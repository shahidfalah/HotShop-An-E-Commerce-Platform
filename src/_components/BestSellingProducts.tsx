import ProductCard from "./ProductCard"
import { Button } from "@/_components/ui/button"
import productsData from "../data/products.json"

export default function BestSellingProducts() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-5 h-10 bg-red-500 rounded"></div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Best Selling Products</h2>
            <p className="text-gray-600 mt-1">Top rated products by our customers</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {productsData.bestSelling.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
