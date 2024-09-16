import { FilterQuery } from "mongoose";
import { Category, Product } from "../models/product-model";
import {
  CreateProductInput,
  GetProductByIdParams,
  GetProductQueryParams,
  UpdateProductInput,
} from "../schemas/product-schema";
import { BadRequestException, NotFoundException } from "../types/error-types";
import { PriceFilter } from "../types/product-types";

export async function createProduct(productBody: CreateProductInput) {
  const product = new Product(productBody);
  await product.save();
}

export async function getAllProducts(
  productQueryParams: GetProductQueryParams
) {
  const {
    q,
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
    category,
    minPrice,
    maxPrice,
  } = productQueryParams;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const sort: { [key: string]: 1 | -1 } = {};
  sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

  const filter: FilterQuery<typeof Product> = {};
  if (typeof q === "string" && q.trim() !== "") {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  if (category) {
    const categoryDoc = await Category.findOne({ name: category });

    if (categoryDoc) {
      filter.category = categoryDoc._id;
    } else {
      throw new BadRequestException("Invalid category");
    }
  }

  if (minPrice || maxPrice) {
    const priceFilter: PriceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    filter.price = priceFilter;
  }

  const products = await Product.find(filter)
    .populate("category", "name")
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const total = await Product.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  return {
    products,
    total,
    totalPages,
  };
}

export async function getProductById(params: GetProductByIdParams) {
  const product = await Product.findById(params.id);

  if (!product) {
    throw new NotFoundException("Product not found.");
  }

  return product;
}

export async function updateProduct(
  productId: string,
  productBody: UpdateProductInput
) {
  const product = await Product.findByIdAndUpdate(productId, productBody, {
    new: true,
  });

  if (!product) {
    throw new NotFoundException("Product not found.");
  }

  return product;
}
