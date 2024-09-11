import { Product, Category } from "../models/product-model";
import { User } from "../models/user-model";
import mongoose from "mongoose";

async function initializeProducts() {
  try {
    await Product.deleteMany({});

    const categories = await Category.find();
    if (categories.length === 0) {
      throw new Error(
        "Categories not found. Please run category seeder first."
      );
    }

    const users = await User.find();
    if (users.length === 0) {
      throw new Error("Users not found. Please run user seeder first.");
    }

    const products = [
      {
        name: "iPhone 13",
        price: 799,
        description: "Apple's flagship smartphone",
        category: "Smartphones",
        reviews: [
          { user: users[0]._id, message: "Great phone!", rating: 5 },
          { user: users[1]._id, message: "Good, but expensive", rating: 4 },
        ],
      },
      {
        name: "Samsung Galaxy S21",
        price: 799,
        description: "High-end Android smartphone",
        category: "Smartphones",
        reviews: [
          {
            user: users[1]._id,
            message: "Excellent Android device",
            rating: 5,
          },
        ],
      },
      {
        name: "MacBook Pro",
        price: 1299,
        description: "Powerful laptop for professionals",
        category: "Laptops",
        reviews: [
          {
            user: users[1]._id,
            message: "Nice laptop!",
            rating: 5,
          },
        ],
      },
      {
        name: "Dell XPS 13",
        price: 999,
        description: "Ultrabook with InfinityEdge display",
        category: "Laptops",
        reviews: [
          {
            user: users[1]._id,
            message: "Nice laptop for Linux!",
            rating: 5,
          },
        ],
      },
      {
        name: "iPad Air",
        price: 599,
        description: "Versatile tablet for work and play",
        category: "Tablets",
        reviews: [
          {
            user: users[1]._id,
            message: "Nice tablet",
            rating: 5,
          },
        ],
      },
      {
        name: "Sony WH-1000XM4",
        price: 349,
        description: "Wireless noise-cancelling headphones",
        category: "Audio",
        reviews: [
          {
            user: users[1]._id,
            message: "Good quality",
            rating: 5,
          },
        ],
      },
      {
        name: "LG OLED CX Series",
        price: 1499,
        description: "4K OLED Smart TV",
        category: "TVs",
        reviews: [
          {
            user: users[1]._id,
            message: "Great TV",
            rating: 5,
          },
        ],
      },
      {
        name: "Nintendo Switch",
        price: 299,
        description: "Hybrid gaming console",
        category: "Gaming",
        reviews: [
          {
            user: users[1]._id,
            message: "Good",
            rating: 5,
          },
        ],
      },
      {
        name: "Canon EOS R5",
        price: 3899,
        description: "Full-frame mirrorless camera",
        category: "Cameras",
        reviews: [
          {
            user: users[1]._id,
            message: "Greate!",
            rating: 5,
          },
        ],
      },
      {
        name: "Fitbit Versa 3",
        price: 229,
        description: "Advanced fitness smartwatch",
        category: "Wearables",
        reviews: [
          {
            user: users[1]._id,
            message: "Happy!~",
            rating: 5,
          },
        ],
      },
      {
        name: "Bose QuietComfort Earbuds",
        price: 279,
        description: "True wireless noise-cancelling earbuds",
        category: "Audio",
        reviews: [
          {
            user: users[1]._id,
            message: "Satisfied!",
            rating: 5,
          },
        ],
      },
      {
        name: "Microsoft Surface Pro 7",
        price: 749,
        description: "Versatile 2-in-1 tablet",
        category: "Tablets",
        reviews: [
          {
            user: users[1]._id,
            message: "Excellent device",
            rating: 5,
          },
        ],
      },
      {
        name: "PlayStation 5",
        price: 499,
        description: "Next-gen gaming console",
        category: "Gaming",
        reviews: [
          {
            user: users[1]._id,
            message: "sleek",
            rating: 5,
          },
        ],
      },
      {
        name: "DJI Mavic Air 2",
        price: 799,
        description: "Foldable 4K drone",
        category: "Drones",
        reviews: [
          {
            user: users[1]._id,
            message: "sleek",
            rating: 5,
          },
        ],
      },
      {
        name: "Asus ROG Strix G15",
        price: 1299,
        description: "High-performance gaming laptop",
        category: "Laptops",
        reviews: [
          {
            user: users[1]._id,
            message: "Just wow",
            rating: 5,
          },
        ],
      },
      {
        name: "GoPro HERO9 Black",
        price: 449,
        description: "Action camera with front display",
        category: "Cameras",
        reviews: [
          {
            user: users[1]._id,
            message: "Just wow",
            rating: 5,
          },
        ],
      },
      {
        name: "Samsung Galaxy Watch 4",
        price: 249,
        description: "Advanced smartwatch with health features",
        category: "Wearables",
        reviews: [
          {
            user: users[1]._id,
            message: "Just wow",
            rating: 5,
          },
        ],
      },
      {
        name: "Sonos Arc",
        price: 799,
        description: "Premium soundbar for home theater",
        category: "Audio",
        reviews: [],
      },
      {
        name: "Razer BlackWidow V3",
        price: 139,
        description: "Mechanical gaming keyboard",
        category: "Accessories",
        reviews: [],
      },
      {
        name: "LG 34GN850-B",
        price: 999,
        description: "34-inch ultrawide gaming monitor",
        category: "Monitors",
        reviews: [],
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

      const reviews = product.reviews
        ? product.reviews.map((review) => ({
            ...review,
            user: new mongoose.Types.ObjectId(review.user),
          }))
        : [];

      await Product.create({
        name: product.name,
        price: product.price,
        description: product.description,
        category: category._id,
        reviews: reviews,
      });
    }

    console.log("Products and reviews seeded successfully");
  } catch (error) {
    console.error("Error seeding products and reviews:", error);
  }
}

export { initializeProducts };
