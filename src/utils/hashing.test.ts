import bcrypt from "bcryptjs";
import { hashPassword, verifyPassword } from "./hashing";

// Mock bcrypt to avoid actual hashing in tests
jest.mock("bcryptjs");

describe("Password Utility Functions", () => {
  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const mockSalt = "mocksalt";
      const mockHash = "mockhash";
      const password = "testpassword";

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword(password);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, mockSalt);
      expect(result).toBe(mockHash);
    });

    it("should throw an error if bcrypt.genSalt fails", async () => {
      const error = new Error("Salt generation failed");
      (bcrypt.genSalt as jest.Mock).mockRejectedValue(error);

      await expect(hashPassword("testpassword")).rejects.toThrow(
        "Salt generation failed"
      );
    });

    it("should throw an error if bcrypt.hash fails", async () => {
      const error = new Error("Hashing failed");
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("mocksalt");
      (bcrypt.hash as jest.Mock).mockRejectedValue(error);

      await expect(hashPassword("testpassword")).rejects.toThrow(
        "Hashing failed"
      );
    });
  });

  describe("verifyPassword", () => {
    it("should return true for matching passwords", async () => {
      const plainTextPassword = "testpassword";
      const hashedPassword = "hashedpassword";

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await verifyPassword(plainTextPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainTextPassword,
        hashedPassword
      );
      expect(result).toBe(true);
    });

    it("should return false for non-matching passwords", async () => {
      const plainTextPassword = "testpassword";
      const hashedPassword = "hashedpassword";

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await verifyPassword(plainTextPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainTextPassword,
        hashedPassword
      );
      expect(result).toBe(false);
    });

    it("should throw an error if bcrypt.compare fails", async () => {
      const error = new Error("Comparison failed");
      (bcrypt.compare as jest.Mock).mockRejectedValue(error);

      await expect(
        verifyPassword("testpassword", "hashedpassword")
      ).rejects.toThrow("Comparison failed");
    });
  });
});
