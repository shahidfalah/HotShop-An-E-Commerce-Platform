/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { Textarea } from "@/_components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card"
import { Label } from "@/_components/ui/label"

export default function AdminCategoryForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as File | null,
    icon: "",
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
      form.append("icon", formData.icon)
      if (formData.image) form.append("image", formData.image)
      console.log("Submitting form data:",form.get("title"), form.get("description"), form.get("icon"), form.get("image"))
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

  return (
    <Card className="w-full max-w-2xl">
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
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
              onChange={handleFileChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="Icon name or emoji"
            />
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
