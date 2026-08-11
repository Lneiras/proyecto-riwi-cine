// app/src/repositories/interfaces/user.repository.interface.ts

import User, { UserCreationAttributes } from "../../models/user.model";

/**
 * Contrato del Repositorio de Usuarios
 * -----------------------------------
 * Define las operaciones de persistencia disponibles para la entidad User.
 *
 * Cualquier implementación deberá cumplir esta interfaz.
 */

export interface IUserRepository {

    /**
     * Crea un usuario.
     */
    create(data: UserCreationAttributes): Promise<User>;

    /**
     * Obtiene todos los usuarios.
     */
    findAll(): Promise<User[]>;

    /*optener usuario por su id:*/
    findById(id: number): Promise<User | null>;

    /**
     * Autentica un usuario por correo electrónico y contraseña.
     */
    auth(email: string, password: string): Promise<User | null>;
    
    changeUserLocation(email: string, password: string, location: string): Promise<User | null>;

    update(id: number, data: Partial<UserCreationAttributes>): Promise<User | null>;

    delete(id: number): Promise<void>;

}