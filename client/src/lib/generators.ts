import type { ProductData } from "../pages/Home";

export function generateAd(data: ProductData): string {
  return `🚀 Introducing ${data.productName} by ${data.companyName}!

${data.uniqueSellingPoint}

Key Features:
${data.keyFeatures.map(feature => `✨ ${feature}`).join('\n')}

Perfect for: ${data.targetAudience}

Learn more: [Link] #Innovation #Technology`;
}

export function generateBlogPost(data: ProductData): string {
  return `Revolutionary ${data.productName} Transforms [Industry]

${data.companyName} is proud to introduce ${data.productName}, a game-changing solution designed for ${data.targetAudience}.

${data.description}

What Makes ${data.productName} Special?
${data.uniqueSellingPoint}

Key Features and Benefits:
${data.keyFeatures.map(feature => `• ${feature}`).join('\n')}

Experience the future today with ${data.productName}.`;
}

export function generateSocialPost(data: ProductData): string {
  return `🔥 Game-changer alert! 🔥

Meet ${data.productName} - ${data.uniqueSellingPoint}

${data.description.slice(0, 100)}...

Perfect for: ${data.targetAudience}
By: ${data.companyName}

#Innovation #Tech #Future`;
}
