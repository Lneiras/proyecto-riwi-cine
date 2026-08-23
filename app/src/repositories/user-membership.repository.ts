// app/src/repositories/user-membership.repository.ts

/**
 * Repository de Membresías de Usuario (HU-006)
 * --------------------------------------------
 * Operaciones de persistencia sobre la tabla `userMemberships`.
 */

import { Transaction } from "sequelize";
import UserMembership, {
  UserMembershipCreationAttributes,
} from "../models/user-membership.model";
import { IUserMembershipRepository } from "./interfaces/user-membership.repository.interface";

class UserMembershipRepository implements IUserMembershipRepository {
  async create(
    data: UserMembershipCreationAttributes,
    transaction?: Transaction
  ): Promise<UserMembership> {
    return await UserMembership.create(data, { transaction });
  }

  async findByUserId(userId: number): Promise<UserMembership[]> {
    return await UserMembership.findAll({ where: { userId } });
  }

  async findActiveByUserId(
    userId: number,
    transaction?: Transaction
  ): Promise<UserMembership | null> {
    return await UserMembership.findOne({
      where: { userId, status: "activa" },
      transaction,
    });
  }

  async findByMembershipCode(
    membershipCode: string,
    transaction?: Transaction
  ): Promise<UserMembership | null> {
    return await UserMembership.findOne({
      where: { membershipCode },
      transaction,
    });
  }
  async findByQrCode(qrCode: string, transaction?: Transaction): Promise<UserMembership | null> {
    return await UserMembership.findOne({ where: { qrCode }, transaction });
  }

  async setQrCode(id: number, qrCode: string): Promise<UserMembership> {
    await UserMembership.update({ qrCode }, { where: { id } });
    const updated = await UserMembership.findByPk(id);
    if (!updated) {
      throw new Error("UserMembership not found after update");
    }
    return updated;
  }
}

export default new UserMembershipRepository();
