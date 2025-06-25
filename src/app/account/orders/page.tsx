"use client"

import { ArrowLeft, Package, Calendar, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock order data - replace with your actual data fetching
const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    total: 299.99,
    status: "Delivered",
    items: 3,
  },
  {
    id: "ORD-002",
    date: "2024-01-10",
    total: 149.5,
    status: "Shipped",
    items: 2,
  },
  {
    id: "ORD-003",
    date: "2024-01-05",
    total: 89.99,
    status: "Processing",
    items: 1,
  },
]

export default function OrdersPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="mr-4 p-2 rounded-full bg-surface shadow-custom">
            <ArrowLeft className="w-5 h-5 text-font" />
          </button>
          <h1 className="text-2xl font-bold text-font">Past Orders</h1>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <div key={order.id} className="bg-surface rounded-xl p-4 shadow-custom">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-icon-bg rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-font">{order.id}</h3>
                    <p className="text-muted text-sm">{order.items} items</p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "Delivered"
                      ? "bg-success-bg text-success"
                      : order.status === "Shipped"
                        ? "bg-info-light text-info"
                        : "bg-warning-bg text-warning"
                  }`}
                >
                  {order.status}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted">
                  <Calendar className="w-4 h-4 mr-1" />
                  {order.date}
                </div>
                <div className="flex items-center font-semibold text-font">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {order.total}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
