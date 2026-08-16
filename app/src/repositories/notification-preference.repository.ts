// app/src/repositories/notification-preference.repository.ts

import { Transaction } from "sequelize";
import NotificationPreference from "../models/notification-preference.model";

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
}

export default new NotificationPreferenceRepository();
