// app/src/repositories/user-membership.repository.ts

/**
 * Repository de Membresías de Usuario (HU-006)
 * --------------------------------------------
 * Operaciones de persistencia sobre la tabla `userMemberships`
 * (membresía individual adquirida por un usuario).
 */

import UserMembership, {
  UserMembershipCreationAttributes,
} from "../models/user-membership.model";
import { IUserMembershipRepository } from "./interfaces/user-membership.repository.interface";

class UserMembershipRepository implements IUserMembershipRepository {
  /** Crea una membresía individual para un usuario. */
  async create(data: UserMembershipCreationAttributes): Promise<UserMembership> {
    return await UserMembership.create(data);
  }

  /** Historial de membresías de un usuario. */
  async findByUserId(userId: number): Promise<UserMembership[]> {
    return await UserMembership.findAll({ where: { userId } });
  }
}

export default new UserMembershipRepository();
