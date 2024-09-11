import { Category } from "../models/category-model";

async function initializeCategories() {
  try {
    await Category.deleteMany({});

    const categories = [
      "Smartphones",
      "Laptops",
      "Tablets",
      "Audio",
      "TVs",
      "Gaming",
      "Cameras",
      "Wearables",
      "Drones",
      "Accessories",
      "Monitors",
    ];

    for (const categoryName of categories) {
      await Category.create({ name: categoryName });
    }

    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
}

export { initializeCategories };
