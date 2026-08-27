export type PaymentMethod =
  | "card"
  | "pse"
  | "nequi"
  | "daviplata";

export interface CreatePaymentDto {
  reservationId: number;
  paymentMethod: PaymentMethod;
  paymentToken: string;
}

export function validateCreatePaymentDto(
  body: unknown
): {
  valid: boolean;
  error?: string;
  data?: CreatePaymentDto;
} {
  const payload =
    (body ?? {}) as Record<string, unknown>;

  const allowedMethods = [
    "card",
    "pse",
    "nequi",
    "daviplata",
  ];

  if (
    !Number.isInteger(
      payload.reservationId
    ) ||
    Number(payload.reservationId) <= 0
  ) {
    return {
      valid: false,
      error:
        "reservationId debe ser un entero mayor que 0.",
    };
  }

  if (
    typeof payload.paymentMethod !==
      "string" ||
    !allowedMethods.includes(
      payload.paymentMethod
    )
  ) {
    return {
      valid: false,
      error:
        "paymentMethod debe ser card, pse, nequi o daviplata.",
    };
  }

  if (
    typeof payload.paymentToken !==
      "string" ||
    payload.paymentToken.trim().length === 0
  ) {
    return {
      valid: false,
      error:
        "paymentToken es obligatorio.",
    };
  }

  return {
    valid: true,
    data: {
      reservationId:
        payload.reservationId as number,
      paymentMethod:
        payload.paymentMethod as PaymentMethod,
      paymentToken:
        payload.paymentToken,
    },
  };
}