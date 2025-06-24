"use client";
import { signIn } from "next-auth/react";

const FormOnSubmit = ({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "login" | "signup";
}) => {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (mode === "signup") {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error("Signup failed:", await res.text());
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/",
    });

    if (!result?.ok) {
      console.error("Login failed:", result);
    }
  }

  return <form onSubmit={handleSubmit}>{children}</form>;
};

export default FormOnSubmit;
