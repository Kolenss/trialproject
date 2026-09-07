import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { productRoutes } from "../routes/products.js";

vi.mock("../services/openFoodFacts.js", () => ({
  searchProducts: vi.fn().mockResolvedValue({
    products: [
      {
        code: "123",
        name: "Test Product",
        brand: "Test Brand",
        imageUrl: "https://example.com/img.jpg",
        nutrients: {
          energyKcal: 250,
          fat: 10,
          saturatedFat: 3,
          carbohydrates: 30,
          sugars: 5,
          fiber: 2,
          proteins: 8,
          salt: 1,
        },
      },
    ],
    total: 1,
  }),
}));

vi.mock("../middleware/auth.js", () => ({
  attachDemoUser: vi.fn(),
}));

import { attachDemoUser } from "../middleware/auth.js";

function createApp(subscriptionStatus: string) {
  const app = express();
  app.use(express.json());

  (attachDemoUser as ReturnType<typeof vi.fn>).mockImplementation(
    (req: express.Request, _res: express.Response, next: express.NextFunction) => {
      req.user = { id: 1, email: "demo@example.com", subscriptionStatus };
      next();
    }
  );

  app.use("/api/products", productRoutes);
  return app;
}

describe("GET /api/products/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when query is empty", async () => {
    const app = createApp("inactive");
    const res = await request(app).get("/api/products/search").query({ q: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Search query is required");
  });

  it("returns products with nutrients when user has active subscription", async () => {
    const app = createApp("active");
    const res = await request(app).get("/api/products/search").query({ q: "test" });

    expect(res.status).toBe(200);
    expect(res.body.hasSubscription).toBe(true);
    expect(res.body.products[0].nutrients).not.toBeNull();
    expect(res.body.products[0].nutrients.energyKcal).toBe(250);
  });

  it("strips nutrients when user has no subscription", async () => {
    const app = createApp("inactive");
    const res = await request(app).get("/api/products/search").query({ q: "test" });

    expect(res.status).toBe(200);
    expect(res.body.hasSubscription).toBe(false);
    expect(res.body.products[0].nutrients).toBeNull();
  });

  it("still returns basic product info without subscription", async () => {
    const app = createApp("inactive");
    const res = await request(app).get("/api/products/search").query({ q: "test" });

    expect(res.body.products[0].name).toBe("Test Product");
    expect(res.body.products[0].brand).toBe("Test Brand");
    expect(res.body.products[0].imageUrl).toBe("https://example.com/img.jpg");
  });

  it("passes language and page parameters", async () => {
    const app = createApp("active");
    const { searchProducts } = await import("../services/openFoodFacts.js");

    await request(app)
      .get("/api/products/search")
      .query({ q: "milk", lang: "fr", page: "2" });

    expect(searchProducts).toHaveBeenCalledWith("milk", "fr", 2);
  });
});
