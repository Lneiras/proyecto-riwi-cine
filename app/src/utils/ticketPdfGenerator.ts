import PDFDocument from "pdfkit";

interface TicketPdfData {
    ticketCode: string;
    buyerName: string;
    movie: string;
    date: string;
    time: string;
    cinema: string;
    room: string;
    seat: string;
    format: string;
    ticketType: string;
    qrCode: string;
}

export function generateTicketPdf(data: TicketPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 50,
        });

        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => {
            chunks.push(chunk);
        });

        doc.on("end", () => {
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

        doc.text(`Código de entrada: ${data.ticketCode}`);
        doc.text(`Comprador: ${data.buyerName}`);

        doc.moveDown();

        doc.fontSize(16).text(data.movie);

        doc.moveDown();

        doc.fontSize(12);

        doc.text(`Fecha: ${data.date}`);
        doc.text(`Hora: ${data.time}`);
        doc.text(`Complejo: ${data.cinema}`);
        doc.text(`Sala: ${data.room}`);
        doc.text(`Silla: ${data.seat}`);
        doc.text(`Formato: ${data.format}`);
        doc.text(`Tipo de entrada: ${data.ticketType}`);

        doc.moveDown(2);

        doc.fontSize(14).text("Código QR");

        doc.moveDown();

        const qrBuffer = Buffer.from(
            data.qrCode.replace(
                /^data:image\/png;base64,/,
                ""
            ),
            "base64"
        );

        doc.image(qrBuffer, {
            fit: [180, 180],
            align: "center",
        });

        doc.moveDown(2);

        doc
            .fontSize(10)
            .text(
                "Este código QR es personal, único y válido para una sola entrada."
            );

        doc.moveDown();

        doc.text(
            "Condiciones de uso: presente esta entrada digital al ingresar a la sala."
        );

        doc.end();

    });
}