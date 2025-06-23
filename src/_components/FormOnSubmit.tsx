"use client";

import { signIn } from "next-auth/react"

const FormOnSubmit = (props: {
    children: React.ReactNode;
    }) => {

    const { children } = props;

        async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/"
        })
    }
    
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleLogin(e);
            }}
        >
        {children}
        </form>
    );
}

export default FormOnSubmit;