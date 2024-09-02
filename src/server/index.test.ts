import request from "supertest";
import { createApp } from ".";
import { Express } from "express";

const app: Express = createApp("DEV");

describe("App", () => {
  const ENV = "development";
  const app = createApp(ENV);

  it("should respond to GET /", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe(`Welcome to Nodecommerce - ${ENV}`);
  });
});

/**
 * Todo: make the CORS integration test more robust - learn how to test according to set environment
 */

describe("CORS Middleware", () => {
  it("should not allow requests from an unspecified origin", async () => {
    const response = await request(app)
      .get("/")
      .set("Origin", "http://example.com");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
