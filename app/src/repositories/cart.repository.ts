import { redis } from "../config/redis";

export interface CartTicketReference {
  showtimeId: number;
  seatId: number;
  seatLockId: number;
}

export interface CartProductReference {
  productId: number;
  quantity: number;
}

export interface CartGiftCardPurchase {
  giftCardId: number;
  amount: number;
}

export interface CartAppliedGiftCard {
  giftCardId: number;
  amount: number;
}

export interface CartData {
  userId: number;

  tickets: CartTicketReference[];

  products: CartProductReference[];

  giftCardsToPurchase: CartGiftCardPurchase[];

  appliedGiftCards: CartAppliedGiftCard[];

  membershipApplied: boolean;

  /**
   * Si existe, significa que el carrito
   * ya fue convertido en una reserva
   * y se encuentra en proceso de pago.
   */
  checkoutReservationId?: number;

  createdAt: string;

  lastActivityAt: string;

  expiresAt: string;
}

class CartRepository {
  private key(userId: number): string {
    return `cine:cart:user:${userId}`;
  }

  private ttl(): number {
    return Number(
      process.env.CART_TTL_SECONDS || 600
    );
  }

  async find(
    userId: number
  ): Promise<CartData | null> {
    const raw = await redis.get(
      this.key(userId)
    );

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as CartData;
    } catch {
      await redis.del(
        this.key(userId)
      );

      return null;
    }
  }

  async save(
    cart: CartData
  ): Promise<CartData> {
    const now = new Date();

    cart.lastActivityAt =
      now.toISOString();

    cart.expiresAt = new Date(
      now.getTime() +
        this.ttl() * 1000
    ).toISOString();

    await redis.set(
      this.key(cart.userId),
      JSON.stringify(cart),
      {
        EX: this.ttl(),
      }
    );

    return cart;
  }

  async create(
    userId: number
  ): Promise<CartData> {
    const existing =
      await this.find(userId);

    if (existing) {
      return existing;
    }

    const now =
      new Date().toISOString();

    return this.save({
      userId,

      tickets: [],

      products: [],

      giftCardsToPurchase: [],

      appliedGiftCards: [],

      membershipApplied: true,

      createdAt: now,

      lastActivityAt: now,

      expiresAt: now,
    });
  }

  async delete(
    userId: number
  ): Promise<void> {
    await redis.del(
      this.key(userId)
    );
  }
}

export default new CartRepository();