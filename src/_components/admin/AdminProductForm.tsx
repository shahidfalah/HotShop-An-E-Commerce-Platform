"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { Textarea } from "@/_components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card"
import { Label } from "@/_components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/select"

interface Category {
  id: string
  title: string
  slug: string
}

export default function AdminProductForm() {
  const [categories, setCategories] = useState<Category[]>([])
  // const [formData, setFormData] = useState({
  //   title: "",
  //   description: "",
  //   price: "",
  //   salePrice: "",
  //   saleStart: "",
  //   saleEnd: "",
  //   images: "",
  //   brand: "",
  //   width:  null as File | null,
  //   height: "",
  //   stock: "",
  //   categoryId: "",
  // })
  const [formData, setFormData]   = useState({
    title: "", description: "", price: "", salePrice: "",
    saleStart: "", saleEnd: "", brand: "", width: "", height: "", stock: "",
    categoryId: "", images: [] as File[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "GET"
      })
      const result = await response.json()
      if (result.success) {
        console.log("Fetched categories:", result.category)
        setCategories(result.category)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const fd = new FormData()
    Object.entries(formData).forEach(([k, v]) => {
      if (k === "images") return
      fd.append(k, v as string)
    })
    formData.images.forEach(f => fd.append("images", f))

    const res   = await fetch("/api/admin/products", { method: "POST", body: fd })
    const json  = await res.json()

    if (json.success) {
      setMessage({ type: "success", text: "Product created!" })
      setFormData({
        title: "", description: "", price: "", salePrice: "",
        saleStart: "", saleEnd: "", brand: "", width: "", height: "", stock: "",
        categoryId: "", images: [] as File[],
      })
    } else {
      setMessage({ type: "error", text: json.error })
    }
    setIsLoading(false)
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(f => ({ ...f, images: Array.from(e.target.files ?? []) }))
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 text-(--color-font)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select value={formData.categoryId} onValueChange={handleSelectChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
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
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
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
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="saleStart">Sale Start Date</Label>
              <Input
                id="saleStart"
                name="saleStart"
                type="datetime-local"
                value={formData.saleStart}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saleEnd">Sale End Date</Label>
              <Input
                id="saleEnd"
                name="saleEnd"
                type="datetime-local"
                value={formData.saleEnd}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Images (comma-separated URLs)</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
              onChange={handleFileChange}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input id="width" name="width" value={formData.width} onChange={handleChange} placeholder="e.g., 10cm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g., 15cm"
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
  )
}
