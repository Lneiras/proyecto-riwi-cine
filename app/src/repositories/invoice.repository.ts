import { Invoice } from "../models";
import { CreateInvoiceDto } from "../dto/create-invoice.dto";

class InvoiceRepository{
    async create(data: CreateInvoiceDto): Promise<Invoice>{
        return Invoice.create(data);
    }

    async findById(id: number): Promise<Invoice | null>{
        return Invoice.findByPk(id);
    }

    async findByUserId(userId: number): Promise<Invoice[]>{
        return Invoice.findAll({
            where: {userId},
            order: [["createdAt", "DESC"]],
        });
    }
}