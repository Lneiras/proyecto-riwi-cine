import { Op } from "sequelize";
import cartRepository, { CartData } from "../repositories/cart.repository";
import giftCardRepository from "../repositories/gift-card.repository";
import { calculateCart } from "../utils/cartCalculator";
import { hashGiftCardCode } from "../utils/giftCardCode";
import { AppError } from "../utils/apiResponse";
import { Format, GiftCard, Membership, Movie, Room, Seat, SeatLock, Showtime, User, Inventory, Snack } from "../models";
import { redis, SEAT_LOCK_PREFIX } from "../config/redis";
import { getEffectivePrice } from "./snack.service";
import { money } from "../utils/cartCalculator";

class CartService {
  private ttl(): number { return Number(process.env.CART_TTL_SECONDS || 600); }

  async getOrCreate(userId: number) {
    const cart = await cartRepository.create(userId);
    await this.touchLocks(cart);
    await cartRepository.save(cart);
    return this.present(cart);
  }

  async get(userId: number) {
    const cart = await cartRepository.find(userId);
    if (!cart) throw new AppError("No existe un carrito activo", 404, "CART_NOT_FOUND");
    await this.touchLocks(cart);
    await cartRepository.save(cart);
    return this.present(cart);
  }

  async addLockedSeats(userId: number, showtimeId: number, seatIds: number[]) {
    const cart = await cartRepository.create(userId);
    const locks = await SeatLock.findAll({ where: { userId, showtimeId, seatId: { [Op.in]: seatIds },
      status: "active", expiresAt: { [Op.gt]: new Date() } } });
    if (locks.length !== new Set(seatIds).size) {
      throw new AppError("Uno o más bloqueos de silla no están vigentes", 409, "SEAT_LOCK_INVALID");
    }
    const incoming = new Set(seatIds.map((seatId) => `${showtimeId}:${seatId}`));
    cart.tickets = cart.tickets.filter((ticket) => !incoming.has(`${ticket.showtimeId}:${ticket.seatId}`));
    cart.tickets.push(...locks.map((lock) => ({ showtimeId, seatId: lock.seatId, seatLockId: lock.id })));
    await cartRepository.save(cart);
    return this.present(cart);
  }

  async removeTickets(userId: number, showtimeId: number, seatIds: number[]) {
    const cart = await cartRepository.find(userId);
    if (!cart) throw new AppError("No existe un carrito activo", 404, "CART_NOT_FOUND");
    const remove = new Set(seatIds);
    cart.tickets = cart.tickets.filter((ticket) => ticket.showtimeId !== showtimeId || !remove.has(ticket.seatId));
    await cartRepository.save(cart);
    return this.present(cart);
  }

  async replaceProducts(userId: number, products: { productId: number; quantity: number }[]) {
    const cart = await cartRepository.find(userId);
    if (!cart) throw new AppError("No existe un carrito activo", 404, "CART_NOT_FOUND");

    // Consolida cantidades si el cliente envía el mismo producto repetido en el arreglo
    const merged = new Map<number, number>();
    for (const item of products) {
      if (item.quantity === 0) continue; // quantity: 0 se interpreta como "quitar del carrito"
      merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
    }

    const validated: CartProductReference[] = [];
    for (const [productId, quantity] of merged) {
      const snack = await Snack.findOne({ where: { id: productId, isActive: true } });
      if (!snack) {
        throw new AppError(`El producto ${productId} no existe o no está disponible`, 404, "SNACK_NOT_FOUND");
      }

      const inventory = await Inventory.findOne({ where: { snackId: productId } });
      const available = inventory?.quantityAvailable ?? 0;
      if (available < quantity) {
        throw new AppError(
          `Stock insuficiente para "${snack.name}". Disponible: ${available}, solicitado: ${quantity}`,
          409,
          "INSUFFICIENT_STOCK"
        );
      }

      validated.push({ productId, quantity });
    }

    cart.products = validated;
    await cartRepository.save(cart);
  }

  async applyMembership(userId: number) {
    const cart = await cartRepository.find(userId);
    if (!cart) throw new AppError("No existe un carrito activo", 404, "CART_NOT_FOUND");
    cart.membershipApplied = true;
    await cartRepository.save(cart);
    return this.present(cart);
  }

  async applyGiftCard(userId: number, code: string) {
    const cart = await cartRepository.find(userId);
    if (!cart) throw new AppError("No existe un carrito activo", 404, "CART_NOT_FOUND");
    const giftCard = await giftCardRepository.findByCodeHash(hashGiftCardCode(code));
    if (!giftCard || giftCard.status !== "active") {
      throw new AppError("Gift card inválida o inactiva", 400, "INVALID_GIFT_CARD");
    }
    if (giftCard.expiresAt && giftCard.expiresAt.getTime() <= Date.now()) {
      giftCard.status = "expired"; await giftCard.save();
      throw new AppError("La gift card está vencida", 400, "EXPIRED_GIFT_CARD");
    }
    const balance = Number(giftCard.availableBalance);
    if (balance <= 0) throw new AppError("La gift card no tiene saldo", 409, "EMPTY_GIFT_CARD");
    if (cart.giftCardsToPurchase.some((item) => item.giftCardId === giftCard.id)) {
      throw new AppError("No puedes pagar una gift card con ella misma", 409, "GIFT_CARD_SELF_USE");
    }
    const lockKey = `cine:gift-card-lock:${giftCard.id}`;
    const acquired = await redis.set(lockKey, String(userId), { NX: true, EX: this.ttl() });
    const owner = await redis.get(lockKey);
    if (acquired !== "OK" && owner !== String(userId)) {
      throw new AppError("La gift card está siendo utilizada en otro carrito", 409, "GIFT_CARD_LOCKED");
    }
    cart.appliedGiftCards = cart.appliedGiftCards.filter((item) => item.giftCardId !== giftCard.id);
    cart.appliedGiftCards.push({ giftCardId: giftCard.id, amount: balance });
    await cartRepository.save(cart);
    await redis.expire(lockKey, this.ttl());
    return this.present(cart);
  }

