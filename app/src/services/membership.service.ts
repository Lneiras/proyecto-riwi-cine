

import MembershipRepository from "../repositories/membership.repository";
import { IMembershipService, MembershipBenefits } from "./interfaces/membership.service.interface";
import Membership from "../models/membership.model";
import { calculateMembershipDiscount, MembershipDiscountInput, MembershipDiscountResult } from "../utils/membershipDiscountCalculator";
import membershipCodeRepository from "../repositories/membership-code.repository";
import { generateMembershipCode } from "../utils/membershipCodeGenerator";
import { generateQrImage } from "../utils/qrCodeGenerator";
import { MembershipQrResult } from "./interfaces/membership.service.interface";



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

    async calculateDiscount(userId: number, input: MembershipDiscountInput): Promise<MembershipDiscountResult> {
        const membership = await this.getByUserId(userId);

        return calculateMembershipDiscount(
        {
            ticketDiscountPercent: Number(membership.ticketDiscount),
            snackDiscountPercent: Number(membership.snackDiscount),
        },
        input
        );
    }

    async getOrCreateQr(userId: number): Promise<MembershipQrResult> {
        let membershipCode = await membershipCodeRepository.findByUserId(userId);

        if (!membershipCode) {
            // Reintento simple ante una colisión de `code` extremadamente
            // improbable (8 caracteres hex = 4,294,967,296 combinaciones).
            let attempts = 0;
            while (!membershipCode && attempts < 3) {
                try {
                    membershipCode = await membershipCodeRepository.create(userId, generateMembershipCode());
                } catch (err: any) {
                    attempts++;
                    if (attempts >= 3) throw err;
                }
            }
        }

        const qrImage = await generateQrImage(membershipCode!.code);

        return {
            code: membershipCode!.code,
            qrImage,
        };
    }
}

export default new MembershipService();