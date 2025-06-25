"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

interface AccountItemProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  count?: number
  onClick: () => void
  variant?: "default" | "danger"
}

export default function AccountItem({
  icon: Icon,
  title,
  subtitle,
  count,
  onClick,
  variant = "default",
}: AccountItemProps) {
  const isLogout = variant === "danger"

  return (
    <button
      onClick={onClick}
      className={`w-full bg-surface rounded-xl p-4 shadow-custom transition-custom hover:shadow-lg active:scale-[0.98] ${
        isLogout ? "hover:bg-error-bg" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-custom ${
              isLogout ? "bg-(--color-bg-of-icons)" : "bg-(--color-bg-of-icons) hover:bg-(--color-bg-of-icons-hover)"
            }`}
          >
            <Icon className={`w-6 h-6 ${isLogout ? "text-(--color-error)" : "text-(--color-primary)"}`} />
          </div>

          {/* Content */}
          <div className="text-left">
            <h3 className={`font-medium ${isLogout ? "text-(--color-error) hover:underline" : "text-font"}`}>{title}</h3>
            {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2">
          {count !== undefined && (
            <div className="bg-primary-soft px-2 py-1 rounded-full">
              <span className="text-primary text-sm font-medium">{count}</span>
            </div>
          )}
          {!isLogout && <ChevronRight className="w-5 h-5 text-muted" />}
        </div>

      </div>
    </button>
  )
}
