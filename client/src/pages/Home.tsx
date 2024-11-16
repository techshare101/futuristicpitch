import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm } from "../components/ProductForm";
import { ContentPreview } from "../components/ContentPreview";
import { ParticlesBackground } from "../components/ParticlesBackground";
import { useState } from "react";
import { motion } from "framer-motion";

export interface ProductData {
  companyName: string;
  productName: string;
  description: string;
  companyDescription: string;
  industryType: string;
  currentChallenges: string;
  integrationNeeds: string;
  budgetRoi: string;
  keyFeatures: string[];
  targetAudience: string;
  uniqueSellingPoint: string;
}

export default function Home() {
  const [productData, setProductData] = useState<ProductData | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <ParticlesBackground />
      <div className="relative container mx-auto px-4 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] animate-gradient"
        >
          Futuristic Product Pitch Generator
        </motion.h1>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="backdrop-blur-xl bg-white/5 rounded-xl p-8 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <ProductForm onSubmit={setProductData} />
          </motion.div>

          {productData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl p-8 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <Tabs defaultValue="ads" className="w-full">
                <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
                  <TabsTrigger value="ads">Ads</TabsTrigger>
                  <TabsTrigger value="blog">Blog Posts</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
                  <TabsTrigger value="integration">Integration</TabsTrigger>
                  <TabsTrigger value="emotional">Emotional Appeal</TabsTrigger>
                </TabsList>
                {["ads", "blog", "social", "analysis", "features", "case-studies", "integration", "emotional"].map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    <ContentPreview type={tab as any} data={productData} />
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
