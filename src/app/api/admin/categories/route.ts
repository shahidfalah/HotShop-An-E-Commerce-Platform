import { NextRequest, NextResponse } from "next/server"
import { CategoryService } from "@/lib/database/category.service"
import { supabase } from "@/lib/storage/supabase"
import { v4 as uuid } from "uuid"
import { getAdminSession } from "@/lib/admin"

export async function POST(req: NextRequest) {
  const adminSession = await  getAdminSession()
  const formData = await req.formData()
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const icon = formData.get("icon") as string
  
  const createdById = adminSession?.user.id // Replace with actual logged-in user ID
  if (!createdById) {
    return NextResponse.json({ success: false, error: "Unauthorized: Admin user ID not found" }, { status: 401 })
  }

  const file = formData.get("image") as File | null

  let imagePath = ""

  // ✅ Upload image to Supabase if exists
  if (file) {
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuid()}.${fileExt}`
    const storagePath = `${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const { error, data } = await supabase.storage
      .from("category-images")
        .upload(storagePath, arrayBuffer, {
          contentType: file.type,
        })
    console.log("Upload result:", { error, data })
    
    if (error) {
      // console.log("Supabase upload result:", error)
      return NextResponse.json({ success: false, error: "Image upload failed" }, { status: 500 })
    }

    imagePath = storagePath
  }

  try {
    const category = await CategoryService.createCategory({
      title: title,
      description,
      image: imagePath,
      icon,
      createdById,
    })

    return NextResponse.json({ success: true, message: "Category created successfully", category })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Something went wrong" }, { status: 400 })
  }
}

export async function GET() {

  try {
    const category = await CategoryService.findAll();

    return NextResponse.json({ success: true, message: "Category retrieved successfully", category })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Something went wrong" }, { status: 400 })
  }
}
