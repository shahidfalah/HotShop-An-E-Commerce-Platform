// src/_components/account/LogoutButton.tsx
"use client";

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import AccountItem from "@/_components/account/AccountItem"; // Reusing AccountItem for consistent styling

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/" }); // Redirect to homepage after logout
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false); // Reset state if logout fails
    }
  };

  return (
    <AccountItem
      icon="LogOut"
      title={isLoggingOut ? "Logging out..." : "Log Out"}
      subtitle="Securely sign out"
      onClick={handleLogout}
      variant="danger"
    />
  );
}
