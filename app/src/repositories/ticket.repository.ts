import { Ticket } from "../models";
import { CreateTicketDto } from "../dto/create-ticket.dto";


class TicketRepository {

    async create(data: CreateTicketDto): Promise<Ticket>{
        return Ticket.create(data);
    }

    async findByUserId(userId: number): Promise<Ticket[]> {
        return Ticket.findAll({
            where: { userId },
            order: [["createAt", "DESC"]],
        });
    }

    async findById(id: number): Promise<Ticket | null> {
        return Ticket.findByPk(id);
    }
}

export default new TicketRepository()