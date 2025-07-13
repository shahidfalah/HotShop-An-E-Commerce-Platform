/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Textarea } from "@/_components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Label } from "@/_components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/select";
import { Checkbox } from "@/_components/ui/checkbox";
import { useSession } from "next-auth/react";
import imageCompression from 'browser-image-compression';
import { toast } from 'react-hot-toast'; // For user feedback

interface Category {
  id: string;
  title: string;
  slug: string;
}

export default function AdminProductForm() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    salePrice: "",
    saleStart: "",
    saleEnd: "",
    brand: "",
    width: "", // Still string in form state
    height: "", // Still string in form state
    stock: "",
    categoryId: "",
    images: [] as File[], // Array of File objects
    isFlashSale: false,
    createdById: session?.user?.id || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [discountDisplay, setDiscountDisplay] = useState<string>("");

  useEffect(() => {
    if (session?.user?.id) {
      setFormData(prev => ({ ...prev, createdById: session.user.id as string }));
    }
  }, [session]);

  useEffect(() => {
    const originalPrice = parseFloat(formData.price);
    const salePrice = parseFloat(formData.salePrice);

    if (!isNaN(originalPrice) && originalPrice > 0 && !isNaN(salePrice) && salePrice < originalPrice) {
      const discount = ((originalPrice - salePrice) / originalPrice) * 100;
      setDiscountDisplay(`${discount.toFixed(2)}% Off`);
    } else {
      setDiscountDisplay("N/A");
    }
  }, [formData.price, formData.salePrice]);


  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/categories", { method: "GET" });
      const result = await response.json();
      if (result.success) {
        setCategories(result.category);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to fetch categories" });
      }
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
      setMessage({ type: "error", text: error.message || "Failed to fetch categories" });
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Basic validation for required fields
    if (!formData.title || !formData.price || !formData.stock || !formData.categoryId || formData.images.length === 0) {
      setMessage({ type: "error", text: "Please fill all required fields (Product Name, Original Price, Stock, Category, Images)." });
      setIsLoading(false);
      return;
    }

    // Flash Sale specific validation
    if (formData.isFlashSale && (!formData.saleStart || !formData.saleEnd)) {
      setMessage({ type: "error", text: "Flash Sale products require a start and end date." });
      setIsLoading(false);
      return;
    }

    const fd = new FormData();
    
    // Append all form data fields to FormData object
    Object.entries(formData).forEach(([k, v]) => {
      // Skip images as they are handled separately
      if (k === "images") return; 

      // Handle boolean for isFlashSale
      if (k === "isFlashSale") {
        fd.append(k, String(v)); // Convert boolean to string
      } else if (v !== null && v !== undefined) {
        // Append other fields, ensuring they are not null/undefined
        fd.append(k, v as string);
      }
    });

    // Append image files to FormData
    formData.images.forEach((file) => {
      fd.append(`images`, file, file.name); // Append with original filename
    });

    try {
      const res = await fetch("/api/admin/products", { method: "POST", body: fd });
      
      // Check if the response content type is JSON before parsing
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await res.text(); // Read as text if not JSON
        console.error("Non-JSON response from /api/admin/products:", errorText);
        // Attempt to parse if it looks like a Vercel 413 error page
        if (errorText.includes("Request Entity Too Large")) {
          throw new Error("File size too large. Please try smaller images or reduce quantity.");
        }
        throw new Error(`Server responded with non-JSON content (Status: ${res.status}). Check server logs for details.`);
      }

      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: "Product created successfully!" });
        toast.success("Product created successfully!"); // Show toast notification
        // Reset form data after successful submission
        setFormData({
          title: "", description: "", price: "", salePrice: "",
          saleStart: "", saleEnd: "", brand: "", width: "", height: "", stock: "",
          categoryId: "", images: [], isFlashSale: false,
          createdById: session?.user?.id || "",
        });
        setDiscountDisplay(""); // Reset discount display
      } else {
        setMessage({ type: "error", text: json.error || "Failed to create product." });
        toast.error(json.error || "Failed to create product."); // Show toast notification
      }
    } catch (error: any) {
      console.error("Error submitting product form:", error);
      setMessage({ type: "error", text: error.message || "An unexpected error occurred." });
      toast.error(error.message || "An unexpected error occurred."); // Show toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
    }));
  };

  // NEW: Handle file change with compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const compressedFiles: File[] = [];

    if (files.length === 0) {
      setFormData(f => ({ ...f, images: [] }));
      return;
    }

    setIsLoading(true); // Show loading while compressing
    setMessage(null); // Clear previous messages

    try {
      for (const file of files) {
        // Define compression options
        const options = {
          maxSizeMB: 1, // Max file size in MB (e.g., 1MB)
          maxWidthOrHeight: 1920, // Max width or height (e.g., 1920px)
          useWebWorker: true, // Use web worker for better performance
          fileType: file.type, // Maintain original file type
        };
        
        // Compress the image
        const compressedFile = await imageCompression(file, options);
        compressedFiles.push(compressedFile);
      }
      setFormData(f => ({ ...f, images: compressedFiles }));
      toast.success(`${compressedFiles.length} image(s) processed and ready for upload!`);
    } catch (error: any) {
      console.error('Image compression failed:', error);
      setMessage({ type: "error", text: `Image processing failed: ${error.message}. Please try again.` });
      toast.error(`Image processing failed: ${error.message}.`);
      setFormData(f => ({ ...f, images: [] })); // Clear images on error
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  return (
    <Card className="w-full bg-(--color-surface) border border-(--color-border) text-(--color-font)">
      <CardHeader>
        <CardTitle className="text-(--color-font)">Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Name *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                className="bg-(--color-background) border-(--color-border) text-(--color-font)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select value={formData.categoryId} onValueChange={handleSelectChange} required>
                <SelectTrigger className="bg-(--color-background) border-(--color-border) text-(--color-font)">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-(--color-surface) border-(--color-border) text-(--color-font)">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={4}
              className="bg-(--color-background) border-(--color-border) text-(--color-font)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Original Price *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="bg-(--color-background) border-(--color-border) text-(--color-font)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price</Label>
              <Input
                id="salePrice"
                name="salePrice"
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={handleChange}
                placeholder="0.00 (optional)"
                className="bg-(--color-background) border-(--color-border) text-(--color-font)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                required
                className="bg-(--color-background) border-(--color-border) text-(--color-font)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountDisplay">Calculated Discount</Label>
            <Input
              id="discountDisplay"
              name="discountDisplay"
              type="text"
              value={discountDisplay}
              readOnly
              className="bg-(--color-background) border-(--color-border) text-(--color-font) opacity-70 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFlashSale"
              name="isFlashSale"
              checked={formData.isFlashSale}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFlashSale: !!checked }))}
              className="border-(--color-border) data-(state=checked):bg-(--color-primary) data-(state=checked):text-white"
            />
            <Label htmlFor="isFlashSale" className="text-(--color-font)">Is this a Flash Sale product?</Label>
          </div>

          {formData.isFlashSale && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-(--color-border) rounded-md p-4 bg-(--color-background)">
              <div className="space-y-2">
                <Label htmlFor="saleStart">Sale Start Date *</Label>
                <Input
                  id="saleStart"
                  name="saleStart"
                  type="datetime-local"
                  value={formData.saleStart}
                  onChange={handleChange}
                  required={formData.isFlashSale}
                  className="bg-(--color-surface) border-(--color-border) text-(--color-font)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="saleEnd">Sale End Date *</Label>
                <Input
                  id="saleEnd"
                  name="saleEnd"
                  type="datetime-local"
                  value={formData.saleEnd}
                  onChange={handleChange}
                  required={formData.isFlashSale}
                  className="bg-(--color-surface) border-(--color-border) text-(--color-font)"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="images">Product Images * (Select one or more files)</Label>
            <Input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              required
              onChange={handleFileChange}
              className="bg-(--color-background) border-(--color-border) text-(--color-font) file:text-(--color-primary) file:bg-(--color-background) file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-2"
            />
            {formData.images.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {formData.images.length} image(s) selected and processed.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand name" className="bg-(--color-background) border-(--color-border) text-(--color-font)" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Width (e.g., 10.5)</Label>
              <Input id="width" name="width" type="number" step="0.01" value={formData.width} onChange={handleChange} placeholder="e.g., 10.5" className="bg-(--color-background) border-(--color-border) text-(--color-font)" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (e.g., 15.0)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                step="0.01"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g., 15.0"
                className="bg-(--color-background) border-(--color-border) text-(--color-font)"
              />
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === "success"
                  ? "bg-(--color-success-bg) text-(--color-success) border border-(--color-success)"
                  : "bg-(--color-error-bg) text-(--color-error) border border-(--color-error)"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full bg-(--color-primary) text-white hover:bg-(--color-primary-hover)">
            {isLoading ? "Creating..." : "Create Product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
