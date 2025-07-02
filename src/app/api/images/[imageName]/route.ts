import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/storage/supabase"

// Define the type for params to explicitly be a Promise
type RouteParams = { params: Promise<{ imageName: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { imageName } = await params;

  if (!imageName) {
    return NextResponse.json({ error: "Image name is required" }, { status: 400 })
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(imageName)

  if (!data?.publicUrl) {
    return NextResponse.json({ error: "Failed to get image URL" }, { status: 404 })
  }

  return NextResponse.json({ url: data.publicUrl })
}