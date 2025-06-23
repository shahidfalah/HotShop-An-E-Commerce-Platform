import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "@/styles/globals.css"
import Header from "@/_components/Header"
import Footer from "@/_components/Footer"
import { Providers } from "@/_components/providers"

const plusJakartaSans = Plus_Jakarta_Sans()

export const metadata: Metadata = {
  title: "HotShop",
  description: "E-Commerce platform for flash sales",
  icons: {
    icon: "/logo.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.className} antialiased`}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
