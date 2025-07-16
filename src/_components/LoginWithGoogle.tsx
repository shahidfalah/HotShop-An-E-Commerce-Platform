"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import GoogleIcon from "../../public/google-icon.svg"

const LoginWithGoogle = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const handleGoogleSignIn = async () => {
        // Pass the determined callbackUrl to the signIn function
        await signIn("google", { callbackUrl: callbackUrl });
    };

    return (
        <button
            onClick={handleGoogleSignIn}
            className="mt-4 bg-(--color-bg-of-icons) px-4 py-2 rounded w-full hover:bg-(--color-bg-of-icons-hover) transition-colors flex items-center justify-center gap-2"
        >
            <span className="font-bold flex items-center justify-center gap-2">
                <Image
                    src={GoogleIcon}
                    alt="Google Icon"
                    width={20}
                    height={20}
                    priority
                />
                Continue with Google
            </span>
        </button>
    );
}

export default LoginWithGoogle;
