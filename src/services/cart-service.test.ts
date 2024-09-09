/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Types } from "mongoose";
import CartService from "./cart-service";
import Cart, { ICart } from "../models/cart-model";
import { Product } from "../models/product-model";

jest.mock("../models/cart-model");
jest.mock("../models/product-model");

describe("CartService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("should retrieve an existing cart", async () => {
      const mockCart = {
        userId: new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5a"),
        items: [],
        totalAmount: 0,
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      const result = await CartService.getCart("5f7c8d2e9d5d5e001c5f5b5a");
      expect(result).toEqual(mockCart);
      expect(Cart.findOne).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
      });
    });

    it("should create a new cart if none exists", async () => {
      (Cart.findOne as jest.Mock).mockResolvedValue(null);
      const mockSave = jest.fn().mockResolvedValue(undefined);
      const mockCart = {
        userId: new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5a"),
        items: [],
        totalAmount: 0,
        save: mockSave,
      };
      (Cart as unknown as jest.Mock).mockImplementation(() => mockCart);

      const result = await CartService.getCart("5f7c8d2e9d5d5e001c5f5b5a");

      expect(Cart).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
        items: [],
        totalAmount: 0,
      });
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockCart);
    });

    it("should throw an error for invalid user ID", async () => {
      await expect(CartService.getCart("invalid-id")).rejects.toThrow(
        "Invalid user ID"
      );
    });
  });

  describe("addToCart", () => {
    it("should add a new item to the cart", async () => {
      const productId = new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5b");
      const mockProduct = { _id: productId, price: 10 };
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);

      const mockCart: Partial<ICart> = {
        userId: new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5a"),
        items: [],
        totalAmount: 0,
        save: jest.fn(),
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await CartService.addToCart("5f7c8d2e9d5d5e001c5f5b5a", {
        productId,
        quantity: 2,
      });

      expect(mockCart.items).toHaveLength(1);
      expect(mockCart.totalAmount).toBe(20);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it("should update quantity if item already exists in cart", async () => {
      const productId = new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5b");
      const mockProduct = { _id: productId, price: 10 };
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);

      const mockCart: Partial<ICart> = {
        userId: new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5a"),
        items: [{ productId, quantity: 1, price: 10 }],
        totalAmount: 10,
        save: jest.fn(),
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await CartService.addToCart("5f7c8d2e9d5d5e001c5f5b5a", {
        productId,
        quantity: 2,
      });

      expect(mockCart.items?.[0].quantity).toBe(3);
      expect(mockCart.totalAmount).toBe(30);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it("should throw an error if product is not found", async () => {
      (Product.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        CartService.addToCart("5f7c8d2e9d5d5e001c5f5b5a", {
          productId: new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5b"),
          quantity: 1,
        })
      ).rejects.toThrow("Product not found");
    });
  });

  describe("updateCartItem", () => {
    it("should update the quantity of an item in the cart", async () => {
      const mockCart: Partial<ICart> = {
        userId: new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5a"),
        items: [
          {
            productId: new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5b"),
            quantity: 2,
            price: 10,
          },
        ],
        totalAmount: 20,
        save: jest.fn(),
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await CartService.updateCartItem(
        "5f7c8d2e9d5d5e001c5f5b5a",
        "5f7c8d2e9d5d5e001c5f5b5b",
        3
      );

      expect(mockCart.items?.[0].quantity).toBe(3);
      expect(mockCart.totalAmount).toBe(30);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it("should throw an error if the item is not found in the cart", async () => {
      const mockCart: Partial<ICart> = {
        userId: new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5a"),
        items: [],
        totalAmount: 0,
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await expect(
        CartService.updateCartItem(
          "5f7c8d2e9d5d5e001c5f5b5a",
          "5f7c8d2e9d5d5e001c5f5b5b",
          3
        )
      ).rejects.toThrow("Item not found in cart");
    });
  });

  describe("removeFromCart", () => {
    it("should remove an item from the cart", async () => {
      const mockCart: Partial<ICart> = {
        userId: new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5a"),
        items: [
          {
            productId: new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5b"),
            quantity: 2,
            price: 10,
          },
        ],
        totalAmount: 20,
        save: jest.fn(),
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await CartService.removeFromCart(
        "5f7c8d2e9d5d5e001c5f5b5a",
        "5f7c8d2e9d5d5e001c5f5b5b"
      );

      expect(mockCart.items).toHaveLength(0);
      expect(mockCart.totalAmount).toBe(0);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it("should throw an error if the item is not found in the cart", async () => {
      const mockCart: Partial<ICart> = {
        userId: new Types.ObjectId("5f7c8d2e9d5d5e001c5f5b5a"),
        items: [],
        totalAmount: 0,
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await expect(
        CartService.removeFromCart(
          "5f7c8d2e9d5d5e001c5f5b5a",
          "5f7c8d2e9d5d5e001c5f5b5b"
        )
      ).rejects.toThrow("Item not found in cart");
    });
  });
});
