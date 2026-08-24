
import QRCode from "qrcode";

/**
 * Convierte cualquier texto en una imagen QR codificada en base64
 * (data URI), lista para renderizar directamente en un <img src="...">
 * del frontend, sin necesidad de guardar ni servir un archivo.
 *
 * Reutilizable a futuro por HU-014 (QR de entradas) y HU-018 (QR de
 * bonos digitales) — la lógica de "texto a imagen QR" es la misma,
 * solo cambia qué texto se codifica.
 */
export async function generateQrImage(data: string): Promise<string> {
    return QRCode.toDataURL(data, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 300,
    });
}