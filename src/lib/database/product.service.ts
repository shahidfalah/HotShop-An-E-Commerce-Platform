/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/database/product.service.ts
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/storage/supabase"; // Import supabase client
import slugify from "slugify"; // Import slugify library

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
    // width and height are strings in DB, but often used as numbers in frontend.
    // Convert to number here for client-side use, or null if invalid.
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
  width?: string; // Keep as string to match DB schema
  height?: string; // Keep as string to match DB schema
  stock: string;
  categoryId: string;
  createdById: string;
  images: string[];
  isFlashSale?: boolean;
  isActive?: boolean;
}

export class ProductService {

  /**
   * Helper function to generate a unique slug.
   * It takes a base title, slugifies it, and checks for uniqueness in the database.
   * If the slug already exists, it appends a number to make it unique.
   */
  static async generateUniqueSlug(title: string): Promise<string> {
    let baseSlug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
    if (!baseSlug) { // Fallback for titles that result in empty slugs
      baseSlug = "product";
    }
    let slug = baseSlug;
    let counter = 1;

    // Check if slug already exists
    let existingProduct = await prisma.product.findUnique({
      where: { slug: slug },
      select: { id: true }, // Select only ID for efficiency
    });

    // If slug exists, append a counter until it's unique
    while (existingProduct) {
      slug = `${baseSlug}-${counter}`;
      existingProduct = await prisma.product.findUnique({
        where: { slug: slug },
        select: { id: true },
      });
      counter++;
    }
    return slug;
  }

  /**
   * Creates a new product.
   * @param data The product data.
   * @returns The created product.
   */
  static async createProduct(data: ProductCreateInput) {
    // Generate a unique slug before creating the product
    const uniqueSlug = await ProductService.generateUniqueSlug(data.title);

    const priceNum = parseFloat(data.price);
    const salePriceNum = data.salePrice ? parseFloat(data.salePrice) : undefined;
    const stockNum = parseInt(data.stock, 10);

    // Keep width and height as strings if they are defined, otherwise undefined
    const widthString = data.width !== undefined && data.width !== null ? data.width.toString() : undefined;
    const heightString = data.height !== undefined && data.height !== null ? data.height.toString() : undefined;

    const saleStartDate = data.saleStart ? new Date(data.saleStart) : undefined;
    const saleEndDate = data.saleEnd ? new Date(data.saleEnd) : undefined;

    const imagesArray = Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []);

