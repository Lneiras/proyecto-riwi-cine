// ¡¡ PASARELA FALSA PARA PODER PROBAR EL COMPORTAMIENTO !!

export type GatewayStatus =
  | "approved"
  | "rejected"
  | "timeout";

export interface PaymentRequest {
  amount: number;

  paymentMethod:
    | "card"
    | "pse"
    | "nequi"
    | "daviplata";

  paymentToken: string;
}

export interface PaymentResponse {
  transactionReference: string;
  status: GatewayStatus;
  rejectionReason?: string;
}

export interface PaymentGateway {
  charge(
    request: PaymentRequest
  ): Promise<PaymentResponse>;
}
