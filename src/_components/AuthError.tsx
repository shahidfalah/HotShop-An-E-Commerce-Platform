// components/AuthError.tsx
"use client";

import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  OAuthAccountNotLinked: "Account exists with another login method.",
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  return (
    <div className="text-red-500 text-sm mt-2">
      {errorMessages[error] || "Something went wrong. Please try again."}
    </div>
  );
}
