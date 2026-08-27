import { Op } from "sequelize";
import { Snack, SnackCategory, Inventory, SnackPromotion } from "../models";
import { money } from "../utils/cartCalculator";

export interface SnackFilters {
    categoryId?: number;
    search?: string;
}

/** Catálogo público: solo snacks activos, con categoría, stock y disponibilidad. */
export async function getActiveSnacks(filters: SnackFilters) {
    const where: Record<string, unknown> = { isActive: true };

    if (filters.categoryId) where.snackCategoryId = filters.categoryId;
    if (filters.search) where.name = { [Op.iLike]: `%${filters.search}%` };

    const snacks = await Snack.findAll({
        where,
        include: [
            { model: SnackCategory, as: "category", attributes: ["id", "name"] },
            { model: Inventory, as: "inventory", attributes: ["quantityAvailable"] },
        ],
        order: [["name", "ASC"]],
    });

    const results = [];
    for (const snack of snacks) {
        const plain = snack.toJSON() as any;
        const effectivePrice = await getEffectivePrice(snack);
        const stock = plain.inventory?.quantityAvailable ?? 0;

        results.push({
            id: plain.id,
            name: plain.name,
            description: plain.description,
            price: Number(plain.price),
            effectivePrice, // precio con promoción vigente aplicada, si existe
            imageUrl: plain.imageUrl,
            category: plain.category,
            stock,
            available: stock > 0, // AC de HU-012: el Frontend deshabilita "Agregar" si es false
        });
    }
    return results;
}

/** Categorías activas para el filtro del catálogo. */
export async function getActiveCategories() {
    return SnackCategory.findAll({
        where: { isActive: true },
        attributes: ["id", "name", "description"],
        order: [["name", "ASC"]],
    });
}

/**
 * Calcula el precio efectivo de un snack considerando promociones vigentes,
 * por producto o por categoría. Se recalcula en caliente (no se "congela"
 * en el carrito), igual que el precio de las entradas en cart.service.ts.
 */
export async function getEffectivePrice(snack: InstanceType<typeof Snack>): Promise<number> {
    const now = new Date();

    const promotion = await SnackPromotion.findOne({
        where: {
            isActive: true,
            startDate: { [Op.lte]: now },
            endDate: { [Op.gte]: now },
            [Op.or]: [
                { snackId: snack.id },
                { snackCategoryId: (snack as any).snackCategoryId },
            ],
        },
        order: [["discountValue", "DESC"]], // si hay varias vigentes, aplica la de mayor descuento
    });

    const basePrice = Number(snack.price);
    if (!promotion) return basePrice;

    if (promotion.discountType === "percentage") {
        return money(basePrice * (1 - Number(promotion.discountValue) / 100));
    }
    return Math.max(0, money(basePrice - Number(promotion.discountValue)));
}