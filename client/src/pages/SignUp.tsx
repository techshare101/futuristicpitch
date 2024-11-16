import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ParticlesBackground } from "../components/ParticlesBackground";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

declare const Stripe: any;

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      
      // Create payment element
      const stripe = await Stripe("pk_live_51QEaKvGRxp9eu0DJa1y91M5ASVlVE8IauF2fMzlBpH3NvhY01P47d9aIKZ7qcAdETYokGWEZY4zgoHSrB9dGkhKr00N2yvbb8D");
      const elements = stripe.elements();
      
      const card = elements.create("card");
      card.mount("#card-element");

      // Handle payment submission
      const { paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card,
      });

      // Create subscription
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          paymentMethod: paymentMethod.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      const { clientSecret } = await response.json();

      // Confirm the subscription payment
      const { error } = await stripe.confirmCardPayment(clientSecret);
      
      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success!",
        description: "Your subscription has been created successfully.",
      });

      // Here you would typically create the user account with the provided email/password
      
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <ParticlesBackground />
      
      <div className="relative container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-8 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] animate-gradient">
              Join the Future
            </h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel className="text-white">Payment Details</FormLabel>
                  <div
                    id="card-element"
                    className="p-3 bg-white/5 text-white border border-white/20 rounded-md transition-all duration-300
                    focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 hover:border-white/40"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] hover:from-[#ff33ff] hover:via-[#33ffff] hover:to-[#ff33ff] transition-all duration-300 animate-gradient"
                >
                  {loading ? "Processing..." : "Sign Up"}
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-center text-white/60">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Log in
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
