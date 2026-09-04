// app/src/seeders/language.seed.ts

/**
 * Seed de idiomas (tabla `languages`).
 */

import Language from "../models/language.model";

export const languageSeedData = [{ name: "Subtitulada" }, { name: "Doblada" }, { name: "Original" }];

export async function seedLanguages(): Promise<Map<string, number>> {
  const idsByName = new Map<string, number>();

  for (const data of languageSeedData) {
    const [language] = await Language.findOrCreate({
      where: { name: data.name },
      defaults: data,
    });
    idsByName.set(language.name, language.id);
  }

  console.log(`✔ languages: ${idsByName.size} registros listos`);
  return idsByName;
}
