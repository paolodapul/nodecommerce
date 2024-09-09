import request from "supertest";
import express from "express";
import { register, login } from "./user-controller";
import * as userService from "../services/userService";

jest.mock("../services/userService");

const app = express();
app.use(express.json());

app.post("/register", register);
app.post("/login", login);

describe("User Authentication Integration Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
    it("should register a new user and return 201 status", async () => {
      const mockUser = {
        _id: "123456789",
        username: "testuser",
        email: "testuser@example.com",
        password: "hashedpassword",
      };

      (userService.register as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post("/register").send({
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        description: "New user has been created.",
        id: "123456789",
      });
    });

    it("should return 500 status when registration fails", async () => {
      (userService.register as jest.Mock).mockRejectedValue(
        new Error("Registration failed")
      );

      const response = await request(app).post("/register").send({
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Registration failed",
        message: "Registration failed",
      });
    });
  });

  describe("POST /login", () => {
    it("should login a user and return 200 status", async () => {
      const mockUser = {
        _id: "123456789",
        username: "testuser",
        email: "testuser@example.com",
      };

      (userService.login as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post("/login").send({
        username: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        description: "Found user.",
        user: mockUser,
      });
    });

    it("should return 500 status when login fails", async () => {
      (userService.login as jest.Mock).mockRejectedValue(
        new Error("Invalid credentials")
      );

      const response = await request(app).post("/login").send({
        username: "testuser",
        password: "wrongpassword",
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Login failed",
        message: "Invalid credentials",
      });
    });
  });
});
