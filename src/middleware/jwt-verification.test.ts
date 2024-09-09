/* eslint-disable @typescript-eslint/no-misused-promises */
import request from "supertest";
import express, { Express, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtVerification } from "./jwt-verification";
import { CustomRequest } from "./jwt-verification";

type ResponseBody = {
  message: string;
};

let app: Express;
const JWT_SECRET = "test-secret";

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use(jwtVerification("view_products"));
  process.env.JWT_SECRET = JWT_SECRET;

  // Mock protected route
  app.get("/protected", (req: CustomRequest, res: Response) => {
    res.json({ message: "Access granted" });
  });
});

describe("verifyToken middleware", () => {
  it("should allow access with a valid token", async () => {
    const token = jwt.sign({ userId: "123" }, JWT_SECRET);
    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect((response.body as ResponseBody).message).toBe("Access granted");
  });

  it("should deny access with an invalid token", async () => {
    const token = "invalid-token";
    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect((response.body as ResponseBody).message).toBe("Invalid token.");
  });

  it("should deny access with no token", async () => {
    const response = await request(app).get("/protected");

    expect(response.status).toBe(401);
    expect((response.body as ResponseBody).message).toBe(
      "Authentication failed."
    );
  });

  it("should deny access with Auth header but no token", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer `);

    expect(response.status).toBe(401);
    expect((response.body as ResponseBody).message).toBe(
      "Authentication failed."
    );
  });

  it("should handle expired tokens", async () => {
    const token = jwt.sign({ userId: "123" }, JWT_SECRET, { expiresIn: "1ms" });
    await new Promise((resolve) => setTimeout(resolve, 5)); // wait for token to expire

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect((response.body as ResponseBody).message).toBe("Token has expired.");
  });
});
