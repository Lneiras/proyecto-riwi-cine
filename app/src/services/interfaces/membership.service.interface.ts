
import Membership from "../../models/membership.model";
import { MembershipDiscountInput, MembershipDiscountResult } from "../../utils/membershipDiscountCalculator";


export interface MembershipBenefits {
    level: string;
    ticketDiscount: number;
    snackDiscount: number;
    minPoints: number;
}

export interface IMembershipService {
    getByUserId(userId: number): Promise<Membership>;
    getBenefitsByUserId(userId: number): Promise<MembershipBenefits>,
    calculateDiscount(userId: number, input: MembershipDiscountInput): Promise<MembershipDiscountResult>,
    getOrCreateQr(userId: number): Promise<MembershipQrResult>;
}

export interface MembershipQrResult {
    code: string;
    qrImage: string; // data URI base64, listo para <img src="...">
}