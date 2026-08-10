// app/src/seeders/movie.seed.ts

/**
 * Seed de películas (tabla `movies`). Depende de `movieGenres` y
 * `movieStatuses`.
 *
 * Incluye a propósito películas en distintos estados para probar los
 * escenarios de HU-003/HU-004/HU-005:
 *  - "publicada"       -> aparecen en la cartelera (HU-003).
 *  - "proximo_estreno" -> aparecen en Próximos Estrenos (HU-005).
 *  - "borrador"        -> NO deben aparecer en ningún listado público.
 */

import Movie from "../models/movie.model";

interface MovieSeed {
  title: string;
  durationMinutes: number;
  rating: string;
  genreName: string;
  statusName: string;
  synopsis: string;
  releaseDate: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
}

export const movieSeedData: MovieSeed[] = [
  {
    title: "Guardianes del Tiempo",
    durationMinutes: 128,
    rating: "PG-13",
    genreName: "Ciencia Ficción",
    statusName: "publicada",
    synopsis: "Un grupo de científicos descubre cómo viajar en el tiempo para evitar una catástrofe global.",
    releaseDate: "2026-06-12",
    posterUrl: "https://cdn.multicine.example.com/posters/guardianes-del-tiempo.jpg",
    bannerUrl: "https://cdn.multicine.example.com/banners/guardianes-del-tiempo.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    title: "Risas en Cadena",
    durationMinutes: 102,
    rating: "PG",
    genreName: "Comedia",
    statusName: "publicada",
    synopsis: "Una boda familiar se convierte en una cadena de malentendidos imposibles de detener.",
    releaseDate: "2026-05-20",
    posterUrl: "https://cdn.multicine.example.com/posters/risas-en-cadena.jpg",
    bannerUrl: "https://cdn.multicine.example.com/banners/risas-en-cadena.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    title: "El Umbral Oscuro",
    durationMinutes: 95,
    rating: "R",
    genreName: "Terror",
    statusName: "publicada",
    synopsis: "Una familia se muda a una casa antigua donde algo lleva décadas esperando su regreso.",
    releaseDate: "2026-07-01",
    posterUrl: "https://cdn.multicine.example.com/posters/el-umbral-oscuro.jpg",
    bannerUrl: "https://cdn.multicine.example.com/banners/el-umbral-oscuro.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    title: "Mundo de Cristal",
    durationMinutes: 90,
    rating: "G",
    genreName: "Animación",
    statusName: "publicada",
    synopsis: "Una niña descubre un reino miniatura escondido dentro de una esfera de cristal.",
    releaseDate: "2026-06-28",
    posterUrl: "https://cdn.multicine.example.com/posters/mundo-de-cristal.jpg",
    bannerUrl: "https://cdn.multicine.example.com/banners/mundo-de-cristal.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    title: "Última Frontera",
    durationMinutes: 135,
    rating: "PG-13",
    genreName: "Acción",
    statusName: "proximo_estreno",
    synopsis: "Un equipo de élite debe cruzar territorio hostil para desactivar una amenaza global.",
    releaseDate: "2026-09-18",
    posterUrl: "https://cdn.multicine.example.com/posters/ultima-frontera.jpg",
    bannerUrl: "https://cdn.multicine.example.com/banners/ultima-frontera.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    title: "Susurros del Bosque",
    durationMinutes: 110,
    rating: "PG-13",
    genreName: "Drama",
    statusName: "proximo_estreno",
    synopsis: "Dos hermanas separadas por años de silencio se reencuentran en la cabaña de su infancia.",
    releaseDate: "2026-09-04",
    posterUrl: "https://cdn.multicine.example.com/posters/susurros-del-bosque.jpg",
    bannerUrl: "https://cdn.multicine.example.com/banners/susurros-del-bosque.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    title: "Código Fantasma",
    durationMinutes: 118,
    rating: "R",
    genreName: "Suspenso",
    statusName: "borrador",
    synopsis: "Un hacker descubre que la IA que ayudó a crear ahora lo está vigilando a él.",
    releaseDate: "2026-11-10",
    posterUrl: "https://cdn.multicine.example.com/posters/codigo-fantasma.jpg",
    bannerUrl: "https://cdn.multicine.example.com/banners/codigo-fantasma.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

export async function seedMovies(
  genreIdsByName: Map<string, number>,
  statusIdsByName: Map<string, number>
): Promise<Map<string, number>> {
  const idsByTitle = new Map<string, number>();

  for (const data of movieSeedData) {
    const genreId = genreIdsByName.get(data.genreName);
    const statusId = statusIdsByName.get(data.statusName);
    if (!genreId) throw new Error(`No se encontró el género "${data.genreName}" para "${data.title}"`);
    if (!statusId) throw new Error(`No se encontró el estado "${data.statusName}" para "${data.title}"`);

    const [movie] = await Movie.findOrCreate({
      where: { title: data.title },
      defaults: {
        title: data.title,
        durationMinutes: data.durationMinutes,
        rating: data.rating,
        genreId,
        synopsis: data.synopsis,
        releaseDate: new Date(data.releaseDate),
        posterUrl: data.posterUrl,
        bannerUrl: data.bannerUrl,
        trailerUrl: data.trailerUrl,
        statusId,
      },
    });
    idsByTitle.set(movie.title, movie.id);
  }

  console.log(`✔ movies: ${idsByTitle.size} registros listos`);
  return idsByTitle;
}
