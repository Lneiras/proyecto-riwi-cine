import {
  Request,
  Response,
  NextFunction,
} from "express";

import cartService from
  "../services/cart.service";

import seatService from
  "../services/seat.service";

import {
  AppError,
} from "../utils/apiResponse";


function errorResponse(
  next: NextFunction,
  error: unknown
) {

  if (
    error instanceof AppError
  ) {
    return next(error);
  }

  return next(
    new AppError(
      error instanceof Error
        ? error.message
        : "Error del carrito",

      500,

      "INTERNAL_ERROR"
    )
  );
}


/*
 * ============================================================
 * CREAR / RECUPERAR CARRITO
 * ============================================================
 */

export async function createCart(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    return res.status(200).json({
      success: true,

      data:
        await cartService.getOrCreate(
          req.userId!
        ),
    });

  } catch (error) {

    return errorResponse(
      next,
      error
    );
  }
}


/*
 * ============================================================
 * CONSULTAR CARRITO
 * ============================================================
 */

export async function getCart(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    return res.json({
      success: true,

      data:
        await cartService.get(
          req.userId!
        ),
    });

  } catch (error) {

    return errorResponse(
      next,
      error
    );
  }
}


/*
 * ============================================================
 * MODIFICAR CARRITO
 * ============================================================
 */

export async function updateCart(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const {
      functionId,
      addSeatIds,
      removeSeatIds,
      addProducts,
      updateProducts,
      removeProductIds,
    } = req.body as {

      functionId?: number;

      addSeatIds?: number[];

      removeSeatIds?: number[];

      addProducts?: {
        productId: number;
        quantity: number;
      }[];

      updateProducts?: {
        productId: number;
        quantity: number;
      }[];

      removeProductIds?: number[];
    };


    /*
     * ========================================================
     * VALIDACIÓN DE SILLAS
     * ========================================================
     */

    if (
      (
        addSeatIds ||
        removeSeatIds
      ) &&
      (
        !Number.isInteger(
          functionId
        ) ||
        Number(functionId) <= 0
      )
    ) {

      throw new AppError(
        "functionId es obligatorio para modificar sillas",

        400,

        "INVALID_FUNCTION_ID"
      );
    }


    const validateIds = (
      ids?: number[]
    ) =>
      !ids ||
      (
        Array.isArray(ids) &&
        ids.every(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )
      );


    if (
      !validateIds(
        addSeatIds
      ) ||
      !validateIds(
        removeSeatIds
      )
    ) {

      throw new AppError(
        "Los IDs de silla no son válidos",

        400,

        "INVALID_SEAT_IDS"
      );
    }


    /*
     * ========================================================
     * VALIDACIÓN DE PRODUCTOS
     * ========================================================
     */

    const validateProducts = (
      products?: {
        productId: number;
        quantity: number;
      }[]
    ) =>
      !products ||
      (
        Array.isArray(products) &&
        products.every(
          (item) =>
            item &&
            Number.isInteger(
              item.productId
            ) &&
            item.productId > 0 &&
            Number.isInteger(
              item.quantity
            ) &&
            item.quantity > 0
        )
      );


    if (
      !validateProducts(
        addProducts
      )
    ) {

      throw new AppError(
        "Los productos a agregar no son válidos",

        400,

        "INVALID_PRODUCTS"
      );
    }


    if (
      !validateProducts(
        updateProducts
      )
    ) {

      throw new AppError(
        "Los productos a actualizar no son válidos",

        400,

        "INVALID_PRODUCTS"
      );
    }


    if (
      !validateIds(
        removeProductIds
      )
    ) {

      throw new AppError(
        "Los IDs de producto no son válidos",

        400,

        "INVALID_PRODUCT_IDS"
      );
    }


    /*
     * ========================================================
     * AGREGAR SILLAS
     * ========================================================
     */

    if (
      addSeatIds?.length
    ) {

      await seatService.lockSeats(
        functionId!,
        addSeatIds,
        req.userId!
      );


      await cartService.addLockedSeats(
        req.userId!,
        functionId!,
        addSeatIds
      );
    }


    /*
     * ========================================================
     * RETIRAR SILLAS
     * ========================================================
     */

    if (
      removeSeatIds?.length
    ) {

      await seatService.releaseSeats(
        functionId!,
        removeSeatIds,
        req.userId!
      );


      await cartService.removeTickets(
        req.userId!,
        functionId!,
        removeSeatIds
      );
    }


    /*
     * ========================================================
     * AGREGAR PRODUCTOS
     * ========================================================
     */

    if (
      addProducts?.length
    ) {

      await cartService.addProducts(
        req.userId!,
        addProducts
      );
    }


    /*
     * ========================================================
     * ACTUALIZAR PRODUCTOS
     * ========================================================
     */

    if (
      updateProducts?.length
    ) {

      await cartService.updateProducts(
        req.userId!,
        updateProducts
      );
    }


    /*
     * ========================================================
     * ELIMINAR PRODUCTOS
     * ========================================================
     */

    if (
      removeProductIds?.length
    ) {

      await cartService.removeProducts(
        req.userId!,
        removeProductIds
      );
    }


    /*
     * ========================================================
     * RESPUESTA
     * ========================================================
     */

    return res.json({
      success: true,

      data:
        await cartService.get(
          req.userId!
        ),
    });

  } catch (error) {

    return errorResponse(
      next,
      error
    );
  }
}


