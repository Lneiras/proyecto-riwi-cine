

import MembershipRepository from "../repositories/membership.repository";
import { IMembershipService, MembershipBenefits } from "./interfaces/membership.service.interface";
import Membership from "../models/membership.model";

class MembershipService implements IMembershipService {
    async getByUserId(userId: number): Promise<Membership> {
        const membership = await MembershipRepository.findByUserId(userId);
        if (!membership) {
        throw new Error("Membership not found");
        }
        return membership;
    }

    //  esto trae los beneficios BASE del nivel actual.

    async getBenefitsByUserId(userId: number): Promise<MembershipBenefits> {
        const membership = await this.getByUserId(userId);
        return {
            level: membership.name,
            ticketDiscount: Number(membership.ticketDiscount),
            snackDiscount: Number(membership.snackDiscount),
            minPoints: membership.minPoints,
        };
    }
}

export default new MembershipService();