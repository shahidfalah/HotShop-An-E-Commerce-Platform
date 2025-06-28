/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { ProductService } from "@/lib/database/product.service"
import { supabase } from "@/lib/storage/supabase"          //  uses service‑role key
import { v4 as uuid } from "uuid"
import { getAdminSession } from "@/lib/admin"

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const fd = await req.formData()

  // collect basic scalar fields
  const payload: any = {
    title:       fd.get("title")        as string,
    description: fd.get("description")  as string,
    price:       fd.get("price")        as string,
    salePrice:   fd.get("salePrice")    as string,
    saleStart:   fd.get("saleStart")    as string,
    saleEnd:     fd.get("saleEnd")      as string,
    brand:       fd.get("brand")        as string,
    width:       fd.get("width")        as string,
    height:      fd.get("height")       as string,
    stock:       fd.get("stock")        as string,
    categoryId:  fd.get("categoryId")   as string,
    createdById: session.user.id,
  }

  /** Upload every selected file to Supabase */
  const files = fd.getAll("images") as File[]          // multi‑file input
  const imagePaths: string[] = []

  for (const file of files) {
    if (!file || !(file instanceof File)) continue
    const ext = file.name.split(".").pop()
    const path = `${uuid()}.${ext}`

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error(error)
      return NextResponse.json({ success: false, error: "Image upload failed" }, { status: 500 })
    }
    imagePaths.push(path)
  }

  try {
    const product = await ProductService.createProduct({
      ...payload,
      images: imagePaths,
    })

    return NextResponse.json({ success: true, message: "Product created", data: product })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
