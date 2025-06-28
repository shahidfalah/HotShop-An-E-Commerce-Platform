import { prisma } from "@/lib/prisma"

/**
 * CategoryService - Service Layer Pattern
 *
 * Why use a service layer?
 * 1. Separates business logic from API routes
 * 2. Makes code reusable across different parts of the app
 * 3. Easier to test and maintain
 * 4. Provides a single source of truth for database operations
 */
export class CategoryService {
    /**
     * Find all categories with product count
     *
     * Best Practice: Always include relevant related data to avoid N+1 queries
     */
    static async findAll() {
        try {
            return await prisma.category.findMany({
                include: {
                    _count: {
                        select: {
                        products: true, // Count products in each category
                        },
                    },
                    createdBy: {
                        select: {
                        name: true,
                        email: true,
                        },
                    },
                },
                orderBy: { title: "asc" }, // Always provide consistent ordering
            })
        } catch (error) {
            console.error("Error fetching categories:", error)
            throw new Error("Failed to fetch categories")
        }
    }

    /**
     * Find category by ID with full details
     *
     * Learning: Use specific includes based on what you need
     */
    static async findById(id: string) {
        try {
            return await prisma.category.findUnique({
                where: { id },
                include: {
                products: {
                    where: { isActive: true }, // Only active products
                    take: 10, // Limit to prevent large payloads
                    orderBy: { createdAt: "desc" },
                    select: {
                    id: true,
                    title: true,
                    slug: true,
                    price: true,
                    salePrice: true,
                    images: true,
                    },
                },
                createdBy: {
                    select: {
                    name: true,
                    email: true,
                    },
                },
                _count: {
                    select: {
                    products: true,
                    },
                },
                },
            })
        } catch (error) {
            console.error("Error fetching category by ID:", error)
            throw new Error("Failed to fetch category")
        }
    }

    /**
     * Find category by slug (for public pages)
     *
     * Learning: Slugs are SEO-friendly and user-friendly URLs
     */
    static async findBySlug(slug: string) {
        try {
        return await prisma.category.findUnique({
            where: { slug },
            include: {
            products: {
                where: { isActive: true },
                include: {
                _count: {
                    select: {
                    reviews: true,
                    wishlists: true,
                    },
                },
                },
                orderBy: { createdAt: "desc" },
            },
            _count: {
                select: {
                products: true,
                },
            },
            },
        })
        } catch (error) {
        console.error("Error fetching category by slug:", error)
        throw new Error("Failed to fetch category")
        }
    }

    /**
     * Create a new category
     *
     * Learning: Always validate and sanitize input data
     * Generate slugs automatically for consistency
     */
    static async createCategory(data: {
        title: string
        description?: string
        image?: string
        icon?: string
        createdById: string
    }) {
        try {
        // Generate slug from name (SEO-friendly URL)
        const slug = data.title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/[^a-z0-9-]/g, "") // Remove special characters
            .replace(/-+/g, "-") // Replace multiple hyphens with single
            .replace(/^-|-$/g, "") // Remove leading/trailing hyphens

        // Check if category with same name or slug already exists
        const existingCategory = await prisma.category.findFirst({
            where: {
            OR: [{ title: { equals: data.title, mode: "insensitive" } }, { slug }],
            },
        })

        if (existingCategory) {
            throw new Error("Category with this name already exists")
        }

        // Create the category with transaction for data integrity
        const category = await prisma.category.create({
            data: {
            title: data.title.trim(),
            slug,
            description: data.description?.trim() || "",
            image: data.image || "",
            icon: data.icon || "",
            createdById: data.createdById,
            },
            include: {
            createdBy: {
                select: {
                name: true,
                email: true,
                },
            },
            _count: {
                select: {
                products: true,
                },
            },
            },
        })

        return category
        } catch (error) {
        console.error("Error creating category:", error)
        if (error instanceof Error) {
            throw error // Re-throw known errors
        }
        throw new Error("Failed to create category")
        }
    }

    /**
     * Update an existing category
     *
     * Learning: Partial updates allow flexibility
     */
    static async updateCategory(
        id: string,
        data: Partial<{
        title: string
        description: string
        image: string
        icon: string
        }>,
    ) {
        try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = { ...data }

        // If title is being updated, regenerate slug
        if (data.title) {
            updateData.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")

            // Check for conflicts
            const existingCategory = await prisma.category.findFirst({
            where: {
                AND: [
                { id: { not: id } }, // Exclude current category
                {
                    OR: [{ title: { equals: data.title, mode: "insensitive" } }, { slug: updateData.slug }],
                },
                ],
            },
            })

            if (existingCategory) {
            throw new Error("Category with this name already exists")
            }
        }

        return await prisma.category.update({
            where: { id },
            data: updateData,
            include: {
            createdBy: {
                select: {
                name: true,
                email: true,
                },
            },
            _count: {
                select: {
                products: true,
                },
            },
            },
        })
        } catch (error) {
        console.error("Error updating category:", error)
        if (error instanceof Error) {
            throw error
        }
        throw new Error("Failed to update category")
        }
    }

    /**
     * Delete a category (with safety checks)
     *
     * Learning: Always check dependencies before deletion
     */
    static async deleteCategory(id: string) {
        try {
        // Check if category has products
        const productCount = await prisma.product.count({
            where: { categoryId: id, isActive: true },
        })

        if (productCount > 0) {
            throw new Error("Cannot delete category with active products")
        }

        return await prisma.category.delete({
            where: { id },
        })
        } catch (error) {
        console.error("Error deleting category:", error)
        if (error instanceof Error) {
            throw error
        }
        throw new Error("Failed to delete category")
        }
    }

    /**
     * Get category analytics
     *
     * Learning: Aggregate data for business insights
     */
    static async getCategoryAnalytics(categoryId: string) {
        try {
        const [category, products] = await Promise.all([
            prisma.category.findUnique({
            where: { id: categoryId },
            select: {
                title: true,
                createdAt: true,
            },
            }),
            prisma.product.findMany({
            where: { categoryId, isActive: true },
            include: {
                orderItems: true,
                reviews: {
                select: {
                    rating: true,
                },
                },
                _count: {
                select: {
                    wishlists: true,
                },
                },
            },
            }),
        ])

        if (!category) {
            throw new Error("Category not found")
        }

        // Calculate analytics
        const totalProducts = products.length
        const totalSold = products.reduce(
            (sum, product) => sum + product.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
            0,
        )
        const totalRevenue = products.reduce(
            (sum, product) =>
            sum + product.orderItems.reduce((itemSum, item) => itemSum + item.quantity * Number(item.price), 0),
            0,
        )
        const averageRating =
            products.length > 0
            ? products.reduce((sum, product) => {
                const productRating =
                    product.reviews.length > 0
                    ? product.reviews.reduce((ratingSum, review) => ratingSum + review.rating, 0) / product.reviews.length
                    : 0
                return sum + productRating
                }, 0) / products.length
            : 0

        return {
            category,
            analytics: {
            totalProducts,
            totalSold,
            totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            totalWishlists: products.reduce((sum, product) => sum + product._count.wishlists, 0),
            },
        }
        } catch (error) {
        console.error("Error fetching category analytics:", error)
        if (error instanceof Error) {
            throw error
        }
        throw new Error("Failed to fetch category analytics")
        }
    }
}
