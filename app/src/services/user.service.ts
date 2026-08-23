// app/src/services/user.service.ts

import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { CreateUserDto } from "../dto/create-user.dto";
import UserRepository from "../repositories/user.repository";
import MembershipService from "./membership.service";
import CityRepository from "../repositories/cities.repository";
import Role from "../models/role.model";
import Membership from "../models/membership.model";
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

  async login(email: string, password: string): Promise<AuthResult | null> {
    const user = await UserRepository.findByEmail(email);
    if (!user) return null;

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) return null;

    // HU-006: una cuenta sin correo confirmado no puede autenticarse.
    if (!user.emailVerified || user.accountStatus !== "activa") return null;

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

    if (!user.emailVerified || user.accountStatus !== "activa") {
      throw new Error("La cuenta aún no está activa");
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

  // esto es lo que permite actualizar el perfil del usuario, recibe el id del usuario
  // y un objeto con los campos a actualizar, en este caso solo el nombre
  async updateProfile(userId: number, data: Partial<{ name: string }>): Promise<User> {
  return await UserRepository.update(userId, data);
  }
}

export default new UserService();
