// src/app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/_components/Header";
import Footer from "@/_components/Footer";
import { Providers } from "@/_components/providers"; // Assuming Providers wraps AuthProvider and Toaster
import React, { Suspense } from 'react'; // Import React and Suspense
import { Toaster } from "react-hot-toast"; // Import Toaster directly if Providers doesn't render it

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "HotShop",
  description: "E-Commerce platform for flash sales",
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` ${plusJakartaSans.className} antialiased`}> {/* Corrected font class usage */}
        <Providers>
          <Header/>
          {children}
          <Footer />
          {/* Lazy load Toaster for better performance */}
          {/* Assuming Toaster is rendered here or within Providers. If Providers renders Toaster internally,
              you might need to modify Providers component to use Suspense for Toaster.
              For now, placing it directly here as a common pattern. */}
          <Suspense fallback={null}>
            <Toaster position="bottom-right" />
          </Suspense>
        </Providers>
        {/* Load ColorThief script asynchronously to avoid blocking the main thread.
            Only include this if you are actively using ColorThief. */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.4.0/color-thief.min.js" async defer></script>
      </body>
    </html>
  );
}
