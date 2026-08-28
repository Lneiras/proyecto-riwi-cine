import { Ticket, User, ReservationEntry, Showtime, Movie, Room, Cinema, Format, Seat } from "../models";
import { CreateTicketDto } from "../dto/create-ticket.dto";

class TicketRepository {

    async create(data: CreateTicketDto): Promise<Ticket> {
        return Ticket.create(data);
    }

    async findByUserId(userId: number): Promise<Ticket[]> {
        return Ticket.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
        });
    }

    async findById(id: number): Promise<Ticket | null> {
        return Ticket.findByPk(id);
    }

    async findByInvoiceId(invoiceId: number): Promise<Ticket[]> {
        return Ticket.findAll({ where: { invoiceId } });
    }

    /**
     * Trae el ticket con TODO lo necesario para armar el PDF / la respuesta
     * de GET /tickets/:id: comprador, función (película, formato), sala,
     * cine y silla. Se apoya en las asociaciones que ya están en models/index.ts.
     */
    async findDetailedById(id: number): Promise<Ticket | null> {
        return Ticket.findByPk(id, {
            include: [
                { model: User },
                {
                    model: ReservationEntry,
                    include: [
                        {
                            model: Showtime,
                            include: [Movie, Format, { model: Room, include: [Cinema] }],
                        },
                        { model: Seat },
                    ],
                },
            ],
        });
    }

    async update(
        id: number,
        data: Partial<CreateTicketDto> & { status?: string; usedAt?: Date | null }
    ): Promise<Ticket | null> {
        await Ticket.update(data, { where: { id } });
        return this.findById(id);
    }
}

export default new TicketRepository();