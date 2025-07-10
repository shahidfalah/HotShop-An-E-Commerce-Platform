// src/_components/ui/DeleteConfirmationModal.tsx
"use client";

import React from 'react';
import { Button } from "@/_components/ui/button";
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean; // To show loading state on confirm button
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isConfirming = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12121275] bg-opacity-50 p-4">
      <div className="bg-(--color-background) rounded-lg shadow-xl w-full max-w-sm p-6 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-(--color-font) mb-3">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>

        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isConfirming}
            className="border-0 bg-[#d0d0d0] text-(--color-muted) hover:bg-(--color-disabled) hover:text-(--color-font) transition-colors"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700 transition-colors"
            disabled={isConfirming}
          >
            {isConfirming ? 'Deleting...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
