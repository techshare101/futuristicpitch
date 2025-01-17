import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ParticlesBackground } from "../components/ParticlesBackground";
import { Navigation } from "../components/Navigation";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { login } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const result = await login(values);
      
      if (result.ok) {
        toast({
          title: "Success!",
          description: "You have been logged in successfully.",
        });
        
        if (result.returnTo) {
          setLocation(result.returnTo);
        } else {
          setLocation("/projects");
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
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
      <Navigation />
      
      <div className="relative container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-8 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] animate-gradient">
              Welcome Back
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] hover:from-[#ff33ff] hover:via-[#33ffff] hover:to-[#ff33ff] transition-all duration-300 animate-gradient"
                >
                  {loading ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-center text-white/60">
              Don't have an account?{" "}
              <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign up
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
