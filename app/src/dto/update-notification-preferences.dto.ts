// app/src/dto/update-notification-preferences.dto.ts

export interface UpdateNotificationPreferencesDto {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  commercialEnabled?: boolean;
}

export function validateUpdateNotificationPreferencesDto(body: unknown): {
  valid: boolean;
  error?: string;
  data: UpdateNotificationPreferencesDto;
} {
  const payload = (body ?? {}) as Record<string, unknown>;
  const data: UpdateNotificationPreferencesDto = {};

  if (payload.emailEnabled !== undefined) {
    if (typeof payload.emailEnabled !== "boolean") {
      return {
        valid: false,
        error: "El campo 'emailEnabled' debe ser un booleano.",
        data,
      };
    }
    data.emailEnabled = payload.emailEnabled;
  }

  if (payload.smsEnabled !== undefined) {
    if (typeof payload.smsEnabled !== "boolean") {
      return {
        valid: false,
        error: "El campo 'smsEnabled' debe ser un booleano.",
        data,
      };
    }
    data.smsEnabled = payload.smsEnabled;
  }

  if (payload.commercialEnabled !== undefined) {
    if (typeof payload.commercialEnabled !== "boolean") {
      return {
        valid: false,
        error: "El campo 'commercialEnabled' debe ser un booleano.",
        data,
      };
    }
    data.commercialEnabled = payload.commercialEnabled;
  }

  if (Object.keys(data).length === 0) {
    return {
      valid: false,
      error:
        "Debes enviar al menos una preferencia para actualizar ('emailEnabled', 'smsEnabled' o 'commercialEnabled').",
      data,
    };
  }

  return {
    valid: true,
    data,
  };
}
