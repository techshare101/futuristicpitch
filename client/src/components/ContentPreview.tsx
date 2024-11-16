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
  generateEmotionalAppeal,
} from "../lib/generators";
import { CopyButton } from "./ui/copy-button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  BookOpen,
  Share2,
  BarChart,
  ListChecks,
  BookMarked,
  Link,
  Heart,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ContentPreviewProps {
  type:
    | "ads"
    | "blog"
    | "social"
    | "analysis"
    | "features"
    | "case-studies"
    | "integration"
    | "emotional";
  data: ProductData;
}

export function ContentPreview({ type, data }: ContentPreviewProps) {
  const getIcon = () => {
    switch (type) {
      case "ads":
        return <Megaphone className="w-5 h-5" />;
      case "blog":
        return <BookOpen className="w-5 h-5" />;
      case "social":
        return <Share2 className="w-5 h-5" />;
      case "analysis":
        return <BarChart className="w-5 h-5" />;
      case "features":
        return <ListChecks className="w-5 h-5" />;
      case "case-studies":
        return <BookMarked className="w-5 h-5" />;
      case "integration":
        return <Link className="w-5 h-5" />;
      case "emotional":
        return <Heart className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "ads":
        return "Advertisement Copy";
      case "blog":
        return "Blog Post";
      case "social":
        return "Social Media Post";
      case "analysis":
        return "Company Challenges Analysis";
      case "features":
        return "User Features";
      case "case-studies":
        return "Case Studies";
      case "integration":
        return "Marketing Integration";
      case "emotional":
        return "Emotional Appeal";
    }
  };

  const content = (() => {
    switch (type) {
      case "ads":
        return generateAd(data);
      case "blog":
        return generateBlogPost(data);
      case "social":
        return generateSocialPost(data);
      case "analysis":
        return generateAnalysis(data);
      case "features":
        return generateFeatures(data);
      case "case-studies":
        return generateCaseStudies(data);
      case "integration":
        return generateIntegration(data);
      case "emotional":
        return generateEmotionalAppeal(data);
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5 }}
      className="perspective-1000"
    >
      <motion.div
        whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className="backdrop-blur-xl bg-white/5 border-white/10 overflow-hidden transform-gpu hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          <CardContent className="p-6">
            <motion.div
              className="flex justify-between items-start mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <motion.span
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="text-white/80 bg-white/5 p-2 rounded-lg"
                >
                  {getIcon()}
                </motion.span>
                <h3 className="text-xl font-semibold text-white">
                  {getTitle()}
                </h3>
              </div>
              <CopyButton text={content} />
            </motion.div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="content" className="border-white/20">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <AccordionTrigger className="text-white hover:text-cyan-400 transition-colors">
                    View Content
                  </AccordionTrigger>
                </motion.div>
                <AccordionContent>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-white/90 whitespace-pre-wrap prose prose-invert max-w-none"
                  >
                    {content}
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}