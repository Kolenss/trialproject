import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { attachDemoUser } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/recent", attachDemoUser, async (req: Request, res: Response) => {
  try {
    const searches = await prisma.search.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      distinct: ["query"],
    });
    res.json(searches.slice(0, 10));
  } catch (error) {
    console.error("Failed to fetch recent searches:", error);
    res.status(500).json({ error: "Failed to fetch recent searches" });
  }
});

router.post("/", attachDemoUser, async (req: Request, res: Response) => {
  const { query, language } = req.body;

  if (!query?.trim()) {
    res.status(400).json({ error: "Query is required" });
    return;
  }

  try {
    const search = await prisma.search.create({
      data: {
        query: query.trim(),
        language: language || "en",
        userId: req.user!.id,
      },
    });
    res.status(201).json(search);
  } catch (error) {
    console.error("Failed to save search:", error);
    res.status(500).json({ error: "Failed to save search" });
  }
});

export { router as searchRoutes };
