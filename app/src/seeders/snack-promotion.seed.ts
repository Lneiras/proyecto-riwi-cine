// app/src/seeders/snack-promotion.seed.ts

/**
 * Seed de promociones de confitería (tabla `snackPromotions`). Depende de
 * `snacks` y `snackCategories`.
 *
 * Incluye una promoción por producto, una por categoría y una ya vencida
 * (para poder probar que `getEffectivePrice` la ignora correctamente).
 */

import SnackPromotion, { DiscountType } from "../models/snack-promotion.model";

interface SnackPromotionSeed {
    snackName?: string;
    categoryName?: string;
    discountType: DiscountType;
    discountValue: number;
    startDate: Date;
    endDate: Date;
}

const now = new Date();
const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

export const snackPromotionSeedData: SnackPromotionSeed[] = [
    {
        // Promo vigente por producto: -20% en Combo Grande
        snackName: "Combo Grande",
        discountType: "percentage",
        discountValue: 20,
        startDate: now,
        endDate: in30Days,
    },
    {
        // Promo vigente por categoría: -$1.000 en cualquier Bebida
        categoryName: "Bebidas",
        discountType: "fixed",
        discountValue: 1000,
        startDate: now,
        endDate: in30Days,
    },
    {
        // Promo YA VENCIDA a propósito, para verificar que no se aplique
        snackName: "Chocolatina",
        discountType: "percentage",
        discountValue: 50,
        startDate: twoDaysAgo,
        endDate: yesterday,
    },
];

export async function seedSnackPromotions(
    snackIdsByName: Map<string, number>,
    categoryIdsByName: Map<string, number>
    ): Promise<void> {
    let count = 0;

    for (const data of snackPromotionSeedData) {
        const snackId = data.snackName ? snackIdsByName.get(data.snackName) : null;
        const snackCategoryId = data.categoryName ? categoryIdsByName.get(data.categoryName) : null;

        if (data.snackName && !snackId) {
            throw new Error(`No se encontró el snack "${data.snackName}" para su promoción`);
        }
        if (data.categoryName && !snackCategoryId) {
            throw new Error(`No se encontró la categoría "${data.categoryName}" para su promoción`);
        }

        await SnackPromotion.findOrCreate({
            where: {
                snackId: snackId ?? null,
                snackCategoryId: snackCategoryId ?? null,
                discountType: data.discountType,
            },
            defaults: {
                snackId: snackId ?? null,
                snackCategoryId: snackCategoryId ?? null,
                discountType: data.discountType,
                discountValue: data.discountValue,
                startDate: data.startDate,
                endDate: data.endDate,
            },
        });
        count++;
    }

    console.log(`snackPromotions: ${count} registros listos`);
}