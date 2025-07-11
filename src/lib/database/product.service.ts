/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/database/product.service.ts
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/storage/supabase"; // Import supabase client
import { WishlistService } from "./wishlist.service"; // Import WishlistService

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Helper function to get public URL for an image filename
function getPublicImageUrl(imageName: string): string {
  if (!imageName) return `https://placehold.co/400x300/E0E0E0/0D171C?text=No+Image`; // Robust fallback
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName;
  }
  const { data } = supabase.storage.from("product-images").getPublicUrl(imageName);
  return data.publicUrl || `https://placehold.co/400x300/E0E0E0/0D171C?text=No+Image`; // Robust fallback
}

// Helper function to format product data, including prices, dimensions, and image URLs
function formatProductForClient(product: any) {
  if (!product) return product;

  // Convert Decimal fields to numbers
  const formattedProduct = {
    ...product,
    price: product.price ? parseFloat(product.price.toString()) : 0,
    salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
    width: product.width ? parseFloat(product.width.toString()) : null,
    height: product.height ? parseFloat(product.height.toString()) : null,
  };

  // Transform image filenames to full public URLs
  const formattedImages = Array.isArray(product.images)
    ? product.images.map((img: string) => getPublicImageUrl(img))
    : [];

  // Calculate discount percentage
  let calculatedDiscountPercentage: number | null = null;
  if (formattedProduct.salePrice !== null && formattedProduct.salePrice < formattedProduct.price && formattedProduct.price > 0) {
    calculatedDiscountPercentage = parseFloat(((formattedProduct.price - formattedProduct.salePrice) / formattedProduct.price * 100).toFixed(2));
  }

  // Calculate timeLeftMs for flash sales
  let timeLeftMs: number | null = null;
  if (formattedProduct.isFlashSale && formattedProduct.saleEnd) {
    const saleEndDate = new Date(formattedProduct.saleEnd);
    const now = new Date();
    timeLeftMs = saleEndDate.getTime() - now.getTime();
    if (timeLeftMs < 0) timeLeftMs = 0; // Sale has ended
  }

  // Calculate average rating
  const totalRating = product.reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) || 0;
  const averageRating = product.reviews?.length > 0
    ? parseFloat((totalRating / product.reviews.length).toFixed(1))
    : null;

  return {
    ...formattedProduct,
    images: formattedImages, // Now contains full public URLs
    discountPercentage: calculatedDiscountPercentage,
    timeLeftMs: timeLeftMs,
    rating: averageRating,
    reviews: undefined, // Exclude raw reviews array from the main product object
  };
}

// Define an interface for the incoming data, which might have string dates and dimensions
interface ProductCreateInput {
  title: string;
  description?: string;
  price: string;
  salePrice?: string;
  saleStart?: string;
  saleEnd?: string;
  brand: string;
  width?: string;
  height?: string;
  stock: string;
  categoryId: string;
  createdById: string;
  images: string[];
  isFlashSale?: boolean;
  isActive?: boolean;
}

export class ProductService {

  /**
   * Creates a new product.
   * @param data The product data.
   * @returns The created product.
   */
  static async createProduct(data: ProductCreateInput) {
    const slug = slugify(data.title);

    const priceNum = parseFloat(data.price);
    const salePriceNum = data.salePrice ? parseFloat(data.salePrice) : undefined;
    const stockNum = parseInt(data.stock, 10);

    const widthNum = data.width ? parseFloat(data.width) : undefined;
    const heightNum = data.height ? parseFloat(data.height) : undefined;

    const saleStartDate = data.saleStart ? new Date(data.saleStart) : undefined;
    const saleEndDate = data.saleEnd ? new Date(data.saleEnd) : undefined;

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
        width: widthNum !== undefined ? widthNum.toString() : undefined,
        height: heightNum !== undefined ? heightNum.toString() : undefined,
        stock: stockNum,
        categoryId: data.categoryId,
        createdById: data.createdById,
        images: imagesArray,
        slug,
        isFlashSale: data.isFlashSale ?? false,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Finds a product by its slug, including related data and wishlist status for a given user.
   * This is the method to use for the product detail page.
   * @param slug The slug of the product.
   * @param userId Optional user ID to check wishlist status.
   * @returns The product object with `isWishlistedByUser` or null if not found.
   */
  static async findProductBySlug(slug: string, userId?: string) { // Renamed to findProductBySlug and added userId
    try {
      const product = await prisma.product.findUnique({
        where: { slug: slug },
        include: {
          category: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              wishlists: true,
            },
          },
          reviews: { // Include reviews to calculate average rating
            select: { rating: true },
          },
        },
      });

      if (!product) {
        return null;
      }

      // Determine if the product is wishlisted by the user
      let isWishlistedByUser = false;
      if (userId) {
        isWishlistedByUser = await WishlistService.isProductWishlisted(userId, product.id);
      }

      // Format product data for client (prices, images, dimensions, calculated fields)
      const formattedProduct = formatProductForClient(product);

      return {
        ...formattedProduct,
        isWishlistedByUser: isWishlistedByUser, // Add wishlist status
      };

    } catch (error) {
      console.error(`Error finding product by slug '${slug}':`, error);
      throw new Error("Failed to retrieve product details.");
    }
  }

  /**
   * Finds all active products. Can be filtered by category.
   * This method is perfect for your new /products page.
   * @param categoryId Optional category ID to filter by.
   * @returns An array of products.
   */
  static async findAllProducts(categoryId?: string) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId: categoryId }),
      },
      orderBy: { createdAt: "desc" }, // Default sorting for general products
      include: {
        category: { select: { id: true, title: true, slug: true } },
        _count: {
          select: { reviews: true, wishlists: true }
        },
        reviews: { // Include reviews to calculate average rating
          select: { rating: true },
        },
      }
    });
    return products.map(formatProductForClient); // Format all products
  }

  /**
   * Finds products currently on flash sale. Can be filtered by category.
   * @param categoryId Optional category ID to filter by.
   * @returns An array of flash sale products.
   */
  static async findFlashSaleProducts(categoryId?: string) {
    const now = new Date();
    const products = await prisma.product.findMany({
      where: {
        isFlashSale: true,
        isActive: true,
        saleStart: { lte: now },
        saleEnd: { gte: now },
        ...(categoryId && { categoryId: categoryId }),
      },
      orderBy: { saleEnd: "asc" },
      include: {
        category: { select: { id: true, title: true, slug: true } },
        _count: {
          select: { reviews: true, wishlists: true }
        },
        reviews: { // Include reviews to calculate average rating
          select: { rating: true },
        },
      }
    });
    return products.map(formatProductForClient); // Format all products
  }

  /**
   * Finds the latest active products.
   * @param limit The maximum number of products to return.
   * @returns An array of latest products.
   */
  static async findLatestProducts(limit: number = 8) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: { stock: "desc" },
      take: limit,
      include: {
        category: { select: { id: true, title: true, slug: true } },
        _count: {
          select: { reviews: true, wishlists: true }
        },
        reviews: { // Include reviews to calculate average rating
          select: { rating: true },
        },
      }
    });
    return products.map(formatProductForClient); // Format all products
  }

  /**
   * Counts all active products in the database.
   * @returns The total count of active products.
   */
  static async countAllProducts(): Promise<number> {
    return await prisma.product.count({
      where: {
        isActive: true,
      },
    });
  }
}
