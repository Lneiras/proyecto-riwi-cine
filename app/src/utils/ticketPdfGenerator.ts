import PDFDocument from "pdfkit";

interface TicketPdfData {
    ticketCode: string;
    buyerName: string;
    movie: string;
    date: string;
    cinema: string;
    room: string;
    seat: string;
    format: string;
    ticketType: string;
    qrCode: string;
}

export function generateTicketPdf(data:TicketPdfData): Promise<Buffer>{
    return new Promise((resolve, reject) =>{
        const doc = new PDFDocument({
            size: "A4",
            margin: 50,
        });

        const chunks: Buffer[] = [];

        doc.on("data", (chunk)=>{
            chunks.push(chunk);
        });

        doc.on("end", ()=>{
            resolve(Buffer.concat(chunks));
        });

        doc.on("error", reject);

        doc
        .fontSize(24)
        .text("MULTICINE", {
            align: "center",
        });

        doc.moveDown();

        doc
        .fontSize(20)
        .text("ENTRADA DIGITAL", {
            align: "center",
        });

        doc.moveDown(2);

        doc.fontSize(12);
    })
}