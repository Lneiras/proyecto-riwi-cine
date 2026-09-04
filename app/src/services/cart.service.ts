import {
  Op,
} from "sequelize";

import cartRepository, {
  CartData,
} from "../repositories/cart.repository";

import {
  Format,
  Membership,
  Movie,
  Product,
  Room,
  Seat,
  SeatLock,
  Showtime,
  User,
  GiftCard
} from "../models";

import giftCardRepository from
  "../repositories/gift-card.repository";

import {
  hashGiftCardCode,
} from "../utils/giftCardCode";

import {
  redis,
  SEAT_LOCK_PREFIX,
} from "../config/redis";

import {
  calculateCart,
} from "../utils/cartCalculator";

import {
  AppError,
} from "../utils/apiResponse";

export interface CartProductInput {
  productId: number;
  quantity: number;
}

class CartService {

  private ttl(): number {
    return Number(
      process.env.CART_TTL_SECONDS ||
        600
    );
  }

  async getOrCreate(
    userId: number
  ) {
    const cart =
      await cartRepository.create(
        userId
      );

    await this.touchLocks(
      cart
    );

    await cartRepository.save(
      cart
    );

    return this.present(
      cart
    );
  }

  async get(
    userId: number
  ) {
    const cart =
      await cartRepository.find(
        userId
      );

    if (!cart) {
      throw new AppError(
        "No existe un carrito activo",
        404,
        "CART_NOT_FOUND"
      );
    }

    await this.touchLocks(
      cart
    );

    await cartRepository.save(
      cart
    );

    return this.present(
      cart
    );
  }

  /*
   * ============================================================
   * ASIENTOS
   * ============================================================
   */

  async addLockedSeats(
    userId: number,
    showtimeId: number,
    seatIds: number[]
  ) {
    const cart =
      await cartRepository.create(
        userId
      );

    this.ensureEditable(
      cart
    );

    const locks =
      await SeatLock.findAll({
        where: {
          userId,

          showtimeId,

          seatId: {
            [Op.in]:
              seatIds,
          },

          status: "active",

          expiresAt: {
            [Op.gt]:
              new Date(),
          },
        },
      });

    if (
      locks.length !==
      new Set(seatIds).size
    ) {
      throw new AppError(
        "Uno o más bloqueos de silla no están vigentes",
        409,
        "SEAT_LOCK_INVALID"
      );
    }

    const incoming =
      new Set(
        seatIds.map(
          (seatId) =>
            `${showtimeId}:${seatId}`
        )
      );

    cart.tickets =
      cart.tickets.filter(
        (ticket) =>
          !incoming.has(
            `${ticket.showtimeId}:${ticket.seatId}`
          )
      );

    cart.tickets.push(
      ...locks.map(
        (lock) => ({
          showtimeId,

          seatId:
            lock.seatId,

          seatLockId:
            lock.id,
        })
      )
    );

    await cartRepository.save(
      cart
    );

    return this.present(
      cart
    );
  }

  async removeTickets(
    userId: number,
    showtimeId: number,
    seatIds: number[]
  ) {
    const cart =
      await cartRepository.find(
        userId
      );

    if (!cart) {
      throw new AppError(
        "No existe un carrito activo",
        404,
        "CART_NOT_FOUND"
      );
    }

    this.ensureEditable(
      cart
    );

    const remove =
      new Set(seatIds);

    cart.tickets =
      cart.tickets.filter(
        (ticket) =>
          ticket.showtimeId !==
            showtimeId ||
          !remove.has(
            ticket.seatId
          )
      );

    await cartRepository.save(
      cart
    );

    return this.present(
      cart
    );
  }

  /*
   * ============================================================
   * PRODUCTOS
   * ============================================================
   */

