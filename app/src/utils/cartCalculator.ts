export function money(value: number): number { return Math.round((value + Number.EPSILON) * 100) / 100; }

export interface CartCalculationInput {
  ticketSubtotal: number; productSubtotal: number; giftCardPurchaseSubtotal: number;
  ticketMembershipPercent: number; productMembershipPercent: number;
  promotionDiscount: number; appliedGiftCardAmount: number; taxPercent: number;
}

export function calculateCart(input: CartCalculationInput) {
  for (const value of Object.values(input)) {
    if (!Number.isFinite(value) || value < 0) throw new Error("Los valores del carrito no pueden ser negativos");
  }
  const membershipDiscount = money(
    input.ticketSubtotal * input.ticketMembershipPercent / 100 +
    input.productSubtotal * input.productMembershipPercent / 100
  );
  const subtotal = money(input.ticketSubtotal + input.productSubtotal + input.giftCardPurchaseSubtotal);
  const afterDiscounts = Math.max(0, money(subtotal - membershipDiscount - input.promotionDiscount));
  const tax = money(afterDiscounts * input.taxPercent / 100);
  const beforeGiftCards = money(afterDiscounts + tax);
  const giftCardDiscount = Math.min(beforeGiftCards, money(input.appliedGiftCardAmount));
  return { ticketSubtotal: money(input.ticketSubtotal), productSubtotal: money(input.productSubtotal),
    giftCardPurchaseSubtotal: money(input.giftCardPurchaseSubtotal), subtotal, membershipDiscount,
    promotionDiscount: money(input.promotionDiscount), giftCardDiscount, tax,
    total: money(beforeGiftCards - giftCardDiscount) };
}
