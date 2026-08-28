import InvoiceRepository from "../repositories/invoice.repository";
import TicketRepository from "../repositories/ticket.repository";
import { AppError } from "../utils/apiResponse";

class InvoiceService {
    async getInvoiceDetail(userId: number, invoiceId: number) {
        const invoice = await InvoiceRepository.findById(invoiceId);

        if (!invoice) {
            throw new AppError("Factura no encontrada", 404, "INVOICE_NOT_FOUND");
        }
        if (invoice.userId !== userId) {
            throw new AppError("No tienes permiso para consultar esta factura", 403, "FORBIDDEN");
        }

        const tickets = await TicketRepository.findByInvoiceId(invoice.id);

        return {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            subtotal: invoice.subtotal,
            total: invoice.total,
            status: invoice.status,
            items: tickets.map((t) => ({
                ticketId: t.id,
                ticketCode: t.ticketCode,
            })),
        };
    }
}

export default new InvoiceService();