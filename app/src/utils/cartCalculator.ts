function money(
  value: number
): number {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}

export interface CartCalculationInput {
  ticketSubtotal: number;

  productSubtotal: number;

  giftCardPurchaseSubtotal: number;

  ticketMembershipPercent: number;

  productMembershipPercent: number;

  promotionDiscount: number;

  appliedGiftCardAmount: number;

  taxPercent: number;
}

export interface CartCalculationResult {
  ticketSubtotal: number;

  productSubtotal: number;

  giftCardPurchaseSubtotal: number;

  subtotal: number;

  membershipDiscount: number;

  promotionDiscount: number;

  taxableSubtotal: number;

  taxPercent: number;

  tax: number;

  beforeGiftCards: number;

  giftCardDiscount: number;

  total: number;
}

export function calculateCart(
  input: CartCalculationInput
): CartCalculationResult {
  for (const value of Object.values(
    input
  )) {
    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      throw new Error(
        "Los valores del carrito no pueden ser negativos"
      );
    }
  }

  const membershipDiscount =
    money(
      input.ticketSubtotal *
        input.ticketMembershipPercent /
        100 +
        input.productSubtotal *
          input.productMembershipPercent /
          100
    );

  const subtotal = money(
    input.ticketSubtotal +
      input.productSubtotal +
      input.giftCardPurchaseSubtotal
  );

  const taxableSubtotal = Math.max(
    0,
    money(
      subtotal -
        membershipDiscount -
        input.promotionDiscount
    )
  );

  const tax = money(
    taxableSubtotal *
      input.taxPercent /
      100
  );

  const beforeGiftCards = money(
    taxableSubtotal + tax
  );

  const giftCardDiscount = Math.min(
    beforeGiftCards,
    money(input.appliedGiftCardAmount)
  );

  const total = money(
    beforeGiftCards -
      giftCardDiscount
  );

  return {
    ticketSubtotal: money(
      input.ticketSubtotal
    ),

    productSubtotal: money(
      input.productSubtotal
    ),

    giftCardPurchaseSubtotal:
      money(
        input.giftCardPurchaseSubtotal
      ),

    subtotal,

    membershipDiscount,

    promotionDiscount: money(
      input.promotionDiscount
    ),

    taxableSubtotal,

    taxPercent: input.taxPercent,

    tax,

    beforeGiftCards,

    giftCardDiscount,

    total,
  };
}