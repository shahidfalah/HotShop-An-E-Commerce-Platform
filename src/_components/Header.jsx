"use client";

import React from 'react';

import { useEffect } from 'react';
import { useState } from 'react';

import { useSession } from "next-auth/react";

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Heart, User, Search, Menu, X } from 'lucide-react';
import Link from 'next/link'

const navigationLinks = [
  { name: "Home", href: "/", active: true },
  { name: "Flash Sale", href: "/flash-sale", active: false },
  { name: "Categories", href: "/categories", active: false },
  { name: "New Arrivals", href: "#new-arrivals", active: false },
]

const Header = () => {
    const [browserWidth, setBrowserWidth] = React.useState(0);
    // const session = await getServerSession(authOptions);

    useEffect(() => {
        // Set initial width
        setBrowserWidth(window.innerWidth)

        // Add event listener for window resize
        const handleResize = () => {
            setBrowserWidth(window.innerWidth)
        }

        window.addEventListener("resize", handleResize)

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    if (browserWidth < 768) {
        return (
            <NavBarMobile />
        );
    } else if (browserWidth >= 768) {
        return (
            <NavBarDesktop/>
        );
    }
}

const NavBarDesktop = () => {
    return (
        <nav className="text-(--color-font) flex justify-between items-center px-[40px] py-[12px] border-b border-gray-200">
            <div className="container mx-auto flex items-center gap-[32px]">
                <div className="flex items-center space-x-2">
                    <img src="/logo.svg" alt="logo-HotShop" />
                    <h1 className=" text-2xl">HotShop</h1>
                </div>
                <ul className="flex gap-[36px]">
                    {navigationLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className={`font-medium py-2 transition-colors hover:text-(--color-primary) ${
                            link.active ? "text-(--color-primary)" : "text-(--color-font)"
                            }`}
                        >
                            {link.name}
                        </a>
                        ))}
                </ul>
            </div>
            <MetaNav/>
        </nav>
    )
}

const NavBarMobile = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    return (
        <nav className="bg-white text-(--color-font) border-b border-gray-200 sticky top-0 z-50 border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <img src="/logo.svg" alt="logo-HotShop" />
                        <h1 className=" text-2xl">HotShop</h1>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center space-x-4">
                        {/* <Button variant="ghost" size="sm" className="hidden md:flex">
                            <Heart className="w-5 h-5" />
                        </Button> */}
                        <Button variant="ghost" size="sm" className="relative">
                            <img className='p-2 bg-[#F5F2F0]' src="/bagIcon.svg" alt="bag-icon" />
                            {/* <ShoppingCart className="w-5 h-5" /> */}
                            <span className="absolute -top-1 -right-[1px] bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                2
                            </span>
                        </Button>
                        <Button variant="ghost" size="sm" className="hidden md:flex">
                            <User className="w-5 h-5" />
                            <span className="ml-1 text-sm">Login/Sign Up</span>
                        </Button>

                        {/* Mobile Menu Button */}
                        <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                <div className="md:hidden py-4 border-t border-gray-200">
                    <div className="flex flex-col space-y-4">
                        {/* Mobile Search */}
                        <div className="relative">
                            <Input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="flex flex-col space-y-2">
                            {navigationLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium py-2 transition-colors hover:text-red-500 ${
                                link.active ? "text-red-500" : "text-gray-700"
                                }`}
                            >
                                {link.name}
                            </a>
                            ))}
                        </nav>

                        {/* Mobile Actions */}
                        {/* <div className="flex items-center space-x-4 pt-2">
                            <Button variant="ghost" size="sm">
                            <Heart className="w-5 h-5 mr-2" />
                            Wishlist
                            </Button>
                            <Button variant="ghost" size="sm">
                            <User className="w-5 h-5 mr-2" />
                            Login
                            </Button>
                        </div> */}
                        <MetaNav />
                    </div>
                </div>
                )}
            </div>
        </nav>
    )
}

const MetaNav =  () => {
    const { data: session, status } = useSession();
    if (status=== "unauthenticated" || status === "loading") {
        return (
            <Link href="/login" className="text-(--color-primary) hover:text-(--color-primary-hover) font-bold border-2 border-(--color-primary) hover:border-(--color-primary-hover) px-[16px] py-[8px] rounded-[8px]">Login/SignUP</Link>
        );
    } else if (status=== "authenticated") {
        return (
            <div className="flex items-center gap-4">
                <div className='flex items-center gap-2'>
                    <img className='icon-style' src="/wishIcon.svg" alt="wish-list-icon" />
                    <img className='icon-style' src="/bagIcon.svg" alt="bag-icon" />
                </div>
                {/* <img src={session.img} alt="" /> */}
            </div>
        )
    }
}


export default Header;
