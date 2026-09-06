import { Router, Request, Response } from "express";
import { searchProducts } from "../services/openFoodFacts.js";
import { attachDemoUser } from "../middleware/auth.js";

const router = Router();

router.get("/search", attachDemoUser, async (req: Request, res: Response) => {
  const query = (req.query.q as string) || "";
  const lang = (req.query.lang as string) || "en";
  const page = parseInt(req.query.page as string) || 1;

  if (!query.trim()) {
    res.status(400).json({ error: "Search query is required" });
    return;
  }

  try {
    const results = await searchProducts(query, lang, page);

    const hasSubscription = req.user?.subscriptionStatus === "active";
    const products = results.products.map((p) => ({
      ...p,
      nutrients: hasSubscription ? p.nutrients : null,
    }));

    res.json({
      products,
      total: results.total,
      page,
      hasSubscription,
    });
  } catch (error) {
    console.error("Product search error:", error);
    res.status(502).json({ error: "Failed to fetch products" });
  }
});

export { router as productRoutes };
