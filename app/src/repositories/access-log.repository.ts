// app/src/repositories/access-log.repository.ts

import AccessLog, {
  AccessLogCreationAttributes,
} from "../models/access-log.model";

/**
 * Repository de Auditoría de Accesos (HU-007).
 */
class AccessLogRepository {
  /** Registra un evento de acceso (IP, dispositivo y timestamp). */
  async create(data: AccessLogCreationAttributes): Promise<AccessLog> {
    return await AccessLog.create(data);
  }

  /** Historial de accesos de un usuario, del más reciente al más antiguo. */
  async findByUserId(userId: number): Promise<AccessLog[]> {
    return await AccessLog.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }
}

export default new AccessLogRepository();
