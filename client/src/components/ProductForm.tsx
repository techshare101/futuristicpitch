import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductData } from "../pages/Home";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  productName: z.string().min(2, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  companyDescription: z.string().min(10, "Company description is required"),
  industryType: z.string().min(2, "Industry type is required"),
  currentChallenges: z.string().min(10, "Current challenges must be specified"),
  integrationNeeds: z.string().min(10, "Integration needs must be specified"),
  budgetRoi: z.string().min(5, "Budget/ROI expectations are required"),
  keyFeatures: z.string().transform((str) => str.split(',').map(s => s.trim())),
  targetAudience: z.string().min(5, "Target audience is required"),
  uniqueSellingPoint: z.string().min(10, "USP must be at least 10 characters"),
});

interface ProductFormProps {
  onSubmit: (data: ProductData) => void;
}

export function ProductForm({ onSubmit }: ProductFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      productName: "",
      description: "",
      companyDescription: "",
      industryType: "",
      currentChallenges: "",
      integrationNeeds: "",
      budgetRoi: "",
      keyFeatures: "",
      targetAudience: "",
      uniqueSellingPoint: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="single" collapsible className="w-full space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AccordionItem value="basic-info" className="border-white/20 group">
              <AccordionTrigger className="text-white group-hover:text-cyan-400 transition-colors">
                Basic Information
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Company Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Product Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Company Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Industry Type</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <AccordionItem value="product-details" className="border-white/20 group">
              <AccordionTrigger className="text-white group-hover:text-pink-400 transition-colors">
                Product Details
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Product Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="keyFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Key Features/Keywords (comma-separated)</FormLabel>
                      <FormDescription className="text-white/60">
                        Include product features, capabilities, and relevant SEO keywords for better visibility
                      </FormDescription>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., automation, cloud-based, AI-powered, scalable"
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniqueSellingPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Unique Selling Point</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <AccordionItem value="business-context" className="border-white/20 group">
              <AccordionTrigger className="text-white group-hover:text-purple-400 transition-colors">
                Business Context
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentChallenges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Current Challenges</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Target Audience</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="integrationNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Integration Needs</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budgetRoi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Budget/ROI Expectations</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white/5 text-white border-white/20 transition-all duration-300
                          focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 hover:border-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        </Accordion>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] hover:from-[#ff33ff] hover:via-[#33ffff] hover:to-[#ff33ff] transition-all duration-300 animate-gradient bg-[length:200%_auto] hover:bg-[length:220%_auto]"
          >
            Generate Content
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
