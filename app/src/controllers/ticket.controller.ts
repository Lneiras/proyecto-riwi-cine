import { Request, Response, NextFunction } from "express";
import ticketService from "../services/ticket.service";

export const generateTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Sesión requerida" });
        }

        const { reservationEntryIds } = req.body;

        if (!Array.isArray(reservationEntryIds) || reservationEntryIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: "reservationEntryIds debe ser un arreglo con al menos un elemento",
            });
        }

        const result = await ticketService.generateTickets(userId, reservationEntryIds);

        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getMyTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Sesión requerida" });
        }

        const result = await ticketService.getMyTickets(userId);

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getTicketById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Sesión requerida" });
        }

        const ticketId = Number(req.params.id);
        if (Number.isNaN(ticketId)) {
            return res.status(400).json({ success: false, error: "id inválido" });
        }

        const ticket = await ticketService.getTicketDetail(userId, ticketId);

        return res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

export const downloadTicketPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Sesión requerida" });
        }

        const ticketId = Number(req.params.id);
        if (Number.isNaN(ticketId)) {
            return res.status(400).json({ success: false, error: "id inválido" });
        }

        const pdfBuffer = await ticketService.getTicketPdfBuffer(userId, ticketId);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="entrada-${ticketId}.pdf"`);
        return res.status(200).send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};

export const regenerateTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Sesión requerida" });
        }

        const parsedId = Number(req.body.ticketId);
        if (Number.isNaN(parsedId)) {
            return res.status(400).json({ success: false, error: "ticketId inválido" });
        }

        const ticket = await ticketService.regenerateTicket(userId, parsedId);

        return res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};