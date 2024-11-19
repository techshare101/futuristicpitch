import type { ProductData } from "../pages/Home";

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

export function generateAd(data: ProductData): string {
  // Focus on The Hero's Entry and Victory
  return `<div align="center">

# ✨ ${data.productName}
## *The Game-Changer in ${data.industryType}*

</div>

---

### 🌟 **Your Defining Moment Has Arrived**
> 💡 *"${data.uniqueSellingPoint}"*

---

### 📊 **Success Stories**
Transform your business like our clients who achieved:
• 🚀 ${data.budgetRoi}
• ✨ Unparalleled growth
• 💫 Market leadership

---

### 🎯 **Key Transformations**
${data.keyFeatures.map(feature => `• ⭐ **${feature}**`).join('\n')}

---

### 👥 **Perfect For**
*${data.targetAudience}*

---

**Ready to be the next success story?** [Learn More](#)

#Innovation #Success #${data.industryType.replace(/\s+/g, '')}`;
}

export function generateBlogPost(data: ProductData): string {
  // Use the full 8-step cycle
  return `<div align="center">

# The Evolution of ${data.productName}
## A Journey of Innovation

</div>

---

### 🌟 **Origins & Need**
In the ever-evolving landscape of ${data.industryType}, ${data.companyName} recognized a critical gap.
> 💡 *"${data.companyDescription}"*

---

### 🔍 **The Challenge**
${data.currentChallenges}

---

### ⚡ **A Revolutionary Solution Emerges**
Enter **${data.productName}** - *${data.uniqueSellingPoint}*

---

### 🛠️ **Overcoming Obstacles**
Through rigorous development and testing, we addressed:
• 🔄 Integration challenges
• 🎯 Market demands
• 💪 Performance requirements

${data.integrationNeeds}

---

### 🏆 **Success Stories**
📊 **Client Achievements:**
• ✨ ${data.budgetRoi}
${data.keyFeatures.map(feature => `• 🚀 **${feature}**: *Driving real results*`).join('\n')}

---

### 🌈 **The New Reality**
Post-implementation, our clients experience:
• 📈 Streamlined operations
• ⚡ Enhanced productivity
• 💰 Improved ROI
• 🎯 Better decision-making

---

### 💡 **Simple Yet Powerful**
${data.description}

---

### ⭐ **Our Promise**
At **${data.companyName}**, we're committed to:
• 🔬 Innovation with purpose
• 👥 Client success
• 🔄 Continuous improvement
• 🤝 Ethical business practices

---

> 💫 *Ready to transform your business? Contact us today!*`;
}

export function generateSocialPost(data: ProductData): string {
  // Emphasize The Problem and The New World
  return `<div align="center">

# 🔍 Transform Your ${data.industryType}

</div>

---

### **Facing These Challenges?**
> 💡 *"${data.currentChallenges.toLowerCase()}"*

---

### ✨ **Imagine a World Where:**
• 🌟 ${data.uniqueSellingPoint}
• 🚀 Your team achieves ${data.budgetRoi}
• 💫 Daily challenges become opportunities

---

### 🎯 **The Solution**
**${data.productName}** makes this reality possible.

---

Join the future of ${data.industryType} with *${data.companyName}*

#Innovation #FutureOfWork #${data.industryType.replace(/\s+/g, '')}`;
}

export function generateAnalysis(data: ProductData): string {
  // Focus on Journey and Resolving Complexities
  return `<div align="center">

# Strategic Analysis
## Implementing ${data.productName}

</div>

---

### 📊 **Journey to Excellence**

#### 1. Current State Assessment
• 🏢 **Industry:** ${data.industryType}
• 🎯 **Challenges:** ${data.currentChallenges}

#### 2. Implementation Pathway
• 🔄 **Integration:** ${data.integrationNeeds}
• 📈 **ROI Timeline:** ${data.budgetRoi}

---

### 💡 **Simplifying Complex Solutions**
${data.keyFeatures.map((feature, index) => `
#### ${index + 1}. **${feature}**
• 📋 Implementation strategy
• 🎯 Expected outcomes
• 📊 Performance metrics`).join('\n')}

---

### 🛠️ **Technical Framework**
• 🏗️ Architecture Overview
• 🔄 Integration Points
• 📈 Scalability Measures
• 🔒 Security Protocols

---

### ⚡ **Risk Mitigation Strategy**
1. 📚 **Comprehensive training**
2. 🔄 **Phased deployment**
3. 📊 **Continuous monitoring**
4. ⚙️ **Regular optimization**`;
}

