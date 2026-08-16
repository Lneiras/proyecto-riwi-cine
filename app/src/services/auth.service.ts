import bcrypt from "bcryptjs";
import crypto from "crypto";
import sequelize from "../config/database";
import User from "../models/user.model";
import Cinema from "../models/cinema.model";
import Membership from "../models/membership.model";
import Role from "../models/role.model";
import UserGenre from "../models/user-genre.model";
import { RegisterUserDto } from "../dto/register-user.dto";
import UserRepository from "../repositories/user.repository";
import CityRepository from "../repositories/cities.repository";
import EmailVerificationTokenRepository from "../repositories/email-verification-token.repository";
import BonusWalletRepository from "../repositories/bonus-wallet.repository";
import NotificationPreferenceRepository from "../repositories/notification-preference.repository";
import MembershipService from "./membership.service";
import CaptchaService from "./captcha.service";
import EmailService from "./email.service";
import { AuthResult, IAuthService, RegisterResult } from "./interfaces/auth.service.interface";
import { signAccessToken, signRefreshToken, verifyToken } from "../utils/jwt";
import { durationToMs } from "../utils/time";
import { AppError } from "../utils/apiResponse";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
const DOCUMENT_REGEX = /^[A-Za-z0-9.-]{5,30}$/;

class AuthService implements IAuthService {
  async register(data: RegisterUserDto, remoteIp?: string): Promise<RegisterResult> {
    this.validateRegisterData(data);

    await CaptchaService.validate(data.captchaToken, remoteIp);

    const email = data.email.trim().toLowerCase();
    const documentNumber = data.documentNumber.trim();

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError(
        "El correo electrónico ya se encuentra registrado.",
        409,
        "EMAIL_ALREADY_REGISTERED"
      );
    }

    const existingDocument = await User.findOne({ where: { documentNumber } });
    if (existingDocument) {
      throw new AppError(
        "El número de documento ya se encuentra registrado.",
        409,
        "DOCUMENT_ALREADY_REGISTERED"
      );
    }

    const city = await CityRepository.findById(data.cityId);
    if (!city) {
      throw new AppError("La ciudad seleccionada no existe.", 400, "CITY_NOT_FOUND");
    }

    if (data.favoriteCinemaId) {
      const favoriteCinema = await Cinema.findByPk(data.favoriteCinemaId);
      if (!favoriteCinema) {
        throw new AppError(
          "El complejo favorito seleccionado no existe.",
          400,
          "CINEMA_NOT_FOUND"
        );
      }
    }

    if (data.userGenreId) {
      const genre = await UserGenre.findByPk(data.userGenreId);
      if (!genre) {
        throw new AppError("El género seleccionado no existe.", 400, "GENRE_NOT_FOUND");
      }
    }

    const clientRole = await Role.findOne({ where: { name: "Cliente" } });
    if (!clientRole) {
      throw new AppError(
        "El rol Cliente no está configurado.",
        500,
        "CLIENT_ROLE_NOT_CONFIGURED"
      );
    }