  async applyGiftCard(
  userId: number,
  code: string
) {

  const cart =
    await cartRepository.find(
      userId
    );

  if (!cart) {
    throw new AppError(
      "No existe un carrito activo",
      404,
      "CART_NOT_FOUND"
    );
  }

  this.ensureEditable(
    cart
  );

  const giftCard =
    await giftCardRepository
      .findByCodeHash(
        hashGiftCardCode(
          code
        )
      );

  if (
    !giftCard ||
    giftCard.status !==
      "active"
  ) {
    throw new AppError(
      "Gift card inválida o inactiva",
      400,
      "INVALID_GIFT_CARD"
    );
  }

  if (
    giftCard.expiresAt &&
    giftCard.expiresAt.getTime() <=
      Date.now()
  ) {

    giftCard.status =
      "expired";

    await giftCard.save();

    throw new AppError(
      "La gift card está vencida",
      400,
      "EXPIRED_GIFT_CARD"
    );
  }

  const balance =
    Number(
      giftCard.availableBalance
    );

  if (
    balance <= 0
  ) {
    throw new AppError(
      "La gift card no tiene saldo",
      409,
      "EMPTY_GIFT_CARD"
    );
  }

  /*
   * Bloqueo distribuido en Redis.
   *
   * Impide que dos usuarios intenten
   * utilizar la misma Gift Card
   * simultáneamente.
   */

  const lockKey =
    `cine:gift-card-lock:${giftCard.id}`;

  const acquired =
    await redis.set(
      lockKey,

      String(userId),

      {
        NX: true,

        EX:
          this.ttl(),
      }
    );

  const owner =
    await redis.get(
      lockKey
    );

  if (
    acquired !== "OK" &&
    owner !==
      String(userId)
  ) {
    throw new AppError(
      "La gift card está siendo utilizada en otro carrito",
      409,
      "GIFT_CARD_LOCKED"
    );
  }

  cart.appliedGiftCards =
    cart.appliedGiftCards.filter(
      (item) =>
        item.giftCardId !==
        giftCard.id
    );

  cart.appliedGiftCards.push({
    giftCardId:
      giftCard.id,

    /*
     * Guardamos el saldo que se
     * aplicará al carrito.
     */
    amount:
      balance,
  });

  await cartRepository.save(
    cart
  );

  await redis.expire(
    lockKey,
    this.ttl()
  );

  return this.present(
    cart
  );
  }

  async removeGiftCard(
  userId: number,
  giftCardId: number
) {

  const cart =
    await cartRepository.find(
      userId
    );

  if (!cart) {
    throw new AppError(
      "No existe un carrito activo",
      404,
      "CART_NOT_FOUND"
    );
  }

  this.ensureEditable(
    cart
  );

  cart.appliedGiftCards =
    cart.appliedGiftCards.filter(
      (item) =>
        item.giftCardId !==
        giftCardId
    );

  await redis.del(
    `cine:gift-card-lock:${giftCardId}`
  );

  await cartRepository.save(
    cart
  );

  return this.present(
    cart
  );
  }

  async addProducts(
    userId: number,
    products: CartProductInput[]
  ) {
    const cart =
      await cartRepository.create(
        userId
      );

    this.ensureEditable(
      cart
    );

    for (
      const item
      of products
    ) {

      const product =
        await Product.findByPk(
          item.productId
        );

      if (!product) {
        throw new AppError(
          `El producto ${item.productId} no existe`,
          404,
          "PRODUCT_NOT_FOUND"
        );
      }

      const existing =
        cart.products.find(
          (productItem) =>
            productItem.productId ===
            item.productId
        );

      const newQuantity =
        existing
          ? existing.quantity +
            item.quantity
          : item.quantity;

      /*
       * Esta validación evita agregar
       * al carrito una cantidad que ya
       * supera el stock conocido.
       *
       * El checkout volverá a validar
       * el stock dentro de una
       * transacción.
       */
      if (
        newQuantity >
        product.stock
      ) {
        throw new AppError(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
          409,
          "INSUFFICIENT_STOCK"
        );
      }

      if (existing) {

        existing.quantity =
          newQuantity;

      } else {

        cart.products.push({
          productId:
            item.productId,

          quantity:
            item.quantity,
        });
      }
    }

    await cartRepository.save(
      cart
    );

    return this.present(
      cart
    );
  }

