import { Model } from "sequelize";
import {
    Ticket,
    ReservationEntry,
    Showtime,
    Seat,
    Movie,
    Room,
    Cinema,
    Format,
    Language,
} from "../models";

class TicketRepository {
    async findByUserId(userId: number): Promise<Ticket[]> {
        return Ticket.findAll({
            where: { userId },
            include: [
                {
                    model: ReservationEntry,
                    include: [
                        {
                            model: Showtime,
                            include: [
                                Movie,
                                Room,
                                Format,
                                Language,
                            ],
                        },
                        Seat,
                    ],
                },
            ],
            order: [["createAt", "DESC"]],
        });
    }

    async findById(id: number): Promise<Ticket | null> {
        return Ticket.findByPk(id, {
            include: [
                {
                    model: ReservationEntry,
                    include: [
                        {
                            model: Showtime,
                            include: [
                                Movie,
                                Room,
                                Format,
                                Language,
                            ],
                        },
                        Seat,
                    ],
                },
            ],
        });
    }
}

export default new TicketRepository()