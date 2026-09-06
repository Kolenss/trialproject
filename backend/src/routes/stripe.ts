import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getStripe, getWebhookSecret } from "../services/stripe.js";
import { attachDemoUser } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.post(
  "/create-checkout",
  attachDemoUser,
  async (req: Request, res: Response) => {
    const stripe = getStripe();
    if (!stripe) {
      res.status(503).json({ error: "Stripe is not configured" });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
      });

      let customerId = user?.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user!.email,
        });
        customerId = customer.id;
        await prisma.user.update({
          where: { id: user!.id },
          data: { stripeCustomerId: customerId },
        });
      }

      const priceId = process.env.STRIPE_PRICE_ID;
      if (!priceId) {
        res.status(503).json({ error: "Stripe price ID is not configured" });
        return;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}?subscription=success`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}?subscription=cancelled`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  }
);

router.post("/webhook", async (req: Request, res: Response) => {
  const stripe = getStripe();
  if (!stripe) {
    res.status(503).json({ error: "Stripe is not configured" });
    return;
  }

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret) {
    res.status(503).json({ error: "Webhook secret not configured" });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as { customer: string; id: string; status: string };
        await prisma.user.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as { customer: string; id: string };
        await prisma.user.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionId: null,
            subscriptionStatus: "inactive",
          },
        });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }

  res.json({ received: true });
});

export { router as stripeRoutes };
