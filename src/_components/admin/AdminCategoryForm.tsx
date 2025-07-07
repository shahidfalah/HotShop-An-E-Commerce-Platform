/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { Textarea } from "@/_components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card"
import { Label } from "@/_components/ui/label"
import * as LucideIcons from "lucide-react" // Import all icons from lucide-react
import { type LucideProps } from "lucide-react"; // Import LucideProps for typing

// --- New: Define a list of common icons you want to offer ---
// You can expand this list or fetch it dynamically if you have many
const commonIcons = [
  "PackageSearch", // Example for "Search" or "Products"
  "Smartphone",    // For "Phones"
  "Laptop",        // For "Computers"
  "Headphones",    // For "Audio"
  "Watch",         // For "Wearables"
  "Gamepad",       // For "Gaming"
  "Camera",        // For "Cameras"
  "Shirt",         // For "Apparel"
  "Home",          // General
  "ClipboardList", // For "Order" or "Lists"
  // Add more as needed from lucide-react documentation
];

export default function AdminCategoryForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as File | null,
    icon: "", // This will store the string name of the Lucide icon (e.g., "Smartphone")
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const form = new FormData()
      form.append("title", formData.title)
      form.append("description", formData.description)
      form.append("icon", formData.icon) // Send the icon name string
      if (formData.image) form.append("image", formData.image)

      console.log("Submitting form data:", formData.title, formData.description, formData.icon, formData.image?.name) // Log names for files
      
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        body: form,
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: "success", text: result.message })
        setFormData({ title: "", description: "", image: null, icon: "" })
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } catch (error) {
      console.error("Error creating category:", error); // Log actual error for debugging
      setMessage({ type: "error", text: "Failed to create category" })
    } finally {
      setIsLoading(false)
    }
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({
      ...prev,
      image: file,
    }))
  }

  // --- New: Handle icon selection ---
  const handleIconSelect = (iconName: string) => {
    setFormData((prev) => ({
      ...prev,
      icon: iconName,
    }));
  };

  // --- New: Render the selected icon for preview ---
  const SelectedIconComponent = formData.icon ? (LucideIcons[formData.icon as keyof typeof LucideIcons] as React.ElementType<LucideProps>)
  : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Category</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 text-(--color-font)">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter category description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Category Image</Label> {/* Changed label from 'URL' to 'Image' */}
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              // required // Consider if image is always required or optional
              onChange={handleFileChange}
              placeholder="https://example.com/image.jpg"
            />
             {formData.image && (
                <p className="text-xs text-gray-500 mt-1">Selected: {formData.image.name}</p>
             )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Select Icon</Label>
            <div className="border p-2 rounded-md grid grid-cols-6 gap-2 bg-gray-50"> {/* Icon Grid */}
              {commonIcons.map((iconName) => {
                const IconComponent = iconName ? (LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType<LucideProps>) : null;
                return IconComponent ? (
                  <button
                    key={iconName}
                    type="button" // Important: Prevent form submission
                    onClick={() => handleIconSelect(iconName)}
                    className={`p-2 rounded-md border flex items-center justify-center text-xl transition-all duration-200
                      ${formData.icon === iconName ? "bg-blue-200 border-blue-500 text-blue-700" : "bg-white hover:bg-gray-100 border-gray-200"}
                    `}
                    title={iconName} // Tooltip on hover
                  >
                    <IconComponent size={24} /> {/* Adjust size as needed */}
                  </button>
                ) : null;
              })}
            </div>
            {formData.icon && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-gray-700">
                <span>Selected Icon:</span>
                <span className="p-2 border rounded-md bg-white flex items-center justify-center">
                  {SelectedIconComponent && <SelectedIconComponent size={20} />}
                </span>
                <span>{formData.icon}</span>
                <Button variant="ghost" size="sm" onClick={() => handleIconSelect("")}>Clear</Button>
              </div>
            )}
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
            {isLoading ? "Creating..." : "Create Category"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
