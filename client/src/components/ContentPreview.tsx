import { Card, CardContent } from "@/components/ui/card";
import { ProductData } from "../pages/Home";
import { generateAd, generateBlogPost, generateSocialPost } from "../lib/generators";
import { CopyButton } from "./ui/copy-button";

interface ContentPreviewProps {
  type: "ads" | "blog" | "social";
  data: ProductData;
}

export function ContentPreview({ type, data }: ContentPreviewProps) {
  const content = (() => {
    switch (type) {
      case "ads":
        return generateAd(data);
      case "blog":
        return generateBlogPost(data);
      case "social":
        return generateSocialPost(data);
    }
  })();

  return (
    <Card className="bg-white/5 border-white/20">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-white">
            {type === "ads" ? "Advertisement Copy" : 
             type === "blog" ? "Blog Post" : 
             "Social Media Post"}
          </h3>
          <CopyButton text={content} />
        </div>
        <div className="text-white/90 whitespace-pre-wrap">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
