

export interface CalculateDiscountDto {
    ticketAmount?: number;
    snackAmount?: number;
}

export function validateCalculateDiscountDto(body: unknown): {
    valid: boolean;
    error?: string;
    data: CalculateDiscountDto;
    } {
    const payload = (body ?? {}) as Record<string, unknown>;
    const data: CalculateDiscountDto = {};

    if (payload.ticketAmount !== undefined) {
        if (typeof payload.ticketAmount !== "number" || payload.ticketAmount < 0) {
        return { valid: false, error: "El campo 'ticketAmount' debe ser un número mayor o igual a 0.", data };
        }
        data.ticketAmount = payload.ticketAmount;
    }

    if (payload.snackAmount !== undefined) {
        if (typeof payload.snackAmount !== "number" || payload.snackAmount < 0) {
        return { valid: false, error: "El campo 'snackAmount' debe ser un número mayor o igual a 0.", data };
        }
        data.snackAmount = payload.snackAmount;
    }

    if (data.ticketAmount === undefined && data.snackAmount === undefined) {
        return { valid: false, error: "Debes enviar 'ticketAmount' y/o 'snackAmount'.", data };
    }

    return { valid: true, error: undefined, data };
}