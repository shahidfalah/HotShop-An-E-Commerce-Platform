import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export class ProductService {
  /** Create product */
  static async createProduct(data: {
    title: string
    description?: string
    price: string
    salePrice?: string
    saleStart?: string
    saleEnd?: string
    images: string[]          // Supabase storage paths
    brand?: string
    width?: string
    height?: string
    stock: string
    categoryId: string
    createdById: string
  }) {
    const slug = slugify(data.title)

    // reject duplicates
    const exists = await prisma.product.findFirst({
      where: { slug },
      select: { id: true }
    })
    if (exists) throw new Error("Product with this title already exists")

    return prisma.product.create({
      data: {
        title: data.title.trim(),
        slug,
        description: data.description?.trim() ?? "",
        price: new Decimal(data.price),
        salePrice: data.salePrice ? new Decimal(data.salePrice) : undefined,
        saleStart: data.saleStart ? new Date(data.saleStart) : undefined,
        saleEnd:   data.saleEnd   ? new Date(data.saleEnd)   : undefined,
        images: data.images,
        brand: data.brand ?? "",
        width: data.width ?? "",
        height: data.height ?? "",
        stock: Number(data.stock || 0),
        categoryId: data.categoryId,
        createdById: data.createdById,
      },
      include: {
        category: { select: { title: true } },
        createdBy: { select: { name: true, email: true } },
      },
    })
  }

}
