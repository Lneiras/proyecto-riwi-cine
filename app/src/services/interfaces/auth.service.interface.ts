import User from "../../models/user.model";
import UserMembership from "../../models/user-membership.model";
import { RegisterUserDto } from "../../dto/register-user.dto";

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  user: User;
  membership: UserMembership;
  activationExpiresAt: Date;
}

export interface IAuthService {
  /** Registra el usuario y crea los recursos asociados de HU-006. */
  register(data: RegisterUserDto, remoteIp?: string): Promise<RegisterResult>;

  /** Verifica el token enviado por correo y habilita la cuenta. */
  verifyEmail(token: string): Promise<User>;

  /** Renueva el token de acceso. */
  refresh(refreshToken: string): Promise<AuthResult>;
}
