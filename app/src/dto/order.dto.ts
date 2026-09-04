export interface OrderProductDto {
  productId: number;
  quantity: number;
}

export interface CreateOrderDto {
  showtimeId: number;
  seatIds: number[];
  products?: OrderProductDto[];
}

export function validateCreateOrderDto(
  body: unknown
): {
  valid: boolean;
  error?: string;
  data?: CreateOrderDto;
} {
  const payload =
    (body ?? {}) as Record<string, unknown>;

  const showtimeId = payload.showtimeId;
  const seatIds = payload.seatIds;
  const products = payload.products;

  if (
    !Number.isInteger(showtimeId) ||
    Number(showtimeId) <= 0
  ) {
    return {
      valid: false,
      error:
        "showtimeId debe ser un entero mayor que 0.",
    };
  }

  if (
    !Array.isArray(seatIds) ||
    seatIds.length === 0 ||
    !seatIds.every(
      (id) =>
        Number.isInteger(id) &&
        Number(id) > 0
    )
  ) {
    return {
      valid: false,
      error:
        "seatIds debe contener al menos un ID válido.",
    };
  }

  if (products !== undefined) {
    if (!Array.isArray(products)) {
      return {
        valid: false,
        error: "products debe ser un arreglo.",
      };
    }

    for (const item of products) {
      const product =
        item as Record<string, unknown>;

      if (
        !Number.isInteger(product.productId) ||
        Number(product.productId) <= 0 ||
        !Number.isInteger(product.quantity) ||
        Number(product.quantity) <= 0
      ) {
        return {
          valid: false,
          error:
            "Cada producto debe tener productId y quantity válidos.",
        };
      }
    }
  }

  return {
    valid: true,
    data: {
      showtimeId: showtimeId as number,
      seatIds: [
        ...new Set(seatIds as number[]),
      ],
      products:
        (products as OrderProductDto[]) ?? [],
    },
  };
}