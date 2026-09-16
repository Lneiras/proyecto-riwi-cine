// app/src/tests/notification.test.ts

/**
 * Pruebas QA HU-015: Notificaciones Automáticas por Correo Electrónico
 * -------------------------------------------------------------------
 * - Escenario 1: Envío de correo transaccional exitoso y registro en historial.
 * - Escenario 2: Reintentos por fallo de envío (hasta 3 intentos) y marcado como fallida.
 * - Escenario 3: Respeto de preferencias de marketing vs. correos transaccionales obligatorios.
 * - Reenvío de notificaciones y gestión de preferencias.
 * - Validación de DTOs y renderizado de plantillas HTML corporativas.
 */

import { NotificationService } from "../services/notification.service";
import emailService from "../services/email.service";
import notificationHistoryRepository from "../repositories/notification-history.repository";
import notificationPreferenceRepository from "../repositories/notification-preference.repository";
import UserRepository from "../repositories/user.repository";
import { validateSendEmailNotificationDto } from "../dto/send-email-notification.dto";
import { validateUpdateNotificationPreferencesDto } from "../dto/update-notification-preferences.dto";
import { validateResendNotificationDto } from "../dto/resend-notification.dto";
import {
  renderAccountEmail,
  renderPurchaseEmail,
  renderReservationEmail,
  renderMarketingEmail,
} from "../templates/email-templates";

