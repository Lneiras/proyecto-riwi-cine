import { randomUUID } from "crypto";
import sequelize from "../config/database";
import seatRepository from "../repositories/seat.repository";
import { redis, SEAT_EVENT_CHANNEL, SEAT_LOCK_PREFIX } from "../config/redis";

const TTL_SECONDS = Number(process.env.SEAT_LOCK_TTL_SECONDS || 300);

interface SeatEvent {
    type: "seat:locked" | "seat:released";
    showtimeId: number;
    seatId: number;
    status: "reserved" | "available";
    expiresAt: string | null;
}

class SeatService {
  private getRedisKey(showtimeId: number, seatId: number): string {
    return `${SEAT_LOCK_PREFIX}:${showtimeId}:${seatId}`;
  }

  private async publish(event: SeatEvent): Promise<void> {
    await redis.publish(SEAT_EVENT_CHANNEL, JSON.stringify(event));
  }

  async getSeats(showtimeId: number) {
    const showtime = await seatRepository.findShowtimeById(showtimeId);

    if (!showtime) {
      throw new Error("Función no encontrada");
    }

    const seats = await seatRepository.findSeatsByRoomId(showtime.roomId);
    const soldSeatIds = new Set(await seatRepository.findSoldSeatIds(showtimeId));
    const locks = await seatRepository.findActiveLocks(showtimeId);
    const lockBySeat = new Map(locks.map((lock) => [lock.seatId, lock]));

    return {
      showtimeId,
      roomId: showtime.roomId,
      seats: seats.map((seat) => {
        const lock = lockBySeat.get(seat.id);

        if (soldSeatIds.has(seat.id)) {
          return {
            id: seat.id,
            row: seat.row,
            number: seat.number,
            type: seat.type,
            status: "sold",
            expiresAt: null,
          };
        }

        if (lock) {
          return {
            id: seat.id,
            row: seat.row,
            number: seat.number,
            type: seat.type,
            status: "reserved",
            expiresAt: lock.expiresAt,
          };
        }

        return {
          id: seat.id,
          row: seat.row,
          number: seat.number,
          type: seat.type,
          status: "available",
          expiresAt: null,
        };
      }),
    };
  }

  async lockSeats(showtimeId: number, seatIds: number[], userId: number) {
    if (seatIds.length === 0) {
      throw new Error("Debes enviar al menos un asiento");
    }

    const uniqueSeatIds = [...new Set(seatIds)];
    const showtime = await seatRepository.findShowtimeById(showtimeId);

    if (!showtime) {
      throw new Error("Función no encontrada");
    }

    const seats = await seatRepository.findSeatsByRoomId(showtime.roomId);
    const validSeatIds = new Set(seats.map((seat) => seat.id));

    for (const seatId of uniqueSeatIds) {
      if (!validSeatIds.has(seatId)) {
        throw new Error(`El asiento ${seatId} no pertenece a la sala de la función`);
      }
    }

    const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000);

    /*
     * Identifica exclusivamente este bloqueo Redis.
     */
    const redisValue = `${userId}:${randomUUID()}`;
    const acquiredKeys: string[] = [];

