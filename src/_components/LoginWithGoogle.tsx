"use client";

import { signIn } from "next-auth/react";
import Image from "next/image"; // Import Next.js Image component
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import GoogleIcon from "../../public/google-icon.svg"

const LoginWithGoogle = () => {
    const searchParams = useSearchParams();
    // Get the callbackUrl from the URL parameters, default to homepage if not present
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const handleGoogleSignIn = async () => {
        // Pass the determined callbackUrl to the signIn function
        await signIn("google", { callbackUrl: callbackUrl });
    };

    return (
        <button
            onClick={handleGoogleSignIn} // Call the new handler
            className="mt-4 bg-(--color-bg-of-icons) px-4 py-2 rounded w-full hover:bg-(--color-bg-of-icons-hover) transition-colors flex items-center justify-center gap-2"
        >
            <span className="font-bold flex items-center justify-center gap-2">
                <Image
                    src={GoogleIcon} // Use Next.js Image component with static asset path
                    alt="Google Icon"
                    width={20} // Specify width
                    height={20} // Specify height
                    priority // Prioritize loading for LCP
                />
                Continue with Google
            </span>
        </button>
    );
}

export default LoginWithGoogle;