/*
 * ============================================================
 * ELIMINAR CARRITO
 * ============================================================
 */

export async function deleteCart(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const cart =
      await cartService.delete(
        req.userId!
      );


    if (cart) {

      const groups =
        new Map<
          number,
          number[]
        >();


      for (
        const ticket
        of cart.tickets
      ) {

        groups.set(
          ticket.showtimeId,

          [
            ...(groups.get(
              ticket.showtimeId
            ) || []),

            ticket.seatId,
          ]
        );
      }


      for (
        const [
          showtimeId,
          seatIds,
        ] of groups
      ) {

        await seatService.releaseSeats(
          showtimeId,
          seatIds,
          req.userId!
        );
      }
    }


    return res.json({
      success: true,

      data: {
        deleted:
          Boolean(cart),
      },
    });

  } catch (error) {

    return errorResponse(
      next,
      error
    );
  }
}


/*
 * ============================================================
 * APLICAR MEMBRESÍA
 * ============================================================
 */

export async function applyMembership(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    return res.json({
      success: true,

      data:
        await cartService.applyMembership(
          req.userId!
        ),
    });

  } catch (error) {

    return errorResponse(
      next,
      error
    );
  }
}


/*
 * ============================================================
 * APLICAR GIFT CARD
 * ============================================================
 */

export async function applyGiftCard(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const {
      code,
    } = req.body as {
      code?: string;
    };


    /*
     * El código es obligatorio.
     */

    if (
      typeof code !== "string" ||
      code.trim().length === 0
    ) {

      throw new AppError(
        "El código de la Gift Card es obligatorio",

        400,

        "INVALID_GIFT_CARD_CODE"
      );
    }


    return res.json({
      success: true,

      data:
        await cartService.applyGiftCard(
          req.userId!,
          code
        ),
    });

  } catch (error) {

    return errorResponse(
      next,
      error
    );
  }
}


/*
 * ============================================================
 * RETIRAR GIFT CARD
 * ============================================================
 */

export async function removeGiftCard(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const {
      giftCardId,
    } = req.body as {
      giftCardId: number;
    };


    if (
      !Number.isInteger(
        giftCardId
      ) ||
      Number(giftCardId) <= 0
    ) {

      throw new AppError(
        "giftCardId debe ser un entero mayor que 0",

        400,

        "INVALID_GIFT_CARD_ID"
      );
    }


    return res.json({
      success: true,

      data:
        await cartService.removeGiftCard(
          req.userId!,
          giftCardId
        ),
    });

  } catch (error) {

    return errorResponse(
      next,
      error
    );
  }
}