  async updateProducts(
    userId: number,
    products: CartProductInput[]
  ) {
    const cart =
      await cartRepository.find(
        userId
      );

    if (!cart) {
      throw new AppError(
        "No existe un carrito activo",
        404,
        "CART_NOT_FOUND"
      );
    }

    this.ensureEditable(
      cart
    );

    for (
      const item
      of products
    ) {

      const product =
        await Product.findByPk(
          item.productId
        );

      if (!product) {
        throw new AppError(
          `El producto ${item.productId} no existe`,
          404,
          "PRODUCT_NOT_FOUND"
        );
      }

      if (
        item.quantity >
        product.stock
      ) {
        throw new AppError(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
          409,
          "INSUFFICIENT_STOCK"
        );
      }

      const existing =
        cart.products.find(
          (productItem) =>
            productItem.productId ===
            item.productId
        );

      if (!existing) {
        throw new AppError(
          `El producto ${item.productId} no está en el carrito`,
          404,
          "PRODUCT_NOT_IN_CART"
        );
      }

      existing.quantity =
        item.quantity;
    }

    await cartRepository.save(
      cart
    );

    return this.present(
      cart
    );
  }

  async removeProducts(
    userId: number,
    productIds: number[]
  ) {
    const cart =
      await cartRepository.find(
        userId
      );

    if (!cart) {
      throw new AppError(
        "No existe un carrito activo",
        404,
        "CART_NOT_FOUND"
      );
    }

    this.ensureEditable(
      cart
    );

    const remove =
      new Set(productIds);

    cart.products =
      cart.products.filter(
        (item) =>
          !remove.has(
            item.productId
          )
      );

    await cartRepository.save(
      cart
    );

    return this.present(
      cart
    );
  }

  /*
   * ============================================================
   * MEMBRESÍA
   * ============================================================
   */

  async applyMembership(
    userId: number
  ) {
    const cart =
      await cartRepository.find(
        userId
      );

    if (!cart) {
      throw new AppError(
        "No existe un carrito activo",
        404,
        "CART_NOT_FOUND"
      );
    }

    this.ensureEditable(
      cart
    );

    cart.membershipApplied =
      true;

    await cartRepository.save(
      cart
    );

    return this.present(
      cart
    );
  }

  /*
   * ============================================================
   * ELIMINAR CARRITO
   * ============================================================
   */

  async delete(
    userId: number
  ): Promise<CartData | null> {

    const cart =
      await cartRepository.find(
        userId
      );

    if (!cart) {
      return null;
    }

    if (
      cart.checkoutReservationId
    ) {
      throw new AppError(
        "No puedes eliminar el carrito mientras existe un pago en proceso",
        409,
        "CHECKOUT_IN_PROGRESS"
      );
    }

    await cartRepository.delete(
      userId
    );

    return cart;
  }

  private ensureEditable(
    cart: CartData
  ): void {
    if (
      cart.checkoutReservationId
    ) {
      throw new AppError(
        "El carrito está bloqueado porque existe un pago en proceso",
        409,
        "CHECKOUT_IN_PROGRESS"
      );
    }
  }

  /*
   * ============================================================
   * REFRESCAR LOCKS
   * ============================================================
   */

  private async touchLocks(
    cart: CartData
  ): Promise<void> {

    if (!cart.tickets.length) {
      return;
    }

    const expiresAt =
      new Date(
        Date.now() +
          this.ttl() * 1000
      );

    const locks =
      await SeatLock.findAll({
        where: {
          id: {
            [Op.in]:
              cart.tickets.map(
                (ticket) =>
                  ticket.seatLockId
              ),
          },

          userId:
            cart.userId,

          status:
            "active",

          expiresAt: {
            [Op.gt]:
              new Date(),
          },
        },
      });

    const activeIds =
      new Set(
        locks.map(
          (lock) =>
            lock.id
        )
      );

    cart.tickets =
      cart.tickets.filter(
        (ticket) =>
          activeIds.has(
            ticket.seatLockId
          )
      );

    for (
      const lock of locks
    ) {

      const key =
        `${SEAT_LOCK_PREFIX}:${lock.showtimeId}:${lock.seatId}`;

      const expected =
        `${cart.userId}:${lock.lockToken}`;

      const current =
        await redis.get(
          key
        );

      if (
        current !==
        expected
      ) {
        continue;
      }

      lock.expiresAt =
        expiresAt;

      await lock.save();

      await redis.expire(
        key,
        this.ttl()
      );
    }
  }