    return await prisma.product.create({
      data: {
        title: data.title,
        slug: uniqueSlug, // Use the unique slug here
        description: data.description,
        price: priceNum,
        salePrice: salePriceNum,
        saleStart: saleStartDate,
        saleEnd: saleEndDate,
        brand: data.brand,
        width: widthString, // Save as string to match DB schema
        height: heightString, // Save as string to match DB schema
        stock: stockNum,
        categoryId: data.categoryId,
        createdById: data.createdById,
        images: imagesArray,
        isFlashSale: data.isFlashSale ?? false,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Finds a product by its slug, including related data and wishlist/cart status for a given user.
   * This is the method to use for the product detail page.
   * @param slug The slug of the product.
   * @param userId Optional user ID to check wishlist and cart status.
   * @returns The product object with `isWishlistedByUser` and `isInCartByUser` or null if not found.
   */
  static async findProductBySlug(slug: string, userId?: string) {
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

      // Determine if the product is wishlisted and in cart by the user
      let isWishlistedByUser = false;
      let isInCartByUser = false;
      if (userId) {
        const status = await ProductService.checkProductStatusForUser(product.id, userId);
        isWishlistedByUser = status.isWishlisted;
        isInCartByUser = status.isInCart;
      }

      // Format product data for client (prices, images, dimensions, calculated fields)
      const formattedProduct = formatProductForClient(product);

      return {
        ...formattedProduct,
        isWishlistedByUser: isWishlistedByUser, // Add wishlist status
        isInCartByUser: isInCartByUser,       // Add cart status
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
   * @param userId Optional user ID to check wishlist and cart status for each product.
   * @returns An array of products.
   */
  static async findAllProducts(categoryId?: string, userId?: string) {
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

    // Map and format products, and check wishlist/cart status for each
    const formattedProducts = await Promise.all(
      products.map(async (product) => {
        const formatted = formatProductForClient(product);
        let isWishlistedByUser = false;
        let isInCartByUser = false;
        if (userId) {
          const status = await ProductService.checkProductStatusForUser(product.id, userId);
          isWishlistedByUser = status.isWishlisted;
          isInCartByUser = status.isInCart;
        }
        return {
          ...formatted,
          isWishlistedByUser: isWishlistedByUser,
          isInCartByUser: isInCartByUser,
        };
      })
    );
    return formattedProducts;
  }

  /**
   * Finds products currently on flash sale. Can be filtered by category.
   * @param categoryId Optional category ID to filter by.
   * @param userId Optional user ID to check wishlist and cart status for each product.
   * @returns An array of flash sale products.
   */
  static async findFlashSaleProducts(categoryId?: string, userId?: string) {
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

    // Map and format products, and check wishlist/cart status for each
    const formattedProducts = await Promise.all(
      products.map(async (product) => {
        const formatted = formatProductForClient(product);
        let isWishlistedByUser = false;
        let isInCartByUser = false;
        if (userId) {
          const status = await ProductService.checkProductStatusForUser(product.id, userId);
          isWishlistedByUser = status.isWishlisted;
          isInCartByUser = status.isInCart;
        }
        return {
          ...formatted,
          isWishlistedByUser: isWishlistedByUser,
          isInCartByUser: isInCartByUser,
        };
      })
    );
    return formattedProducts;
  }

  /**
   * Finds the latest active products.
   * @param limit The maximum number of products to return.
   * @param userId Optional user ID to check wishlist and cart status for each product.
   * @returns An array of latest products.
   */
  static async findLatestProducts(limit: number = 8, userId?: string) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
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

    // Map and format products, and check wishlist/cart status for each
    const formattedProducts = await Promise.all(
      products.map(async (product) => {
        const formatted = formatProductForClient(product);
        let isWishlistedByUser = false;
        let isInCartByUser = false;
        if (userId) {
          const status = await ProductService.checkProductStatusForUser(product.id, userId);
          isWishlistedByUser = status.isWishlisted;
          isInCartByUser = status.isInCart;
        }
        return {
          ...formatted,
          isWishlistedByUser: isWishlistedByUser,
          isInCartByUser: isInCartByUser,
        };
      })
    );
    return formattedProducts;
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

  /**
   * Checks if a specific product is in a user's cart or wishlist.
   * This function is intended for server-side use.
   * @param productId The ID of the product to check.
   * @param userId The ID of the user.
   * @returns An object containing `isInCart` and `isWishlisted` boolean flags.
   */
  static async checkProductStatusForUser(
    productId: string,
    userId: string
  ): Promise<{ isInCart: boolean; isWishlisted: boolean }> {
    try {
      // Check if product is in cart
      const cartItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: { // Assumes unique compound key on userId and productId
            userId: userId,
            productId: productId,
          },
        },
        select: { id: true }, // Select only ID for efficiency
      });

      // Check if product is in wishlist
      const wishlistItem = await prisma.wishlist.findUnique({
        where: {
          userId_productId: { // Assumes unique compound key on userId and productId
            userId: userId,
            productId: productId,
          },
        },
        select: { id: true }, // Select only ID for efficiency
      });

      return {
        isInCart: !!cartItem, // True if cartItem exists, false otherwise
        isWishlisted: !!wishlistItem, // True if wishlistItem exists, false otherwise
      };
    } catch (error) {
      console.error(`Error checking product status for user ${userId} and product ${productId}:`, error);
      // In case of an error, assume false to prevent UI issues, but log the error.
      return { isInCart: false, isWishlisted: false };
    }
  }
}
