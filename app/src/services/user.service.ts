// app/src/services/user.service.ts

import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model";
import { CreateUserDto } from "../dto/create-user.dto";
import UserRepository from "../repositories/user.repository";
import AccessLogRepository from "../repositories/access-log.repository";
import PasswordResetTokenRepository from "../repositories/password-reset-token.repository";
import MembershipService from "./membership.service";
import CityRepository from "../repositories/cities.repository";
import EmailService from "./email.service";
import Role from "../models/role.model";
import Membership from "../models/membership.model";
import { IUserService, AuthResult } from "./interfaces/user.service.interface";
import { signAccessToken, signRefreshToken, verifyToken } from "../utils/jwt";
import { durationToMs } from "../utils/time";
import { AppError } from "../utils/apiResponse";

/**
 * Reglas de seguridad HU-007.
 */
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000; // 30 minutos
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

/**
 * Servicio de Usuarios
 * --------------------
 * Contiene toda la lógica de negocio relacionada con la entidad User:
 * hashing de contraseñas, emisión/rotación de tokens JWT, bloqueo por
 * intentos fallidos, recuperación de contraseña y ubicación.
 *
 * El Service conoce las reglas del negocio.
 * El Repository únicamente conoce cómo guardar y consultar información.
 */

interface LoginContext {
  ip?: string;
  userAgent?: string;
}

class UserService implements IUserService {
  /** Persiste un evento de auditoría sin romper el flujo si falla. */
  private async logAccess(
    event: string,
    userId: number | null,
    ctx?: LoginContext
  ): Promise<void> {
    try {
      await AccessLogRepository.create({
        userId,
        event,
        ipAddress: ctx?.ip ?? null,
        userAgent: ctx?.userAgent?.slice(0, 255) ?? null,
      });
    } catch (error) {
      console.error("No fue posible registrar el evento de acceso:", error);
    }
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existingUser = await UserRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error("El correo electrónico ya se encuentra registrado.");
    }

    // Los endpoints públicos no pueden autootorgarse rol ni membresía.
    const clientRole = await Role.findOne({ where: { name: "Cliente" } });
    if (!clientRole) throw new Error("El rol Cliente no está configurado");

    const bronzeMembership = await Membership.findOne({ where: { name: "Bronce" } });
    if (!bronzeMembership) throw new Error("La membresía Bronce no está configurada");

