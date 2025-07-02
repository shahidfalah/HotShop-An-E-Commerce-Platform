"use client";

import React from 'react';

import { useEffect, useState } from 'react';

import { useSession } from "next-auth/react";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Menu, X } from 'lucide-react';
import Link from 'next/link'
import Image from 'next/image';
import { useRouter } from 'next/navigation';



const NavLinks=({name}) =>{
    const [navigationLinks, setNavigationLinks]=useState([
        { name: "Home", href: "/", active: false, available: true },
        { name: "Flash Sale", href: "/flash-sale", active: false, available: true },
        { name: "Categories", href: "/#categories", active: false, available: true },
        { name: "New Arrivals", href: "/#new-arrivals", active: false, available: true },
        { name: "Admin", href: "/admin", active: false, available: false },
    ])
 
    const { data: session } = useSession();
    useEffect(() => {
    if (session?.user?.role === "ADMIN") {
        setNavigationLinks((prev) =>
            prev.map((link) =>
                link.name === "Admin" ? { ...link, available: true } : link
            )
        );
    }
    }, [session]);

    const router = useRouter();

    function handleTheChangeStyle(){
        setNavigationLinks(
            navigationLinks.map((nav) => ({
                ...nav,
                active: nav.name === name,
            }))
        );
    }

    useEffect(()=>{
        console.log("before",navigationLinks)
        handleTheChangeStyle()
        console.log("after",navigationLinks)
    },[])
    
    return (
        navigationLinks.map((nav)=> (
            nav.available && (
               <Link
                    key={nav.name}
                    href={nav.href}
                    className={`text-sm font-medium py-2 transition-colors hover:text-(--color-primary) ${
                        nav.active ? "text-(--color-primary)" : "text-(--color-font)"
                    }`}
                    onClick={() => {
                        setNavigationLinks(
                        navigationLinks.map((link) => ({
                            ...link,
                            active: link.name === nav.name,
                        }))
                        );
                    }}
                >
                    {nav.name}
                </Link>

            )
        ))
    )
}

const Header = () => {
    return (
        <div>
            <div className='block md:hidden'>
                <NavBarMobile />
            </div>
            <div className='hidden md:block'>
                <NavBarDesktop />
            </div>
        </div>

    )
}

