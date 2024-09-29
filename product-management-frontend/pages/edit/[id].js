import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { updateProduct, getProductById } from '../../services/productService'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Image } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  description: z.string().max(200, "Description must be less than 200 characters"),
  price: z.number().positive("Price must be positive").max(999999, "Price must be less than 999999"),
  stock: z.number().int("Stock must be an integer").nonnegative("Stock must be non-negative").max(10000, "Stock must be less than 10000"),
  featuredImage: z.string().url("Must be a valid URL").max(500, "URL must be less than 500 characters"),
})

export default function EditProduct() {
  const router = useRouter()
  const { id } = router.query
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      featuredImage: '',
    },
  })

  useEffect(() => {
    if (id) {
      setIsLoading(true)
      getProductById(id)
        .then((product) => {
          form.reset({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            featuredImage: product.featuredImage,
          })
        })
        .catch((error) => {
          console.error('Failed to fetch product:', error)
          toast({
            title: "Error",
            description: "Failed to fetch product details.",
            variant: "destructive",
          })
        })
        .finally(() => setIsLoading(false))
    }
  }, [id, form])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await updateProduct(id, data)
      toast({
        title: "Success",
        description: "Product updated successfully.",
      })
      router.push('/')
    } catch (error) {
      console.error('Failed to update product:', error)
      toast({
        title: "Error",
        description: "An error occurred while updating the product.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-lg w-full p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Product</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Image className="inline mr-1" size={14} />
                    Ensure it's a valid image URL (max 500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full mr-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit" className="w-full" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" /> {isLoading ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}