    const roleId = clientRole.id;
    const membershipId = bronzeMembership.id;
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await UserRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      roleId,
      membershipId,
      cityId: dto.cityId ?? null,
      userGenreId: dto.userGenreId ?? null,
      emailVerified: false,
      accountStatus: "inactiva",
      registeredAt: new Date(),
    });

    // HU-006: la membresía individual recibe también un código único.
    await MembershipService.createForUser(user.id, membershipId);

    return user;
  }

  async verifyEmail(userId: number): Promise<User | null> {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");

    return await UserRepository.update(userId, { emailVerified: true, accountStatus: "activa" });
  }

  async findAll(): Promise<User[]> {
    return await UserRepository.findAll();
  }

  /**
   * HU-007 Escenario 1: login exitoso.
   * - Emite Access Token (15 min) + Refresh Token (7 días).
   * - Invalida el refresh token anterior (todas las sesiones previas).
   *
   * HU-007 Escenario 2: 5 intentos fallidos consecutivos bloquean la
   * cuenta por 15 minutos.
   *
   * HU-007 Escenario 3: si el correo no está verificado se informa
   * específicamente que debe verificarlo antes de iniciar sesión.
   */
  async login(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    const ctx: LoginContext = { ip, userAgent };

    if (typeof email !== "string" || typeof password !== "string") {
      throw new AppError("Correo y contraseña son requeridos.", 400, "VALIDATION_ERROR");
    }

    const user = await UserRepository.findByEmail(email.trim().toLowerCase());

    if (!user) {
      await this.logAccess("login_failed", null, ctx);
      throw new AppError("Credenciales inválidas.", 401, "INVALID_CREDENTIALS");
    }

    // Escenario 2: cuenta bloqueada temporalmente.
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const minutesLeft = Math.max(1, Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000));
      await this.logAccess("login_blocked", user.id, ctx);
      throw new AppError(
        `Tu cuenta está bloqueada temporalmente. Intenta nuevamente en ${minutesLeft} minuto(s).`,
        423,
        "ACCOUNT_LOCKED"
      );
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      const attempts = user.failedLoginAttempts + 1;

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        // Quinto intento fallido: bloqueo temporal de la cuenta.
        const lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        await UserRepository.update(user.id, {
          failedLoginAttempts: 0,
          lockedUntil,
        });
        await this.logAccess("lockout", user.id, ctx);
        throw new AppError(
          "Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Inténtalo en 15 minutos.",
          423,
          "ACCOUNT_LOCKED"
        );
      }

      await UserRepository.update(user.id, { failedLoginAttempts: attempts });
      await this.logAccess("login_failed", user.id, ctx);
      const remaining = MAX_FAILED_ATTEMPTS - attempts;
      throw new AppError(
        `Credenciales inválidas. Te quedan ${remaining} intento(s) antes del bloqueo temporal.`,
        401,
        "INVALID_CREDENTIALS"
      );
    }

    // Escenario 3: correo no verificado / cuenta inactiva.
    if (!user.emailVerified || user.accountStatus !== "activa") {
      await this.logAccess("login_failed_unverified", user.id, ctx);
      throw new AppError(
        "Debes verificar tu correo electrónico antes de iniciar sesión.",
        403,
        "EMAIL_NOT_VERIFIED"
      );
    }

    // Login exitoso: limpia el estado de bloqueo e invalida sesiones previas.
    await UserRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
    await UserRepository.revokeAllRefreshTokens(user.id);

    const accessToken = signAccessToken(user.id, user.roleId);
    const refreshToken = signRefreshToken(user.id);

    const refreshMs = durationToMs(process.env.JWT_REFRESH_EXPIRES_IN || "7d");
    const expiresAt = new Date(Date.now() + refreshMs);

    await UserRepository.saveRefreshToken(user.id, refreshToken, expiresAt);
    await this.logAccess("login_success", user.id, ctx);

    return { user, accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = verifyToken(refreshToken);
    if (typeof payload.sub !== "number") {
      throw new AppError("Token de refresco inválido.", 401, "INVALID_REFRESH_TOKEN");
    }

    const stored = await UserRepository.findValidRefreshToken(refreshToken);
    if (!stored || stored.userId !== payload.sub) {
      throw new AppError(
        "Token de refresco inválido o expirado.",
        401,
        "INVALID_REFRESH_TOKEN"
      );
    }

    const user = await UserRepository.findById(payload.sub);
    if (!user) {
      throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
    }

    if (!user.emailVerified || user.accountStatus !== "activa") {
      throw new AppError("La cuenta aún no está activa.", 403, "ACCOUNT_NOT_ACTIVE");
    }

    // Rotación: se revoca el token usado y se emite uno nuevo
    await UserRepository.revokeRefreshToken(refreshToken);

    const newAccessToken = signAccessToken(user.id, user.roleId);
    const newRefreshToken = signRefreshToken(user.id);

    const refreshMs = durationToMs(process.env.JWT_REFRESH_EXPIRES_IN || "7d");
    const expiresAt = new Date(Date.now() + refreshMs);
    await UserRepository.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * HU-007 Task 2: cierra sesión revocando el refresh token recibido.
   * Es idempotente: no falla si el token no existe o ya fue revocado.
   */
  async logout(
    refreshToken: string | undefined,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    if (refreshToken) {
      const stored = await UserRepository.findValidRefreshToken(refreshToken);
      if (stored) {
        await UserRepository.revokeRefreshToken(refreshToken);
        await this.logAccess("logout", stored.userId, { ip, userAgent });
      }
    }
  }

  /**
   * HU-007 Task 2: inicia el flujo "olvidé mi contraseña".
   * Genera un token de un solo uso (30 min) y lo envía por correo.
   * Responde siempre de forma genérica para no revelar si el correo existe.
   */
  async forgotPassword(email: string, ip?: string, userAgent?: string): Promise<void> {
    if (typeof email !== "string" || !email.trim()) {
      throw new AppError("El correo electrónico es requerido.", 400, "VALIDATION_ERROR");
    }

    const ctx: LoginContext = { ip, userAgent };
    const user = await UserRepository.findByEmail(email.trim().toLowerCase());

    if (!user) {
      await this.logAccess("forgot_password_unknown_email", null, ctx);
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    await PasswordResetTokenRepository.create({ userId: user.id, tokenHash, expiresAt });
    await EmailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token: resetToken,
    });
    await this.logAccess("forgot_password", user.id, ctx);
  }

  /**
   * HU-007 Task 2: restablece la contraseña con un token válido.
   * Además revoca todas las sesiones activas del usuario.
   */
  async resetPassword(
    token: string,
    newPassword: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    if (typeof token !== "string" || !token.trim()) {
      throw new AppError("El token de recuperación es requerido.", 400, "TOKEN_REQUIRED");
    }

    if (
      typeof newPassword !== "string" ||
      !PASSWORD_REGEX.test(newPassword)
    ) {
      throw new AppError(
        "La contraseña debe tener mínimo 10 caracteres e incluir mayúscula, minúscula, número y carácter especial.",
        400,
        "WEAK_PASSWORD"
      );
    }

    const ctx: LoginContext = { ip, userAgent };
    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");
    const stored = await PasswordResetTokenRepository.findByHash(tokenHash);

    if (!stored) {
      throw new AppError("Token de recuperación inválido.", 400, "TOKEN_INVALID");
    }

    if (stored.usedAt) {
      throw new AppError("El token de recuperación ya fue utilizado.", 400, "TOKEN_ALREADY_USED");
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new AppError("El token de recuperación expiró.", 400, "TOKEN_EXPIRED");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await UserRepository.update(stored.userId, {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
    await PasswordResetTokenRepository.markAsUsed(stored.id);
    // Seguridad: ninguna sesión previa sobrevive a un cambio de contraseña.
    await UserRepository.revokeAllRefreshTokens(stored.userId);
    await this.logAccess("reset_password", stored.userId, ctx);
  }

  async changeUserLocation(userId: number, location: string): Promise<User | null> {
    const city = await CityRepository.findByName(location);
    if (!city) throw new Error("City not found");

    return await UserRepository.changeUserLocation(userId, city.id);
  }

  async findById(id: number): Promise<User | null> {
    return await UserRepository.findById(id);
  }
}

export default new UserService();
