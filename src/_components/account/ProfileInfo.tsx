"use client"

import { User } from "lucide-react"
import Image from "next/image"

interface ProfileInfoProps {
  user: {
    name: string
    email: string
    image?: string
    role?: string
  }
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-custom mb-6">
      <div className="flex items-center space-x-4">
        {/* Profile Image */}
        <div className="relative">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-(--color-bg-of-icons) rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
          )}
          {/* Online Status Indicator */}
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-(--color-success) rounded-full border-2 border-white"></div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-font mb-1">{user.name}</h2>
          <p className="text-muted text-sm mb-2">{user.email}</p>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-soft">
            <span className="text-primary text-xs font-medium">{user.role || "Premium Member"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
