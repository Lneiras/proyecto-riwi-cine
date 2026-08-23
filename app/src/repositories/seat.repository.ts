import {
  Op,
  Transaction,
} from "sequelize";

import {
  Seat,
  SeatLock,
  ReservationEntry,
  Showtime,
} from "../models";

class SeatRepository {
  async findShowtimeById(
    showtimeId: number
  ): Promise<Showtime | null> {
    return Showtime.findByPk(
      showtimeId
    );
  }

  async findSeatsByRoomId(
    roomId: number
  ): Promise<Seat[]> {
    return Seat.findAll({
      where: {
        roomId,
      },
      order: [
        ["row", "ASC"],
        ["number", "ASC"],
      ],
    });
  }

  async findSoldSeatIds(
    showtimeId: number,
    transaction?: Transaction
  ): Promise<number[]> {
    const rows =
      await ReservationEntry.findAll({
        attributes: [
          "seatId",
        ],

        where: {
          showtimeId,
        },

        transaction,
      });

    return rows.map(
      (row) => row.seatId
    );
  }

  async findActiveLocks(
    showtimeId: number
  ): Promise<SeatLock[]> {
    return SeatLock.findAll({
      where: {
        showtimeId,

        status: "active",

        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });
  }

  async findLockForUpdate(
    showtimeId: number,
    seatId: number,
    transaction: Transaction
  ): Promise<SeatLock | null> {
    return SeatLock.findOne({
      where: {
        showtimeId,
        seatId,
      },

      transaction,

      /*
       * Esto genera el equivalente
       * de SELECT ... FOR UPDATE,
       * pero usando Sequelize.
       */
      lock: transaction.LOCK.UPDATE,
    });
  }

  async createLock(
    data: {
      showtimeId: number;
      seatId: number;
      userId: number;
      lockToken: string;
      expiresAt: Date;
    },
    transaction: Transaction
  ): Promise<SeatLock> {
    return SeatLock.create(
      {
        showtimeId:
          data.showtimeId,

        seatId:
          data.seatId,

        userId:
          data.userId,

        lockToken: data.lockToken,

        expiresAt:
          data.expiresAt,

        status: "active",
      },
      {
        transaction,
      }
    );
  }

  async updateLock(
    lock: SeatLock,
    data: {
      userId: number;
      lockToken: string;
      expiresAt: Date;
    },
    transaction: Transaction
  ): Promise<void> {
    await lock.update(
      {
        userId:
          data.userId,

        lockToken:
          data.lockToken,

        expiresAt:
          data.expiresAt,

        status: "active",

        lockedAt:
          new Date(),
      },
      {
        transaction,
      }
    );
  }

  async markReleased(
    showtimeId: number,
    seatId: number,
    status:
      | "released"
      | "expired",
    transaction?: Transaction
  ): Promise<void> {
    await SeatLock.update(
      {
        status,
      },

      {
        where: {
          showtimeId,
          seatId,

          status: "active",
        },

        transaction,
      }
    );
  }

  async findExpiredLocks(): Promise<
    SeatLock[]
  > {
    return SeatLock.findAll({
      where: {
        status: "active",

        expiresAt: {
          [Op.lte]: new Date(),
        },
      },
    });
  }

  async findDisabledSeatIds(seatIds: number[]): Promise<number[]> {
  const seats = await Seat.findAll({
    attributes: ["id"],
    where: {
      id: {
        [Op.in]: seatIds,
      },
      status: "disabled",
    },
  });

  return seats.map((seat) => seat.id);
}

async findShowtimePrice(showtimeId: number): Promise<number | null> {
  const showtime = await Showtime.findByPk(showtimeId);

  if (!showtime) {
    return null;
  }

  return Number(showtime.basePrice);
}
}

export default new SeatRepository();

