// app/src/repositories/interfaces/user-membership.repository.interface.ts

import UserMembership, {
  UserMembershipCreationAttributes,
} from "../../models/user-membership.model";
import { Transaction } from "sequelize";


/**
 * Contrato del Repositorio de Membresías de Usuario (HU-006).
 */

export interface IUserMembershipRepository {
  /**
   * Crea una membresía individual para un usuario.
   */
  create(data: UserMembershipCreationAttributes): Promise<UserMembership>;

  /**
   * Historial de membresías de un usuario.
   */
  findByUserId(userId: number): Promise<UserMembership[]>;

  findByQrCode(qrCode: string, transaction?: Transaction): Promise<UserMembership | null>;

  setQrCode(id: number, qrCode: string): Promise<UserMembership>;

}
