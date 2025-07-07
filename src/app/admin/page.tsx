// src/app/admin/page.tsx
import { requireAdminPage } from "@/lib/admin";
import AdminLayout from "@/_components/admin/AdminLayout";
import AdminDashboard from "@/_components/admin/AdminDashboard";

// Define the interface for the stats data expected from the API
interface AdminStats {
  products: { total: number; change: number };
  categories: { total: number; change: number };
  users: { total: number; change: number };
  reviews: { total: number; avgRating: number };
  orders: { total: number; revenue: number };
}

// Function to fetch admin statistics on the server
async function getAdminStats(): Promise<AdminStats | null> {
  try {
    // Ensure NEXT_PUBLIC_APP_URL is correctly set in your .env.local and deployment environment
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/stats`;
    const res = await fetch(url, {
      cache: 'no-store', // Always fetch fresh data for admin dashboard
      next: { revalidate: 60 } // Revalidate every minute
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server-side fetch error for admin stats:", errorData.error);
      return null;
    }

    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch admin stats server-side:", error);
    return null;
  }
}

export default async function AdminPage() {
  await requireAdminPage(); // Ensure user is admin

  const stats = await getAdminStats(); // Fetch the stats

  return (
    <AdminLayout>
      {/* Pass the fetched stats to the AdminDashboard client component */}
      <AdminDashboard initialStats={stats} />
    </AdminLayout>
  );
}
