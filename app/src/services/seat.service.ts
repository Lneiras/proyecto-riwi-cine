import { randomUUID } from "crypto";
import sequelize from "../config/database";
import seatRepository from "../repositories/seat.repository";
import { redis, SEAT_EVENT_CHANNEL, SEAT_LOCK_PREFIX } from "../config/redis";

const TTL_SECONDS = Number(process.env.SEAT_LOCK_TTL_SECONDS);
const MAX_SEATS_PER_LOCK = Number(process.env.MAX_SEATS_PER_LOCK);

if (!Number.isInteger(TTL_SECONDS) || TTL_SECONDS <= 0) {
  throw new Error("SEAT_LOCK_TTL_SECONDS debe ser un entero mayor que 0");
}

if (!Number.isInteger(MAX_SEATS_PER_LOCK) || MAX_SEATS_PER_LOCK <= 0) {
  throw new Error("MAX_SEATS_PER_LOCK debe ser un entero mayor que 0");
}

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

        if (seat.status === "disabled") {
          return {
            id: seat.id,
            row: seat.row,
            number: seat.number,
            type: seat.type,
            status: "disabled",
            expiresAt: null,
            };
        }

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

    if (uniqueSeatIds.length > MAX_SEATS_PER_LOCK) { 
      throw new Error( `No puedes bloquear más de ${MAX_SEATS_PER_LOCK} asientos` ); }

    const showtime = await seatRepository.findShowtimeById(showtimeId);

    if (!showtime) {
      throw new Error("Función no encontrada");
    }

    const basePrice = await seatRepository.findShowtimePrice(showtimeId);

    if (basePrice === null) {
      throw new Error("Función no encontrada");
    }

    const seats = await seatRepository.findSeatsByRoomId(showtime.roomId);

    const seatsById = new Map(seats.map((seat) => [seat.id, seat]));

    const validSeatIds = new Set(seats.map((seat) => seat.id));

    for (const seatId of uniqueSeatIds) {
      if (!validSeatIds.has(seatId)) {
        throw new Error(`El asiento ${seatId} no pertenece a la sala de la función`);
      }
    }

    for (const seatId of uniqueSeatIds) {
      const seat = seatsById.get(seatId);

      if (!seat) {
        throw new Error(`El asiento ${seatId} no pertenece a la sala de la función`);
      }

      if (seat.status === "disabled") {
        throw new Error(`El asiento ${seatId} está inhabilitado`);
      }

      if (
        seat.type === "Preferencial" &&
        process.env.PREFERENTIAL_SEAT_POLICY === "deny"
      ) {
        throw new Error(
          `El asiento preferencial ${seatId} no puede ser seleccionado actualmente`
        );
      }
    }

    const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000);

    /*
     * Identifica exclusivamente este bloqueo Redis.
     */
    const lockToken = randomUUID(); 
    const redisValue = `${userId}:${lockToken}`;
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
            await seatRepository.createLock( { 
                showtimeId, 
                seatId, 
                userId, 
                lockToken, 
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
              lockToken,
              expiresAt,
            },
            transaction
          );
        }
      });

      const total = uniqueSeatIds.length * basePrice;
      
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
        quantity: uniqueSeatIds.length,
        unitPrice: basePrice,
        total,
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
    const releasedLocks: { seatId: number; lockToken: string; }[] = [];

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

        releasedLocks.push({
          seatId,
          lockToken: lock.lockToken,
        });
        }
    });

    /*
     * Eliminar Redis de manera segura (vía script LUA).
     */
    for (const released of releasedLocks) {
    const key = this.getRedisKey(showtimeId, released.seatId);

    const script = `
        if redis.call("GET", KEYS[1]) == ARGV[1]
        then
        return redis.call("DEL", KEYS[1])
        end
        return 0
    `;

    await redis.eval(script, {
        keys: [key],
        arguments: [`${userId}:${released.lockToken}`],
    });

    await this.publish({
    type: "seat:released",
    showtimeId,
    seatId: released.seatId,
    status: "available",
    expiresAt: null,
    });
    }

    return releasedLocks.map((released)=> released.seatId);
    }

  async releaseExpiredSeat(
  showtimeId: number,
  seatId: number
): Promise<boolean> {
  const key = this.getRedisKey(showtimeId, seatId);

  /*
   * Si existe una key Redis, significa que todavía existe
   * un bloqueo vigente.
   *
   * Esto también protege contra una carrera:
   *
   * Lock A expira
   *      ↓
   * Usuario B consigue el asiento
   *      ↓
   * llega tarde el evento de A
   *
   * Si la key existe nuevamente, NO tocamos PostgreSQL.
   */
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

    if (!lock) {
      return;
    }

    if (lock.status !== "active") {
      return;
    }

    if (lock.expiresAt.getTime() > Date.now()) {
      return;
    }

    await seatRepository.markReleased(
      showtimeId,
      seatId,
      "expired",
      transaction
    );

    released = true;
  });

  if (!released) {
    return false;
  }

  await this.publish({
    type: "seat:released",
    showtimeId,
    seatId,
    status: "available",
    expiresAt: null,
  });

  return true;
}

  async sweepExpiredLocks(): Promise<void> {
  const expired = await seatRepository.findExpiredLocks();

  for (const lock of expired) {
    const key = this.getRedisKey(lock.showtimeId, lock.seatId);

    /*
     * Si existe nuevamente una key Redis,
     * significa que posiblemente otro usuario
     * ya consiguió el asiento.
     *
     * NO modificamos PostgreSQL.
     */
    const exists = await redis.exists(key);

    if (exists) {
      continue;
    }

    let released = false;

    await sequelize.transaction(async (transaction) => {
      const currentLock = await seatRepository.findLockForUpdate(
        lock.showtimeId,
        lock.seatId,
        transaction
      );

      if (!currentLock) {
        return;
      }

      if (currentLock.status !== "active") {
        return;
      }

      if (currentLock.expiresAt.getTime() > Date.now()) {
        return;
      }

      await seatRepository.markReleased(
        lock.showtimeId,
        lock.seatId,
        "expired",
        transaction
      );

      released = true;
    });

    if (!released) {
      continue;
    }

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
  const price = await seatRepository.findShowtimePrice(showtimeId);

  if (price === null) {
    throw new Error("Función no encontrada");
  }

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
    basePrice: price,
  };
}

}

export default new SeatService();