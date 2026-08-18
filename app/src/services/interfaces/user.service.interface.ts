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

  login(email: string, password: string): Promise<AuthResult | null>;

  refresh(refreshToken: string): Promise<AuthResult>;

  changeUserLocation(userId: number, location: string): Promise<User | null>;

  findById(id: number): Promise<User | null>;

  // esto es lo que permite actualizar el perfil del usuario, recibe el id del usuario
  // y un objeto con los campos a actualizar, en este caso solo el nombre
  updateProfile(userId: number, data: Partial<{ name: string }>): Promise<User>;
}
