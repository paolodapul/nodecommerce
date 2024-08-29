import request from "supertest";
import { createApp } from ".";

describe("App", () => {
  const ENV = "development";
  const app = createApp(ENV);

  it("should respond to GET /", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Welcome to Nodecommerce");
  });
});
