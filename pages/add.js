import { useState } from "react"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { addProduct } from "../services/productService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  description: z.string().max(200, "Description must be less than 200 characters"),
  price: z.number().positive("Price must be positive").max(999999, "Price must be less than 999999"),
  stock: z.number().int("Stock must be an integer").nonnegative("Stock must be non-negative").max(10000, "Stock must be less than 10000"),
  featuredImage: z.string().url("Must be a valid URL").max(500, "URL must be less than 500 characters"),
})

export default function AddProduct() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      featuredImage: "",
    },
  })

  const onSubmit = async (data) => {
    console.log("Form Data:", data); // Debugging line
    setIsLoading(true);
    try {
      await addProduct(data); // Ensure addProduct handles promises correctly
      toast({
        title: "Success",
        description: "Product added successfully.",
      });
      router.push("/");
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding the product.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormDescription>
                  Product name (max 50 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter product description" {...field} />
                </FormControl>
                <FormDescription>
                  Product description (max 200 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter price" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormDescription>
                  Product price (0 - 999999)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter stock quantity" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                </FormControl>
                <FormDescription>
                  Product stock (0 - 10000)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="featuredImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Featured Image URL" {...field} />
                </FormControl>
                <FormDescription>
                  URL of the featured image (max 500 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} className="w-full mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" /> {isLoading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}