import HeroBanner from "@/_components/HeroBanner"
import FlashSales from "@/_components/FlashSales"
import CategoryBanner from "@/_components/CategoryBanner"
import BrowseByCategory from "@/_components/BrowseByCategory"
import NewArrivals from "@/_components/NewArrivals"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Banner with Carousel */}
      <HeroBanner />

      {/* Flash Sales Section */}
      <FlashSales />

      {/* Category Banner */}
      <CategoryBanner />

      {/* Browse by Category */}
      <BrowseByCategory />

      {/* Horizontal Divider */}
      <div className="flex justify-center mt-8">
        <hr className="my-8 border-gray-200 w-[88%]" />
      </div>

      {/* New Arrivals */}
      <NewArrivals />
    </div>
  )
}