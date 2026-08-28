// app/src/repositories/notification-history.repository.ts

import { Transaction, WhereOptions } from "sequelize";
import NotificationHistory, {
  NotificationHistoryAttributes,
  NotificationHistoryCreationAttributes,
  NotificationStatus,
} from "../models/notification-history.model";

export interface FindHistoryOptions {
  userId?: number;
  recipient?: string;
  status?: NotificationStatus;
  type?: string;
  limit?: number;
  offset?: number;
}

class NotificationHistoryRepository {
  async create(
    data: NotificationHistoryCreationAttributes,
    transaction?: Transaction
  ): Promise<NotificationHistory> {
    return await NotificationHistory.create(data, { transaction });
  }

  async findById(id: number): Promise<NotificationHistory | null> {
    return await NotificationHistory.findByPk(id);
  }

  async findByUserId(
    userId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ rows: NotificationHistory[]; count: number }> {
    return await NotificationHistory.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }

  async findHistory(
    options: FindHistoryOptions
  ): Promise<{ rows: NotificationHistory[]; count: number }> {
    const where: WhereOptions<NotificationHistoryAttributes> = {};

    if (options.userId !== undefined) {
      where.userId = options.userId;
    }
    if (options.recipient) {
      where.recipient = options.recipient;
    }
    if (options.status) {
      where.status = options.status;
    }
    if (options.type) {
      where.type = options.type;
    }

    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;

    return await NotificationHistory.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }

  async update(
    id: number,
    data: Partial<NotificationHistoryAttributes>,
    transaction?: Transaction
  ): Promise<NotificationHistory | null> {
    const record = await this.findById(id);
    if (!record) return null;
    await record.update(data, { transaction });
    return record;
  }

  async incrementAttempts(
    id: number,
    errorMessage?: string,
    transaction?: Transaction
  ): Promise<NotificationHistory | null> {
    const record = await this.findById(id);
    if (!record) return null;

    const nextAttempts = record.attempts + 1;
    await record.update(
      {
        attempts: nextAttempts,
        errorMessage: errorMessage ?? record.errorMessage,
        status: nextAttempts >= 3 ? "failed" : record.status,
      },
      { transaction }
    );
    return record;
  }

  async markAsSent(
    id: number,
    sentAt: Date = new Date(),
    transaction?: Transaction
  ): Promise<NotificationHistory | null> {
    const record = await this.findById(id);
    if (!record) return null;
    await record.update(
      {
        status: "sent",
        sentAt,
        errorMessage: null,
      },
      { transaction }
    );
    return record;
  }

  async markAsFailed(
    id: number,
    errorMessage: string,
    transaction?: Transaction
  ): Promise<NotificationHistory | null> {
    const record = await this.findById(id);
    if (!record) return null;
    await record.update(
      {
        status: "failed",
        errorMessage,
      },
      { transaction }
    );
    return record;
  }
}

export default new NotificationHistoryRepository();
