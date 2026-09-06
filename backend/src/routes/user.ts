import { Router, Request, Response } from "express";
import { attachDemoUser } from "../middleware/auth.js";

const router = Router();

router.get("/me", attachDemoUser, (req: Request, res: Response) => {
  res.json({
    id: req.user!.id,
    email: req.user!.email,
    subscriptionStatus: req.user!.subscriptionStatus,
  });
});

export { router as userRoutes };
