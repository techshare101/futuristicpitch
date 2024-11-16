import { motion } from "framer-motion";
import { ParticlesBackground } from "../components/ParticlesBackground";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

// FAQ Data
const faqs = [
  {
    question: "What is the Futuristic Product Pitch Generator?",
    answer: "An AI-powered tool that creates compelling, future-ready product pitches tailored to your business needs. It generates professional content across multiple formats including ads, blog posts, and social media."
  },
  {
    question: "How does it work?",
    answer: "Simply input your product and company details, and our advanced AI generates customized content optimized for different platforms and purposes."
  },
  {
    question: "What types of content can I generate?",
    answer: "Generate ads, blog posts, social media content, product analyses, feature highlights, case studies, integration guides, and emotional appeals."
  },
  {
    question: "Is it suitable for my industry?",
    answer: "Yes! Our generator adapts to any industry, creating relevant and engaging content that speaks to your specific market."
  }
];

// Features Data
const features = [
  {
    title: "AI-Powered Generation",
    description: "Advanced algorithms create compelling content tailored to your needs",
    icon: "🤖"
  },
  {
    title: "Multi-Format Output",
    description: "Generate content for ads, blogs, social media, and more",
    icon: "📱"
  },
  {
    title: "Brand Voice Control",
    description: "Maintain consistent messaging across all platforms",
    icon: "🎯"
  },
  {
    title: "SEO Optimization",
    description: "Content optimized for search engines and engagement",
    icon: "📈"
  }
];

// Testimonials Data
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "TechVision Inc",
    content: "This tool revolutionized our product launch campaigns. The content quality is outstanding!"
  },
  {
    name: "James Wilson",
    role: "Startup Founder",
    company: "Future Labs",
    content: "Generated pitches that helped us secure funding. A game-changer for startups!"
  },
  {
    name: "Elena Rodriguez",
    role: "Product Manager",
    company: "InnovateX",
    content: "The variety of content formats saves us hours of work. Highly recommended!"
  }
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <ParticlesBackground />
      
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] animate-gradient">
            Next-Gen Product Pitch Generator
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Transform your product vision into compelling pitches with our AI-powered generator. Create future-ready content that captivates your audience.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/generator">
              <Button className="bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] hover:from-[#ff33ff] hover:via-[#33ffff] hover:to-[#ff33ff] transition-all duration-300 animate-gradient">
                Start Generating
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          Powerful Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-6 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative container mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          What Our Users Say
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-6 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <p className="text-white/80 mb-4">"{testimonial.content}"</p>
                <div className="text-white">
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-white/60">{testimonial.role}</p>
                  <p className="text-white/60">{testimonial.company}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative container mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          Choose Your Plan
        </h2>
        <div className="max-w-md mx-auto">
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-6 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <h3 className="text-2xl font-bold text-white mb-4">Pro Plan</h3>
            <ul className="text-white/80 space-y-2 mb-6">
              <li>✨ Unlimited content generation</li>
              <li>🚀 All content formats</li>
              <li>💫 Priority support</li>
              <li>🔮 Advanced customization</li>
            </ul>
            <stripe-buy-button
              buy-button-id="buy_btn_1QEbLXGRxp9eu0DJNo9ycVQC"
              publishable-key="pk_live_51QEaKvGRxp9eu0DJa1y91M5ASVlVE8IauF2fMzlBpH3NvhY01P47d9aIKZ7qcAdETYokGWEZY4zgoHSrB9dGkhKr00N2yvbb8D"
              class="stripe-buy-button-no-image"
            >
            </stripe-buy-button>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative container mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-6"
            >
              <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-6 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <h3 className="text-xl font-bold text-white mb-2">{faq.question}</h3>
                <p className="text-white/80">{faq.answer}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
