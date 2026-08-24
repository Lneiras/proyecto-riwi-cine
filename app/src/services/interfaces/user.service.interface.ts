// app/src/services/interfaces/user.service.interface.ts

import User from "../../models/user.model";
import { CreateUserDto } from "../../dto/create-user.dto";

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Contrato del Servicio de Usuarios.
 */

export interface IUserService {
  create(dto: CreateUserDto): Promise<User>;

  findAll(): Promise<User[]>;

  /**
   * Autentica credenciales y emite tokens (HU-007).
   * Lanza AppError ante credenciales inválidas, cuenta bloqueada o correo sin verificar.
   */
  login(email: string, password: string, ip?: string, userAgent?: string): Promise<AuthResult>;

  refresh(refreshToken: string): Promise<AuthResult>;

  /** Cierra sesión revocando el refresh token recibido (HU-007). */
  logout(refreshToken: string | undefined, ip?: string, userAgent?: string): Promise<void>;

  /** Inicia el flujo de recuperación de contraseña enviando un token por correo (HU-007). */
  forgotPassword(email: string, ip?: string, userAgent?: string): Promise<void>;

  /** Restablece la contraseña usando un token válido de recuperación (HU-007). */
  resetPassword(token: string, newPassword: string, ip?: string, userAgent?: string): Promise<void>;

  changeUserLocation(userId: number, location: string): Promise<User | null>;

  findById(id: number): Promise<User | null>;

  // esto es lo que permite actualizar el perfil del usuario, recibe el id del usuario
  // y un objeto con los campos a actualizar, en este caso solo el nombre
  updateProfile(userId: number, data: Partial<{ name: string }>): Promise<User>;
}
