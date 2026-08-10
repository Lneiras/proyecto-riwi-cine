// app/src/repositories/user.repository.ts
import { error } from "console";
import User, { UserCreationAttributes } from "../models/user.model";
import cities from "../models/cities.model";
import { IUserRepository } from "./interfaces/user.repository.interface";
import City from "../models/cities.model";


/**
 * Repositorio de Usuarios
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad User.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class UserRepository implements IUserRepository {

    /**
     * Crea un nuevo usuario.
     */
    async create(data: UserCreationAttributes): Promise<User> {

        return await User.create(data);

    }

    /**
     * Obtiene todos los usuarios.
     */
    async findAll(): Promise<User[]> {

        return await User.findAll();

    }

    async auth(email: string, password: string): Promise<User | null> {

        return await User.findOne({ where: { email, password } });


    }

    async findUserByLocation(location: string): Promise<User[] | null> {
        const users = await User.findAll({ include: [{ model: City, where: { name: location } }] });
        return users.length > 0 ? users : null;
    }

    async findById(id: number): Promise<User | null> {

        return await User.findByPk(id);

    }

    async update(id: number, data: Partial<UserCreationAttributes>): Promise<User>{
        const user = await this.findById(id);
        if (!user) throw new Error("User not found");
        return await user.update(data);

    }

    async delete(id:number): Promise<void>{
        const user = await this.findById(id);
        if (!user) throw new Error("User not found");
        return await user.destroy()
    }


}

export default new UserRepository();