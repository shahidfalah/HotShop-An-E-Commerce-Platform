import { requireAdminPage } from "@/lib/admin"
import AdminLayout from "@/_components/admin/AdminLayout"
import AdminCategoryForm from "@/_components/admin/AdminCategoryForm"
import AdminProductForm from "@/_components/admin/AdminProductForm"

export default async function AdminPage() {
    await requireAdminPage()

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
                    <p className="text-gray-600">Manage your store categories and products</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <AdminCategoryForm />
                    </div>
                    <div>
                        <AdminProductForm />
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
