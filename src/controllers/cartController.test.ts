/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
import request from "supertest";
import express from "express";
import cartController from "../controllers/cartController";
import CartService from "../services/cartService";
import { ICart } from "../models/cartModel";
import mongoose from "mongoose";

jest.mock("../services/cartService");

const app = express();
app.use(express.json());

// Setup routes
app.post("/cart/:userId", cartController.addToCart);
app.get("/cart/:userId", cartController.getCart);
app.put("/cart/:userId/:productId", cartController.updateCartItem);
app.delete("/cart/:userId/:productId", cartController.removeFromCart);

describe("CartController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addToCart", () => {
    it("should add an item to the cart and return 201 status", async () => {
      const mockAddToCart = CartService.addToCart as jest.MockedFunction<
        typeof CartService.addToCart
      >;
      mockAddToCart.mockResolvedValue();

      const response = await request(app)
        .post("/cart/user123")
        .send({ productId: "product123", quantity: 2 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: "Item added to cart" });
      expect(mockAddToCart).toHaveBeenCalledWith("user123", {
        productId: "product123",
        quantity: 2,
      });
    });

    it("should return 500 status when CartService throws an error", async () => {
      const mockAddToCart = CartService.addToCart as jest.MockedFunction<
        typeof CartService.addToCart
      >;
      mockAddToCart.mockRejectedValue(new Error("Service error"));

      const response = await request(app)
        .post("/cart/user123")
        .send({ productId: "product123", quantity: 2 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to add item to cart",
        message: "Service error",
      });
    });
  });

  describe("getCart", () => {
    it("should return the cart for a given user", async () => {
      const mockCartData = {
        userId: new mongoose.Types.ObjectId("000000000000000000000001"),
        items: [],
        totalAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: new mongoose.Types.ObjectId("000000000000000000000002"),
      };

      const mockCart = {
        ...mockCartData,
        toObject: jest.fn().mockReturnValue(mockCartData),
      } as unknown as ICart;

      const mockGetCart = CartService.getCart as jest.MockedFunction<
        typeof CartService.getCart
      >;
      mockGetCart.mockResolvedValue(mockCart);

      const response = await request(app).get("/cart/000000000000000000000001");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          userId: "000000000000000000000001",
          items: [],
          totalAmount: 0,
        })
      );
      expect(mockGetCart).toHaveBeenCalledWith("000000000000000000000001");
    });

    it("should return 500 status when CartService throws an error", async () => {
      const mockGetCart = CartService.getCart as jest.MockedFunction<
        typeof CartService.getCart
      >;
      mockGetCart.mockRejectedValue(new Error("Service error"));

      const response = await request(app).get("/cart/user123");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to retrieve cart",
        message: "Service error",
      });
    });
  });

  describe("updateCartItem", () => {
    it("should update a cart item and return success message", async () => {
      const mockUpdateCartItem =
        CartService.updateCartItem as jest.MockedFunction<
          typeof CartService.updateCartItem
        >;
      mockUpdateCartItem.mockResolvedValue();

      const response = await request(app)
        .put("/cart/user123/product123")
        .send({ quantity: 3 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Cart item updated" });
      expect(mockUpdateCartItem).toHaveBeenCalledWith(
        "user123",
        "product123",
        3
      );
    });

    it("should return 500 status when CartService throws an error", async () => {
      const mockUpdateCartItem =
        CartService.updateCartItem as jest.MockedFunction<
          typeof CartService.updateCartItem
        >;
      mockUpdateCartItem.mockRejectedValue(new Error("Service error"));

      const response = await request(app)
        .put("/cart/user123/product123")
        .send({ quantity: 3 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to update cart item",
        message: "Service error",
      });
    });
  });

  describe("removeFromCart", () => {
    it("should remove an item from the cart and return success message", async () => {
      const mockRemoveFromCart =
        CartService.removeFromCart as jest.MockedFunction<
          typeof CartService.removeFromCart
        >;
      mockRemoveFromCart.mockResolvedValue();

      const response = await request(app).delete("/cart/user123/product123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Item removed from cart" });
      expect(mockRemoveFromCart).toHaveBeenCalledWith("user123", "product123");
    });

    it("should return 500 status when CartService throws an error", async () => {
      const mockRemoveFromCart =
        CartService.removeFromCart as jest.MockedFunction<
          typeof CartService.removeFromCart
        >;
      mockRemoveFromCart.mockRejectedValue(new Error("Service error"));

      const response = await request(app).delete("/cart/user123/product123");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to remove item from cart",
        message: "Service error",
      });
    });
  });
});
