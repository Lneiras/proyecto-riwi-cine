import { Request, Response } from "express";
import cartService from "../services/cart.service";
import seatService from "../services/seat.service";
import { AppError } from "../utils/apiResponse";

function errorResponse(res: Response, error: unknown) {
  const appError = error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : "Error del carrito", 500, "INTERNAL_ERROR");
  return res.status(appError.status).json({ success: false, error: { message: appError.message, code: appError.code } });
}

export async function createCart(req: Request, res: Response) {
  try { return res.status(200).json({ success: true, data: await cartService.getOrCreate(req.userId!) }); }
  catch (error) { return errorResponse(res, error); }
}
export async function getCart(req: Request, res: Response) {
  try { return res.json({ success: true, data: await cartService.get(req.userId!) }); }
  catch (error) { return errorResponse(res, error); }
}
export async function updateCart(req: Request, res: Response) {
  try {
    const { functionId, addSeatIds, removeSeatIds, products } = req.body as {
      functionId?: number; addSeatIds?: number[]; removeSeatIds?: number[];
      products?: { productId: number; quantity: number }[];
    };
    if ((addSeatIds || removeSeatIds) && (!Number.isInteger(functionId) || Number(functionId) <= 0)) {
      throw new AppError("functionId es obligatorio para modificar sillas", 400, "INVALID_FUNCTION_ID");
    }
    const validateIds = (ids?: number[]) => !ids || (Array.isArray(ids) && ids.every((id) => Number.isInteger(id) && id > 0));
    if (!validateIds(addSeatIds) || !validateIds(removeSeatIds)) throw new AppError("Los IDs de silla no son válidos", 400, "INVALID_SEAT_IDS");
    if (products && (!Array.isArray(products) || products.some((p) => !Number.isInteger(p.productId) || p.productId <= 0 || !Number.isInteger(p.quantity) || p.quantity < 0))) {
      throw new AppError("Los productos o cantidades no son válidos", 400, "INVALID_PRODUCTS");
    }
    if (addSeatIds?.length) {
      await seatService.lockSeats(functionId!, addSeatIds, req.userId!);
      await cartService.addLockedSeats(req.userId!, functionId!, addSeatIds);
    }
    if (removeSeatIds?.length) {
      await seatService.releaseSeats(functionId!, removeSeatIds, req.userId!);
      await cartService.removeTickets(req.userId!, functionId!, removeSeatIds);
    }
    if (products) await cartService.replaceProducts(req.userId!, products);
    return res.json({ success: true, data: await cartService.get(req.userId!) });
  } catch (error) { return errorResponse(res, error); }
}
export async function deleteCart(req: Request, res: Response) {
  try {
    const cart = await cartService.delete(req.userId!);
    if (cart) {
      const groups = new Map<number, number[]>();
      for (const ticket of cart.tickets) groups.set(ticket.showtimeId, [...(groups.get(ticket.showtimeId) || []), ticket.seatId]);
      for (const [showtimeId, seatIds] of groups) await seatService.releaseSeats(showtimeId, seatIds, req.userId!);
    }
    return res.json({ success: true, data: { deleted: Boolean(cart) } });
  } catch (error) { return errorResponse(res, error); }
}
export async function applyMembership(req: Request, res: Response) {
  try { return res.json({ success: true, data: await cartService.applyMembership(req.userId!) }); }
  catch (error) { return errorResponse(res, error); }
}
export async function applyGiftCard(req: Request, res: Response) {
  try {
    if (typeof req.body.code !== "string" || !req.body.code.trim()) throw new AppError("El código es obligatorio", 400, "CODE_REQUIRED");
    return res.json({ success: true, data: await cartService.applyGiftCard(req.userId!, req.body.code) });
  } catch (error) { return errorResponse(res, error); }
}
