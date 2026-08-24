

// app/src/repositories/membership.repository.ts

import User from "../models/user.model";
import Membership from "../models/membership.model";
import { IMembershipRepository } from "./interfaces/membership.repository.interface";

/**
 * Repositorio de Membresías
 * -------------------------
 * Módulo independiente de `UserRepository` (decisión de equipo: evitar
 * pisar el trabajo de otros compañeros sobre `user.*`). Solo importa el
 * modelo `User` (no su repository/service) para resolver el
 * `membershipId` del usuario.
 */
class MembershipRepository implements IMembershipRepository {
    async findByUserId(userId: number): Promise<Membership | null> {
        const user = await User.findByPk(userId, { attributes: ["membershipId"] });
        if (!user) return null;
        return await Membership.findByPk(user.membershipId);
    }

    async findById(id: number): Promise<Membership | null> {
        return await Membership.findByPk(id);
    }
}

export default new MembershipRepository();