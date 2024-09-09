/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
import request from "supertest";
import express from "express";
import productController from "./product-controller";
import ProductService from "../services/productService";

jest.mock("../services/productService");

const app = express();
app.use(express.json());

app.post("/products", productController.createProduct);
app.get("/products", productController.getAllProducts);
app.get("/products/:id", productController.getProductById);
app.put("/products/:id", productController.updateProduct);
app.delete("/products/:id", productController.deleteProduct);

describe("ProductController Integration Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /products", () => {
    it("should create a new product and return 201 status", async () => {
      const mockProduct = {
        id: "1",
        name: "Test Product",
        description: "A test product",
        price: 9.99,
        category: "Test Category",
      };

      (ProductService.createProduct as jest.Mock).mockResolvedValue(
        mockProduct
      );

      const response = await request(app).post("/products").send({
        name: "Test Product",
        description: "A test product",
        price: 9.99,
        category: "Test Category",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockProduct);
    });

    it("should return 400 status when creation fails", async () => {
      (ProductService.createProduct as jest.Mock).mockRejectedValue(
        new Error("Creation failed")
      );

      const response = await request(app).post("/products").send({
        name: "Test Product",
        description: "A test product",
        price: 9.99,
        category: "Test Category",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Creation failed" });
    });
  });

  describe("GET /products", () => {
    it("should return all products", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Product 1",
          description: "Description 1",
          price: 9.99,
          category: "Category 1",
        },
        {
          id: "2",
          name: "Product 2",
          description: "Description 2",
          price: 19.99,
          category: "Category 2",
        },
      ];

      (ProductService.getAllProducts as jest.Mock).mockResolvedValue(
        mockProducts
      );

      const response = await request(app).get("/products");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
    });

    it("should return 500 status when retrieval fails", async () => {
      (ProductService.getAllProducts as jest.Mock).mockRejectedValue(
        new Error("Retrieval failed")
      );

      const response = await request(app).get("/products");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Retrieval failed" });
    });
  });

  describe("GET /products/:id", () => {
    it("should return a product by id", async () => {
      const mockProduct = {
        id: "1",
        name: "Product 1",
        description: "Description 1",
        price: 9.99,
        category: "Category 1",
      };

      (ProductService.getProductById as jest.Mock).mockResolvedValue(
        mockProduct
      );

      const response = await request(app).get("/products/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    it("should return 404 status when product is not found", async () => {
      (ProductService.getProductById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/products/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Product not found" });
    });

    it("should return 500 status when retrieval fails", async () => {
      (ProductService.getProductById as jest.Mock).mockRejectedValue(
        new Error("Retrieval failed")
      );

      const response = await request(app).get("/products/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Retrieval failed" });
    });
  });

  describe("PUT /products/:id", () => {
    it("should update a product and return the updated product", async () => {
      const mockUpdatedProduct = {
        id: "1",
        name: "Updated Product",
        description: "Updated description",
        price: 19.99,
        category: "Updated Category",
      };

      (ProductService.updateProduct as jest.Mock).mockResolvedValue(
        mockUpdatedProduct
      );

      const response = await request(app).put("/products/1").send({
        name: "Updated Product",
        description: "Updated description",
        price: 19.99,
        category: "Updated Category",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedProduct);
    });

    it("should return 404 status when product is not found", async () => {
      (ProductService.updateProduct as jest.Mock).mockResolvedValue(null);

      const response = await request(app).put("/products/999").send({
        name: "Updated Product",
        description: "Updated description",
        price: 19.99,
        category: "Updated Category",
      });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Product not found" });
    });

    it("should return 400 status when update fails", async () => {
      (ProductService.updateProduct as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      const response = await request(app).put("/products/1").send({
        name: "Updated Product",
        description: "Updated description",
        price: 19.99,
        category: "Updated Category",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Update failed" });
    });
  });

  describe("DELETE /products/:id", () => {
    it("should delete a product and return success message", async () => {
      (ProductService.deleteProduct as jest.Mock).mockResolvedValue({
        id: "1",
      });

      const response = await request(app).delete("/products/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Product deleted successfully",
      });
    });

    it("should return 404 status when product is not found", async () => {
      (ProductService.deleteProduct as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete("/products/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Product not found" });
    });

    it("should return 500 status when deletion fails", async () => {
      (ProductService.deleteProduct as jest.Mock).mockRejectedValue(
        new Error("Deletion failed")
      );

      const response = await request(app).delete("/products/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Deletion failed" });
    });
  });
});
