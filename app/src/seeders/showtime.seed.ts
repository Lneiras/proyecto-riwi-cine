// app/src/seeders/showtime.seed.ts

/**
 * Seed de funciones (tabla `showtimes`). Depende de `movies`, `rooms`,
 * `formats` e `languages`.
 *
 * Las fechas se calculan relativas a "hoy" para que la cartelera de los
 * próximos 7 días (HU-003) siempre tenga datos válidos sin importar
 * cuándo se corra el seeder. Solo se generan funciones para películas
 * en estado "publicada".
 */

import Showtime from "../models/showtime.model";

interface ShowtimeSeed {
  movieTitle: string;
  cinemaName: string;
  roomNumberName: string;
  formatName: string;
  languageName: string;
  dayOffset: number; // días a partir de hoy
  hour: number; // hora local (0-23)
  minute: number;
  basePrice: number;
}

export const showtimeSeedData: ShowtimeSeed[] = [
  // Guardianes del Tiempo — Cineplex Medellín / Bogotá
  { movieTitle: "Guardianes del Tiempo", cinemaName: "Cineplex Medellín", roomNumberName: "Sala 1", formatName: "IMAX", languageName: "Subtitulada", dayOffset: 0, hour: 19, minute: 30, basePrice: 22000 },
  { movieTitle: "Guardianes del Tiempo", cinemaName: "Cineplex Medellín", roomNumberName: "Sala 2", formatName: "2D", languageName: "Doblada", dayOffset: 1, hour: 16, minute: 0, basePrice: 15000 },
  { movieTitle: "Guardianes del Tiempo", cinemaName: "Cineplex Bogotá", roomNumberName: "Sala 1", formatName: "3D", languageName: "Subtitulada", dayOffset: 2, hour: 20, minute: 15, basePrice: 20000 },

  // Risas en Cadena — Cineplex Medellín / Bogotá
  { movieTitle: "Risas en Cadena", cinemaName: "Cineplex Medellín", roomNumberName: "Sala VIP", formatName: "2D", languageName: "Doblada", dayOffset: 0, hour: 17, minute: 45, basePrice: 28000 },
  { movieTitle: "Risas en Cadena", cinemaName: "Cineplex Bogotá", roomNumberName: "Sala 2", formatName: "2D", languageName: "Doblada", dayOffset: 3, hour: 18, minute: 0, basePrice: 15000 },

  // El Umbral Oscuro — Cineplex Cali
  { movieTitle: "El Umbral Oscuro", cinemaName: "Cineplex Cali", roomNumberName: "Sala 1", formatName: "2D", languageName: "Subtitulada", dayOffset: 1, hour: 21, minute: 0, basePrice: 16000 },
  { movieTitle: "El Umbral Oscuro", cinemaName: "Cineplex Cali", roomNumberName: "Sala 2", formatName: "4DX", languageName: "Doblada", dayOffset: 4, hour: 22, minute: 0, basePrice: 25000 },

  // Mundo de Cristal — todas las ciudades (familiar, matiné)
  { movieTitle: "Mundo de Cristal", cinemaName: "Cineplex Medellín", roomNumberName: "Sala 2", formatName: "3D", languageName: "Doblada", dayOffset: 0, hour: 12, minute: 0, basePrice: 18000 },
  { movieTitle: "Mundo de Cristal", cinemaName: "Cineplex Bogotá", roomNumberName: "Sala 3", formatName: "2D", languageName: "Doblada", dayOffset: 2, hour: 11, minute: 30, basePrice: 14000 },
  { movieTitle: "Mundo de Cristal", cinemaName: "Cineplex Cali", roomNumberName: "Sala 1", formatName: "2D", languageName: "Doblada", dayOffset: 5, hour: 13, minute: 0, basePrice: 14000 },
];

function nextDateAt(dayOffset: number, hour: number, minute: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export async function seedShowtimes(
  movieIdsByTitle: Map<string, number>,
  roomIdsByKey: Map<string, number>,
  formatIdsByName: Map<string, number>,
  languageIdsByName: Map<string, number>
): Promise<void> {
  let count = 0;

  for (const data of showtimeSeedData) {
    const movieId = movieIdsByTitle.get(data.movieTitle);
    const roomId = roomIdsByKey.get(`${data.cinemaName}|${data.roomNumberName}`);
    const formatId = formatIdsByName.get(data.formatName);
    const languageId = languageIdsByName.get(data.languageName);

    if (!movieId) throw new Error(`No se encontró la película "${data.movieTitle}"`);
    if (!roomId) throw new Error(`No se encontró la sala "${data.roomNumberName}" en "${data.cinemaName}"`);
    if (!formatId) throw new Error(`No se encontró el formato "${data.formatName}"`);
    if (!languageId) throw new Error(`No se encontró el idioma "${data.languageName}"`);

    const dateTime = nextDateAt(data.dayOffset, data.hour, data.minute);

    const [, created] = await Showtime.findOrCreate({
      where: { movieId, roomId, dateTime },
      defaults: { movieId, roomId, formatId, languageId, dateTime, basePrice: data.basePrice },
    });
    if (created) count++;
  }

  console.log(`✔ showtimes: ${count} registros nuevos creados (${showtimeSeedData.length} definidos en el seed)`);
}
