import type { ProductData } from "../pages/Home";

export function generateAd(data: ProductData): string {
  return `🚀 Introducing ${data.productName} by ${data.companyName}!

${data.uniqueSellingPoint}

Key Features:
${data.keyFeatures.map(feature => `✨ ${feature}`).join('\n')}

Perfect for: ${data.targetAudience}

ROI Expectations: ${data.budgetRoi}

Learn more: [Link] #Innovation #Technology`;
}

export function generateBlogPost(data: ProductData): string {
  return `Revolutionary ${data.productName} Transforms ${data.industryType}

${data.companyName}, a ${data.companyDescription}, proudly introduces ${data.productName}, a game-changing solution designed for ${data.targetAudience}.

${data.description}

What Makes ${data.productName} Special?
${data.uniqueSellingPoint}

Key Features and Benefits:
${data.keyFeatures.map(feature => `• ${feature}`).join('\n')}

Integration Capabilities:
${data.integrationNeeds}

Experience the future today with ${data.productName}.`;
}

export function generateSocialPost(data: ProductData): string {
  return `🔥 Game-changer alert! 🔥

Meet ${data.productName} - ${data.uniqueSellingPoint}

${data.description.slice(0, 100)}...

Perfect for: ${data.targetAudience}
Industry: ${data.industryType}
By: ${data.companyName}

#Innovation #Tech #Future #${data.industryType.replace(/\s+/g, '')}`;
}

export function generateAnalysis(data: ProductData): string {
  return `Company Challenges Analysis for ${data.companyName}

Current Industry Challenges:
${data.currentChallenges}

How ${data.productName} Addresses These Challenges:
1. Industry Fit: Tailored for ${data.industryType}
2. Integration Solution: ${data.integrationNeeds}
3. ROI Potential: ${data.budgetRoi}

Recommended Implementation Strategy:
1. Initial deployment focusing on core features
2. Phased integration with existing systems
3. ROI monitoring and optimization
4. Scaling based on performance metrics

Risk Mitigation:
• Comprehensive training and support
• Regular performance assessments
• Continuous feedback integration
• Agile adaptation to changing needs`;
}

export function generateFeatures(data: ProductData): string {
  return `Key User Features of ${data.productName}

Core Functionality:
${data.keyFeatures.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}

Integration Capabilities:
${data.integrationNeeds}

Target User Benefits:
1. Streamlined Workflows
2. Improved Efficiency
3. Cost Reduction
4. Enhanced Productivity

Technical Specifications:
• Modern Architecture
• Scalable Infrastructure
• Secure Data Management
• Real-time Updates

Support and Training:
• Comprehensive documentation
• 24/7 technical support
• Regular training sessions
• Update notifications`;
}

export function generateCaseStudies(data: ProductData): string {
  return `Success Stories with ${data.productName}

Case Study 1: Industry Pioneer
• Company Profile: Leading ${data.industryType} organization
• Challenge: Similar to "${data.currentChallenges}"
• Solution: Implemented ${data.productName}
• Result: Achieved ${data.budgetRoi} within expected timeframe

Case Study 2: Growth Champion
• Company Profile: Fast-growing startup in ${data.industryType}
• Challenge: Scaling operations efficiently
• Solution: ${data.productName} integration
• Result: Streamlined processes and reduced operational costs

Key Learnings:
1. Importance of proper implementation
2. Value of user training
3. ROI achievement timeline
4. Best practices for success`;
}

export function generateIntegration(data: ProductData): string {
  return `Marketing Integration Guide for ${data.productName}

Integration Capabilities:
${data.integrationNeeds}

Marketing Channels:
1. Social Media Platforms
2. Email Marketing Systems
3. CRM Integration
4. Analytics Tools
5. Content Management Systems

Implementation Strategy:
• Phase 1: Core system integration
• Phase 2: Data synchronization
• Phase 3: Automated workflows
• Phase 4: Performance optimization

ROI Tracking:
${data.budgetRoi}

Success Metrics:
• User adoption rate
• Process efficiency
• Cost savings
• Revenue impact`;
}

export function generateEmotionalAppeal(data: ProductData): string {
  return `Why ${data.productName} Matters

Your Current Challenges:
${data.currentChallenges}

Our Promise:
We understand the pressures of running a business in ${data.industryType}. ${data.productName} isn't just a tool - it's your partner in success.

How We Make a Difference:
• Reducing daily stress through automation
• Empowering your team with better tools
• Creating more time for what matters
• Building confidence in your operations

The Human Touch:
While ${data.productName} offers cutting-edge technology, our focus remains on the people using it. We're here to support your journey, celebrate your successes, and help you overcome challenges.

Join others who have transformed their work lives with ${data.productName}.`;
}
