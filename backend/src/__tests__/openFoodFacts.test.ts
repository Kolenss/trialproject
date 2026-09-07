import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchProducts, clearCache } from "../services/openFoodFacts.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  clearCache();
});

describe("searchProducts", () => {
  it("returns mapped products from the API response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [
          {
            code: "123",
            product_name: "Test Product",
            product_name_fr: "Produit Test",
            brands: "Test Brand",
            image_front_url: "https://example.com/img.jpg",
            nutriments: {
              "energy-kcal_100g": 250,
              "fat_100g": 10,
              "saturated-fat_100g": 3,
              "carbohydrates_100g": 30,
              "sugars_100g": 5,
              "fiber_100g": 2,
              "proteins_100g": 8,
              "salt_100g": 1,
            },
          },
        ],
        count: 1,
      }),
    });

    const result = await searchProducts("test", "en");

    expect(result.products).toHaveLength(1);
    expect(result.products[0]).toEqual({
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
    });
    expect(result.total).toBe(1);
  });

  it("uses localized product name when available", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [
          {
            code: "456",
            product_name: "Default Name",
            product_name_fr: "Nom Français",
            brands: "Brand",
            nutriments: {},
          },
        ],
        count: 1,
      }),
    });

    const result = await searchProducts("test", "fr");
    expect(result.products[0].name).toBe("Nom Français");
  });

  it("falls back to product_name when localized name is missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [
          {
            code: "789",
            product_name: "Fallback Name",
            brands: "Brand",
            nutriments: {},
          },
        ],
        count: 1,
      }),
    });

    const result = await searchProducts("test", "de");
    expect(result.products[0].name).toBe("Fallback Name");
  });

  it("handles missing data gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [{ code: "000" }],
        count: 1,
      }),
    });

    const result = await searchProducts("test", "en");
    expect(result.products[0].name).toBe("Unknown product");
    expect(result.products[0].brand).toBe("Unknown brand");
    expect(result.products[0].imageUrl).toBeNull();
    expect(result.products[0].nutrients.energyKcal).toBeNull();
  });

  it("throws on API error when all hosts fail", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    await expect(searchProducts("test", "en")).rejects.toThrow(
      "Open Food Facts API error"
    );
  });
});
