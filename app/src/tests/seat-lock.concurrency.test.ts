import "dotenv/config";

import sequelize from "../config/database";
import "../models";

import seatService from "../services/seat.service";
import { redis, SEAT_LOCK_PREFIX } from "../config/redis";
import { Seat, Showtime, SeatLock } from "../models";

describe("Seat locking - concurrencia", () => {
  let showtimeId: number;
  let seatId: number;

  beforeAll(async () => {
    await sequelize.authenticate();

    if (!redis.isOpen) {
      await redis.connect();
    }

    const showtime = await Showtime.findOne();

    if (!showtime) {
      throw new Error(
        "No existe ninguna función en la base de datos para ejecutar la prueba."
      );
    }

    showtimeId = showtime.id;

    const seat = await Seat.findOne({
      where: {
        roomId: showtime.roomId,
        status: "available",
      },
    });

    if (!seat) {
      throw new Error(
        "No existe ningún asiento disponible en la sala de la función."
      );
    }

    seatId = seat.id;
  });

  afterEach(async () => {
    await redis.del(
      `${SEAT_LOCK_PREFIX}:${showtimeId}:${seatId}`
    );

    await SeatLock.destroy({
      where: {
        showtimeId,
        seatId,
      },
    });
  });

  afterAll(async () => {
    if (redis.isOpen) {
      await redis.quit();
    }

    await sequelize.close();
  });

  it(
    "solo permite que un usuario bloquee el mismo asiento",
    async () => {
      const userA = 1;
      const userB = 2;

      const results = await Promise.allSettled([
        seatService.lockSeats(showtimeId, [seatId], userA),
        seatService.lockSeats(showtimeId, [seatId], userB),
      ]);

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      );

      const failed = results.filter(
        (result) => result.status === "rejected"
      );

      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(1);

      const failedResult = failed[0];

      if (failedResult.status === "rejected") {
        expect(failedResult.reason.message).toContain(
          "ya está reservado"
        );
      }
    },
    30000
  );
});