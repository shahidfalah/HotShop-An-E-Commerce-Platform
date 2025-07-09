// src/_components/ui/AccountItem.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react'; // Import all Lucide icons
import { type LucideProps } from 'lucide-react'; // Import LucideProps for typing

interface AccountItemProps {
  icon: string; // Changed type to string (the name of the Lucide icon)
  title: string;
  subtitle?: string;
  count?: number;
  path?: string;
  onClick?: () => void;
  variant?: "default" | "danger";
}

export default function AccountItem({
  icon, // Now icon is a string
  title,
  subtitle,
  count,
  path,
  onClick,
  variant = "default",
}: AccountItemProps) {
  const isLogout = variant === "danger";

  // Basic validation: ensure at least one of path or onClick is provided
  if (!path && !onClick) {
    console.error("AccountItem: Either 'path' or 'onClick' prop must be provided.");
    return null;
  }
  if (path && onClick) {
    console.warn("AccountItem: Both 'path' and 'onClick' props were provided. 'onClick' will take precedence.");
  }

  // Dynamically get the Lucide icon component based on the string name
  const IconComponent = icon
    ? (LucideIcons[icon as keyof typeof LucideIcons] as React.ElementType<LucideProps>)
    : null;

  const itemClasses = `
    w-full flex items-center justify-between p-4 rounded-xl shadow-custom transition-custom
    ${isLogout
      ? "bg-surface hover:bg-error-bg active:scale-[0.98]"
      : "bg-surface hover:shadow-lg active:scale-[0.98]"
    }
    border border-(--color-border)
  `;

  const itemContent = (
    <>
      <div className="flex items-center space-x-4">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-custom ${
            isLogout ? "bg-(--color-bg-of-icons)" : "bg-(--color-bg-of-icons) hover:bg-(--color-bg-of-icons-hover)"
          }`}
        >
          {IconComponent ? (
            <IconComponent className={`w-6 h-6 ${isLogout ? "text-(--color-error)" : "text-(--color-primary)"}`} />
          ) : (
            // Fallback icon if the provided icon name doesn't match a Lucide icon
            <LucideIcons.HelpCircle className={`w-6 h-6 ${isLogout ? "text-(--color-error)" : "text-(--color-primary)"}`} />
          )}
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
    </>
  );

  // If onClick is provided, it takes precedence and renders a button
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={itemClasses}>
        {itemContent}
      </button>
    );
  } else if (path) {
    // If only path is provided, render a Link
    return (
      <Link href={path} className={itemClasses}>
        {itemContent}
      </Link>
    );
  }

  return null;
}
