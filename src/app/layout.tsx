import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/_components/Header";
import Footer from "@/_components/Footer";
import { SessionProvider } from "next-auth/react";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'], // or other subsets as needed
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
      <body
        className={` ${plusJakartaSans} antialiased`}
      >
         <SessionProvider>
          <Header/>
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
