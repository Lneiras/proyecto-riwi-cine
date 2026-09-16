import Product from
  "../models/product.model";

const productSeedData = [
  {
    name: "Crispetas",
    price: 12000,
    stock: 20,
  },

  {
    name: "Gaseosa",
    price: 7000,
    stock: 30,
  },

  {
    name: "Combo Cine",
    price: 18000,
    stock: 15,
  },
];

export async function seedProducts(
  categoryIdsByName:
    Map<string, number>
) {

  const categoryId =
    categoryIdsByName.get(
      "Confitería"
    );

  if (!categoryId) {
    throw new Error(
      "No se encontró la categoría Confitería"
    );
  }

  for (
    const data
    of productSeedData
  ) {

    await Product.findOrCreate({
      where: {
        name: data.name,
      },

      defaults: {
        ...data,
        categoryId,
      },
    });
  }

  console.log(
    "✔ products: productos listos"
  );
}