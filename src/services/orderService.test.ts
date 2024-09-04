/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Types } from "mongoose";
import orderService from "../services/orderService";
import cartService from "../services/cartService";
import { Order } from "../models/orderModel";

// Mock the Order model and cartService
jest.mock("../models/orderModel");
jest.mock("../services/cartService");

describe("OrderService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create a new order", async () => {
      const mockCart = {
        items: [
          { productId: new Types.ObjectId(), quantity: 2, price: 10 },
          { productId: new Types.ObjectId(), quantity: 1, price: 20 },
        ],
      };
      (cartService.getCart as jest.Mock).mockResolvedValue(mockCart);
      (Order.prototype.save as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId(),
        userId: "user123",
        items: mockCart.items,
        totalAmount: 40,
      });

      const result = await orderService.createOrder({
        userId: "user123",
        items: [],
      });

      expect(cartService.getCart).toHaveBeenCalledWith("user123");
      expect(Order.prototype.save).toHaveBeenCalled();
      expect(result).toHaveProperty("totalAmount", 40);
    });
  });

  describe("getAllOrders", () => {
    it("should return all orders", async () => {
      const mockOrders = [
        { _id: new Types.ObjectId() },
        { _id: new Types.ObjectId() },
      ];
      (Order.find as jest.Mock).mockResolvedValue(mockOrders);

      const result = await orderService.getAllOrders();

      expect(Order.find).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });

  describe("getOrderById", () => {
    it("should return an order by id", async () => {
      const mockOrder = { _id: new Types.ObjectId() };
      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(mockOrder._id);

      expect(Order.findById).toHaveBeenCalledWith(mockOrder._id);
      expect(result).toEqual(mockOrder);
    });
  });

  describe("getOrdersByUserId", () => {
    it("should return orders for a specific user", async () => {
      const userId = new Types.ObjectId();
      const mockOrders = [
        { _id: new Types.ObjectId() },
        { _id: new Types.ObjectId() },
      ];
      (Order.find as jest.Mock).mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersByUserId(userId);

      expect(Order.find).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
      });
      expect(result).toEqual(mockOrders);
    });
  });

  describe("updateOrder", () => {
    it("should update an order", async () => {
      const orderId = new Types.ObjectId();
      const updateData = {
        items: [{ productId: new Types.ObjectId(), quantity: 3, price: 15 }],
      };
      const updatedOrder = { ...updateData, totalAmount: 45 };
      (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedOrder);

      const result = await orderService.updateOrder(orderId, updateData);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId,
        expect.objectContaining({ totalAmount: 45 }),
        { new: true }
      );
      expect(result).toEqual(updatedOrder);
    });
  });

  describe("updateOrderStatus", () => {
    it("should update the status of an order", async () => {
      const orderId = new Types.ObjectId();
      const newStatus = "processing";
      const updatedOrder = { _id: orderId, status: newStatus };
      (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedOrder);

      const result = await orderService.updateOrderStatus(orderId, newStatus);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId,
        { status: newStatus },
        { new: true }
      );
      expect(result).toEqual(updatedOrder);
    });
  });

  describe("cancelOrder", () => {
    it("should cancel an order", async () => {
      const orderId = new Types.ObjectId();
      const cancelledOrder = { _id: orderId, status: "cancelled" };
      (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue(cancelledOrder);

      const result = await orderService.cancelOrder(orderId);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId,
        { status: "cancelled" },
        { new: true }
      );
      expect(result).toEqual(cancelledOrder);
    });
  });
});
