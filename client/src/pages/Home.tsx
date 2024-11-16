import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm } from "../components/ProductForm";
import { ContentPreview } from "../components/ContentPreview";
import { useState } from "react";

export interface ProductData {
  companyName: string;
  productName: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  uniqueSellingPoint: string;
}

export default function Home() {
  const [productData, setProductData] = useState<ProductData | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Futuristic Product Pitch Generator
        </h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="backdrop-blur-lg bg-white/10 rounded-xl p-6 shadow-xl">
            <ProductForm onSubmit={setProductData} />
          </div>

          {productData && (
            <div className="backdrop-blur-lg bg-white/10 rounded-xl p-6 shadow-xl">
              <Tabs defaultValue="ads" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="ads" className="flex-1">Ads</TabsTrigger>
                  <TabsTrigger value="blog" className="flex-1">Blog Posts</TabsTrigger>
                  <TabsTrigger value="social" className="flex-1">Social Media</TabsTrigger>
                </TabsList>
                <TabsContent value="ads">
                  <ContentPreview type="ads" data={productData} />
                </TabsContent>
                <TabsContent value="blog">
                  <ContentPreview type="blog" data={productData} />
                </TabsContent>
                <TabsContent value="social">
                  <ContentPreview type="social" data={productData} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
