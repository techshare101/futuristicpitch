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
  const formattedTitle = `🔥 Breakthrough Alert: How ${data.productName} is Revolutionizing ${data.industryType} in 2024`;
  
  return `${formattedTitle}

Are you tired of ${data.currentChallenges.toLowerCase()}? You're not alone. In today's fast-paced ${data.industryType} landscape, businesses face unprecedented challenges that demand innovative solutions.

The Game-Changing Solution You've Been Waiting For
${data.companyName}, a ${data.companyDescription}, has developed ${data.productName} - ${data.uniqueSellingPoint.toLowerCase()}

🎯 Why ${data.productName} Stands Out:
${data.description}

💡 Transform Your Business with These Powerful Features:
${data.keyFeatures.map(feature => `• ${feature}: Unlock new possibilities and drive growth`).join('\n')}

🌟 Real Results, Real Impact
Leading companies in ${data.industryType} have already experienced remarkable transformations:
• 83% reduction in operational overhead
• 2.5x increase in team productivity
• ROI achievement: ${data.budgetRoi}

🔗 Seamless Integration That Works
${data.integrationNeeds}

👥 Perfect For:
${data.targetAudience}

🎉 Limited Time Offer
Start your journey today and receive:
• Free consultation session
• Premium onboarding support
• 30-day money-back guarantee

⚡ Don't Wait - The Future is Here
While others struggle with outdated solutions, industry leaders are already leveraging ${data.productName} to stay ahead. Join them and transform your business today.

🔥 Special Launch Offer - Save 25% This Week Only!
Book your demo now: [Link]
Contact us: [Contact Information]

Ready to revolutionize your business? Click here to get started! ➡️ [CTA Button]

#${data.industryType.replace(/\s+/g, '')} #Innovation #BusinessTransformation`;
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
