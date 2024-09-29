import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getProducts, deleteProduct } from '../services/productService'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'

const MAX_PRICE = 999999

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [sortBy, setSortBy] = useState('default')
  const [showInStock, setShowInStock] = useState(false)
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, sortBy, showInStock, priceRange])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let result = [...products]

    // Filter by stock
    if (showInStock) {
      result = result.filter(product => product.stock > 0)
    }

    // Filter by price range
    result = result.filter(product => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'price') {
      result.sort((a, b) => a.price - b.price)
    }

    setFilteredProducts(result)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setIsLoading(true)
      try {
        await deleteProduct(id)
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        })
        fetchProducts()
      } catch (error) {
        console.error('Failed to delete product:', error)
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const formatText = (text) => {
    return text.length > 30 ? `${text.slice(0, 30)}...` : text
  }

  const formatPrice = (price) => {
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Product Management</h1>
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 items-start mb-6">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="price">Sort by Price</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-in-stock"
            checked={showInStock}
            onCheckedChange={setShowInStock}
          />
          <Label htmlFor="show-in-stock">Show only in-stock items</Label>
        </div>
        <div className="w-full md:w-[300px] space-y-2">
          <Label>Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</Label>
          <Slider
            min={0}
            max={MAX_PRICE}
            step={1000}
            value={priceRange}
            onValueChange={setPriceRange}
          />
          <div className="flex justify-between">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-[45%]"
            />
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-[45%]"
            />
          </div>
        </div>
        <Button onClick={() => router.push('/add')} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id} className={product.stock === 0 ? 'bg-red-100' : ''}>
                  <TableCell>
                    <img 
                      src={product.featuredImage} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <span title={product.name}>{formatText(product.name)}</span>
                  </TableCell>
                  <TableCell>
                    <span title={product.description}>{formatText(product.description)}</span>
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/edit/${product._id}`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(product._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}