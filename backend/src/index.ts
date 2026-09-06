import express from "express";
import cors from "cors";
import { productRoutes } from "./routes/products.js";
import { searchRoutes } from "./routes/searches.js";
import { stripeRoutes } from "./routes/stripe.js";
import { userRoutes } from "./routes/user.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));

app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/searches", searchRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/user", userRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
