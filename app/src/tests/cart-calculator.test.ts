import { calculateCart } from "../utils/cartCalculator";

describe("HU-011 - cálculo del carrito", () => {
  it("calcula membresía, impuestos y gift card sin producir totales negativos", () => {
    expect(calculateCart({ ticketSubtotal: 40000, productSubtotal: 10000,
      giftCardPurchaseSubtotal: 0, ticketMembershipPercent: 10, productMembershipPercent: 5,
      promotionDiscount: 1000, appliedGiftCardAmount: 20000, taxPercent: 19 })).toEqual({
      ticketSubtotal: 40000, productSubtotal: 10000, giftCardPurchaseSubtotal: 0,
      subtotal: 50000, membershipDiscount: 4500, promotionDiscount: 1000,
      giftCardDiscount: 20000, tax: 8455, total: 32955,
    });
  });

  it("limita el descuento de gift card al valor pendiente", () => {
    const result = calculateCart({ ticketSubtotal: 10000, productSubtotal: 0,
      giftCardPurchaseSubtotal: 0, ticketMembershipPercent: 0, productMembershipPercent: 0,
      promotionDiscount: 0, appliedGiftCardAmount: 50000, taxPercent: 0 });
    expect(result.giftCardDiscount).toBe(10000);
    expect(result.total).toBe(0);
  });

  it("rechaza cantidades negativas", () => {
    expect(() => calculateCart({ ticketSubtotal: -1, productSubtotal: 0,
      giftCardPurchaseSubtotal: 0, ticketMembershipPercent: 0, productMembershipPercent: 0,
      promotionDiscount: 0, appliedGiftCardAmount: 0, taxPercent: 0 })).toThrow("no pueden ser negativos");
  });
});
