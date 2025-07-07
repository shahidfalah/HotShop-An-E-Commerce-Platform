// src/_components/admin/AdminDashboard.tsx
"use client"; // This is a Client Component

import React, { useState } from 'react';
import AdminCategoryForm from '@/_components/admin/AdminCategoryForm';
import AdminProductForm from '@/_components/admin/AdminProductForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Package, Users, ShoppingBag, Star, LayoutDashboard, PlusCircle, List, Settings, BarChart2 } from 'lucide-react';
import { Button } from "@/_components/ui/button";
import { Badge } from "@/_components/ui/badge";

// Define the interface for the stats data expected from the parent Server Component
interface AdminStats {
  products: { total: number; change: number };
  categories: { total: number; change: number };
  users: { total: number; change: number };
  reviews: { total: number; avgRating: number };
  orders: { total: number; revenue: number };
}

interface AdminDashboardProps {
  initialStats: AdminStats | null; // Stats passed from the server
}

export default function AdminDashboard({ initialStats }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // Use the initialStats prop, provide a fallback if null
  const [stats ] = useState<AdminStats>(initialStats || {
    products: { total: 0, change: 0 },
    categories: { total: 0, change: 0 },
    users: { total: 0, change: 0 },
    reviews: { total: 0, avgRating: 0 },
    orders: { total: 0, revenue: 0 }
  });

  // If you later implement client-side refetching, you'd use useEffect here.
  // For now, the stats are passed once from the server.
  // useEffect(() => {
  //   // You could add logic here to refetch stats periodically or after form submissions
  //   // if you want real-time updates without a full page reload.
  // }, []);

  // Stat Card Component (moved inside AdminDashboard for simplicity, or keep external if reused)
  function StatCard({ title, value, change, secondaryValue, icon, color }: {
    title: string;
    value: number | string;
    change?: number;
    secondaryValue?: string;
    icon: React.ReactNode;
    color: string;
  }) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-(--color-muted)">{title}</CardTitle>
          <div className={`p-2 rounded-full ${color}`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-(--color-font)">{value}</div>
          <div className="flex items-center justify-between">
            {change !== undefined && (
              <p className={`text-xs ${change >= 0 ? 'text-(--color-success)' : 'text-(--color-error)'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </p>
            )}
            {secondaryValue && (
              <p className="text-xs text-(--color-muted)">{secondaryValue}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Activity Item Component (moved inside AdminDashboard for simplicity, or keep external if reused)
  function ActivityItem({ title, description, time, icon }: {
    title: string;
    description: string;
    time: string;
    icon: React.ReactNode;
  }) {
    return (
      <div className="flex items-start gap-3">
        <div className="mt-1 p-2 bg-(--color-background) rounded-full">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-(--color-font)">{title}</h4>
          <p className="text-sm text-(--color-muted)">{description}</p>
          <p className="text-xs text-gray-400 mt-1">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-8 py-4 md:py-8 bg-(--color-background)">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-(--color-font)">Admin Dashboard</h1>
          <p className="text-(--color-muted) mt-1">Manage your HotShop store efficiently</p>
        </div>
        <div className="flex gap-2">

          {activeTab === "products" && (
            <Button 
              size="sm" 
              className="flex items-center gap-2 bg-(--color-primary) text-white hover:bg-(--color-primary-hover)"
              onClick={() => setShowProductForm(!showProductForm)}
            >
              <PlusCircle className="w-4 h-4" />
              {showProductForm ? 'Hide Form' : 'Add Product'}
            </Button>
          )}

          {activeTab === "categories" && (
            <Button 
              size="sm" 
              className="flex items-center gap-2 bg-(--color-primary) text-white hover:bg-(--color-primary-hover)"
              onClick={() => setShowCategoryForm(!showCategoryForm)}
            >
              <PlusCircle className="w-4 h-4" />
              {showCategoryForm ? 'Hide Form' : 'Add Category'}
            </Button>
          )}

          <Button variant="outline" size="sm" className="flex items-center gap-2 border-(--color-border) hover:text-(--color-font) hover:bg-(--color-background)">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full text-(--color-font)">
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 h-auto bg-(--color-background)">
          
          <TabsTrigger value="overview" className="flex items-center gap-2 p-2">
            <LayoutDashboard className="w-4 h-4 sm:inline" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>

          <TabsTrigger value="products" className="flex items-center gap-2 p-2">
            <Package className="w-4 h-4 sm:inline" />
            <span className="hidden sm:inline">Products</span>
            <Badge variant="secondary" className="ml-1 hidden sm:flex bg-(--color-border) text-(--color-font)">
              {stats.products.total}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="categories" className="flex items-center gap-2 p-2">
            <ShoppingBag className="w-4 h-4 sm:inline" />
            <span className="hidden sm:inline">Categories</span>
            <Badge variant="secondary" className="ml-1 hidden sm:flex bg-(--color-border) text-(--color-font)">
              {stats.categories.total}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="users" className="flex items-center gap-2 p-2">
            <Users className="w-4 h-4 sm:inline" />
            <span className="hidden sm:inline">Users</span>
            <Badge variant="secondary" className="ml-1 hidden sm:flex bg-(--color-border) text-(--color-font)">
              {stats.users.total}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="reviews" className="flex items-center gap-2 p-2">
            <Star className="w-4 h-4 sm:inline" />
            <span className="hidden sm:inline">Reviews</span>
          </TabsTrigger>

          <TabsTrigger value="orders" className="flex items-center gap-2 p-2">
            <List className="w-4 h-4 sm:inline" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-4">
            <h3 className="text-xl font-semibold text-(--color-dark) mb-6">Store Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard 
                title="Total Products" 
                value={stats.products.total} 
                change={stats.products.change} 
                icon={<Package className="h-5 w-5 text-(--color-primary)" />}
                color="bg-(--color-bg-of-icons)"
              />
              <StatCard 
                title="Total Categories" 
                value={stats.categories.total} 
                change={stats.categories.change} 
                icon={<ShoppingBag className="h-5 w-5 text-(--color-primary)" />}
                color="bg-(--color-bg-of-icons)"
              />
              <StatCard 
                title="Total Users" 
                value={stats.users.total} 
                change={stats.users.change} 
                icon={<Users className="h-5 w-5 text-(--color-primary)" />}
                color="bg-(--color-bg-of-icons)"
              />
              <StatCard 
                title="Total Reviews" 
                value={stats.reviews.total} 
                secondaryValue={`Avg: ${stats.reviews.avgRating}★`}
                icon={<Star className="h-5 w-5 text-(--color-primary)" />}
                color="bg-(--color-bg-of-icons)"
              />
              <StatCard 
                title="Total Orders" 
                value={stats.orders.total} 
                icon={<List className="h-5 w-5 text-(--color-primary)" />}
                color="bg-(--color-bg-of-icons)"
              />
              <StatCard 
                title="Total Revenue" 
                value={`$${stats.orders.revenue.toLocaleString()}`} 
                icon={<BarChart2 className="h-5 w-5 text-(--color-primary)" />}
                color="bg-(--color-bg-of-icons)"
              />
            </div>

            {/* Recent Activity Section */}
            <div className="mt-6 bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-4">
              <h3 className="text-lg font-semibold text-(--color-font) mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <ActivityItem 
                  title="New product added" 
                  description="Wireless Headphones by John Doe"
                  time="2 hours ago"
                  icon={<Package className="h-4 w-4 text-(--color-primary)" />}
                />
                <ActivityItem 
                  title="New user registered" 
                  description="sarah@example.com"
                  time="5 hours ago"
                  icon={<Users className="h-4 w-4 text-(--color-primary)" />}
                />
                <ActivityItem 
                  title="Order completed" 
                  description="Order #3421 for $129.99"
                  time="1 day ago"
                  icon={<List className="h-4 w-4 text-(--color-primary)" />}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-4">
          <div className="bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-(--color-dark)">Product Management</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2 border-(--color-border) text-white hover:text-(--color-font) hover:bg-(--color-background)">
                  <List className="w-4 h-4" />
                  Export
                </Button>
                <Button 
                  size="sm" 
                  className="flex items-center gap-2 bg-(--color-primary) text-white hover:bg-(--color-primary-hover)"
                  onClick={() => setShowProductForm(!showProductForm)}
                >
                  <PlusCircle className="w-4 h-4" />
                  {showProductForm ? 'Hide Form' : 'Add Product'}
                </Button>
              </div>
            </div>

            {showProductForm && (
              <div className="mb-6 p-4 border border-(--color-border) rounded-lg bg-(--color-background)">
                <h4 className="text-lg font-medium text-(--color-font) mb-4">Add New Product</h4>
                <AdminProductForm />
              </div>
            )}

            <div className="border border-(--color-border) rounded-lg overflow-hidden">
              <div className="p-4 bg-(--color-background) border-b border-(--color-border) flex justify-between items-center">
                <h4 className="font-medium text-(--color-font)">All Products ({stats.products.total})</h4>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-(--color-font) hover:bg-(--color-background)">Filter</Button>
                  <Button variant="ghost" size="sm" className="text-(--color-font) hover:bg-(--color-background)">Sort</Button>
                </div>
              </div>
              <div className="p-4 text-center text-(--color-muted) bg-(--color-surface)">
                <p>Product table will be displayed here</p>
                <p className="text-sm mt-2">Coming soon with search, pagination, and bulk actions</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-4">
          <div className="bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-(--color-dark)">Category Management</h3>
              <Button 
                size="sm" 
                className="flex items-center gap-2 bg-(--color-primary) text-white hover:bg-(--color-primary-hover)"
                onClick={() => setShowCategoryForm(!showCategoryForm)}
              >
                <PlusCircle className="w-4 h-4" />
                {showCategoryForm ? 'Hide Form' : 'Add Category'}
              </Button>
            </div>

            {showCategoryForm && (
              <div className="mb-6 p-4 border border-(--color-border) rounded-lg bg-(--color-background)">
                <h4 className="text-lg font-medium text-(--color-font) mb-4">Add New Category</h4>
                <AdminCategoryForm />
              </div>
            )}

            <div className="border border-(--color-border) rounded-lg overflow-hidden">
              <div className="p-4 bg-(--color-background) border-b border-(--color-border)">
                <h4 className="font-medium text-(--color-font)">All Categories ({stats.categories.total})</h4>
              </div>
              <div className="p-4 text-center text-(--color-muted) bg-(--color-surface)">
                <p>Category list will be displayed here</p>
                <p className="text-sm mt-2">Coming soon with tree view and drag & drop organization</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4">
          <div className="bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-4">
            <h3 className="text-xl font-semibold text-(--color-dark) mb-6">User Management</h3>
            <div className="border border-(--color-border) rounded-lg overflow-hidden">
              <div className="p-4 bg-(--color-background) border-b border-(--color-border) flex justify-between items-center">
                <h4 className="font-medium text-(--color-font)">All Users ({stats.users.total})</h4>
                <Button variant="outline" size="sm" className='border-(--color-border) text-white hover:text-(--color-font) hover:bg-(--color-background)'>Invite User</Button>
              </div>
              <div className="p-4 text-center text-(--color-muted) bg-(--color-surface)">
                <p>User management table will be displayed here</p>
                <p className="text-sm mt-2">Coming soon with role management and activity logs</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-4">
          <div className="bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-4">
            <h3 className="text-xl font-semibold text-(--color-dark) mb-6">Review Management</h3>
            <div className="border border-(--color-border) rounded-lg overflow-hidden">
              <div className="p-4 bg-(--color-background) border-b border-(--color-border)">
                <h4 className="font-medium text-(--color-font)">All Reviews ({stats.reviews.total})</h4>
              </div>
              <div className="p-4 text-center text-(--color-muted) bg-(--color-surface)">
                <p>Review moderation panel will be displayed here</p>
                <p className="text-sm mt-2">Coming soon with filtering and bulk actions</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-4">
          <div className="bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-4">
            <h3 className="text-xl font-semibold text-(--color-dark) mb-6">Order Management</h3>
            <div className="border border-(--color-border) rounded-lg overflow-hidden">
              <div className="p-4 bg-(--color-background) border-b border-(--color-border) flex justify-between items-center">
                <h4 className="font-medium text-(--color-font)">All Orders ({stats.orders.total})</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className='border-(--color-border) text-white hover:text-(--color-font) hover:bg-(--color-background)'>Export</Button>
                  <Button variant="outline" size="sm" className='border-(--color-border) text-white hover:text-(--color-font) hover:bg-(--color-background)'>Filter</Button>
                </div>
              </div>
              <div className="p-4 text-center text-(--color-muted) bg-(--color-surface)">
                <p>Order management table will be displayed here</p>
                <p className="text-sm mt-2">Coming soon with status management and customer communication</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
