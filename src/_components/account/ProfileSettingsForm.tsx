/* eslint-disable @typescript-eslint/no-explicit-any */
// src/_components/account/ProfileSettingsForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import Image from 'next/image';
import { toast } from 'react-hot-toast'; // For notifications
import { Loader2 } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface ProfileSettingsFormProps {
  initialProfile: UserProfile;
  // Optional callback to notify parent (e.g., to revalidate session if needed)
  onProfileUpdated?: () => void;
}

export default function ProfileSettingsForm({ initialProfile, onProfileUpdated }: ProfileSettingsFormProps) {
  const [formData, setFormData] = useState({
    name: initialProfile.name || '',
    email: initialProfile.email || '',
    image: initialProfile.image || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update form data if initialProfile changes (e.g., user logs in/out)
  useEffect(() => {
    setFormData({
      name: initialProfile.name || '',
      email: initialProfile.email || '',
      image: initialProfile.image || '',
    });
  }, [initialProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      const result = await response.json();
      setSuccessMessage(result.message || 'Profile updated successfully!');
      toast.success(result.message || 'Profile updated successfully!');
      if (onProfileUpdated) {
        onProfileUpdated(); // Trigger parent callback
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-(--color-font) mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-(--color-primary) shadow-md">
            <Image
              src={formData.image || "/defaultProfileImage.jpeg"}
              alt="Profile Picture"
              fill
              className="object-cover"
              sizes="96px"
              onError={(e) => {
                e.currentTarget.src = "/defaultProfileImage.jpeg"; // Fallback on error
              }}
            />
          </div>
          <Input
            id="image"
            name="image"
            type="text"
            value={formData.image}
            onChange={handleChange}
            placeholder="Enter image URL (e.g., from Gravatar, Imgur)"
            className="w-full max-w-md bg-(--color-background) border-(--color-border) text-(--color-font)"
          />
          <p className="text-sm text-gray-500">You can use a direct image URL for your profile picture.</p>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-(--color-font)">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="bg-(--color-background) border-(--color-border) text-(--color-font)"
          />
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-(--color-font)">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            className="bg-(--color-background) border-(--color-border) text-(--color-font)"
          />
        </div>

        {error && (
          <div className="bg-(--color-error-bg) text-(--color-error) border border-(--color-error) p-3 rounded-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-(--color-success-bg) text-(--color-success) border border-(--color-success) p-3 rounded-md">
            {successMessage}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-(--color-primary) text-white hover:bg-(--color-primary-hover) py-2.5 rounded-md text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </div>
  );
}
