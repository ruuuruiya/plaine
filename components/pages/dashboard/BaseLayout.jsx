"use client"

import React, { useEffect, useRef, useState } from 'react'
import SidebarMenu from './SidebarMenu';
import TopMenu from './TopMenu';

const BaseLayout = ({ user, children }) => {

    const [openSidebarMobile, setOpenSidebarMobile] = useState(false);
    const [openSidebarDesktop, setOpenSidebarDesktop] = useState(true);

    // Retain Sidebar Open
    useEffect(() => {
        const savedState = localStorage.getItem('sidebarStateDesktop');
        savedState === 'closed' ? setOpenSidebarDesktop(false) : setOpenSidebarDesktop(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebarStateDesktop', openSidebarDesktop ? 'open' : 'closed');
    }, [openSidebarDesktop]);

    return (
        <>
            <div className="overflow-hidden flex w-full">

                {/* Main Content */}
                <div className={`flex flex-col justify-between h-dvh w-full ${openSidebarDesktop && "md:ml-64"} transition-all duration-300 ease-in-out delay-0`}>

                    {/* Top Bar */}
                    <TopMenu user={user} openSidebarDesktop={openSidebarDesktop} setOpenSidebarDesktop={setOpenSidebarDesktop} openSidebarMobile={openSidebarMobile} setOpenSidebarMobile={setOpenSidebarMobile} />

                    {/* Main Page Content */}
                    <section className='h-full overflow-y-auto'>
                        { children }
                    </section>

                </div>

                {/* Sidebar Desktop */}
                <div className={`hidden ${openSidebarDesktop && "md:flex"} fixed flex-col h-dvh w-64 p-3 bg-white border-r-2 border-dark-600`}>
                    <SidebarMenu setOpenSidebarMobile={setOpenSidebarMobile} />
                </div>

            </div>

            {/* Sidebar Mobile */}
            <div className="z-20 fixed inset-0 pointer-events-none">
                <div className="block md:hidden pointer-events-auto">

                    {/* Overlay */}
                    { openSidebarMobile && <div onClick={() => setOpenSidebarMobile(false)} className="absolute inset-0 bg-black/70"></div> }

                    {/* Sidebar */}
                    <div className={`md:hidden ${openSidebarMobile ? "translate-x-0" : "-translate-x-full"} flex flex-col h-dvh w-64 p-3 bg-white absolute top-0 bottom-0 transition-transform duration-300 ease-in-out delay-0`}>
                        <SidebarMenu setOpenSidebarMobile={setOpenSidebarMobile} />
                    </div>

                </div>
            </div>
        </>
    )
}

export default BaseLayout
