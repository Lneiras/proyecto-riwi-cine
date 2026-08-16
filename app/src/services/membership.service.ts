// app/src/services/membership.service.ts

import { Transaction } from "sequelize";
import Membership from "../models/membership.model";
import UserMembership from "../models/user-membership.model";
import UserRepository from "../repositories/user.repository";
import UserMembershipRepository from "../repositories/user-membership.repository";
import { generateMembershipCode } from "../helpers/membership-code";
import { AppError } from "../utils/apiResponse";

export interface MembershipCreationResult {
  membership: UserMembership;
  created: boolean;
}

class MembershipService {
  /**
   * Crea la membresía digital del usuario. Es idempotente: si ya existe
   * una membresía activa, retorna la existente en lugar de duplicarla.
   */
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
      throw new AppError(
        "El tipo de membresía no está configurado.",
        500,
        "MEMBERSHIP_NOT_CONFIGURED"
      );
    }

    let membershipCode = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateMembershipCode();
      const repeated = await UserMembershipRepository.findByMembershipCode(
        candidate,
        transaction
      );
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
}

export default new MembershipService();