  async addGiftCardPurchase(userId: number, giftCard: GiftCard) {
    const cart = await cartRepository.create(userId);
    cart.giftCardsToPurchase = cart.giftCardsToPurchase.filter((item) => item.giftCardId !== giftCard.id);
    cart.giftCardsToPurchase.push({ giftCardId: giftCard.id, amount: Number(giftCard.initialBalance) });
    await cartRepository.save(cart);
    return this.present(cart);
  }

  async delete(userId: number): Promise<CartData | null> {
    const cart = await cartRepository.find(userId);
    if (!cart) return null;
    await Promise.all(cart.appliedGiftCards.map((item) => redis.del(`cine:gift-card-lock:${item.giftCardId}`)));
    await cartRepository.delete(userId);
    return cart;
  }

  private async touchLocks(cart: CartData): Promise<void> {
    if (!cart.tickets.length) return;
    const expiresAt = new Date(Date.now() + this.ttl() * 1000);
    const locks = await SeatLock.findAll({ where: { id: { [Op.in]: cart.tickets.map((t) => t.seatLockId) },
      userId: cart.userId, status: "active", expiresAt: { [Op.gt]: new Date() } } });
    const activeIds = new Set(locks.map((lock) => lock.id));
    cart.tickets = cart.tickets.filter((ticket) => activeIds.has(ticket.seatLockId));
    for (const lock of locks) {
      const key = `${SEAT_LOCK_PREFIX}:${lock.showtimeId}:${lock.seatId}`;
      const expected = `${cart.userId}:${lock.lockToken}`;
      if (await redis.get(key) !== expected) continue;
      lock.expiresAt = expiresAt; await lock.save(); await redis.expire(key, this.ttl());
    }
  }

  private async present(cart: CartData) {
    const user = await User.findByPk(cart.userId, { include: [{ model: Membership }] });
    const membership = user?.get("Membership") as Membership | undefined;

    const tickets = [];
    for (const ref of cart.tickets) {
      const [showtime, seat] = await Promise.all([Showtime.findByPk(ref.showtimeId), Seat.findByPk(ref.seatId)]);
      if (!showtime || !seat) continue;
      const [movie, room, format] = await Promise.all([
        Movie.findByPk(showtime.movieId), Room.findByPk(showtime.roomId), Format.findByPk(showtime.formatId),
      ]);
      const unitPrice = Number(showtime.basePrice);
      tickets.push({ showtimeId: showtime.id, movie: movie?.title ?? null, dateTime: showtime.dateTime,
        room: room?.numberName ?? null, format: format?.name ?? null,
        seat: { id: seat.id, row: seat.row, number: seat.number, type: seat.type }, unitPrice, total: unitPrice });
    }

    const products = [];
    for (const ref of cart.products) {
      const snack = await Snack.findByPk(ref.productId, { include: [{ association: "category" }] });
      if (!snack || !snack.isActive) continue; // se desactivó/eliminó desde que se agregó al carrito
      const unitPrice = await getEffectivePrice(snack);
      const total = money(unitPrice * ref.quantity);
      products.push({
        productId: snack.id,
        name: snack.name,
        category: (snack as any).category?.name ?? null,
        imageUrl: snack.imageUrl,
        quantity: ref.quantity,
        unitPrice,
        total,
      });
    }

    const giftCardPurchases = await Promise.all(cart.giftCardsToPurchase.map((item) => GiftCard.findByPk(item.giftCardId)));
    const ticketSubtotal = tickets.reduce((sum, item) => sum + item.total, 0);
    const productSubtotal = products.reduce((sum, item) => sum + item.total, 0);
    const giftCardPurchaseSubtotal = giftCardPurchases.reduce((sum, item) => sum + Number(item?.initialBalance ?? 0), 0);

    const summary = calculateCart({ ticketSubtotal, productSubtotal, giftCardPurchaseSubtotal,
      ticketMembershipPercent: cart.membershipApplied ? Number(membership?.ticketDiscount ?? 0) : 0,
      productMembershipPercent: cart.membershipApplied ? Number(membership?.snackDiscount ?? 0) : 0,
      promotionDiscount: 0, appliedGiftCardAmount: cart.appliedGiftCards.reduce((sum, item) => sum + item.amount, 0),
      taxPercent: Number(process.env.CART_TAX_PERCENT || 0) });

    return { ...cart, tickets, products: cart.products, giftCardsToPurchase: giftCardPurchases.filter(Boolean),
      appliedGiftCards: cart.appliedGiftCards, membership: membership ? { id: membership.id, name: membership.name } : null,
      summary };
  }
}

export default new CartService();
