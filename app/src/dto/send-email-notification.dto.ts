// app/src/dto/send-email-notification.dto.ts

export type NotificationCategory =
  "account" | "purchase" | "reservation" | "marketing";

export interface SendEmailNotificationDto {
  recipient: string;
  type: NotificationCategory;
  subject: string;
  templateData?: Record<string, unknown>;
  userId?: number;
  customHtml?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_TYPES: NotificationCategory[] = [
  "account",
  "purchase",
  "reservation",
  "marketing",
];

export function validateSendEmailNotificationDto(body: unknown): {
  valid: boolean;
  error?: string;
  data: SendEmailNotificationDto;
} {
  const payload = (body ?? {}) as Record<string, unknown>;

  const data: Partial<SendEmailNotificationDto> = {};

  if (
    !payload.recipient ||
    typeof payload.recipient !== "string" ||
    !EMAIL_REGEX.test(payload.recipient.trim())
  ) {
    return {
      valid: false,
      error:
        "El campo 'recipient' es obligatorio y debe ser un correo electrónico válido.",
      data: data as SendEmailNotificationDto,
    };
  }
  data.recipient = payload.recipient.trim().toLowerCase();

  if (
    !payload.type ||
    typeof payload.type !== "string" ||
    !ALLOWED_TYPES.includes(payload.type as NotificationCategory)
  ) {
    return {
      valid: false,
      error: `El campo 'type' es obligatorio y debe ser uno de: ${ALLOWED_TYPES.join(", ")}.`,
      data: data as SendEmailNotificationDto,
    };
  }
  data.type = payload.type as NotificationCategory;

  if (
    !payload.subject ||
    typeof payload.subject !== "string" ||
    payload.subject.trim().length === 0
  ) {
    return {
      valid: false,
      error: "El campo 'subject' es obligatorio y no puede estar vacío.",
      data: data as SendEmailNotificationDto,
    };
  }
  data.subject = payload.subject.trim();

  if (payload.templateData !== undefined) {
    if (
      typeof payload.templateData !== "object" ||
      payload.templateData === null ||
      Array.isArray(payload.templateData)
    ) {
      return {
        valid: false,
        error: "El campo 'templateData' debe ser un objeto.",
        data: data as SendEmailNotificationDto,
      };
    }
    data.templateData = payload.templateData as Record<string, unknown>;
  } else {
    data.templateData = {};
  }

  if (payload.userId !== undefined) {
    const userIdNum = Number(payload.userId);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      return {
        valid: false,
        error:
          "El campo 'userId' debe ser un entero positivo si se proporciona.",
        data: data as SendEmailNotificationDto,
      };
    }
    data.userId = userIdNum;
  }

  if (payload.customHtml !== undefined) {
    if (typeof payload.customHtml !== "string") {
      return {
        valid: false,
        error: "El campo 'customHtml' debe ser un string.",
        data: data as SendEmailNotificationDto,
      };
    }
    data.customHtml = payload.customHtml;
  }

  return {
    valid: true,
    data: data as SendEmailNotificationDto,
  };
}
