"use client"

import Link from "next/link";
import Image from "next/image";
import { useState } from 'react';
import { signOut } from "next-auth/react";

const Navbar = ({ user }) => {

    const [open, setOpen] = useState(false);

    return (
        <header>
            <div className="fixed w-full flex justify-center items-center bg-white z-[9999]">
                <div className="flex justify-between items-center max-w-7xl w-full h-20 p-5">

                    {/* Logo */}
                    <Link href={"/"} onClick={() => setOpen(false)} className="flex items-center gap-3 ">
                        <Image src={"/assets/images/logo_black_transparent.png"} alt="logo" width={100} height={100} className="w-10" />
                        <h2 className="text-xl font-bold">{"PLAINE"}</h2>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-8 items-center">
                        <Menus setOpen={setOpen} />
                        { user ? (
                            <ProfileMenu user={user} />
                        ) : (
                            <Link href={"/login"} onClick={() => setOpen(false)} className="border border-neutral-400 font-medium px-5 text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 py-2 rounded-md duration-300">Sign In</Link>
                        )}
                    </nav>

                    {/* Mobile Navigation */}
                    <div className="md:hidden flex items-center gap-3">
                        { !user && <Link href={"/login"} onClick={() => setOpen(false)} className="font-medium px-5 text-center py-2 rounded-md border border-neutral-400 hover:bg-neutral-100 hover:scale-105 active:scale-95 duration-300">Sign In</Link> }

                        <div onClick={() => setOpen(!open)} className="md:hidden cursor-pointer">
                            { open ?
                                <svg width="25" height="25" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                :
                                <svg width="25" height="25" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4C2.22386 4 2 4.22386 2 4.5C2 4.77614 2.22386 5 2.5 5H12.5C12.7761 5 13 4.77614 13 4.5C13 4.22386 12.7761 4 12.5 4H2.5ZM2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5ZM2 10.5C2 10.2239 2.22386 10 2.5 10H12.5C12.7761 10 13 10.2239 13 10.5C13 10.7761 12.7761 11 12.5 11H2.5C2.22386 11 2 10.7761 2 10.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            }
                        </div>

                        { user && <ProfileMenu user={user} /> }
                    </div>

                </div>
            </div>

            {/* Hamburger Menu */}
            <nav className={`fixed z-[9998] md:hidden flex flex-col gap-5 p-5 w-full bg-white border-b border-neutral-300 ${ open ? "translate-y-0 top-20" : "-translate-y-full top-0"} transition-transform duration-300 ease-in-out delay-0`}>
                <Menus setOpen={setOpen} />

                { user ? (
                    <Link href={"/dashboard"} onClick={() => setOpen(false)} className="border border-neutral-400 font-medium text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 duration-300 py-3 rounded-md">Dashboard</Link>
                ) : (
                    <Link href={"/login"} onClick={() => setOpen(false)} className="border border-neutral-400 font-medium text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 py-3 rounded-md duration-300">Sign In</Link>
                )}
            </nav>
        </header>
    )
}

export default Navbar;

const Menus = ({ setOpen }) => {
    return (
        <>
            <Link href={"/"} onClick={() => setOpen(false)} className="hover:text-gray-500">Home</Link>
            <Link href={"#services"} onClick={() => setOpen(false)} className="hover:text-gray-500">Services</Link>
            <Link href={"#about"} onClick={() => setOpen(false)} className="hover:text-gray-500">About Us</Link>
            <Link href={"#contact"} onClick={() => setOpen(false)} className="hover:text-gray-500">Contact</Link>
        </>
    )
};

const ProfileMenu = ({ user }) => {
    return (
        <div className="dropdown cursor-pointer dropdown-end">
            <Image tabIndex={0} src={user?.image || "/assets/icons/default_pfp.png"} alt="profile" width={100} height={100} className="rounded-full aspect-square w-10 border border-neutral-300"/>
            <ul tabIndex={0} className="dropdown-content menu z-[1] p-2 shadow mt-2 rounded-md bg-white  border w-40">
                <li onClick={() => document?.activeElement?.blur()} className=''>
                    <Link href={"/dashboard"} className="flex gap-3">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.30902 1C2.93025 1 2.58398 1.214 2.41459 1.55279L1.05279 4.27639C1.01807 4.34582 1 4.42238 1 4.5V13C1 13.5523 1.44772 14 2 14H13C13.5523 14 14 13.5523 14 13V4.5C14 4.42238 13.9819 4.34582 13.9472 4.27639L12.5854 1.55281C12.416 1.21403 12.0698 1.00003 11.691 1.00003L7.5 1.00001L3.30902 1ZM3.30902 2L7 2.00001V4H2.30902L3.30902 2ZM8 4V2.00002L11.691 2.00003L12.691 4H8ZM7.5 5H13V13H2V5H7.5ZM5.5 7C5.22386 7 5 7.22386 5 7.5C5 7.77614 5.22386 8 5.5 8H9.5C9.77614 8 10 7.77614 10 7.5C10 7.22386 9.77614 7 9.5 7H5.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        <div>Dashboard</div>
                    </Link>
                </li>

                <li>
                    <div onClick={() => signOut({ callbackUrl: "/" })} className="flex gap-3 text-red-500">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 1C2.44771 1 2 1.44772 2 2V13C2 13.5523 2.44772 14 3 14H10.5C10.7761 14 11 13.7761 11 13.5C11 13.2239 10.7761 13 10.5 13H3V2L10.5 2C10.7761 2 11 1.77614 11 1.5C11 1.22386 10.7761 1 10.5 1H3ZM12.6036 4.89645C12.4083 4.70118 12.0917 4.70118 11.8964 4.89645C11.7012 5.09171 11.7012 5.40829 11.8964 5.60355L13.2929 7H6.5C6.22386 7 6 7.22386 6 7.5C6 7.77614 6.22386 8 6.5 8H13.2929L11.8964 9.39645C11.7012 9.59171 11.7012 9.90829 11.8964 10.1036C12.0917 10.2988 12.4083 10.2988 12.6036 10.1036L14.8536 7.85355C15.0488 7.65829 15.0488 7.34171 14.8536 7.14645L12.6036 4.89645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        <div className=" ">Sign out</div>
                    </div>
                </li>
            </ul>
        </div>
    )
};
