import "dotenv/config";

import sequelize from "../config/database";
import "../models";

import seatService from "../services/seat.service";
import {
  redis,
  SEAT_LOCK_PREFIX,
} from "../config/redis";

import {
  Seat,
  Showtime,
  SeatLock,
} from "../models";

describe("Seat locking - expiración", () => {
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
    "libera un asiento cuando el lock expira",
    async () => {
      const userId = 1;

      const key =
        `${SEAT_LOCK_PREFIX}:${showtimeId}:${seatId}`;

      await redis.del(key);

      await seatService.lockSeats(
        showtimeId,
        [seatId],
        userId
      );


      /*
       * Para la prueba reducimos artificialmente
       * el TTL de Redis a 1 segundo.
       */
      await redis.expire(key, 1);

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      const lock = await SeatLock.findOne({
        where: {
          showtimeId,
          seatId,
        },
      });

      expect(lock).not.toBeNull();

      await lock!.update({
        expiresAt: new Date(Date.now() - 1000),
      });

      const released =
        await seatService.releaseExpiredSeat(
          showtimeId,
          seatId
        );

      expect(released).toBe(true);

      const updatedLock = await SeatLock.findOne({
        where: {
          showtimeId,
          seatId,
        },
      });

      expect(updatedLock).not.toBeNull();
      expect(updatedLock!.status).toBe("expired");
    },
    10000
  );
});