// app/src/repositories/notification-preference.repository.ts

import { Transaction } from "sequelize";
import NotificationPreference, {
  NotificationPreferenceAttributes,
} from "../models/notification-preference.model";

class NotificationPreferenceRepository {
  async create(
    userId: number,
    commercialEnabled: boolean,
    transaction?: Transaction
  ): Promise<NotificationPreference> {
    return await NotificationPreference.create(
      {
        userId,
        emailEnabled: true,
        smsEnabled: false,
        commercialEnabled,
      },
      { transaction }
    );
  }

  async findByUserId(userId: number): Promise<NotificationPreference | null> {
    return await NotificationPreference.findOne({
      where: { userId },
    });
  }

  async updateByUserId(
    userId: number,
    preferences: Partial<
      Pick<
        NotificationPreferenceAttributes,
        "emailEnabled" | "smsEnabled" | "commercialEnabled"
      >
    >,
    transaction?: Transaction
  ): Promise<NotificationPreference | null> {
    const existing = await this.findByUserId(userId);
    if (!existing) {
      return await NotificationPreference.create(
        {
          userId,
          emailEnabled: preferences.emailEnabled ?? true,
          smsEnabled: preferences.smsEnabled ?? false,
          commercialEnabled: preferences.commercialEnabled ?? false,
        },
        { transaction }
      );
    }

    await existing.update(preferences, { transaction });
    return existing;
  }
}

export default new NotificationPreferenceRepository();