    const bronzeMembership = await Membership.findOne({ where: { name: "Bronce" } });
    if (!bronzeMembership) {
      throw new AppError(
        "La membresía Bronce no está configurada.",
        500,
        "BRONZE_MEMBERSHIP_NOT_CONFIGURED"
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const activationToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(activationToken).digest("hex");
    const activationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const birthDate = new Date(`${data.birthDate}T00:00:00.000Z`);

    return await sequelize.transaction(async (transaction) => {
      const user = await UserRepository.create(
        {
          name: data.name.trim(),
          lastName: data.lastName.trim(),
          documentType: data.documentType.trim(),
          documentNumber,
          birthDate,
          email,
          phone: data.phone.trim(),
          passwordHash,
          roleId: clientRole.id,
          membershipId: bronzeMembership.id,
          cityId: data.cityId,
          favoriteCinemaId: data.favoriteCinemaId ?? null,
          userGenreId: data.userGenreId ?? null,
          acceptDataProcessing: true,
          acceptTerms: true,
          acceptCommercialCommunications: data.acceptCommercialCommunications === true,
          emailVerified: false,
          accountStatus: "inactiva",
          registeredAt: new Date(),
        },
        transaction
      );

      const membershipResult = await MembershipService.createForUser(
        user.id,
        bronzeMembership.id,
        transaction
      );

      await BonusWalletRepository.create(user.id, transaction);
      await NotificationPreferenceRepository.create(
        user.id,
        data.acceptCommercialCommunications === true,
        transaction
      );

      await EmailVerificationTokenRepository.create(
        {
          userId: user.id,
          tokenHash,
          expiresAt: activationExpiresAt,
          usedAt: null,
        },
        transaction
      );

      // El historial de compras inicia vacío: no se crea ninguna compra al registrarse.
      await EmailService.sendActivationEmail({
        to: user.email,
        name: user.name,
        token: activationToken,
      });

      return {
        user,
        membership: membershipResult.membership,
        activationExpiresAt,
      };
    });
  }

  async verifyEmail(token: string): Promise<User> {
    if (!token || typeof token !== "string") {
      throw new AppError("El token de activación es requerido.", 400, "TOKEN_REQUIRED");
    }

    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");
    const storedToken = await EmailVerificationTokenRepository.findByHash(tokenHash);

    if (!storedToken) {
      throw new AppError("Token de activación inválido.", 400, "TOKEN_INVALID");
    }

    if (storedToken.usedAt) {
      throw new AppError("El token de activación ya fue utilizado.", 400, "TOKEN_ALREADY_USED");
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      throw new AppError(
        "El token de activación expiró.",
        400,
        "TOKEN_EXPIRED"
      );
    }

    await sequelize.transaction(async (transaction) => {
      await UserRepository.update(
        storedToken.userId,
        { emailVerified: true, accountStatus: "activa" },
        transaction
      );
      await EmailVerificationTokenRepository.markAsUsed(storedToken.id, transaction);
    });

    const user = await UserRepository.findById(storedToken.userId);
    if (!user) {
      throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
    }

    return user;
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

    await UserRepository.revokeRefreshToken(refreshToken);

    const newAccessToken = signAccessToken(user.id, user.roleId);
    const newRefreshToken = signRefreshToken(user.id);
    const refreshMs = durationToMs(process.env.JWT_REFRESH_EXPIRES_IN || "7d");
    const expiresAt = new Date(Date.now() + refreshMs);

    await UserRepository.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  private validateRegisterData(data: RegisterUserDto): void {
    const requiredText: Array<[string, unknown]> = [
      ["nombre", data.name],
      ["apellidos", data.lastName],
      ["tipo de documento", data.documentType],
      ["número de documento", data.documentNumber],
      ["fecha de nacimiento", data.birthDate],
      ["correo electrónico", data.email],
      ["confirmación de correo", data.confirmEmail],
      ["celular", data.phone],
      ["contraseña", data.password],
      ["confirmación de contraseña", data.confirmPassword],
    ];

    const captchaBypass =
      process.env.NODE_ENV !== "production" && process.env.CAPTCHA_BYPASS === "true";
    if (!captchaBypass) {
      requiredText.push(["CAPTCHA", data.captchaToken]);
    }

    for (const [field, value] of requiredText) {
      if (typeof value !== "string" || !value.trim()) {
        throw new AppError(`El campo ${field} es requerido.`, 400, "VALIDATION_ERROR");
      }
    }

    const email = data.email.trim().toLowerCase();
    const confirmEmail = data.confirmEmail.trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      throw new AppError("El correo electrónico no es válido.", 400, "INVALID_EMAIL");
    }

    if (email !== confirmEmail) {
      throw new AppError("Los correos electrónicos no coinciden.", 400, "EMAIL_MISMATCH");
    }

    if (!PASSWORD_REGEX.test(data.password)) {
      throw new AppError(
        "La contraseña debe tener mínimo 10 caracteres e incluir mayúscula, minúscula, número y carácter especial.",
        400,
        "WEAK_PASSWORD"
      );
    }

    if (data.password !== data.confirmPassword) {
      throw new AppError("Las contraseñas no coinciden.", 400, "PASSWORD_MISMATCH");
    }

    if (!DOCUMENT_REGEX.test(data.documentNumber.trim())) {
      throw new AppError("El número de documento no es válido.", 400, "INVALID_DOCUMENT");
    }

    const normalizedPhone = data.phone.replace(/[\s()-]/g, "");
    if (!/^\+?[0-9]{7,15}$/.test(normalizedPhone)) {
      throw new AppError("El número de celular no es válido.", 400, "INVALID_PHONE");
    }

    const birthDate = new Date(`${data.birthDate}T00:00:00.000Z`);
    if (Number.isNaN(birthDate.getTime()) || birthDate.getTime() >= Date.now()) {
      throw new AppError("La fecha de nacimiento no es válida.", 400, "INVALID_BIRTH_DATE");
    }

    if (!Number.isInteger(data.cityId) || data.cityId <= 0) {
      throw new AppError("La ciudad principal es requerida.", 400, "INVALID_CITY");
    }

    if (
      data.favoriteCinemaId !== undefined &&
      data.favoriteCinemaId !== null &&
      (!Number.isInteger(data.favoriteCinemaId) || data.favoriteCinemaId <= 0)
    ) {
      throw new AppError("El complejo favorito no es válido.", 400, "INVALID_CINEMA");
    }

    if (
      data.userGenreId !== undefined &&
      data.userGenreId !== null &&
      (!Number.isInteger(data.userGenreId) || data.userGenreId <= 0)
    ) {
      throw new AppError("El género seleccionado no es válido.", 400, "INVALID_GENRE");
    }

    if (data.acceptDataProcessing !== true) {
      throw new AppError(
        "Debes aceptar el tratamiento de datos personales.",
        400,
        "DATA_PROCESSING_REQUIRED"
      );
    }

    if (data.acceptTerms !== true) {
      throw new AppError(
        "Debes aceptar los términos y condiciones.",
        400,
        "TERMS_REQUIRED"
      );
    }
  }
}

export default new AuthService();