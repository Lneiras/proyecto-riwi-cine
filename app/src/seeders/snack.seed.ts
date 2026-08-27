
import Snack from "../models/snack.model";

interface SnackSeed {
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    categoryName: string;
}

export const snackSeedData: SnackSeed[] = [
    {
        name: "Combo Grande",
        description: "Palomitas grandes + gaseosa grande + dulce a elección",
        price: 28000,
        imageUrl: "https://cdn.multicine.example.com/snacks/combo-grande.jpg",
        categoryName: "Combos",
    },
    {
        name: "Combo Pareja",
        description: "2 palomitas medianas + 2 gaseosas medianas",
        price: 45000,
        imageUrl: "https://cdn.multicine.example.com/snacks/combo-pareja.jpg",
        categoryName: "Combos",
    },
    {
        name: "Palomitas Grandes",
        description: "Palomitas saladas o dulces, tamaño grande",
        price: 12000,
        imageUrl: "https://cdn.multicine.example.com/snacks/palomitas-grandes.jpg",
        categoryName: "Palomitas",
    },
    {
        name: "Palomitas Medianas",
        description: "Palomitas saladas o dulces, tamaño mediano",
        price: 9000,
        imageUrl: "https://cdn.multicine.example.com/snacks/palomitas-medianas.jpg",
        categoryName: "Palomitas",
    },
    {
        name: "Gaseosa Grande",
        description: "Bebida gaseosa 500ml, sabor a elección",
        price: 8000,
        imageUrl: "https://cdn.multicine.example.com/snacks/gaseosa-grande.jpg",
        categoryName: "Bebidas",
    },
    {
        name: "Gaseosa Mediana",
        description: "Bebida gaseosa 350ml, sabor a elección",
        price: 6500,
        imageUrl: "https://cdn.multicine.example.com/snacks/gaseosa-mediana.jpg",
        categoryName: "Bebidas",
    },
    {
        name: "Nachos con Queso",
        description: "Nachos crocantes bañados en salsa de queso",
        price: 14000,
        imageUrl: "https://cdn.multicine.example.com/snacks/nachos-queso.jpg",
        categoryName: "Snacks Salados",
    },
    {
        name: "Perro Caliente",
        description: "Perro caliente clásico con salsas a elección",
        price: 11000,
        imageUrl: "https://cdn.multicine.example.com/snacks/perro-caliente.jpg",
        categoryName: "Snacks Salados",
    },
    {
        name: "M&M's",
        description: "Bolsa individual de chocolates M&M's",
        price: 7000,
        imageUrl: "https://cdn.multicine.example.com/snacks/mms.jpg",
        categoryName: "Dulces",
    },
    {
        name: "Chocolatina",
        description: "Chocolatina clásica surtida",
        price: 4000,
        imageUrl: "https://cdn.multicine.example.com/snacks/chocolatina.jpg",
        categoryName: "Dulces",
    },
];

export async function seedSnacks(
    categoryIdsByName: Map<string, number>
    ): Promise<Map<string, number>> {
    const idsByName = new Map<string, number>();

    for (const data of snackSeedData) {
        const snackCategoryId = categoryIdsByName.get(data.categoryName);
        if (!snackCategoryId) {
            throw new Error(`No se encontró la categoría "${data.categoryName}" para "${data.name}"`);
        }

        const [snack] = await Snack.findOrCreate({
            where: { name: data.name },
            defaults: {
                name: data.name,
                description: data.description,
                price: data.price,
                imageUrl: data.imageUrl,
                snackCategoryId,
            },
        });
        idsByName.set(snack.name, snack.id);
    }

    console.log(`snacks: ${idsByName.size} registros listos`);
    return idsByName;
}