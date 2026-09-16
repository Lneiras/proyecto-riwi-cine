// ESTA ES LA PASARELA SIMULADA

// este archivo representa temporalmente el comportamiento de una pasarela real

import { randomUUID } from "crypto";

import {
  PaymentGateway,
  PaymentRequest,
  PaymentResponse,
} from "./payment.gateway";

class MockPaymentGateway
  implements PaymentGateway
{
  async charge(
    request: PaymentRequest
  ): Promise<PaymentResponse> {

    const transactionReference =
      `MOCK-${randomUUID()}`;

    if (
      request.paymentToken ===
      "timeout"
    ) {
      return {
        transactionReference,
        status: "timeout",
        rejectionReason:
          "La pasarela agotó el tiempo de espera.",
      };
    }

    if (
      request.paymentToken ===
      "reject"
    ) {
      return {
        transactionReference,
        status: "rejected",
        rejectionReason:
          "La pasarela rechazó la transacción.",
      };
    }

    return {
      transactionReference,
      status: "approved",
    };
  }
}

export default new MockPaymentGateway();