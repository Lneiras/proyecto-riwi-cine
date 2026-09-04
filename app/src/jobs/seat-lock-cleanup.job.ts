import {
  redisCleanupSubscriber,
  SEAT_LOCK_PREFIX,
} from "../config/redis";

import seatService from "../services/seat.service";

class SeatLockCleanupJob {
  async start(): Promise<void> {
    if (!redisCleanupSubscriber.isOpen) {
      await redisCleanupSubscriber.connect();
    }

    await redisCleanupSubscriber.pSubscribe(
      "__keyevent@0__:expired",
      async (key) => {
        const prefix = `${SEAT_LOCK_PREFIX}:`;

        if (!key.startsWith(prefix)) {
          return;
        }

        const parts = key.split(":");

        if (parts.length !== 4) {
          return;
        }

        const showtimeId = Number(parts[2]);
        const seatId = Number(parts[3]);

        if (
          !Number.isInteger(showtimeId) ||
          !Number.isInteger(seatId)
        ) {
          return;
        }

        try {
          await seatService.releaseExpiredSeat(
            showtimeId,
            seatId
          );
        } catch (error) {
          console.error(
            `Error liberando asiento expirado ${seatId} de la función ${showtimeId}:`,
            error
          );
        }
      }
    );

    const intervalMs = Number(process.env.SEAT_LOCK_SWEEP_MS || 5000);

    setInterval(async () => {
      try {
        await seatService.sweepExpiredLocks();
      } catch (error) {
        console.error("Error en fallback de expiración de asientos:", error);
      }
    }, intervalMs);

    console.log("Seat lock cleanup job iniciado.");
  }
}

export default new SeatLockCleanupJob();