import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        subscriptionStatus: string;
      };
    }
  }
}

export async function attachDemoUser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    let user = await prisma.user.findUnique({
      where: { email: "demo@example.com" },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { email: "demo@example.com" },
      });
    }
    req.user = {
      id: user.id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
    };
  } catch {
    // If DB is unavailable, attach a fallback demo user
    req.user = {
      id: 1,
      email: "demo@example.com",
      subscriptionStatus: "inactive",
    };
  }
  next();
}
