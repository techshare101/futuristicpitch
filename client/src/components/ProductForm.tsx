import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductData } from "../pages/Home";

const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  productName: z.string().min(2, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
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
      keyFeatures: "",
      targetAudience: "",
      uniqueSellingPoint: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Company Name</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white/5 text-white border-white/20" />
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
                <Input {...field} className="bg-white/5 text-white border-white/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="bg-white/5 text-white border-white/20" />
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
              <FormLabel className="text-white">Key Features (comma-separated)</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white/5 text-white border-white/20" />
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
                <Input {...field} className="bg-white/5 text-white border-white/20" />
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
                <Textarea {...field} className="bg-white/5 text-white border-white/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          Generate Content
        </Button>
      </form>
    </Form>
  );
}
