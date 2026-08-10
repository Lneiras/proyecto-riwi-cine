// app/src/services/interfaces/user.service.interface.ts

import User from "../../models/user.model";
import { CreateUserDto } from "../../dto/create-user.dto";


/**
 * Contrato del Servicio de Usuarios.
 */

export interface IUserService {

    create(dto: CreateUserDto): Promise<User>;

    findAll(): Promise<User[]>;

    Auth(email: string, password: string): Promise<User | null>;

    findUserByLocation(location: string): Promise<User | null>;

    health(): Promise<string>;

    findById(id: number): Promise<User | null>;

}