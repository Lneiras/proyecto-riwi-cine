// app/src/seeders/snack-category.seed.ts

/**
 * Seed de categorías de confitería (tabla `snackCategories`).
 */

import SnackCategory from "../models/snack-category.model";

export const snackCategorySeedData = [
    { name: "Combos", description: "Combinaciones de palomitas + bebida a precio especial" },
    { name: "Palomitas", description: "Palomitas dulces o saladas en distintos tamaños" },
    { name: "Bebidas", description: "Gaseosas, jugos y agua" },
    { name: "Snacks Salados", description: "Nachos, perros calientes y similares" },
    { name: "Dulces", description: "Chocolates y confites" },
];

export async function seedSnackCategories(): Promise<Map<string, number>> {
    const idsByName = new Map<string, number>();

    for (const data of snackCategorySeedData) {
        const [category] = await SnackCategory.findOrCreate({
        where: { name: data.name },
        defaults: data,
        });
        idsByName.set(category.name, category.id);
    }

    console.log(`snackCategories: ${idsByName.size} registros listos`);
    return idsByName;
}