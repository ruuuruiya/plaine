"use client"

import Image from 'next/image'
import React, { useRef } from 'react'
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

const Collab = () => {

    const title = useRef();
    const container = useRef();

    useGSAP(() => {

        gsap.registerPlugin(ScrollTrigger);

        gsap.fromTo(title.current, {
            ease: "bounce.in",
            x: -500,
            opacity: 0
        }, {
            opacity: 1,
            duration: 1,
            x: 0,
            scrollTrigger: {
                trigger: title.current,
                start: "top 80%",
                end: "bottom 80%",
            }
        });

        gsap.from(container.current.children, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power4.inOut",
            stagger: 0.2,
            scrollTrigger: {
                trigger: container.current,
                start: "top 80%",
                end: "bottom 80%",
            }
        });
    })

    return (
        <div className=" bg-dot-black/35 w-full flex flex-col items-center relative">
            <div className="max-w-[70rem] w-full flex flex-col gap-2 py-20 px-5 relative mb-20">

                <div ref={title} className="mb-10 flex flex-col gap-2">
                    <h2 className='font-bold text-3xl'>In Collaboration With</h2>
                    <span className='text-textSecondary max-w-[40rem] '>Thanks to</span>
                </div>

                <div ref={container} className=" w-full z-10 flex justify-center items-center gap-10 flex-col md:flex-row select-none">
                    <Image src={"/assets/icons/1_brand.png"} width={475} height={131} alt='img' className='opacity-25 w-80' />
                    <Image src={"/assets/icons/2_brand.png"} width={475} height={131} alt='img' className='opacity-25 w-80' />
                </div>

                {/* Overlay */}
                <h6 className=' font-extrabold text-neutral-400 opacity-20 text-9xl absolute top-0 -left-20 select-none'>PARTNER</h6>
            </div>
        </div>
    )
}

export default Collab