export function generateFeatures(data: ProductData): string {
  // Highlight The Hero's Entry and Resolving Complexities
  return `<div align="center">

# ${data.productName}
## Transformative Features

</div>

---

### 🌟 **Game-Changing Solution**
> 💡 *"${data.uniqueSellingPoint}"*

---

### 💫 **Core Capabilities**
${data.keyFeatures.map((feature, index) => `
#### ${index + 1}. **${feature}**
• 🔧 How it works
• 📈 Business impact
• 🎯 Implementation ease`).join('\n')}

---

### 🔄 **Integration Framework**
${data.integrationNeeds}

---

### 🛠️ **Simplified Technology Stack**
• 💻 **Intuitive Interface**
• 🔄 **Seamless Integration**
• 📊 **Real-time Analytics**
• ⚡ **Automated Workflows**

---

### 🤝 **Support Infrastructure**
• 🔧 24/7 Technical Support
• 📚 Training Resources
• 📋 Implementation Guides
• ✨ Best Practices`;
}

export function generateCaseStudies(data: ProductData): string {
  // Emphasize The Victory and The New World
  return `<div align="center">

# ${data.productName}
## Success Story

</div>

---

### 👥 **Client Profile**
• 🏢 **Industry:** ${data.industryType}
• 🎯 **Challenge:** ${data.currentChallenges}

---

### 🌟 **Transformation Highlights**
• 🏆 **Achievement:** ${data.budgetRoi}
• 🔄 **Implementation:** ${data.integrationNeeds}

---

### 💫 **Key Victories**
${data.keyFeatures.map(feature => `• ✨ **${feature}:** *Delivering measurable impact*`).join('\n')}

---

### 🌈 **The New Reality**
1. 📈 **Streamlined Operations**
2. ⚡ **Enhanced Productivity**
3. 💰 **Improved ROI**
4. 🎯 **Better Decision-Making**

---

### 💬 **Client Testimonial**
> 💡 *"${data.productName} transformed our approach to ${data.industryType}"*

---

### 🚀 **Looking Forward**
• 📈 Continuous Improvement
• 🌟 Scaling Success
• 💫 Future Innovations`;
}

export function generateIntegration(data: ProductData): string {
  // Focus on Journey and The New World
  return `<div align="center">

# Integration Guide
## ${data.productName}

</div>

---

### 🛠️ **Implementation Journey**
1. 📊 **Current Infrastructure Analysis**
2. 🎯 **Integration Requirements:**
   ${data.integrationNeeds}
3. 📋 **Deployment Strategy**
4. ⚙️ **Performance Optimization**

---

### 🔄 **Path to Transformation**
${data.keyFeatures.map((feature, index) => `
#### ${index + 1}. **${feature}**
• 📋 Implementation steps
• ⏱️ Timeline
• 📊 Success metrics`).join('\n')}

---

### 🌟 **The New Operating Environment**
• ⚡ **Seamless Workflows**
• 📈 **Enhanced Efficiency**
• 📊 **Real-time Insights**
• 🔄 **Scalable Architecture**

---

### 📊 **Success Metrics**
• 💰 **Target ROI:** ${data.budgetRoi}
• 📈 **Efficiency Gains**
• 👥 **User Adoption**
• ⚡ **System Performance**`;
}

export function generateEmotionalAppeal(data: ProductData): string {
  // Emphasize The Problem and The Moral
  return `<div align="center">

# Understanding Your Challenges
## We're Here to Help

</div>

---

### 💭 **The Daily Struggle**
> 💡 *"${data.currentChallenges}"*

---

### 🤝 **We Get It**
Running a business in **${data.industryType}** isn't just about numbers. It's about:
• 👥 Your team's success
• 🌟 Peace of mind
• 🚀 Future growth
• 💫 Lasting impact

---

### ⭐ **Our Promise to You**
> 💫 *"${data.uniqueSellingPoint}"*

---

### 🌟 **Values That Drive Us**
• 💡 Innovation with purpose
• 🤝 Client success first
• ⭐ Ethical practices
• 📈 Continuous support

---

### 💫 **Why It Matters**
${data.keyFeatures.map(feature => `• ✨ **${feature}:** *Making a real difference*`).join('\n')}

---

> 🌟 *Join others who've trusted ${data.productName} to transform their future.
> Together, let's build something extraordinary.*`;
}
