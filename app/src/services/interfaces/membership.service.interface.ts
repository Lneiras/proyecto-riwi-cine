
import Membership from "../../models/membership.model";

export interface MembershipBenefits {
    level: string;
    ticketDiscount: number;
    snackDiscount: number;
    minPoints: number;
}

export interface IMembershipService {
    getByUserId(userId: number): Promise<Membership>;
    getBenefitsByUserId(userId: number): Promise<MembershipBenefits>;
}