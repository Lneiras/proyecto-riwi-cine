import { Request, Response } from "express";
import giftCardService from "../services/gift-card.service";
import cartService from "../services/cart.service";
import { AppError } from "../utils/apiResponse";

function fail(res: Response, error: unknown) {
  const e = error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : "Error de gift card", 500, "INTERNAL_ERROR");
  return res.status(e.status).json({ success: false, error: { message: e.message, code: e.code } });
}
export async function createGiftCard(req: Request, res: Response) {
  try {
    const card = await giftCardService.createForPurchase(req.userId!, req.body);
    const cart = await cartService.addGiftCardPurchase(req.userId!, card);
    return res.status(201).json({ success: true, data: { giftCard: card, cart } });
  } catch (error) { return fail(res, error); }
}
export async function listPurchasedGiftCards(req: Request, res: Response) {
  try { return res.json({ success: true, data: await giftCardService.findPurchased(req.userId!) }); }
  catch (error) { return fail(res, error); }
}
export async function getPurchasedGiftCard(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new AppError("ID inválido", 400, "INVALID_ID");
    return res.json({ success: true, data: await giftCardService.findPurchasedById(req.userId!, id) });
  } catch (error) { return fail(res, error); }
}
