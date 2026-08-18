

import Membership from "../../models/membership.model";

export interface IMembershipRepository {
    /**
     * Busca la membresía activa de un usuario a partir de su id.
     * No usa `include` a propósito: resuelve el `membershipId` del
     * usuario y luego busca la membresía, para mantener este módulo
     * desacoplado de cómo el módulo `User` maneje sus asociaciones/alias.
     */
    findByUserId(userId: number): Promise<Membership | null>;

    findById(id: number): Promise<Membership | null>;
}