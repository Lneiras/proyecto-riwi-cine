import Seat from "../models/seat.model";

interface SeatSeed {
  row: string;
  number: number;
  type: string;
}

function buildSeats(capacity: number): SeatSeed[] {
  const seats: SeatSeed[] = [];
  const seatsPerRow = 10;
  const rows = Math.ceil(capacity / seatsPerRow);
  const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    const row = rowLetters[rowIndex];

    for (let number = 1; number <= seatsPerRow; number++) {
      if (seats.length >= capacity) {
        break;
      }

      let type = "General";

      if (row === "A" && number <= 2) {
        type = "Preferencial";
      }

      if (rowIndex === rows - 1 && number <= 4) {
        type = "VIP";
      }

      seats.push({
        row,
        number,
        type,
      });
    }
  }

  return seats;
}

export async function seedSeats(
  roomIdsByKey: Map<string, number>,
  roomSeedData: {
    cinemaName: string;
    numberName: string;
    capacity: number;
  }[]
): Promise<Map<string, number>> {
  const seatIdsByKey = new Map<string, number>();

  for (const roomData of roomSeedData) {
    const roomId = roomIdsByKey.get(
      `${roomData.cinemaName}|${roomData.numberName}`
    );

    if (!roomId) {
      throw new Error(`No se encontró la sala ${roomData.numberName}`);
    }

    const seats = buildSeats(roomData.capacity);

    for (const seat of seats) {
      const [seatRow] = await Seat.findOrCreate({
        where: {
          roomId,
          row: seat.row,
          number: seat.number,
        },
        defaults: {
          roomId,
          row: seat.row,
          number: seat.number,
          type: seat.type,
          status: "available",
        },
      });

      seatIdsByKey.set(`${roomData.cinemaName}|${roomData.numberName}|${seat.row}${seat.number}`, seatRow.id);
    }

    console.log(`[OK] seats: ${roomData.numberName} -> ${seats.length}`);
  }

  return seatIdsByKey;
}