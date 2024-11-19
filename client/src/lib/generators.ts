import type { ProductData } from "../pages/Home";
import Anthropic from '@anthropic-ai/sdk';

const STORY_CYCLE_PROMPT = `
Prompt for Creating a Story-Driven Brand Narrative:
1. The Backdrop: Consider the origins and initial need
2. The Problem: Address specific challenges and emotional impact
3. The Hero's Entry: Present the solution's defining moment
4. The Journey: Acknowledge and overcome obstacles
5. The Victory: Showcase transformation through success stories
6. The New World: Illustrate the positive changes post-transformation
7. Resolving Complexities: Explain complex features simply
8. The Moral: Emphasize the ethical message and trust factors
`;

interface GenerateContentOptions {
  type: string;
  focusPoints: string[];
}

async function generateContent(data: ProductData, options: GenerateContentOptions): Promise<string> {
  const { type, focusPoints } = options;
  
  try {
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        type,
        focusPoints,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const result = await response.json();
    return result.content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

export async function generateAd(data: ProductData): Promise<string> {
  return generateContent(data, {
    type: 'ad',
    focusPoints: ["The Hero's Entry", "The Victory"],
  });
}

export async function generateBlogPost(data: ProductData): Promise<string> {
  return generateContent(data, {
    type: 'blog',
    focusPoints: ["The Backdrop", "The Problem", "The Hero's Entry", "The Journey", "The Victory", "The New World", "Resolving Complexities", "The Moral"],
  });
}

export async function generateSocialPost(data: ProductData): Promise<string> {
  return generateContent(data, {
    type: 'social',
    focusPoints: ["The Problem", "The New World"],
  });
}

export async function generateAnalysis(data: ProductData): Promise<string> {
  return generateContent(data, {
    type: 'analysis',
    focusPoints: ["The Journey", "Resolving Complexities"],
  });
}

export async function generateFeatures(data: ProductData): Promise<string> {
  return generateContent(data, {
    type: 'features',
    focusPoints: ["The Hero's Entry", "Resolving Complexities"],
  });
}

export async function generateCaseStudies(data: ProductData): Promise<string> {
  return generateContent(data, {
    type: 'case-study',
    focusPoints: ["The Victory", "The New World"],
  });
}

export async function generateIntegration(data: ProductData): Promise<string> {
  return generateContent(data, {
    type: 'integration',
    focusPoints: ["The Journey", "The New World"],
  });
}

export async function generateEmotionalAppeal(data: ProductData): Promise<string> {
  return generateContent(data, {
    type: 'emotional',
    focusPoints: ["The Problem", "The Moral"],
  });
}