    try {
      /*
       * Redis es la primera barrera contra la concurrencia.
       */
      for (const seatId of uniqueSeatIds) {
        const key = this.getRedisKey(showtimeId, seatId);

        const result = await redis.set(key, redisValue, {
          NX: true,
          PX: TTL_SECONDS * 1000,
        });

        if (result !== "OK") {
          throw new Error(`El asiento ${seatId} ya está reservado`);
        }

        acquiredKeys.push(key);
      }

      /*
       * Segunda barrera: PostgreSQL mediante Sequelize.
       */
      await sequelize.transaction(async (transaction) => {
        const soldSeatIds = new Set(
          await seatRepository.findSoldSeatIds(showtimeId, transaction)
        );

        for (const seatId of uniqueSeatIds) {
          if (soldSeatIds.has(seatId)) {
            throw new Error(`El asiento ${seatId} ya fue vendido`);
          }

          const existingLock = await seatRepository.findLockForUpdate(
            showtimeId,
            seatId,
            transaction
          );

          if (!existingLock) {
            await seatRepository.createLock(
              {
                showtimeId,
                seatId,
                userId,
                expiresAt,
              },
              transaction
            );
            continue;
          }

          const expired = existingLock.expiresAt.getTime() <= Date.now();

          if (existingLock.status === "active" && !expired) {
            throw new Error(`El asiento ${seatId} ya está reservado`);
          }

          await seatRepository.updateLock(
            existingLock,
            {
              userId,
              expiresAt,
            },
            transaction
          );
        }
      });

      /*
       * PostgreSQL confirmó. Ahora notificamos.
       */
      for (const seatId of uniqueSeatIds) {
        await this.publish({
          type: "seat:locked",
          showtimeId,
          seatId,
          status: "reserved",
          expiresAt: expiresAt.toISOString(),
        });
      }

      return {
        showtimeId,
        expiresAt,
        seatIds: uniqueSeatIds,
      };
    } catch (error) {
      /*
       * PostgreSQL falló. Liberamos solamente las keys que este request consiguió.
       */
      for (const key of acquiredKeys) {
        const currentValue = await redis.get(key);

        if (currentValue !== redisValue) {
          continue;
        }

        const script = `
          if redis.call("GET", KEYS[1]) == ARGV[1]
          then
            return redis.call("DEL", KEYS[1])
          end
          return 0
        `;

        await redis.eval(script, {
          keys: [key],
          arguments: [redisValue],
        });
      }

      throw error;
    }
  }

  async releaseSeats(showtimeId: number, seatIds: number[], userId: number) {
    const releasedSeats: number[] = [];

    await sequelize.transaction(async (transaction) => {
    for (const seatId of seatIds) {
        const lock = await seatRepository.findLockForUpdate(
        showtimeId,
        seatId,
        transaction
        );

        if (!lock) continue;
        if (lock.userId !== userId) continue;
        if (lock.status !== "active") continue;
        if (lock.expiresAt.getTime() <= Date.now()) continue;

        await seatRepository.markReleased(
        showtimeId,
        seatId,
        "released",
        transaction
        );

        releasedSeats.push(seatId);
        }
    });

    /*
     * Eliminar Redis de manera segura (vía script LUA).
     */
    for (const seatId of releasedSeats) {
    const key = this.getRedisKey(showtimeId, seatId);
    const currentValue = await redis.get(key);

    if (currentValue) {
    const script = `
        if redis.call("GET", KEYS[1]) == ARGV[1]
        then
        return redis.call("DEL", KEYS[1])
        end
        return 0
    `;

    await redis.eval(script, {
        keys: [key],
        arguments: [currentValue],
    });
    }

    await this.publish({
    type: "seat:released",
    showtimeId,
    seatId,
    status: "available",
    expiresAt: null,
    });
    }

    return releasedSeats;
    }

    async releaseExpiredSeat(
    showtimeId: number,
    seatId: number
    ): Promise<boolean> {
    const key = this.getRedisKey(showtimeId, seatId);
    const exists = await redis.exists(key);

    if (exists) {
        return false;
    }

    let released = false;

    await sequelize.transaction(async (transaction) => {
        const lock = await seatRepository.findLockForUpdate(
        showtimeId,
        seatId,
        transaction
        );

        if (!lock) return;
        if (lock.status !== "active") return;
        if (lock.expiresAt.getTime() > Date.now()) return;

        await seatRepository.markReleased(
        showtimeId,
        seatId,
        "expired",
        transaction
        );

        released = true;
    });

    if (released) {
        await this.publish({
        type: "seat:released",
        showtimeId,
        seatId,
        status: "available",
        expiresAt: null,
        });
    }

    return released;
}

  async sweepExpiredLocks() {
    const expired = await seatRepository.findExpiredLocks();

    for (const lock of expired) {
    const key = this.getRedisKey(lock.showtimeId, lock.seatId);

    /*
    * Si existe un nuevo lock Redis, no tocamos el registro.
    */
    const exists = await redis.exists(key);

    if (exists) {
    continue;
    }

    await sequelize.transaction(async (transaction) => {
    const currentLock = await seatRepository.findLockForUpdate(
        lock.showtimeId,
        lock.seatId,
        transaction
        );

        if (!currentLock) return;
        if (currentLock.status !== "active") return;
        if (currentLock.expiresAt.getTime() > Date.now()) return;

        await seatRepository.markReleased(
        lock.showtimeId,
        lock.seatId,
        "expired",
        transaction
        );
    });

    await this.publish({
        type: "seat:released",
        showtimeId: lock.showtimeId,
        seatId: lock.seatId,
        status: "available",
        expiresAt: null,
    });
    }
}

async getSummary(showtimeId: number) {

    const result = await this.getSeats(showtimeId);

    const summary = {
    total: result.seats.length,
    available: 0,
    reserved: 0,
    sold: 0,
    byType: {
        General: 0,
        Preferencial: 0,
        VIP: 0,
    },
    };

    for (const seat of result.seats) {
        if (seat.status === "available") summary.available++;
        if (seat.status === "reserved") summary.reserved++;
        if (seat.status === "sold") summary.sold++;

        if (seat.type in summary.byType) {
            summary.byType[seat.type as keyof typeof summary.byType]++;
        }
    }

    return {
    showtimeId,
    ...summary,
    };
    }
}

export default new SeatService();