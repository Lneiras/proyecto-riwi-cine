

import { Transaction } from "sequelize";
import Membership from "../models/membership.model";
import UserMembership from "../models/user-membership.model";
import UserRepository from "../repositories/user.repository";
import UserMembershipRepository from "../repositories/user-membership.repository";
import { generateMembershipCode } from "../helpers/membership-code";
import { AppError } from "../utils/apiResponse";
import { calculateMembershipDiscount, MembershipDiscountInput, MembershipDiscountResult } from "../utils/membershipDiscountCalculator";
import { generateQrImage } from "../utils/qrCodeGenerator";
import { MembershipBenefits, MembershipQrResult } from "./interfaces/membership.service.interface";
import { generateQrIdentifier } from "../utils/qrIdentifierGenerator";



export interface MembershipCreationResult {
    membership: UserMembership;
    created: boolean;
}

class MembershipService {

    async createForUser(
        userId: number,
        membershipId?: number,
        transaction?: Transaction
    ): Promise<MembershipCreationResult> {
        const existing = await UserMembershipRepository.findActiveByUserId(userId, transaction);
        if (existing) {
            return { membership: existing, created: false };
        }

        let resolvedMembershipId = membershipId;

        if (!resolvedMembershipId) {
            const user = await UserRepository.findById(userId);
            if (!user) {
                throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
            }
            resolvedMembershipId = user.membershipId;
        }

        const membershipType = await Membership.findByPk(resolvedMembershipId, { transaction });
        if (!membershipType) {
            throw new AppError("El tipo de membresía no está configurado.", 500, "MEMBERSHIP_NOT_CONFIGURED");
        }

        let membershipCode = "";
        for (let attempt = 0; attempt < 5; attempt++) {
            const candidate = generateMembershipCode();
            const repeated = await UserMembershipRepository.findByMembershipCode(candidate, transaction);
            if (!repeated) {
                membershipCode = candidate;
                break;
            }
        }

        if (!membershipCode) {
            throw new AppError(
                "No fue posible generar el código de membresía.",
                500,
                "MEMBERSHIP_CODE_GENERATION_FAILED"
            );
        }

        const createdMembership = await UserMembershipRepository.create(
            {
                userId,
                membershipId: resolvedMembershipId,
                membershipCode,
                startDate: new Date(),
                endDate: null,
                status: "activa",
            },
            transaction
        );

        return { membership: createdMembership, created: true };
    }

// HU8 parte de la consulta de membresía activa
    private async getActiveUserMembership(userId: number): Promise<UserMembership> {
        const active = await UserMembershipRepository.findActiveByUserId(userId);
        if (!active) {
            throw new Error("Membership not found");
        }
        return active;
    }

    async getByUserId(userId: number): Promise<Membership> {
        const active = await this.getActiveUserMembership(userId);
        const membership = await Membership.findByPk(active.membershipId);
        if (!membership) {
            throw new Error("Membership not found");
        }
        return membership;
    }

// HU8 parte de beneficios  
    async getBenefitsByUserId(userId: number): Promise<MembershipBenefits> {
        const membership = await this.getByUserId(userId);
        return {
            level: membership.name,
            ticketDiscount: Number(membership.ticketDiscount),
            snackDiscount: Number(membership.snackDiscount),
            minPoints: membership.minPoints,
        };
    }

// HU8 parte del cálculo de descuento 
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

// HU8 parte del QR
// Usamos el`membershipCode` que HU-006 ya generó y guardó en `userMemberships` al momento del registro.
    async getOrCreateQr(userId: number): Promise<MembershipQrResult> {
        let active = await this.getActiveUserMembership(userId);

        if (!active.qrCode) {
            let qrCode = "";
            for (let attempt = 0; attempt < 5; attempt++) {
                const candidate = generateQrIdentifier();
                const repeated = await UserMembershipRepository.findByQrCode(candidate);
                if (!repeated) {
                    qrCode = candidate;
                    break;
                }
            }

            if (!qrCode) {
                throw new AppError(
                    "No fue posible generar el código QR de membresía.",
                    500,
                    "QR_CODE_GENERATION_FAILED"
                );
            }

            active = await UserMembershipRepository.setQrCode(active.id, qrCode);
        }

        const qrImage = await generateQrImage(active.qrCode!);

        return {
            code: active.qrCode!,
            qrImage,
        };
    }
}

export default new MembershipService();