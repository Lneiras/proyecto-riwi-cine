// app/src/seeders/reservation-entry.seed.ts

/**
 * Seed de reservas de prueba (tabla `reservation_entries`).
 *
 * ⚠️ Esto NO es un flujo real de negocio: HU-013 (confirmación de pago)
 * todavía no existe, así que nada en la app crea filas en
 * `reservation_entries` hoy en día (ni `lock-seats`, que solo escribe en
 * `seat_locks`). Este seeder solo sirve para tener datos con los que
 * probar HU-014 sin insertar SQL a mano cada vez que se resetea el
 * volumen de Docker. Depende de `showtimeIdsByKey` (de `showtime.seed.ts`)
 * y `seatIdsByKey` (de `seat.seed.ts`).
 *
 * Cuando HU-013 quede implementada, este seeder se puede borrar sin
 * afectar nada más.
 */

import ReservationEntry from "../models/reservation-entry.model";

interface ReservationEntrySeed {
  movieTitle: string;
  cinemaName: string;
  roomNumberName: string;
  dayOffset: number;
  hour: number;
  minute: number;
  seatKeys: string[]; // ej: "A1", "A2"
  unitPrice: number;
}

export const reservationEntrySeedData: ReservationEntrySeed[] = [
  {
    movieTitle: "Guardianes del Tiempo",
    cinemaName: "Cineplex Medellín",
    roomNumberName: "Sala 1",
    dayOffset: 0,
    hour: 19,
    minute: 30,
    seatKeys: ["A1", "A2", "A3"],
    unitPrice: 22000,
  },
];

const TEST_RESERVATION_ID = 999999; // marcador para identificar que es data de prueba

export async function seedTestReservationEntries(
  showtimeIdsByKey: Map<string, number>,
  seatIdsByKey: Map<string, number>
): Promise<void> {
  let count = 0;

  for (const data of reservationEntrySeedData) {
    const showtimeKey = `${data.movieTitle}|${data.cinemaName}|${data.roomNumberName}|${data.dayOffset}|${data.hour}:${data.minute}`;
    const showtimeId = showtimeIdsByKey.get(showtimeKey);

    if (!showtimeId) {
      console.warn(`⚠ reservation_entries (test): no se encontró la función "${data.movieTitle}" (${showtimeKey}), se omite.`);
      continue;
    }

    for (const seatKey of data.seatKeys) {
      const seatId = seatIdsByKey.get(`${data.cinemaName}|${data.roomNumberName}|${seatKey}`);

      if (!seatId) {
        console.warn(`⚠ reservation_entries (test): no se encontró la silla "${seatKey}" en "${data.roomNumberName}", se omite.`);
        continue;
      }

      const [, created] = await ReservationEntry.findOrCreate({
        where: { showtimeId, seatId },
        defaults: {
          reservationId: TEST_RESERVATION_ID,
          showtimeId,
          seatId,
          unitPrice: data.unitPrice,
        },
      });

      if (created) count++;
    }
  }

  const totalDefined = reservationEntrySeedData.reduce((sum, d) => sum + d.seatKeys.length, 0);
  console.log(`✔ reservation_entries (TEST): ${count} registros nuevos creados (${totalDefined} definidos en el seed, solo para probar HU-014)`);
}