// app/src/seeders/room.seed.ts

/**
 * Seed de salas (tabla `rooms`). Depende de `cinemas`.
 * Devuelve los ids indexados como "NombreCine|NombreNumeroSala" para
 * que el seeder de funciones los referencie sin ambigüedad entre cines.
 */

import Room from "../models/room.model";

interface RoomSeed {
  cinemaName: string;
  numberName: string;
  capacity: number;
}

export const roomSeedData: RoomSeed[] = [
  { cinemaName: "Cineplex Medellín", numberName: "Sala 1", capacity: 120 },
  { cinemaName: "Cineplex Medellín", numberName: "Sala 2", capacity: 80 },
  { cinemaName: "Cineplex Medellín", numberName: "Sala VIP", capacity: 40 },
  { cinemaName: "Cineplex Bogotá", numberName: "Sala 1", capacity: 150 },
  { cinemaName: "Cineplex Bogotá", numberName: "Sala 2", capacity: 100 },
  { cinemaName: "Cineplex Bogotá", numberName: "Sala 3", capacity: 60 },
  { cinemaName: "Cineplex Cali", numberName: "Sala 1", capacity: 100 },
  { cinemaName: "Cineplex Cali", numberName: "Sala 2", capacity: 70 },
];

export async function seedRooms(cinemaIdsByName: Map<string, number>): Promise<Map<string, number>> {
  const idsByKey = new Map<string, number>();

  for (const data of roomSeedData) {
    const cinemaId = cinemaIdsByName.get(data.cinemaName);
    if (!cinemaId) {
      throw new Error(`No se encontró el cine "${data.cinemaName}" para la sala "${data.numberName}"`);
    }

    const [room] = await Room.findOrCreate({
      where: { cinemaId, numberName: data.numberName },
      defaults: { cinemaId, numberName: data.numberName, capacity: data.capacity },
    });
    idsByKey.set(`${data.cinemaName}|${data.numberName}`, room.id);
  }

  console.log(`✔ rooms: ${idsByKey.size} registros listos`);
  return idsByKey;
}
