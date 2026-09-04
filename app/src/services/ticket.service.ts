import crypto from "crypto";

import { User, ReservationEntry, Ticket } from "../models";

import TicketRepository from "../repositories/ticket.repository";
import InvoiceRepository from "../repositories/invoice.repository";
import { generateQrImage } from "../utils/qrCodeGenerator";
import { generateTicketPdf } from "../utils/ticketPdfGenerator";
import { AppError } from "../utils/apiResponse";

interface TicketDetail {
    id: number;
    ticketCode: string;
    qrCode: string;
    status: string;
    buyerName: string;
    movie: string;
    date: string;
    time: string;
    cinema: string;
    room: string;
    seat: string;
    format: string;
    ticketType: string;
}

class TicketService {

    async generateTickets(userId: number, reservationEntryIds: number[]) {
        if (!reservationEntryIds || !reservationEntryIds.length) {
            throw new AppError("Debe enviar al menos una entrada", 400, "MISSING_ENTRIES");
        }

        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError("Usuario no encontrado", 404, "USER_NOT_FOUND");
        }

        const entries = await ReservationEntry.findAll({
            where: { id: reservationEntryIds },
        });

        if (entries.length !== reservationEntryIds.length) {
            throw new AppError("Una o más entradas no existen", 404, "ENTRIES_NOT_FOUND");
        }

        const alreadyIssued = await Ticket.findAll({
            where: { reservationEntryId: reservationEntryIds },
        });

        if (alreadyIssued.length > 0) {
            throw new AppError(
                "Una o más reservas ya tienen una entrada generada",
                409,
                "TICKETS_ALREADY_EXIST"
            );
        }

        const subtotal = entries.reduce((sum, entry) => sum + Number(entry.unitPrice), 0);

        const invoice = await InvoiceRepository.create({
            userId,
            invoiceNumber: `MC-${Date.now()}-${userId}`,
            subtotal,
            total: subtotal,
        });

        const tickets = [];

        for (const entry of entries) {
            const ticketCode = crypto.randomUUID();

            const qrCode = await generateQrImage(
                JSON.stringify({ ticketCode, type: "MULTICINE_TICKET" })
            );

            const ticket = await TicketRepository.create({
                userId,
                reservationEntryId: entry.id,
                invoiceId: invoice.id,
                ticketCode,
                qrCode,
            });

            tickets.push(ticket);
        }

        return { tickets, invoice };
    }

    async getMyTickets(userId: number) {
        return TicketRepository.findByUserId(userId);
    }

    async getTicketDetail(userId: number, ticketId: number): Promise<TicketDetail> {
        const ticket = await TicketRepository.findDetailedById(ticketId);

        if (!ticket) {
            throw new AppError("Entrada no encontrada", 404, "TICKET_NOT_FOUND");
        }
        if (ticket.userId !== userId) {
            throw new AppError("No tienes permiso para consultar esta entrada", 403, "FORBIDDEN");
        }

        return this.mapTicketToDetail(ticket);
    }

    async getTicketPdfBuffer(userId: number, ticketId: number): Promise<Buffer> {
        const ticket = await TicketRepository.findDetailedById(ticketId);

        if (!ticket) {
            throw new AppError("Entrada no encontrada", 404, "TICKET_NOT_FOUND");
        }
        if (ticket.userId !== userId) {
            throw new AppError("No tienes permiso para descargar esta entrada", 403, "FORBIDDEN");
        }

        const detail = this.mapTicketToDetail(ticket);

        return generateTicketPdf({
            ticketCode: detail.ticketCode,
            buyerName: detail.buyerName,
            movie: detail.movie,
            date: detail.date,
            time: detail.time,
            cinema: detail.cinema,
            room: detail.room,
            seat: detail.seat,
            format: detail.format,
            ticketType: detail.ticketType,
            qrCode: detail.qrCode,
        });
    }

    async regenerateTicket(userId: number, ticketId: number) {
        const ticket = await TicketRepository.findById(ticketId);

        if (!ticket) {
            throw new AppError("Entrada no encontrada", 404, "TICKET_NOT_FOUND");
        }
        if (ticket.userId !== userId) {
            throw new AppError("No tienes permiso para regenerar esta entrada", 403, "FORBIDDEN");
        }
        if (ticket.status === "USED") {
            throw new AppError("No se puede regenerar una entrada ya utilizada", 409, "TICKET_ALREADY_USED");
        }

        const ticketCode = crypto.randomUUID();
        const qrCode = await generateQrImage(
            JSON.stringify({ ticketCode, type: "MULTICINE_TICKET" })
        );

        return TicketRepository.update(ticket.id, {
            ticketCode,
            qrCode,
            status: "ACTIVE",
            usedAt: null,
        });
    }

    /**
     * Convierte el ticket (con sus includes) en el objeto plano que pide
     * la HU: película, fecha, hora, complejo, sala, silla, formato,
     * tipo de entrada y nombre del comprador.
     */
    private mapTicketToDetail(ticket: any): TicketDetail {
        const entry = ticket.ReservationEntry;
        const showtime = entry.Showtime;
        const seat = entry.Seat;
        const buyer = ticket.User;

        const dateTime = new Date(showtime.dateTime);

        return {
            id: ticket.id,
            ticketCode: ticket.ticketCode,
            qrCode: ticket.qrCode,
            status: ticket.status,
            buyerName: `${buyer.name} ${buyer.lastName ?? ""}`.trim(),
            movie: showtime.Movie.title,
            date: dateTime.toLocaleDateString("es-CO"),
            time: dateTime.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
            cinema: showtime.Room.Cinema.name,
            room: showtime.Room.numberName,
            seat: `${seat.row}${seat.number}`,
            format: showtime.Format.name,
            ticketType: seat.type,
        };
    }
}

export default new TicketService();