describe("HU-015 - Notificaciones Automáticas por Correo Electrónico", () => {
  let notificationService: NotificationService;
  const testUserId = 42;
  const testEmail = "usuario@correo.com";

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService = new NotificationService();
  });

  describe("Escenario 1: Envío de correo transaccional exitoso", () => {
    it("debe enviar un correo transaccional (compra) y registrarlo en el historial con estado 'sent'", async () => {
      // Mock de repositorios
      jest
        .spyOn(UserRepository, "findByEmail")
        .mockResolvedValue({ id: testUserId } as any);
      jest.spyOn(notificationHistoryRepository, "create").mockResolvedValue({
        id: 101,
        userId: testUserId,
        recipient: testEmail,
        type: "purchase",
        subject: "Confirmación de Compra #ORD-101",
        status: "pending",
        attempts: 0,
      } as any);

      const updateSpy = jest
        .spyOn(notificationHistoryRepository, "update")
        .mockResolvedValue({} as any);
      const sendSpy = jest
        .spyOn(emailService, "sendRawHtmlEmail")
        .mockResolvedValue(undefined);

      const result = await notificationService.sendEmail({
        userId: testUserId,
        recipient: testEmail,
        type: "purchase",
        subject: "Confirmación de Compra #ORD-101",
        templateData: {
          userName: "Juan Pérez",
          orderNumber: "ORD-101",
          movieTitle: "Avengers: Secret Wars",
          cinemaName: "Multicine Titan Plaza",
          showtime: "2026-09-01 19:00",
          items: [
            {
              name: "Boleta 2D General",
              quantity: 2,
              unitPrice: 15000,
              subtotal: 30000,
            },
          ],
          totalAmount: 30000,
          paymentMethod: "Tarjeta de Crédito",
        },
      });

      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(result.status).toBe("sent");
      expect(result.attempts).toBe(1);
      expect(result.sentAt).not.toBeNull();
      expect(updateSpy).toHaveBeenCalledWith(
        101,
        expect.objectContaining({ status: "sent", attempts: 1 })
      );
    });
  });

  describe("Escenario 2: Reintentos por fallo de envío", () => {
    it("debe realizar hasta 3 reintentos ante fallos del proveedor antes de marcar la notificación como 'failed'", async () => {
      jest
        .spyOn(UserRepository, "findByEmail")
        .mockResolvedValue({ id: testUserId } as any);
      jest.spyOn(notificationHistoryRepository, "create").mockResolvedValue({
        id: 102,
        userId: testUserId,
        recipient: testEmail,
        type: "account",
        subject: "Alerta de Seguridad",
        status: "pending",
        attempts: 0,
      } as any);

      jest
        .spyOn(notificationHistoryRepository, "update")
        .mockResolvedValue({} as any);
      const incSpy = jest
        .spyOn(notificationHistoryRepository, "incrementAttempts")
        .mockResolvedValue({} as any);
      const markFailedSpy = jest
        .spyOn(notificationHistoryRepository, "markAsFailed")
        .mockResolvedValue({} as any);

      // Simular fallo constante en el proveedor de email (ej. timeout / 502)
      const sendSpy = jest
        .spyOn(emailService, "sendRawHtmlEmail")
        .mockRejectedValue(new Error("Error 502: Bad Gateway de Resend"));

      const result = await notificationService.sendEmail({
        userId: testUserId,
        recipient: testEmail,
        type: "account",
        subject: "Alerta de Seguridad",
        templateData: {
          userName: "Juan Pérez",
          actionMessage: "Intento de inicio de sesión sospechoso detectado.",
        },
      });

      // Se deben ejecutar exactamente 3 intentos antes de marcar como fallida
      expect(sendSpy).toHaveBeenCalledTimes(3);
      expect(incSpy).toHaveBeenCalledTimes(3);
      expect(markFailedSpy).toHaveBeenCalledWith(
        102,
        expect.stringContaining("Error 502")
      );
      expect(result.status).toBe("failed");
      expect(result.attempts).toBe(3);
      expect(result.errorMessage).toContain("Error 502");
    });
  });

  describe("Escenario 3: Respeto de preferencias de marketing", () => {
    it("no debe enviar correos de marketing si el usuario tiene desactivadas las comunicaciones comerciales", async () => {
      jest
        .spyOn(UserRepository, "findByEmail")
        .mockResolvedValue({ id: testUserId } as any);
      // commercialEnabled = false
      jest
        .spyOn(notificationPreferenceRepository, "findByUserId")
        .mockResolvedValue({
          userId: testUserId,
          emailEnabled: true,
          smsEnabled: false,
          commercialEnabled: false,
        } as any);

      const createHistorySpy = jest
        .spyOn(notificationHistoryRepository, "create")
        .mockResolvedValue({
          id: 103,
          status: "failed",
        } as any);

      const sendSpy = jest.spyOn(emailService, "sendRawHtmlEmail");

      const result = await notificationService.sendEmail({
        userId: testUserId,
        recipient: testEmail,
        type: "marketing",
        subject: "¡Próximos Estrenos Imperdibles en Multicine!",
        templateData: {
          campaignTitle: "Cartelera de Fin de Semana",
          campaignBody: "Descuentos en funciones 3D.",
        },
      });

      // El correo NO debe enviarse
      expect(sendSpy).not.toHaveBeenCalled();
      expect(result.skippedDueToPreferences).toBe(true);
      expect(result.status).toBe("failed");
      expect(createHistorySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "failed",
          errorMessage: expect.stringContaining("comunicaciones comerciales"),
        })
      );
    });

    it("sí debe enviar correos de marketing cuando el usuario activa las comunicaciones comerciales", async () => {
      jest
        .spyOn(UserRepository, "findByEmail")
        .mockResolvedValue({ id: testUserId } as any);
      // commercialEnabled = true
      jest
        .spyOn(notificationPreferenceRepository, "findByUserId")
        .mockResolvedValue({
          userId: testUserId,
          emailEnabled: true,
          smsEnabled: false,
          commercialEnabled: true,
        } as any);

      jest.spyOn(notificationHistoryRepository, "create").mockResolvedValue({
        id: 104,
        status: "pending",
      } as any);
      jest
        .spyOn(notificationHistoryRepository, "update")
        .mockResolvedValue({} as any);
      const sendSpy = jest
        .spyOn(emailService, "sendRawHtmlEmail")
        .mockResolvedValue(undefined);

      const result = await notificationService.sendEmail({
        userId: testUserId,
        recipient: testEmail,
        type: "marketing",
        subject: "¡Próximos Estrenos Imperdibles en Multicine!",
        templateData: {
          campaignTitle: "Cartelera de Fin de Semana",
          campaignBody: "Descuentos en funciones 3D.",
        },
      });

      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(result.status).toBe("sent");
    });

    it("sí continúa enviando correos transaccionales obligatorios aun cuando el marketing esté desactivado", async () => {
      jest
        .spyOn(UserRepository, "findByEmail")
        .mockResolvedValue({ id: testUserId } as any);
      jest
        .spyOn(notificationPreferenceRepository, "findByUserId")
        .mockResolvedValue({
          userId: testUserId,
          commercialEnabled: false,
        } as any);

      jest.spyOn(notificationHistoryRepository, "create").mockResolvedValue({
        id: 105,
        status: "pending",
      } as any);
      jest
        .spyOn(notificationHistoryRepository, "update")
        .mockResolvedValue({} as any);
      const sendSpy = jest
        .spyOn(emailService, "sendRawHtmlEmail")
        .mockResolvedValue(undefined);

      const result = await notificationService.sendEmail({
        userId: testUserId,
        recipient: testEmail,
        type: "reservation",
        subject: "Confirmación de Reserva #RES-500",
        templateData: {
          userName: "Juan Pérez",
          reservationCode: "RES-500",
          movieTitle: "Batman",
          cinemaName: "Multicine Titan",
          roomName: "Sala 1",
          showtime: "2026-09-02 20:00",
          seats: ["A1", "A2"],
        },
      });

      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(result.status).toBe("sent");
    });
  });

  describe("Reenvío de Notificaciones e Historial", () => {
    it("debe permitir reintentar el reenvío de una notificación mediante resendNotification", async () => {
      const mockRecord = {
        id: 106,
        userId: testUserId,
        recipient: testEmail,
        type: "purchase",
        subject: "Confirmación de Compra",
        bodyHtml: "<p>Comprobante de compra</p>",
        status: "failed",
        attempts: 3,
        update: jest.fn().mockResolvedValue(true),
      };

      jest
        .spyOn(notificationHistoryRepository, "findById")
        .mockResolvedValue(mockRecord as any);
      jest
        .spyOn(notificationHistoryRepository, "update")
        .mockResolvedValue({} as any);
      const sendSpy = jest
        .spyOn(emailService, "sendRawHtmlEmail")
        .mockResolvedValue(undefined);

      const resendResult = await notificationService.resendNotification(106);

      expect(mockRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: "pending", attempts: 0 })
      );
      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(resendResult.status).toBe("sent");
    });

    it("debe consultar el historial paginado de notificaciones", async () => {
      jest
        .spyOn(notificationHistoryRepository, "findHistory")
        .mockResolvedValue({
          rows: [{ id: 1, type: "purchase", status: "sent" }] as any,
          count: 1,
        });

      const history = await notificationService.getHistory({
        userId: testUserId,
        page: 1,
        limit: 10,
      });

      expect(history.items.length).toBe(1);
      expect(history.meta.total).toBe(1);
      expect(history.meta.page).toBe(1);
      expect(history.meta.totalPages).toBe(1);
    });

    it("debe actualizar y consultar las preferencias de notificación", async () => {
      const mockPreferences = {
        userId: testUserId,
        emailEnabled: true,
        smsEnabled: true,
        commercialEnabled: true,
      };

      jest
        .spyOn(notificationPreferenceRepository, "updateByUserId")
        .mockResolvedValue(mockPreferences as any);
      jest
        .spyOn(notificationPreferenceRepository, "findByUserId")
        .mockResolvedValue(mockPreferences as any);

      const updated = await notificationService.updatePreferences(testUserId, {
        smsEnabled: true,
        commercialEnabled: true,
      });

      expect(updated.smsEnabled).toBe(true);
      expect(updated.commercialEnabled).toBe(true);

      const fetched = await notificationService.getPreferences(testUserId);
      expect(fetched.smsEnabled).toBe(true);
      expect(fetched.commercialEnabled).toBe(true);
    });
  });

  describe("Validación de DTOs", () => {
    it("debe validar correctamente SendEmailNotificationDto", () => {
      // Válido
      const valid = validateSendEmailNotificationDto({
        recipient: "test@correo.com",
        type: "purchase",
        subject: "Mi Compra",
      });
      expect(valid.valid).toBe(true);
      expect(valid.data.recipient).toBe("test@correo.com");

      // Inválido por correo
      const invalidEmail = validateSendEmailNotificationDto({
        recipient: "correo-invalido",
        type: "purchase",
        subject: "Mi Compra",
      });
      expect(invalidEmail.valid).toBe(false);
      expect(invalidEmail.error).toContain("recipient");

      // Inválido por tipo
      const invalidType = validateSendEmailNotificationDto({
        recipient: "test@correo.com",
        type: "tipo_inexistente",
        subject: "Mi Compra",
      });
      expect(invalidType.valid).toBe(false);
      expect(invalidType.error).toContain("type");
    });

    it("debe validar correctamente UpdateNotificationPreferencesDto", () => {
      const valid = validateUpdateNotificationPreferencesDto({
        emailEnabled: true,
        commercialEnabled: false,
      });
      expect(valid.valid).toBe(true);
      expect(valid.data.emailEnabled).toBe(true);

      const empty = validateUpdateNotificationPreferencesDto({});
      expect(empty.valid).toBe(false);

      const invalidType = validateUpdateNotificationPreferencesDto({
        emailEnabled: "no-boolean",
      });
      expect(invalidType.valid).toBe(false);
    });

    it("debe validar correctamente ResendNotificationDto", () => {
      const valid = validateResendNotificationDto({ notificationId: 15 });
      expect(valid.valid).toBe(true);
      expect(valid.data.notificationId).toBe(15);

      const invalid = validateResendNotificationDto({ notificationId: -1 });
      expect(invalid.valid).toBe(false);
    });
  });

  describe("Renderizado de Plantillas HTML Corporativas (Task 4)", () => {
    it("debe renderizar la plantilla de cuenta", () => {
      const html = renderAccountEmail({
        userName: "Carlos",
        actionTitle: "Bienvenido",
        actionMessage: "Gracias por registrarte.",
      });
      expect(html).toContain("MULTICINE");
      expect(html).toContain("Carlos");
      expect(html).toContain("Bienvenido");
    });

    it("debe renderizar la plantilla de compra", () => {
      const html = renderPurchaseEmail({
        userName: "Carlos",
        orderNumber: "ORD-555",
        movieTitle: "Spider-Man",
        totalAmount: 25000,
      });
      expect(html).toContain("¡Compra Exitosa!");
      expect(html).toContain("ORD-555");
      expect(html).toContain("Spider-Man");
    });

    it("debe renderizar la plantilla de reserva", () => {
      const html = renderReservationEmail({
        userName: "Carlos",
        reservationCode: "RES-777",
        movieTitle: "Avatar",
        cinemaName: "Cine 1",
        roomName: "Sala 2",
        showtime: "18:00",
        seats: ["B1", "B2"],
      });
      expect(html).toContain("Confirmación de Reserva");
      expect(html).toContain("RES-777");
      expect(html).toContain("Avatar");
      expect(html).toContain("B1, B2");
    });

    it("debe renderizar la plantilla de marketing", () => {
      const html = renderMarketingEmail({
        userName: "Carlos",
        campaignTitle: "Gran Estreno",
        campaignBody: "Ven a ver las nuevas películas.",
        promoCode: "CINE50",
      });
      expect(html).toContain("Gran Estreno");
      expect(html).toContain("CINE50");
      expect(html).toContain("preferencias de notificación");
    });
  });
});
