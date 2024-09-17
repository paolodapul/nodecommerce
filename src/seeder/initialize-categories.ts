import { Category } from "../models/product-model";
import logger from "../utils/logger";

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

    logger.info("Categories seeded successfully");
  } catch (error) {
    logger.error("Error seeding categories:", error);
  }
}

export { initializeCategories };