const NavBarDesktop = ()=>{
    return (
        <nav className="text-(--color-font) flex justify-between items-center px-[40px] py-[12px] border-b border-gray-200">
            <div className="container mx-auto flex items-center gap-[32px]">
                <div className="flex items-center space-x-2">
                    <Image src="/logo.svg" alt="logo-HotShop" width={32} height={32}/>
                    <h1 className=" text-2xl">HotShop</h1>
                </div>
                <ul className="flex gap-[36px]">
                    <NavLinks name="Home"/>
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
                        <Image src="/logo.svg" alt="logo-HotShop" width={23} height={23} />
                        <h1 className=" text-2xl">HotShop</h1>
                    </div>

                    {/* Action Icons of Bag-icon*/}
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="relative">
                            <Image className='icon-style' src="/bagIcon.svg" alt="bag-icon" width={32} height={32}/>
                            <span className="absolute -top-1 -right-[-6px] bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                2
                            </span>
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
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg bg-(--color-background)"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="flex flex-col space-y-2">
                            <NavLinks name="Home"/>
                        </nav>

                        {/* Mobile Actions */}
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
    const profileImage = session?.user.image || "/defaultProfileImage.jpeg"; // Fallback image if no profile image is available
    if (status=== "unauthenticated" || status === "loading") {
        return (
            <Link href="/login" className="text-(--color-primary) hover:text-(--color-primary-hover) font-bold text-center border-2 border-(--color-primary) hover:border-(--color-primary-hover) px-[16px] py-[8px] rounded-[8px]">Login/SignUP</Link>
        );
    } else if (status=== "authenticated") {
        return (
            <div className="flex items-center gap-4">
                <div className='flex items-center gap-2'>
                    <Image className='icon-style' src="/wishIcon.svg" alt="wish-list-icon" width={32} height={32}/>
                    <Image className='icon-style' src="/bagIcon.svg" alt="bag-icon" width={32} height={32}/>
                </div>
                <Link href="/account">
                    <Image className="ml-2 rounded-[50%] border border-(--color-bg-of-icons) hover:border-(--color-bg-of-icons-hover)" src={profileImage} alt="profile-image" width={32} height={32}/>
                </Link>
            </div>
        )
    }
}

export default Header;

// function handleChangeStyleNavLink(e,setNavigationLinks,navigationLinks){
//     const ul= document.getElementsByTagName("ul")
//     console.log(ul.innerText)
//     console.log("with in handleChangeStyleNavLink",navigationLinks)
//     console.log("Clicked link:", e.target.innerText);
//     // navigationLinks.forEach((link) => {
//     //     link.active = false;
//     // });
//     const clickedLink = navigationLinks.navigationLinks.find((link) => link.name === e.target.innerText);
//     if (clickedLink) {
//         clickedLink.active = true;
        
//         setNavigationLinks(
//             navigationLinks.navigationLinks.map((nav)=>{
//                 console.log("onckilck",nav)
//                 if(nav.name===e.target.innerText){
//                     nav.active=true
//                 }else {
//                     nav.active=false
//                 }
//             })

//         )
//     }
//     console.log("Updated navigation links:", navigationLinks);
// }


        // navigationLinks.forEach((link) => {
        //     if (link.name === clickedLink.name) {
        //         link.active = true;
        //     }
        // });


// let navigationLinks = [
//   { name: "Home", href: "/", active: true, available: true },
//   { name: "Flash Sale", href: "/flash-sale", active: false, available: true },
//   { name: "Categories", href: "/#categories", active: false, available: true },
//   { name: "New Arrivals", href: "/#new-arrivals", active: false, available: true },
//   { name: "Admin", href: "/admin", active: false, available: false },
// ]

        // setNavigationLinks((prev) => ({
        //     ...prev,
        //     [active]: false,
        // }))

        // setNavigationLinks(
        //     navigationLinks.map((nav)=>{
        //         console.log(nav.name)
        //         if(nav.name===name){
        //             nav.active=true
        //         }else {
        //             nav.active=false
        //         }
        //     })
        // )             

    // if (browserWidth < 768) {
    //     return (
    //         <NavBarMobile navigationLinks={navigationLinks} />
    //     );
    // } else if (browserWidth >= 768) {
    //     return (
    //         <NavBarDesktop navigationLinks={navigationLinks} setNavigationLinks={setNavigationLinks} />
    //     );
    // }    

    // console.log(navigationLinks.navigationLinks)
    // for(let i of navigationLinks.navigationLinks){
    //     console.log(i)
    // }
    // console.log(navigationLinks)
    // console.log("=============================================")
    // navigationLinks.navigationLinks.map((link)=>{ 
    //     console.log("link",link)
    // })


{/*                     
                    {navigationLinks.navigationLinks.map((link,index) => (
                        link.available && (
                            <a
                                id={index}
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium py-2 transition-colors hover:text-(--color-primary) ${
                                link.active ? "text-(--color-primary)" : "text-(--color-font)"
                                }`}
                                onClick={(e) => {
                                    console.log(e)
                                    handleChangeStyleNavLink(e,setNavigationLinks,navigationLinks)
                                }}
                            >
                                {link.name}
                            </a>
                        )
                    ))
                    } */}

    //     props.navigationLinks.setNavigationLinks([

    //     props.navigationLinks.navigationLinks.map((nav)=>{
    //         if(nav.name===props.name){
    //             nav.active=true
    //         }else (
    //             nav.active=false
    //         )
    //     })]
    // ) 


     // let newNav = []
    // for(let i of navigationLinks.navigationLinks){


    //     if(i.name===name){
    //         i.active=true
    //     }else (
    //         i.active=false
    //     )
    //     newNav.push(i)
    // }
    // cons
    // console.log(props.navigationLinks.setNavigationLinks)
    
    // props.navigationLinks.setNavigationLinks([

    //     props.navigationLinks.navigationLinks.map((nav)=>{
    //         if(nav.name===props.name){
    //             nav.active=true
    //         }else (
    //             nav.active=false
    //         )
    //     })]
    // ) 

// link.available && (
                        //     <button onClick={(e) => handleChangeStyleNavLink(e)} key={link.name}
                        //             className={`font-medium py-2 transition-colors hover:text-(--color-primary) ${
                        //             link.active ? "text-(--color-primary)" : "text-(--color-font)"
                        //             }`}
                        //     >
                        //         <a
                        //             href={link.href}
                        //         >
                        //             {link.name}
                        //         </a>
                        //     </button>

                        // )