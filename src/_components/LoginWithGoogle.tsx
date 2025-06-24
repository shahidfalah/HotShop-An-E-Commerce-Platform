/* eslint-disable @next/next/no-img-element */
"use client";

import { signIn } from "next-auth/react";

const LoginWithGoogle = () => {

    return (
        <button
            onClick={() => signIn("google")}
            className="mt-4 bg-(--color-bg-of-icons) px-4 py-2 rounded w-full hover:bg-(--color-bg-of-icons-hover) transition-colors flex items-center justify-center gap-2"
        >
            <span className="font-bold flex items-center justify-center gap-2">
                <img src="/google-icon.svg" alt="Google Icon" />
                Continue with Google
            </span>
        </button>
    );
}

export default LoginWithGoogle;