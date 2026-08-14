import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { CreateUserDto } from "../dto/create-user.dto";
import UserRepository from "../repositories/user.repository";
import CityRepository from "../repositories/cities.repository";
import Role from "../models/role.model";
import { IUserService, AuthResult } from "./interfaces/user.service.interface";
import { signAccessToken, signRefreshToken, verifyToken } from "../utils/jwt";
import { durationToMs } from "../utils/time";
import { IAuthService } from "./interfaces/auth.service.interface";




class AuthService implements IAuthService {


  async register(data: CreateUserDto): Promise<User> {
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("El correo electrónico ya se encuentra registrado.");
    }

    // Rol por defecto: "Cliente"
    let roleId = data.roleId;
    if (!roleId) {
      const clientRole = await Role.findOne({ where: { name: "Cliente" } });
      roleId = clientRole ? clientRole.id : 1;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return await UserRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      roleId,
      membershipId: data.membershipId ?? 1,
      cityId: data.cityId ?? null,
      userGenreId: data.userGenreId ?? null,
      emailVerified: false,
      accountStatus: "activa",
      registeredAt: new Date(),
    });
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

}

export default new AuthService();