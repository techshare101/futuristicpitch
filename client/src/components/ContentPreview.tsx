import { Card, CardContent } from "@/components/ui/card";
import { ProductData } from "../pages/Home";
import { 
  generateAd, 
  generateBlogPost, 
  generateSocialPost,
  generateAnalysis,
  generateFeatures,
  generateCaseStudies,
  generateIntegration,
  generateEmotionalAppeal
} from "../lib/generators";
import { CopyButton } from "./ui/copy-button";
import { motion } from "framer-motion";
import { 
  Megaphone, 
  BookOpen, 
  Share2, 
  BarChart, 
  ListChecks, 
  BookMarked, 
  Link, 
  Heart 
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ContentPreviewProps {
  type: "ads" | "blog" | "social" | "analysis" | "features" | "case-studies" | "integration" | "emotional";
  data: ProductData;
}

export function ContentPreview({ type, data }: ContentPreviewProps) {
  const getIcon = () => {
    switch (type) {
      case "ads": return <Megaphone className="w-5 h-5" />;
      case "blog": return <BookOpen className="w-5 h-5" />;
      case "social": return <Share2 className="w-5 h-5" />;
      case "analysis": return <BarChart className="w-5 h-5" />;
      case "features": return <ListChecks className="w-5 h-5" />;
      case "case-studies": return <BookMarked className="w-5 h-5" />;
      case "integration": return <Link className="w-5 h-5" />;
      case "emotional": return <Heart className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "ads": return "Advertisement Copy";
      case "blog": return "Blog Post";
      case "social": return "Social Media Post";
      case "analysis": return "Company Challenges Analysis";
      case "features": return "User Features";
      case "case-studies": return "Case Studies";
      case "integration": return "Marketing Integration";
      case "emotional": return "Emotional Appeal";
    }
  };

  const content = (() => {
    switch (type) {
      case "ads": return generateAd(data);
      case "blog": return generateBlogPost(data);
      case "social": return generateSocialPost(data);
      case "analysis": return generateAnalysis(data);
      case "features": return generateFeatures(data);
      case "case-studies": return generateCaseStudies(data);
      case "integration": return generateIntegration(data);
      case "emotional": return generateEmotionalAppeal(data);
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/5 border-white/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="text-white/80">{getIcon()}</span>
              <h3 className="text-xl font-semibold text-white">{getTitle()}</h3>
            </div>
            <CopyButton text={content} />
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="content" className="border-white/20">
              <AccordionTrigger className="text-white hover:text-white/80">
                View Content
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-white/90 whitespace-pre-wrap prose prose-invert">
                  {content}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
}
