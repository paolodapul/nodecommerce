/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Types } from "mongoose";
import productService from "../services/productService";
import { Product } from "../models/productModel";

// Mock the Product model
jest.mock("../models/productModel");

describe("ProductService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProduct", () => {
    it("should create a new product", async () => {
      const productData = {
        name: "Test Product",
        price: 9.99,
        description: "This is a test product",
      };
      const savedProduct = { ...productData, _id: new Types.ObjectId() };
      (Product.prototype.save as jest.Mock).mockResolvedValue(savedProduct);

      const result = await productService.createProduct(productData);

      expect(Product).toHaveBeenCalledWith(productData);
      expect(Product.prototype.save).toHaveBeenCalled();
      expect(result).toEqual(savedProduct);
    });
  });

  describe("getAllProducts", () => {
    it("should return all products", async () => {
      const mockProducts = [
        { _id: new Types.ObjectId(), name: "Product 1", price: 10 },
        { _id: new Types.ObjectId(), name: "Product 2", price: 20 },
      ];
      (Product.find as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAllProducts();

      expect(Product.find).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe("getProductById", () => {
    it("should return a product by id", async () => {
      const productId = new Types.ObjectId();
      const mockProduct = { _id: productId, name: "Test Product", price: 15 };
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.getProductById(productId);

      expect(Product.findById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });

    it("should return null if product is not found", async () => {
      const productId = new Types.ObjectId();
      (Product.findById as jest.Mock).mockResolvedValue(null);

      const result = await productService.getProductById(productId);

      expect(Product.findById).toHaveBeenCalledWith(productId);
      expect(result).toBeNull();
    });
  });

  describe("updateProduct", () => {
    it("should update a product", async () => {
      const productId = new Types.ObjectId();
      const updateData = { name: "Updated Product", price: 25 };
      const updatedProduct = { _id: productId, ...updateData };
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        updatedProduct
      );

      const result = await productService.updateProduct(productId, updateData);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        updateData,
        { new: true }
      );
      expect(result).toEqual(updatedProduct);
    });

    it("should return null if product to update is not found", async () => {
      const productId = new Types.ObjectId();
      const updateData = { name: "Updated Product" };
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await productService.updateProduct(productId, updateData);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        updateData,
        { new: true }
      );
      expect(result).toBeNull();
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product", async () => {
      const productId = new Types.ObjectId();
      const deletedProduct = {
        _id: productId,
        name: "Deleted Product",
        price: 30,
      };
      (Product.findByIdAndDelete as jest.Mock).mockResolvedValue(
        deletedProduct
      );

      const result = await productService.deleteProduct(productId);

      expect(Product.findByIdAndDelete).toHaveBeenCalledWith(productId);
      expect(result).toEqual(deletedProduct);
    });

    it("should return null if product to delete is not found", async () => {
      const productId = new Types.ObjectId();
      (Product.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await productService.deleteProduct(productId);

      expect(Product.findByIdAndDelete).toHaveBeenCalledWith(productId);
      expect(result).toBeNull();
    });
  });
});
