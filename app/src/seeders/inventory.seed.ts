// app/src/seeders/inventory.seed.ts

/**
 * Seed de inventario de confitería (tabla `inventory`). Depende de `snacks`.
 *
 * Incluye a propósito un producto con stock en 0 para poder probar el AC
 * de HU-012 ("producto agotado no se puede agregar al carrito").
 */

import Inventory from "../models/inventory.model";

interface InventorySeed {
    snackName: string;
    quantityAvailable: number;
    minStockAlert: number;
}

export const inventorySeedData: InventorySeed[] = [
    { snackName: "Combo Grande", quantityAvailable: 40, minStockAlert: 10 },
    { snackName: "Combo Pareja", quantityAvailable: 25, minStockAlert: 5 },
    { snackName: "Palomitas Grandes", quantityAvailable: 60, minStockAlert: 15 },
    { snackName: "Palomitas Medianas", quantityAvailable: 80, minStockAlert: 20 },
    { snackName: "Gaseosa Grande", quantityAvailable: 100, minStockAlert: 20 },
    { snackName: "Gaseosa Mediana", quantityAvailable: 120, minStockAlert: 25 },
    { snackName: "Nachos con Queso", quantityAvailable: 30, minStockAlert: 10 },
    { snackName: "Perro Caliente", quantityAvailable: 0, minStockAlert: 10 }, // agotado a propósito
    { snackName: "M&M's", quantityAvailable: 50, minStockAlert: 15 },
    { snackName: "Chocolatina", quantityAvailable: 70, minStockAlert: 20 },
];

export async function seedInventory(snackIdsByName: Map<string, number>): Promise<void> {
    let count = 0;

    for (const data of inventorySeedData) {
        const snackId = snackIdsByName.get(data.snackName);
        if (!snackId) {
            throw new Error(`No se encontró el snack "${data.snackName}" para su inventario`);
        }

        await Inventory.findOrCreate({
            where: { snackId },
            defaults: {
                snackId,
                quantityAvailable: data.quantityAvailable,
                minStockAlert: data.minStockAlert,
            },
        });
        count++;
    }

    console.log(`inventory: ${count} registros listos`);
}