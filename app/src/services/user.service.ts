// app/src/services/user.service.ts

import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { CreateUserDto } from "../dto/create-user.dto";
import UserRepository from "../repositories/user.repository";
import CityRepository from "../repositories/cities.repository";
import Role from "../models/role.model";
import { IUserService, AuthResult } from "./interfaces/user.service.interface";
import { signAccessToken, signRefreshToken, verifyToken } from "../utils/jwt";
import { durationToMs } from "../utils/time";

/**
 * Servicio de Usuarios
 * --------------------
 * Contiene toda la lógica de negocio relacionada con la entidad User:
 * hashing de contraseñas, emisión/rotación de tokens JWT y ubicación.
 *
 * El Service conoce las reglas del negocio.
 * El Repository únicamente conoce cómo guardar y consultar información.
 */

class UserService implements IUserService {
  async create(dto: CreateUserDto): Promise<User> {
    const existingUser = await UserRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error("El correo electrónico ya se encuentra registrado.");
    }

    // Rol por defecto: "Cliente"
    let roleId = dto.roleId;
    if (!roleId) {
      const clientRole = await Role.findOne({ where: { name: "Cliente" } });
      roleId = clientRole ? clientRole.id : 1;
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return await UserRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      roleId,
      membershipId: dto.membershipId ?? 1,
      cityId: dto.cityId ?? null,
      userGenreId: dto.userGenreId ?? null,
      emailVerified: false,
      accountStatus: "activa",
      registeredAt: new Date(),
    });
  }

  async findAll(): Promise<User[]> {
    return await UserRepository.findAll();
  }

  async login(email: string, password: string): Promise<AuthResult | null> {
    const user = await UserRepository.findByEmail(email);
    if (!user) return null;

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) return null;

    const accessToken = signAccessToken(user.id, user.roleId);
    const refreshToken = signRefreshToken(user.id);

    const refreshMs = durationToMs(process.env.JWT_REFRESH_EXPIRES_IN || "7d");
    const expiresAt = new Date(Date.now() + refreshMs);

    await UserRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return { user, accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = verifyToken(refreshToken);
    if (typeof payload.sub !== "number") {
      throw new Error("Token de refresco inválido");
    }

    const stored = await UserRepository.findValidRefreshToken(refreshToken);
    if (!stored || stored.userId !== payload.sub) {
      throw new Error("Token de refresco inválido o expirado");
    }

    const user = await UserRepository.findById(payload.sub);
    if (!user) {
      throw new Error("Usuario no encontrado");
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
