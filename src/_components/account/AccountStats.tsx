"use client"

interface AccountStatsProps {
  stats: {
    totalOrders: number
    wishlistItems: number
    reviewsGiven: number
  }
}

export default function AccountStats({ stats }: AccountStatsProps) {
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-custom mb-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">{stats.totalOrders}</div>
          <div className="text-muted text-sm">Orders</div>
        </div>
        <div className="text-center border-l border-r border-custom">
          <div className="text-2xl font-bold text-primary mb-1">{stats.wishlistItems}</div>
          <div className="text-muted text-sm">Wishlist</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">{stats.reviewsGiven}</div>
          <div className="text-muted text-sm">Reviews</div>
        </div>
      </div>
    </div>
  )
}
