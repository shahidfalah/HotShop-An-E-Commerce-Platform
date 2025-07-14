import { createClient } from "@supabase/supabase-js"

/**
 * Supabase Storage Integration
 *
 * Learning: Why use Supabase Storage?
 * 1. Built-in CDN for fast image delivery
 * 2. Automatic image optimization and resizing
 * 3. Row Level Security (RLS) for access control
 * 4. Cost-effective compared to AWS S3
 * 5. Easy integration with Supabase database
 */

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabaseRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!supabaseUrl || !supabaseRoleKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseRoleKey)

/**
 * Storage bucket names
 *
 * Best Practice: Use descriptive bucket names for organization
 */
export const STORAGE_BUCKETS = {
  CATEGORIES: "category-images",
  PRODUCTS: "product-images",
  USERS: "user-avatars",
  // TEMP: "temp-uploads", // For temporary uploads before processing
} as const

/**
 * Upload image to Supabase Storage
 *
 * Learning: Always validate file types and sizes for security
 */
export async function uploadImage(
  file: File,
  bucket: keyof typeof STORAGE_BUCKETS,
  path?: string,
): Promise<{ url: string; path: string }> {
  try {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.")
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 5MB.")
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = path ? `${path}/${fileName}` : fileName

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from(STORAGE_BUCKETS[bucket]).upload(filePath, file, {
      cacheControl: "3600", // Cache for 1 hour
      upsert: false, // Don't overwrite existing files
    })

    if (error) {
      console.error("Supabase upload error:", error)
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKETS[bucket]).getPublicUrl(data.path)

    return {
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to upload image")
  }
}

/**
 * Delete image from Supabase Storage
 *
 * Learning: Always clean up unused files to save storage costs
 */
export async function deleteImage(bucket: keyof typeof STORAGE_BUCKETS, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKETS[bucket]).remove([path])

    if (error) {
      console.error("Supabase delete error:", error)
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error("Error deleting image:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to delete image")
  }
}

/**
 * Get optimized image URL with transformations
 *
 * Learning: Supabase can resize and optimize images on-the-fly
 */
export function getOptimizedImageUrl(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string,
  options?: {
    width?: number
    height?: number
    quality?: number
    format?: "origin"
  },
): string {
  const { data } = supabase.storage.from(STORAGE_BUCKETS[bucket]).getPublicUrl(path, {
    transform: {
      width: options?.width,
      height: options?.height,
      quality: options?.quality || 80,
      format: options?.format || "origin",
    },
  })

  return data.publicUrl
}

/**
 * Get public URL for any file in a specified bucket.
 * This function is now more general.
 * @param bucket The name of the storage bucket.
 * @param path The path/filename of the file within the bucket.
 * @param options Optional transform options for image optimization.
 * @returns The public URL of the file.
 */
export function getPublicFileUrl(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string,
  options?: {
    width?: number
    height?: number
    quality?: number
    format?: "origin"
  },
): string {
  if (!path) return `https://placehold.co/150x150/E0E0E0/0D171C?text=No+Image`; // Generic fallback for missing path
  
  // If the path is already a full URL (e.g., from OAuth providers), return it directly
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKETS[bucket]).getPublicUrl(path, {
    transform: {
      width: options?.width,
      height: options?.height,
      quality: options?.quality || 80,
      format: options?.format || "origin",
    },
  })

  return data.publicUrl || `https://placehold.co/150x150/E0E0E0/0D171C?text=No+Image`; // Fallback if publicUrl is null
}

/**
 * Specific helper to get the public URL for a user avatar.
 * This handles cases where the image is a full URL (e.g., from Google OAuth)
 * or a filename stored in Supabase 'user-avatars' bucket.
 * @param imagePath The image path or full URL from the user object.
 * @returns The public URL of the avatar.
 */
export function getPublicAvatarUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return "/defaultProfileImage.jpeg"; // Your default local fallback image
  }
  // If it's already a full URL (e.g., from OAuth), return it directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, assume it's a path in the 'user-avatars' bucket
  return getPublicFileUrl("USERS", imagePath, { width: 150, height: 150, quality: 75 });
}



/**
 * Upload multiple images
 *
 * Learning: Batch operations are more efficient
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: keyof typeof STORAGE_BUCKETS,
  path?: string,
): Promise<Array<{ url: string; path: string }>> {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, bucket, path))
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error("Error uploading multiple images:", error)
    throw new Error("Failed to upload images")
  }
}