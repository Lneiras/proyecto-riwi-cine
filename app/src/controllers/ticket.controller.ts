import { Request, Response, NextFunction } from "express";
import ticketService from "../services/ticket.service";

export const generateTickets = async (req:Request, res: Response, next: NextFunction)=>{
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Sesión requerida",
            });
        };

        const {reservationEntryIds} = req.body;

        if (!Array.isArray(reservationEntryIds || reservationEntryIds.length === 0)) {
            return res.status(400).json({
                success: false,
                error: "ReservationEntryIds debe ser un arreglo",
            });
        };

        const result = await ticketService.generateTickets(userId, reservationEntryIds);

        return res.status(201).json({
            success: true,
            data: result,
        });

    } catch (error:any) {
        next(error);
    }
}

export const getMyTickets = async (req:Request, res:Response, next:NextFunction)=>{
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Sesión requerida",
            });
        };

        const result = await ticketService.getMyTickets(userId);
        
        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        next(error);
    }
}