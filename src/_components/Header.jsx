"use client";

import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from "next-auth/react";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

const NavLinks = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    
    const [navigationLinks, setNavigationLinks] = useState([
        { name: "Home", href: "/", active: false, available: true },
        { name: "Products", href: "/products", active: false, available: true },
        { name: "Categories", href: "/#categories", active: false, available: true },
        { name: "New Arrivals", href: "/#new-arrivals", active: false, available: true },
        { name: "Admin", href: "/admin", active: false, available: false },
    ]);

    useEffect(() => {
        if (session?.user?.role === "ADMIN") {
            setNavigationLinks(prev =>
                prev.map(link =>
                    link.name === "Admin" ? { ...link, available: true } : link
                )
            );
        }
    }, [session]);

    // Update active state based on current route
    useEffect(() => {
        setNavigationLinks(prevLinks =>
            prevLinks.map(link => ({
                ...link,
                active: pathname === link.href || 
                       (link.href !== '/' && pathname.startsWith(link.href))
            }))
        );
    }, [pathname]);

    return (
        <>
            {navigationLinks.map((nav) => (
                nav.available && (
                    <Link
                        key={nav.name}
                        href={nav.href}
                        className={`text-sm font-medium py-2 transition-colors hover:text-(--color-primary) ${
                            nav.active ? "text-(--color-primary)" : "text-(--color-font)"
                        }`}
                    >
                        {nav.name}
                    </Link>
                )
            ))}
        </>
    );
};

const Header = () => {
    return (
        <header>
            <nav className='block md:hidden'>
                <NavBarMobile />
            </nav>
            <nav className='hidden md:block'>
                <NavBarDesktop />
            </nav>
        </header>
    );
};

const NavBarDesktop = () => {
    return (
        <div className="text-(--color-font) flex justify-between items-center px-[40px] py-[12px] border-b border-gray-200">
            <div className="container mx-auto flex items-center gap-[32px]">
                <div className="flex items-center space-x-2">
                    <Image src="/logo.svg" alt="logo-HotShop" width={32} height={32}/>
                    <h1 className="text-2xl">HotShop</h1>
                </div>
                <ul className="flex gap-[36px]">
                    <NavLinks />
                </ul>
            </div>
            <MetaNav/>
        </div>
    );
};

const NavBarMobile = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";
    const [cartItemCount, setCartItemCount] = useState(0); // State for mobile cart count

    const fetchCartCount = useCallback(async () => {
        if (isAuthenticated) {
            try {
                const response = await fetch("/api/cart");
                if (response.ok) {
                    const items = await response.json();
                    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
                    setCartItemCount(totalCount);
                } else {
                    console.error("Failed to fetch mobile cart count:", response.statusText);
                    setCartItemCount(0);
                }
            } catch (error) {
                console.error("Error fetching mobile cart count:", error);
                setCartItemCount(0);
            }
        } else {
            setCartItemCount(0);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);
    
    return (
        <div className="bg-white text-(--color-font) border-b border-gray-200 sticky top-0 z-50 border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Image src="/logo.svg" alt="logo-HotShop" width={23} height={23} />
                        <h1 className="text-2xl">HotShop</h1>
                    </div>

                    {/* Action Icons of Bag-icon*/}
                    <div className="flex items-center space-x-4">                        
                        {isAuthenticated && (
                            <div className='flex items-center gap-2'>
                                <Link className="relative" href="/account">
                                    <Image className='icon-style' src="/wishIcon.svg" alt="wish-list-icon" width={32} height={32}/>
                                    <span className="absolute -top-1 -right-[4px] bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                        2
                                    </span>
                                </Link>
                                <Link className="relative" href="/cart">
                                    <Image className='icon-style' src="/bagIcon.svg" alt="bag-icon" width={32} height={32}/>
                                    <span className="absolute -top-1 -right-[4px] bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                </Link>
                            </div>
                        )}

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
                            <MetaNav />
                            {/* Mobile Navigation */}
                            <div className="flex flex-col space-y-2">
                                <NavLinks />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MetaNav = () => {
    const { data: session, status } = useSession();
    const profileImage = session?.user.image || "/defaultProfileImage.jpeg";
    const userName = session?.user.name || "no-name";
    const isAuthenticated = status === "authenticated";
    const [cartItemCount, setCartItemCount] = useState(0); // State for mobile cart count

    const fetchCartCount = useCallback(async () => {
        if (isAuthenticated) {
            try {
                const response = await fetch("/api/cart");
                if (response.ok) {
                    const items = await response.json();
                    console.log("Cart items:", items)
                    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
                    setCartItemCount(totalCount);
                } else {
                    console.error("Failed to fetch mobile cart count:", response.statusText);
                    setCartItemCount(0);
                }
            } catch (error) {
                console.error("Error fetching mobile cart count:", error);
                setCartItemCount(0);
            }
        } else {
            setCartItemCount(0);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    if (status === "unauthenticated" || status === "loading") {
        return (
            <Link 
                href="/login" 
                className="text-(--color-primary) hover:text-(--color-primary-hover) font-bold text-center border-2 border-(--color-primary) hover:border-(--color-primary-hover) px-[16px] py-[8px] rounded-[8px]"
            >
                Login/SignUp
            </Link>
        );
    } else if (status === "authenticated") {
        return (
            <>
                {/* for desktop */}
                <div className="hidden md:flex items-center gap-4">
                    <div className='flex items-center gap-2'>
                        <Link href="/account">
                            <Image className='icon-style' src="/wishIcon.svg" alt="wish-list-icon" width={40} height={40}/>
                        </Link>
                        <Link className="relative" href="/cart">
                            <Image className='icon-style' src="/bagIcon.svg" alt="bag-icon" width={40} height={40}/>
                            <span className="absolute -top-1 -right-[4px] bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                {cartItemCount}
                            </span>
                        </Link>
                    </div>
                    <Link href="/account">
                        <Image 
                            className="ml-2 rounded-[50%] border border-(--color-bg-of-icons) hover:border-(--color-bg-of-icons-hover)" 
                            src={profileImage} 
                            alt="profile-image" 
                            width={32} 
                            height={32}
                        />
                    </Link>
                </div>
                {/* for mobile */}
                <div className="flex md:hidden items-center gap-2">
                    <Link href="/account">
                        <Image 
                            className="rounded-[50%] border border-(--color-bg-of-icons) hover:border-(--color-bg-of-icons-hover)" 
                            src={profileImage} 
                            alt="profile-image" 
                            width={32} 
                            height={32}
                        />
                    </Link>
                    <h3 className='text-sm'>{userName}</h3>
                </div>
            </>
        );
    }
};

export default Header;