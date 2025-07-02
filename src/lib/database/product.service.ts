/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/database/product.service.ts
import { prisma } from "@/lib/prisma"; // Assuming your Prisma client is exported here

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// Define an interface for the incoming data, which might have string dates
// This makes your code more type-safe and readable.
interface ProductCreateInput {
  title: string;
  description?: string;
  price: string; // Assuming price comes as string from form
  salePrice?: string; // Assuming salePrice comes as string from form
  saleStart?: string; // These will be strings from the form
  saleEnd?: string;   // These will be strings from the form
  brand: string;
  width?: string;
  height?: string;
  stock: string; // Assuming stock comes as string from form
  categoryId: string;
  createdById: string;
  images: string[]; // Assuming image names/paths are strings in an array
  // Add other fields as they exist in your form/Product model
  isFlashSale?: boolean; // Ensure this is also handled if it's part of the form
  isActive?: boolean;
}

export class ProductService {

  /**
   * Creates a new product.
   * @param data The product data.
   * @returns The created product.
   */
  // Change 'any' to your new interface for better type safety
  static async createProduct(data: ProductCreateInput) {
    const slug = slugify(data.title);

    // Convert string numeric values to numbers
    const priceNum = parseFloat(data.price);
    const salePriceNum = data.salePrice ? parseFloat(data.salePrice) : undefined; // Optional
    const stockNum = parseInt(data.stock, 10);

    // Convert saleStart and saleEnd strings to Date objects
    // If they are optional in your schema, handle null/undefined correctly.
    // If they are mandatory, you might want to throw an error if they're missing.
    const saleStartDate = data.saleStart ? new Date(data.saleStart) : undefined; // Or null if your schema allows null
    const saleEndDate = data.saleEnd ? new Date(data.saleEnd) : undefined;     // Or null if your schema allows null

    // Ensure images is correctly formatted if it's a JSON field or similar
    const imagesArray = Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []);


    return await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: priceNum,
        salePrice: salePriceNum,
        saleStart: saleStartDate,
        saleEnd: saleEndDate,
        brand: data.brand,
        width: data.width, // Assuming width/height are strings for now, convert if needed
        height: data.height,
        stock: stockNum,
        categoryId: data.categoryId,
        createdById: data.createdById,
        images: imagesArray, // Pass as an array
        slug,
        isFlashSale: data.isFlashSale ?? false, // Default to false if not provided
        isActive: data.isActive ?? true, // Default to true if not provided
      },
    });
  }

  /**
   * Finds a product by its slug.
   * @param slug The product slug.
   * @returns The product or null if not found.
   */
  static async findProductBySlug(slug: string) {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { title: true } },
        _count: {
          select: { reviews: true, wishlists: true }
        }
      }
    });
  }

  /**
   * Finds all active products. Can be filtered by category.
   * @param categoryId Optional category ID to filter by.
   * @returns An array of products.
   */
  static async findAllProducts(categoryId?: string) {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId: categoryId }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { title: true } },
        _count: {
          select: { reviews: true, wishlists: true }
        }
      }
    });
  }

  /**
   * Finds products currently on flash sale. Can be filtered by category.
   * @param categoryId Optional category ID to filter by.
   * @returns An array of flash sale products.
   */
  static async findFlashSaleProducts(categoryId?: string) {
    const now = new Date();
    return await prisma.product.findMany({
      where: {
        isFlashSale: true,
        isActive: true,
        saleStart: { lte: now }, // Sale started
        saleEnd: { gte: now }, // Sale has not ended
        ...(categoryId && { categoryId: categoryId }),
      },
      orderBy: { saleEnd: "asc" }, // Order by earliest end date
      include: {
        category: { select: { title: true } },
        _count: {
          select: { reviews: true, wishlists: true }
        }
      }
    });
  }

  /**
   * Finds the latest active products.
   * @param limit The maximum number of products to return.
   * @returns An array of latest products.
   */
  static async findLatestProducts(limit: number = 4) {
    return await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        category: { select: { title: true } },
        _count: {
          select: { reviews: true, wishlists: true }
        }
      }
    });
  }

  // You can keep `findAll` if you need a truly unfiltered list for admin purposes,
  // but for public facing API, `findAllProducts` (which filters by isActive) is better.
  // If `findAll` is only for admin, consider moving it to an admin-specific service.
  // For now, let's assume `findAllProducts` replaces the previous `findAll` for client-facing.
  // If you still need the *very* raw `findAll`, keep it or rename `findAllProducts` to something like `findActiveProducts`.
}