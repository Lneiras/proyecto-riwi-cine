
export interface CreateTicketDto {
    userId: number;
    reservationEntryId: number;
    invoiceId: number;
    ticketCode: string;
    qrCode: string;
    status?: string;
    usedAt?: Date | null;
}