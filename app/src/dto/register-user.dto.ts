// app/src/dto/register-user.dto.ts

/**
 * DTO - Registro de Usuario (HU-006)
 * -----------------------------------
 * Representa la información solicitada por el formulario público de registro.
 * Los campos de confirmación y CAPTCHA se validan, pero no se almacenan.
 */
export interface RegisterUserDto {
  name: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  userGenreId?: number | null;

  email: string;
  confirmEmail: string;
  phone: string;

  password: string;
  confirmPassword: string;

  cityId: number;
  favoriteCinemaId?: number | null;

  acceptDataProcessing: boolean;
  acceptTerms: boolean;
  acceptCommercialCommunications?: boolean;

  captchaToken: string;
}
