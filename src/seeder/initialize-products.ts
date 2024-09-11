import { Product } from "../models/product-model";
import { Category } from "../models/category-model";

async function initializeProducts() {
  try {
    await Product.deleteMany({});

    const categories = await Category.find();
    if (categories.length === 0) {
      throw new Error(
        "Categories not found. Please run category seeder first."
      );
    }

    const products = [
      {
        name: "iPhone 13",
        price: 799,
        description: "Apple's flagship smartphone",
        category: "Smartphones",
      },
      {
        name: "Samsung Galaxy S21",
        price: 799,
        description: "High-end Android smartphone",
        category: "Smartphones",
      },
      {
        name: "MacBook Pro",
        price: 1299,
        description: "Powerful laptop for professionals",
        category: "Laptops",
      },
      {
        name: "Dell XPS 13",
        price: 999,
        description: "Ultrabook with InfinityEdge display",
        category: "Laptops",
      },
      {
        name: "iPad Air",
        price: 599,
        description: "Versatile tablet for work and play",
        category: "Tablets",
      },
      {
        name: "Sony WH-1000XM4",
        price: 349,
        description: "Wireless noise-cancelling headphones",
        category: "Audio",
      },
      {
        name: "LG OLED CX Series",
        price: 1499,
        description: "4K OLED Smart TV",
        category: "TVs",
      },
      {
        name: "Nintendo Switch",
        price: 299,
        description: "Hybrid gaming console",
        category: "Gaming",
      },
      {
        name: "Canon EOS R5",
        price: 3899,
        description: "Full-frame mirrorless camera",
        category: "Cameras",
      },
      {
        name: "Fitbit Versa 3",
        price: 229,
        description: "Advanced fitness smartwatch",
        category: "Wearables",
      },
      {
        name: "Bose QuietComfort Earbuds",
        price: 279,
        description: "True wireless noise-cancelling earbuds",
        category: "Audio",
      },
      {
        name: "Microsoft Surface Pro 7",
        price: 749,
        description: "Versatile 2-in-1 tablet",
        category: "Tablets",
      },
      {
        name: "PlayStation 5",
        price: 499,
        description: "Next-gen gaming console",
        category: "Gaming",
      },
      {
        name: "DJI Mavic Air 2",
        price: 799,
        description: "Foldable 4K drone",
        category: "Drones",
      },
      {
        name: "Asus ROG Strix G15",
        price: 1299,
        description: "High-performance gaming laptop",
        category: "Laptops",
      },
      {
        name: "GoPro HERO9 Black",
        price: 449,
        description: "Action camera with front display",
        category: "Cameras",
      },
      {
        name: "Samsung Galaxy Watch 4",
        price: 249,
        description: "Advanced smartwatch with health features",
        category: "Wearables",
      },
      {
        name: "Sonos Arc",
        price: 799,
        description: "Premium soundbar for home theater",
        category: "Audio",
      },
      {
        name: "Razer BlackWidow V3",
        price: 139,
        description: "Mechanical gaming keyboard",
        category: "Accessories",
      },
      {
        name: "LG 34GN850-B",
        price: 999,
        description: "34-inch ultrawide gaming monitor",
        category: "Monitors",
      },
    ];

    for (const product of products) {
      const category = categories.find((c) => c.name === product.category);
      if (!category) {
        console.warn(
          `Category ${product.category} not found for product ${product.name}`
        );
        continue;
      }

      await Product.create({
        name: product.name,
        price: product.price,
        description: product.description,
        category: category._id,
      });
    }

    console.log("Products seeded successfully");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
}

export { initializeProducts };
