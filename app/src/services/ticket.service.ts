import crypto from "crypto";
import QRCode  from "qrcode";

import { User, ReservationEntry } from "../models";

import TicketRepository from "../repositories/ticket.repository";
import InvoiceRepository from "../repositories/invoice.repository";

class TicketService{
    async generateTickets(userId:number, reservationEntryIds:number[]){
        if(!reservationEntryIds.length){
            throw new Error("Debe enviar al menos una entrada");
        }
        const user = await User.findByPk(userId);

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        const entries = await ReservationEntry.findAll({
            where:{
                id: reservationEntryIds,
            },
        });

        if(entries.length !== reservationEntryIds.length){
            throw new Error("Una o mas entradas no existen");
        }

        const tickets = [];

        let subtotal = 0;

        for(const entry of entries){
            const ticketCode = crypto.randomUUID();

            const qrData = JSON.stringify({
                ticketCode,
                type: "MULTICINE_TICKET",
            });

            const qrCode = await QRCode.toDataURL(qrData);

            const ticketData = {
                userId,
                reservationEntryId: entry.id,
                ticketCode,
                qrCode,
            };

            const ticket = await TicketRepository.create(ticketData);

            subtotal += Number(entry.unitPrice);

            tickets.push(ticket);
        }
        
        const invoiceNumber = 
        `MC-${Date.now()}-${userId}`;

        const invoiceData = {
            userId,
            invoiceNumber,
            subtotal,
            total: subtotal,
        };

        const invoice = await InvoiceRepository.create(invoiceData);

        return {
            tickets,
            invoice,
        };
    }

    async getMyTickets(userId:number){
        return TicketRepository.findByUserId(userId);
    }
}