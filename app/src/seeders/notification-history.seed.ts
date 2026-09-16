// app/src/seeders/notification-history.seed.ts

/**
 * Seed de historial de notificaciones (tabla `notificationHistories`).
 * Genera registros de ejemplo para auditar eventos transaccionales,
 * reintentos por fallo, compras, reservas y campañas de marketing (HU-015).
 */

import NotificationHistory, { NotificationType, NotificationStatus } from "../models/notification-history.model";
import {
  renderAccountEmail,
  renderPurchaseEmail,
  renderReservationEmail,
  renderMarketingEmail,
} from "../templates/email-templates";

export interface NotificationHistorySeed {
  userEmail: string;
  type: NotificationType;
  subject: string;
  status: NotificationStatus;
  attempts: number;
  errorMessage: string | null;
  payload: Record<string, unknown>;
  sentAt: Date | null;
}

export const notificationHistorySeedData: NotificationHistorySeed[] = [
  {
    userEmail: "juan@correo.com",
    type: "purchase",
    subject: "Comprobante de Compra #ORD-2026-001 - Multicine",
    status: "sent",
    attempts: 1,
    errorMessage: null,
    payload: {
      userName: "Juan Pérez",
      orderNumber: "ORD-2026-001",
      movieTitle: "Avengers: Secret Wars",
      cinemaName: "Multicine Titan Plaza",
      showtime: "2026-09-01 19:00",
      items: [
        { name: "Boleta 2D General", quantity: 2, unitPrice: 15000, subtotal: 30000 },
        { name: "Combo Crispetas Grande", quantity: 1, unitPrice: 18000, subtotal: 18000 },
      ],
      totalAmount: 48000,
      paymentMethod: "Tarjeta de Crédito",
    },
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    userEmail: "maria@correo.com",
    type: "account",
    subject: "Bienvenido a Multicine - Activa tu cuenta",
    status: "sent",
    attempts: 1,
    errorMessage: null,
    payload: {
      userName: "María López",
      actionTitle: "¡Bienvenida a Multicine!",
      actionMessage: "Tu registro se completó correctamente. Comienza a disfrutar de nuestras funciones y beneficios.",
      buttonText: "Explorar Cartelera",
      buttonUrl: "https://multicine.com/cartelera",
    },
    sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    userEmail: "jose@correo.com",
    type: "reservation",
    subject: "Confirmación de Reserva #RES-8821 - Multicine",
    status: "sent",
    attempts: 1,
    errorMessage: null,
    payload: {
      userName: "Jose Perez",
      reservationCode: "RES-8821",
      movieTitle: "El Señor de los Anillos",
      cinemaName: "Multicine Mall Plaza",
      roomName: "Sala VIP 1",
      showtime: "2026-09-05 21:00",
      seats: ["C4", "C5"],
    },
    sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    userEmail: "franco@correo.com",
    type: "marketing",
    subject: "🎬 Gran Estreno del Mes: Descuentos Exclusivos en Multicine",
    status: "sent",
    attempts: 1,
    errorMessage: null,
    payload: {
      userName: "Franco Perez",
      campaignTitle: "Próximos Estrenos Imperdibles",
      campaignBody: "Disfruta de beneficios especiales por ser miembro Platino en nuestras funciones 3D e IMAX.",
      promoCode: "PLATINO2026",
      discountText: "20% OFF en Confitería",
    },
    sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    userEmail: "juan@correo.com",
    type: "account",
    subject: "Alerta de Seguridad: Intento de inicio de sesión",
    status: "failed",
    attempts: 3,
    errorMessage: "Error 502: Proveedor de correo no disponible tras 3 intentos con backoff.",
    payload: {
      userName: "Juan Pérez",
      actionTitle: "Alerta de Seguridad",
      actionMessage: "Se intentó enviar esta notificación pero el proveedor no respondió.",
    },
    sentAt: null,
  },
  {
    userEmail: "maria@correo.com",
    type: "purchase",
    subject: "Comprobante de Compra #ORD-2026-002 - Multicine",
    status: "pending",
    attempts: 0,
    errorMessage: null,
    payload: {
      userName: "María López",
      orderNumber: "ORD-2026-002",
      movieTitle: "Interstellar",
      totalAmount: 18000,
    },
    sentAt: null,
  },
];

export async function seedNotificationHistories(
  userIdsByEmail: Map<string, number>
): Promise<void> {
  let count = 0;

  for (const data of notificationHistorySeedData) {
    const userId = userIdsByEmail.get(data.userEmail);
    if (!userId) continue;

    let bodyHtml: string | null = null;
    if (data.type === "purchase") {
      bodyHtml = renderPurchaseEmail(data.payload as any);
    } else if (data.type === "reservation") {
      bodyHtml = renderReservationEmail(data.payload as any);
    } else if (data.type === "marketing") {
      bodyHtml = renderMarketingEmail(data.payload as any);
    } else {
      bodyHtml = renderAccountEmail(data.payload as any);
    }

    const [, created] = await NotificationHistory.findOrCreate({
      where: {
        userId,
        subject: data.subject,
        type: data.type,
      },
      defaults: {
        userId,
        recipient: data.userEmail,
        type: data.type,
        subject: data.subject,
        bodyHtml,
        status: data.status,
        attempts: data.attempts,
        errorMessage: data.errorMessage,
        payload: data.payload,
        sentAt: data.sentAt,
      },
    });

    if (created) count++;
  }

  console.log(`✔ notificationHistories: ${count} registros nuevos creados`);
}
