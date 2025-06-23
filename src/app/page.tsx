import HeroBanner from "@/_components/HeroBanner"
import FlashSales from "@/_components/FlashSales"
import CategoryBanner from "@/_components/CategoryBanner"
import BrowseByCategory from "@/_components/BrowseByCategory"
import BestSellingProducts from "@/_components/BestSellingProducts"
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

      {/* Best Selling Products */}
      <BestSellingProducts />

      {/* New Arrivals */}
      <NewArrivals />
    </div>
  )
}




// export default async function Home() {


//   if (false) {
//     return (
//       <main className="text-(--color-font) flex items-center justify-center h-screen bg-gray-100">
//         <h1 className="text-(--color-font) text-2xl font-bold">Please log in to continue</h1>
//       </main>
//     );
//   } else {
//     return (
//     <main className="min-h-screen bg-gray-100">
//       <div className="flex flex-col items-center justify-center h-screen">
//         <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
//           <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to HotShop!</h1>
//           <p className="text-lg text-gray-600 mb-2">
//             You are logged in as <span className="font-semibold">ppp</span>
//           </p>
//           <p className="text-gray-600 mb-6">Enjoy your shopping experience!</p>
          
//           <button className="w-full">
//             Logout
//           </button>
//         </div>
//       </div>
//     </main>
//     );
// }
// }
