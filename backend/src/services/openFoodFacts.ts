export interface ProductResult {
  code: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  nutrients: {
    energyKcal: number | null;
    fat: number | null;
    saturatedFat: number | null;
    carbohydrates: number | null;
    sugars: number | null;
    fiber: number | null;
    proteins: number | null;
    salt: number | null;
  };
}

interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  product_name_fr?: string;
  product_name_de?: string;
  product_name_nl?: string;
  brands?: string;
  image_url?: string;
  image_front_url?: string;
  nutriments?: Record<string, number>;
  [key: string]: unknown;
}

const LANG_KEYS: Record<string, string> = {
  en: "product_name_en",
  fr: "product_name_fr",
  de: "product_name_de",
  nl: "product_name_nl",
};

function extractName(product: OpenFoodFactsProduct, lang: string): string {
  const langKey = LANG_KEYS[lang];
  const localizedName = langKey ? (product[langKey] as string) : undefined;
  return localizedName || product.product_name || "Unknown product";
}

function mapProduct(raw: OpenFoodFactsProduct, lang: string): ProductResult {
  const n = raw.nutriments || {};
  return {
    code: raw.code || "",
    name: extractName(raw, lang),
    brand: raw.brands || "Unknown brand",
    imageUrl: raw.image_front_url || raw.image_url || null,
    nutrients: {
      energyKcal: n["energy-kcal_100g"] ?? null,
      fat: n["fat_100g"] ?? null,
      saturatedFat: n["saturated-fat_100g"] ?? null,
      carbohydrates: n["carbohydrates_100g"] ?? null,
      sugars: n["sugars_100g"] ?? null,
      fiber: n["fiber_100g"] ?? null,
      proteins: n["proteins_100g"] ?? null,
      salt: n["salt_100g"] ?? null,
    },
  };
}

const cache = new Map<string, { data: { products: ProductResult[]; total: number }; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function searchProducts(
  query: string,
  lang: string = "en",
  page: number = 1,
  pageSize: number = 20
): Promise<{ products: ProductResult[]; total: number }> {
  const cacheKey = `${query}|${lang}|${page}|${pageSize}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const fields = [
    "code", "product_name", "product_name_en", "product_name_fr",
    "product_name_de", "product_name_nl", "brands",
    "image_front_url", "image_url", "nutriments",
  ].join(",");

  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page: String(page),
    page_size: String(pageSize),
    lc: lang,
    fields,
  });

  const hosts = [
    "https://world.openfoodfacts.org",
    "https://world.openfoodfacts.net",
  ];

  let lastError: Error | null = null;

  for (const host of hosts) {
    const url = `${host}/cgi/search.pl?${params}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "FoodSearchApp/1.0 (demo project; contact: demo@example.com)",
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        lastError = new Error(`Open Food Facts API error: ${res.status}`);
        continue;
      }

      const data = (await res.json()) as {
        products: OpenFoodFactsProduct[];
        count: number;
      };

      const products = (data.products || []).map((p) => mapProduct(p, lang));
      const result = { products, total: data.count || 0 };

      cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });

      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError!;
}
