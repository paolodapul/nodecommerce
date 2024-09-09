/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
import request from "supertest";
import express, {
  NextFunction,
  Request as ExpressRequest,
  Response,
} from "express";
import orderController from "./order-controller";
import OrderService, { OrderData } from "../services/orderService";
import { IOrder } from "../models/orderModel";
import mongoose from "mongoose";

jest.mock("../services/orderService");

const app = express();
app.use(express.json());

interface CreateOrderRequest extends ExpressRequest {
  user?: {
    id: string;
  };
  body: CreateOrderBody;
}

export type CreateOrderBody = OrderData;

// Middleware to mock user authentication
app.use((req: CreateOrderRequest, _res: Response, next: NextFunction) => {
  req.user = { id: "user123" };
  next();
});

// Setup routes
app.post("/orders", orderController.createOrder);
app.get("/orders/:orderId", orderController.getOrder);
app.get("/users/:userId/orders", orderController.getUserOrders);
app.put("/orders/:orderId", orderController.updateOrder);
app.patch("/orders/:orderId/status", orderController.updateOrderStatus);
app.delete("/orders/:orderId", orderController.cancelOrder);

describe("OrderController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create an order and return 201 status", async () => {
      const mockOrderData = {
        _id: new mongoose.Types.ObjectId("000000000000000000000001"),
        userId: "user123",
        items: [{ productId: "product123", quantity: 2, price: 10 }],
        totalAmount: 20,
        status: "pending" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrder = {
        ...mockOrderData,
        // Add any Mongoose document methods that your IOrder interface might expect
        toObject: jest.fn().mockReturnValue(mockOrderData),
        toJSON: jest.fn().mockReturnValue(mockOrderData),
      } as unknown as IOrder;

      const mockCreateOrder = OrderService.createOrder as jest.MockedFunction<
        typeof OrderService.createOrder
      >;
      mockCreateOrder.mockResolvedValue(mockOrder);

      const response = await request(app)
        .post("/orders")
        .send({
          items: [{ productId: "product123", quantity: 2, price: 10 }],
          totalAmount: 20,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          userId: "user123",
          items: [{ productId: "product123", quantity: 2, price: 10 }],
          totalAmount: 20,
          status: "pending",
        })
      );
      expect(mockCreateOrder).toHaveBeenCalledWith({
        items: [{ productId: "product123", quantity: 2, price: 10 }],
        totalAmount: 20,
        userId: "user123",
      });
    });

    it("should return 500 status when OrderService throws an error", async () => {
      const mockCreateOrder = OrderService.createOrder as jest.MockedFunction<
        typeof OrderService.createOrder
      >;
      mockCreateOrder.mockRejectedValue(new Error("Service error"));

      const response = await request(app)
        .post("/orders")
        .send({
          items: [{ productId: "product123", quantity: 2, price: 10 }],
          totalAmount: 20,
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to create order",
        message: "Service error",
      });
    });
  });

  describe("getOrder", () => {
    it("should return an order for a given orderId", async () => {
      const mockOrderData = {
        _id: new mongoose.Types.ObjectId("000000000000000000000001"),
        userId: "user123",
        items: [{ productId: "product123", quantity: 2, price: 10 }],
        totalAmount: 20,
        status: "pending" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrder = {
        ...mockOrderData,
        // Add any Mongoose document methods that your IOrder interface might expect
        toObject: jest.fn().mockReturnValue(mockOrderData),
        toJSON: jest.fn().mockReturnValue(mockOrderData),
      } as unknown as IOrder;

      const mockGetOrderById = OrderService.getOrderById as jest.MockedFunction<
        typeof OrderService.getOrderById
      >;
      mockGetOrderById.mockResolvedValue(mockOrder);

      const response = await request(app).get(
        "/orders/000000000000000000000001"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          userId: "user123",
          items: [{ productId: "product123", quantity: 2, price: 10 }],
          totalAmount: 20,
          status: "pending",
        })
      );
      expect(mockGetOrderById).toHaveBeenCalledWith("000000000000000000000001");
    });

    it("should return 404 status when order is not found", async () => {
      const mockGetOrderById = OrderService.getOrderById as jest.MockedFunction<
        typeof OrderService.getOrderById
      >;
      mockGetOrderById.mockResolvedValue(null);

      const response = await request(app).get(
        "/orders/000000000000000000000001"
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Order not found" });
    });
  });

  describe("getUserOrders", () => {
    it("should return orders for a given userId", async () => {
      const createMockOrder = (data: Partial<IOrder>) => {
        const mockOrderData = {
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(),
          items: [],
          totalAmount: 0,
          status: "pending" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };

        return {
          ...mockOrderData,
          toObject: jest.fn().mockReturnValue(mockOrderData),
          toJSON: jest.fn().mockReturnValue(mockOrderData),
        } as unknown as IOrder;
      };

      const mockOrders = [
        createMockOrder({
          _id: new mongoose.Types.ObjectId("000000000000000000000001"),
          userId: new mongoose.Types.ObjectId("000000000000000000000abc"),
          items: [
            {
              productId: new mongoose.Types.ObjectId(
                "000000000000000000000def"
              ),
              quantity: 2,
              price: 10,
            },
          ],
          totalAmount: 20,
          status: "pending" as const,
        }),
        createMockOrder({
          _id: new mongoose.Types.ObjectId("000000000000000000000002"),
          userId: new mongoose.Types.ObjectId("000000000000000000000abc"),
          items: [
            {
              productId: new mongoose.Types.ObjectId(
                "000000000000000000000def"
              ),
              quantity: 1,
              price: 15,
            },
          ],
          totalAmount: 15,
          status: "delivered" as const,
        }),
      ];

      const mockGetOrdersByUserId =
        OrderService.getOrdersByUserId as jest.MockedFunction<
          typeof OrderService.getOrdersByUserId
        >;
      mockGetOrdersByUserId.mockResolvedValue(mockOrders);

      const response = await request(app).get(
        "/users/000000000000000000000abc/orders"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          userId: expect.any(String),
          items: [
            expect.objectContaining({
              productId: expect.any(String),
              quantity: 2,
              price: 10,
            }),
          ],
          totalAmount: 20,
          status: "pending",
        })
      );
      expect(mockGetOrdersByUserId).toHaveBeenCalledWith(
        "000000000000000000000abc"
      );
    });
  });

  describe("updateOrder", () => {
    it("should update an order and return the updated order", async () => {
      const createMockOrder = (data: Partial<IOrder>) => {
        const mockOrderData = {
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(),
          items: [],
          totalAmount: 0,
          status: "pending" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };

        return {
          ...mockOrderData,
          toObject: jest.fn().mockReturnValue(mockOrderData),
          toJSON: jest.fn().mockReturnValue(mockOrderData),
        } as unknown as IOrder;
      };

      const userId = new mongoose.Types.ObjectId("000000000000000000000abc");
      const productId = new mongoose.Types.ObjectId("000000000000000000000def");

      const mockUpdatedOrder = createMockOrder({
        _id: new mongoose.Types.ObjectId("000000000000000000000001"),
        userId: userId,
        items: [{ productId: productId, quantity: 3, price: 10 }],
        totalAmount: 30,
        status: "pending" as const,
      });

      const mockUpdateOrder = OrderService.updateOrder as jest.MockedFunction<
        typeof OrderService.updateOrder
      >;
      mockUpdateOrder.mockResolvedValue(mockUpdatedOrder);

      const response = await request(app)
        .put("/orders/000000000000000000000001")
        .send({
          items: [
            { productId: productId.toHexString(), quantity: 3, price: 10 },
          ],
          totalAmount: 30,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          userId: userId.toHexString(),
          items: [
            {
              productId: productId.toHexString(),
              quantity: 3,
              price: 10,
            },
          ],
          totalAmount: 30,
          status: "pending",
        })
      );
      expect(mockUpdateOrder).toHaveBeenCalledWith("000000000000000000000001", {
        items: [{ productId: productId.toHexString(), quantity: 3, price: 10 }],
        totalAmount: 30,
      });
    });

    it("should return 404 status when order is not found", async () => {
      const mockUpdateOrder = OrderService.updateOrder as jest.MockedFunction<
        typeof OrderService.updateOrder
      >;
      mockUpdateOrder.mockResolvedValue(null);

      const response = await request(app)
        .put("/orders/000000000000000000000001")
        .send({
          items: [{ productId: "product123", quantity: 3, price: 10 }],
          totalAmount: 30,
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Order not found" });
    });
  });

  describe("updateOrderStatus", () => {
    it("should update an order status and return the updated order", async () => {
      const createMockOrder = (data: Partial<IOrder>) => {
        const mockOrderData = {
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(),
          items: [],
          totalAmount: 0,
          status: "pending" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };

        return {
          ...mockOrderData,
          toObject: jest.fn().mockReturnValue(mockOrderData),
          toJSON: jest.fn().mockReturnValue(mockOrderData),
        } as unknown as IOrder;
      };

      const userId = new mongoose.Types.ObjectId("000000000000000000000abc");
      const productId = new mongoose.Types.ObjectId("000000000000000000000def");

      const mockUpdatedOrder = createMockOrder({
        _id: new mongoose.Types.ObjectId("000000000000000000000001"),
        userId: userId,
        items: [{ productId: productId, quantity: 3, price: 10 }],
        totalAmount: 30,
        status: "completed" as const,
      });

      const mockUpdateOrderStatus =
        OrderService.updateOrderStatus as jest.MockedFunction<
          typeof OrderService.updateOrderStatus
        >;
      mockUpdateOrderStatus.mockResolvedValue(mockUpdatedOrder);

      const response = await request(app)
        .patch("/orders/000000000000000000000001/status")
        .send({ status: "completed" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          userId: userId.toHexString(),
          items: [
            {
              productId: productId.toHexString(),
              quantity: 3,
              price: 10,
            },
          ],
          totalAmount: 30,
          status: "completed",
        })
      );
      expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
        "000000000000000000000001",
        "completed"
      );
    });

    it("should return 404 status when order is not found", async () => {
      const mockUpdateOrderStatus =
        OrderService.updateOrderStatus as jest.MockedFunction<
          typeof OrderService.updateOrderStatus
        >;
      mockUpdateOrderStatus.mockResolvedValue(null);

      const response = await request(app)
        .patch("/orders/000000000000000000000001/status")
        .send({ status: "completed" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Order not found" });
    });
  });

  describe("cancelOrder", () => {
    it("should cancel an order and return the cancelled order", async () => {
      const createMockOrder = (data: Partial<IOrder>) => {
        const mockOrderData = {
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(),
          items: [],
          totalAmount: 0,
          status: "pending" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };

        return {
          ...mockOrderData,
          toObject: jest.fn().mockReturnValue(mockOrderData),
          toJSON: jest.fn().mockReturnValue(mockOrderData),
        } as unknown as IOrder;
      };

      const userId = new mongoose.Types.ObjectId("000000000000000000000abc");
      const productId = new mongoose.Types.ObjectId("000000000000000000000def");

      const mockCancelledOrder = createMockOrder({
        _id: new mongoose.Types.ObjectId("000000000000000000000001"),
        userId: userId,
        items: [{ productId: productId, quantity: 2, price: 10 }],
        totalAmount: 20,
        status: "cancelled" as const,
      });

      const mockCancelOrder = OrderService.cancelOrder as jest.MockedFunction<
        typeof OrderService.cancelOrder
      >;
      mockCancelOrder.mockResolvedValue(mockCancelledOrder);

      const response = await request(app).delete(
        "/orders/000000000000000000000001"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          userId: userId.toHexString(),
          items: [
            {
              productId: productId.toHexString(),
              quantity: 2,
              price: 10,
            },
          ],
          totalAmount: 20,
          status: "cancelled",
        })
      );
      expect(mockCancelOrder).toHaveBeenCalledWith("000000000000000000000001");
    });

    it("should return 404 status when order is not found", async () => {
      const mockCancelOrder = OrderService.cancelOrder as jest.MockedFunction<
        typeof OrderService.cancelOrder
      >;
      mockCancelOrder.mockResolvedValue(null);

      const response = await request(app).delete(
        "/orders/000000000000000000000001"
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Order not found" });
    });
  });
});
