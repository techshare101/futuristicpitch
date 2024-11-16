import type { Express } from "express";
import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export function registerRoutes(app: Express) {
  app.post("/api/create-subscription", async (req, res) => {
    try {
      const { email, paymentMethod } = req.body;

      // Create a customer
      const customer = await stripe.customers.create({
        email,
        payment_method: paymentMethod,
        invoice_settings: { default_payment_method: paymentMethod },
      });

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: "price_1QLu3eQsgA7IrtQ4ebvOA1eB" }],
        payment_behavior: "error_if_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any).payment_intent?.client_secret,
      });
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(400).json({ error: { message: (error as Error).message } });
    }
  });
}
