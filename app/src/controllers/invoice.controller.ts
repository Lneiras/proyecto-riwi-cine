import { Request, Response, NextFunction } from "express";
import invoiceService from "../services/invoice.service";

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Sesión requerida" });
        }

        const invoiceId = Number(req.params.id);
        if (Number.isNaN(invoiceId)) {
            return res.status(400).json({ success: false, error: "id inválido" });
        }

        const invoice = await invoiceService.getInvoiceDetail(userId, invoiceId);

        return res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        next(error);
    }
};