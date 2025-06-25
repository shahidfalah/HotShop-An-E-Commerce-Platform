"use client"

import type React from "react"

interface AccountSectionProps {
  title: string
  children: React.ReactNode
}

export default function AccountSection({ title, children }: AccountSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-font mb-4 px-1">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
