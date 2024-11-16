import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm } from "../components/ProductForm";
import { ContentPreview } from "../components/ContentPreview";
import { useState } from "react";

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
                <TabsList className="grid grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                  <TabsTrigger value="ads">Ads</TabsTrigger>
                  <TabsTrigger value="blog">Blog Posts</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
                  <TabsTrigger value="integration">Integration</TabsTrigger>
                  <TabsTrigger value="emotional">Emotional Appeal</TabsTrigger>
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
                <TabsContent value="analysis">
                  <ContentPreview type="analysis" data={productData} />
                </TabsContent>
                <TabsContent value="features">
                  <ContentPreview type="features" data={productData} />
                </TabsContent>
                <TabsContent value="case-studies">
                  <ContentPreview type="case-studies" data={productData} />
                </TabsContent>
                <TabsContent value="integration">
                  <ContentPreview type="integration" data={productData} />
                </TabsContent>
                <TabsContent value="emotional">
                  <ContentPreview type="emotional" data={productData} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
