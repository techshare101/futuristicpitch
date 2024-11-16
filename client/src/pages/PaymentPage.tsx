import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParticlesBackground } from "../components/ParticlesBackground";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "wouter";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payment/create-session", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to create payment session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
              Get Access
            </h1>

            <div className="space-y-6">
              <div className="text-white/80 space-y-4">
                <h2 className="text-xl font-semibold text-white">Full Access Features:</h2>
                <ul className="space-y-2">
                  <li>✨ Unlimited content generation</li>
                  <li>🚀 All content formats</li>
                  <li>💫 Priority support</li>
                  <li>🔮 Advanced customization</li>
                  <li>🎯 Brand voice control</li>
                  <li>📈 SEO optimization</li>
                </ul>
              </div>

              <div className="text-center text-white">
                <div className="text-3xl font-bold mb-1">$29</div>
                <div className="text-white/60">per month</div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] hover:from-[#ff33ff] hover:via-[#33ffff] hover:to-[#ff33ff] transition-all duration-300 animate-gradient"
              >
                {loading ? "Processing..." : "Get Access Now"}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
