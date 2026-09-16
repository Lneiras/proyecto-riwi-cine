import Category from
  "../models/category.model";

export const categorySeedData = [
  {
    name: "Confitería",
  },
];

export async function seedCategories() {

  const ids =
    new Map<string, number>();

  for (
    const data
    of categorySeedData
  ) {

    const [category] =
      await Category.findOrCreate({
        where: {
          name: data.name,
        },

        defaults: data,
      });

    ids.set(
      category.name,
      category.id
    );
  }

  console.log(
    `✔ categories: ${ids.size} registros listos`
  );

  return ids;
}