/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { User } from "../models/user-model";
import { register, login } from "./userService";
import * as hashing from "../utils/hashing";
import jwt from "jsonwebtoken";

jest.mock("../models/user-model");
jest.mock("../utils/hashing");
jest.mock("jsonwebtoken");

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const mockedHashedPassword = "hashedPassword123";
      (hashing.hashPassword as jest.Mock).mockResolvedValue(
        mockedHashedPassword
      );

      const mockedUserData = {
        ...userData,
        password: mockedHashedPassword,
      };

      const mockedSave = jest.fn().mockResolvedValue(mockedUserData);

      (User as jest.MockedClass<typeof User>).mockImplementation(
        () =>
          ({
            save: mockedSave,
          } as any)
      );

      const result = await register(userData);

      expect(hashing.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(User).toHaveBeenCalledWith({
        ...userData,
        password: mockedHashedPassword,
      });
      expect(mockedSave).toHaveBeenCalled();
      expect(result).toEqual(mockedUserData);
    });

    it("should throw an error if user save fails", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      (hashing.hashPassword as jest.Mock).mockResolvedValue("hashedPassword");

      const mockedSave = jest.fn().mockRejectedValue(new Error("Save failed"));

      (User as jest.MockedClass<typeof User>).mockImplementation(
        () =>
          ({
            save: mockedSave,
          } as any)
      );

      await expect(register(userData)).rejects.toThrow("Save failed");
    });
  });

  describe("login", () => {
    it("should login successfully with correct credentials", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const mockedUser = {
        ...userData,
        _id: "user123",
        roles: ["user"],
        password: "hashedPassword",
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockedUser);
      (hashing.verifyPassword as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("mockedToken");

      const result = await login(userData);

      expect(User.findOne).toHaveBeenCalledWith({
        username: userData.username,
      });
      expect(hashing.verifyPassword).toHaveBeenCalledWith(
        userData.password,
        mockedUser.password
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockedUser._id, role: mockedUser.roles[0] },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(result).toEqual({
        username: userData.username,
        token: "mockedToken",
      });
    });

    it("should throw an error with incorrect username", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(login(userData)).rejects.toThrow(
        "Incorrect username or password."
      );
    });

    it("should throw an error with incorrect password", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const mockedUser = {
        ...userData,
        password: "hashedPassword",
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockedUser);
      (hashing.verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(login(userData)).rejects.toThrow(
        "Incorrect username or password."
      );
    });
  });
});
