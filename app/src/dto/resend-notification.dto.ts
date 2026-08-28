// app/src/dto/resend-notification.dto.ts

export interface ResendNotificationDto {
  notificationId: number;
}

export function validateResendNotificationDto(body: unknown): {
  valid: boolean;
  error?: string;
  data: ResendNotificationDto;
} {
  const payload = (body ?? {}) as Record<string, unknown>;

  const idVal = payload.notificationId ?? payload.id;
  const notificationId = Number(idVal);

  if (!idVal || !Number.isInteger(notificationId) || notificationId <= 0) {
    return {
      valid: false,
      error:
        "El campo 'notificationId' es obligatorio y debe ser un entero positivo.",
      data: { notificationId: 0 },
    };
  }

  return {
    valid: true,
    data: { notificationId },
  };
}