  /*
   * ============================================================
   * PRESENTACIÓN DEL CARRITO
   * ============================================================
   */

  private async present(
    cart: CartData
  ) {

    const user =
      await User.findByPk(
        cart.userId,
        {
          include: [
            {
              model:
                Membership,
            },
          ],
        }
      );

    const membership =
      user?.get(
        "Membership"
      ) as
        | Membership
        | undefined;

    /*
     * ----------------------------------------------------------
     * ENTRADAS
     * ----------------------------------------------------------
     */

    const tickets = [];

    for (
      const ref of cart.tickets
    ) {

      const [
        showtime,
        seat,
      ] = await Promise.all([
        Showtime.findByPk(
          ref.showtimeId
        ),

        Seat.findByPk(
          ref.seatId
        ),
      ]);

      if (
        !showtime ||
        !seat
      ) {
        continue;
      }

      const [
        movie,
        room,
        format,
      ] = await Promise.all([
        Movie.findByPk(
          showtime.movieId
        ),

        Room.findByPk(
          showtime.roomId
        ),

        Format.findByPk(
          showtime.formatId
        ),
      ]);

      const unitPrice =
        Number(
          showtime.basePrice
        );

      tickets.push({
        showtimeId:
          showtime.id,

        movie:
          movie?.title ??
          null,

        dateTime:
          showtime.dateTime,

        room:
          room?.numberName ??
          null,

        format:
          format?.name ??
          null,

        seat: {
          id:
            seat.id,

          row:
            seat.row,

          number:
            seat.number,

          type:
            seat.type,
        },

        unitPrice,

        total:
          unitPrice,
      });
    }

    const ticketSubtotal =
      tickets.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.total,
        0
      );

    /*
     * ----------------------------------------------------------
     * PRODUCTOS
     * ----------------------------------------------------------
     *
     * Aquí estaba el problema principal.
     *
     * Redis solamente guarda:
     *
     * productId + quantity
     *
     * pero para mostrar el carrito
     * necesitamos consultar PostgreSQL
     * y obtener nombre + precio + stock.
     */

    const products = [];

    for (
      const item
      of cart.products
    ) {

      const product =
        await Product.findByPk(
          item.productId
        );

      /*
       * Si un producto fue eliminado
       * de la base de datos después de
       * haber sido agregado al carrito,
       * no lo incluimos en el cálculo.
       */
      if (!product) {
        continue;
      }

      const unitPrice =
        Number(
          product.price
        );

      const subtotal =
        unitPrice *
        item.quantity;

      products.push({
        productId:
          product.id,

        name:
          product.name,

        quantity:
          item.quantity,

        unitPrice,

        subtotal,

        availableStock:
          product.stock,
      });
    }

    const productSubtotal =
      products.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.subtotal,
        0
      );

    /*
     * ----------------------------------------------------------
     * GIFT CARDS
     * ----------------------------------------------------------
     */

    const giftCardPurchaseSubtotal =
      cart.giftCardsToPurchase.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(item.amount),
        0
      );

    const appliedGiftCardAmount =
      cart.appliedGiftCards.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(item.amount),
        0
      );

    /*
     * ----------------------------------------------------------
     * IVA + DESCUENTOS
     * ----------------------------------------------------------
     */

    const taxPercent =
      Number(
        process.env.CART_TAX_PERCENT ||
          19
      );

    const summary =
      calculateCart({
        ticketSubtotal,

        productSubtotal,

        giftCardPurchaseSubtotal,

        ticketMembershipPercent:
          cart.membershipApplied
            ? Number(
                membership?.ticketDiscount ??
                  0
              )
            : 0,

        productMembershipPercent:
          cart.membershipApplied
            ? Number(
                membership?.snackDiscount ??
                  0
              )
            : 0,

        promotionDiscount:
          0,

        appliedGiftCardAmount,

        taxPercent,
      });

    return {
      ...cart,

      tickets,

      products,

      appliedGiftCards:
        cart.appliedGiftCards,

      membership:
        membership
          ? {
              id:
                membership.id,

              name:
                membership.name,
          }
          : null,

      summary,
    };
  }
}

export default new CartService();