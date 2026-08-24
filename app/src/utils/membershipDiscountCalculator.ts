
/**
 * calculadora para los descuentos de membresía. 
 * 
 * Función PURA: no toca la base de datos ni Express. Recibe los
 * porcentajes de descuento de una membresía y los montos de la compra,
 * y devuelve el desglose. 
 * Esto permite reutilizarla desde cualquier módulo futuro 
 * (Carrito, Confitería, Pago) sin duplicar la fórmula.
 */

export interface MembershipDiscountRates {
    /** Porcentaje de descuento sobre boletas  */
    ticketDiscountPercent: number;
    /** Porcentaje de descuento sobre confitería  */
    snackDiscountPercent: number;
}

export interface MembershipDiscountInput {
    /** Subtotal de boletas ANTES de descuento. */
    ticketAmount?: number;
    /** Subtotal de confitería ANTES de descuento. */
    snackAmount?: number;
}

export interface MembershipDiscountResult {
    ticketSubtotal: number;
    ticketDiscountAmount: number;
    ticketTotal: number;
    snackSubtotal: number;
    snackDiscountAmount: number;
    snackTotal: number;
    grandTotal: number;
}

/**
 * Redondea a 2 decimales evitando errores de coma flotante
 * (ej. 0.1 + 0.2 en JS no da exactamente 0.3).
 */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateMembershipDiscount(
    rates: MembershipDiscountRates,
    input: MembershipDiscountInput
): MembershipDiscountResult {
    const ticketSubtotal = input.ticketAmount ?? 0;
    const snackSubtotal = input.snackAmount ?? 0;

    if (ticketSubtotal < 0 || snackSubtotal < 0) {
        throw new Error("Los montos a descontar no pueden ser negativos.");
    }

    const ticketDiscountAmount = round2(ticketSubtotal * (rates.ticketDiscountPercent / 100));
    const snackDiscountAmount = round2(snackSubtotal * (rates.snackDiscountPercent / 100));

    const ticketTotal = round2(ticketSubtotal - ticketDiscountAmount);
    const snackTotal = round2(snackSubtotal - snackDiscountAmount);

    return {
    ticketSubtotal: round2(ticketSubtotal),
    ticketDiscountAmount,
    ticketTotal,
    snackSubtotal: round2(snackSubtotal),
    snackDiscountAmount,
    snackTotal,
    grandTotal: round2(ticketTotal + snackTotal),
    };
}
