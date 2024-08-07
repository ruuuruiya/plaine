"use client"

import React from 'react'

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import horizontalLoop from '../helpers/horizontalLoop';
import Image from 'next/image';

const RIGHT_REVIEW = [
    { id: 1, name: "Jennifer Thompson", tag: "@jen_t", profile: "/assets/images/reviews/girl1.jpg", message: `Plaine's AI Health Consult has been an absolute lifesaver. The 24/7 medical insights are incredibly helpful! 🌟` },
    { id: 2, name: "David Miller", tag: "@dave_m", profile: "/assets/images/reviews/boy1.jpg", message: `The personalized recommendations from Plaine have made a huge difference in my diet and exercise routine.` },
    { id: 3, name: "Sarah Jackson", tag: "@sjackson", profile: "/assets/images/reviews/girl2.jpg", message: `Plaine's Health Status Monitor keeps me informed and motivated. Highly recommended! 👍` },
    { id: 4, name: "Kevin Roberts", tag: "@kevin_r", profile: "/assets/images/reviews/boy2.jpg", message: `I've tried several health apps, but Plaine's Medicine Tracker stands out for its simplicity and effectiveness. Kudos! 👏` },
    { id: 5, name: "Emily Davis", tag: "@em_davis", profile: "/assets/images/reviews/girl3.jpg", message: `Plaine's Medical Report Analysis has streamlined my health management significantly.` },
    { id: 6, name: "Jason Adams", tag: "@jasonA", profile: "/assets/images/reviews/boy3.jpg", message: `Plaine's AI-powered health insights have exceeded our expectations. They truly understand our needs.` },
    { id: 7, name: "Jessica White", tag: "@jess_w", profile: "/assets/images/reviews/girl4.jpg", message: `Plaine's personalized health approach sets them apart. They genuinely care about their users' wellbeing 🚀.` },
];

const LEFT_REVIEW = [
    { id: 1, name: "Amanda Parker", tag: "@amandap", profile: "/assets/images/reviews/girl5.jpg", message: `I've been blown away by the level of health insights from Plaine 🚀 The AI Health Consult is a game-changer!` },
    { id: 2, name: "Tyler Johnson", tag: "@tyler_j", profile: "/assets/images/reviews/boy4.jpg", message: `The user interface of Plaine's Medicine Tracker is so intuitive, it's like second nature to use it. 👌` },
    { id: 3, name: "Natalie Brown", tag: "@nat_b", profile: "/assets/images/reviews/girl6.jpg", message: `Plaine has revolutionized my health routine. The personalized recommendations are spot on! 💼` },
    { id: 4, name: "Ryan Smith", tag: "@ryanS", profile: "/assets/images/reviews/boy5.jpg", message: `Kudos to Plaine for their innovative health solutions. The Health Status Monitor is fantastic! 🌟` },
    { id: 5, name: "Sophie Williams", tag: "@sophie_w", profile: "/assets/images/reviews/girl7.jpg", message: `Using Plaine's Medical Report Analysis feels like having a personal doctor. It's that good! 💪` },
    { id: 6, name: "Matthew Davis", tag: "@matt_d", profile: "/assets/images/reviews/boy6.jpg", message: `We've tried other health apps, but nothing compares to the reliability and efficiency of Plaine. 👍` },
    { id: 7, name: "Emma Martinez", tag: "@emma_m", profile: "/assets/images/reviews/girl8.jpg", message: `Plaine understands our health needs like no other app. Their personalized approach is a game-changer! 🎮` },
];

const Review = () => {

    useGSAP(() => {
        // Slide Right
        const slidesRight = gsap.utils.toArray('.slideRight');
        const timelineRight = horizontalLoop(slidesRight, {
            speed: 1,
            repeat: -1,
            paddingRight: 20,
            reversed: true,
        });

        slidesRight.forEach(slide => {
            slide.addEventListener("mouseenter", () => gsap.to(timelineRight, {timeScale: 0, overwrite: true}));
            slide.addEventListener("mouseleave", () => gsap.to(timelineRight, {
                timeScale: -1,
                overwrite: true
            }));
        });

        // Slide Left
        const slidesLeft = gsap.utils.toArray('.slideLeft');
        const timelineLeft = horizontalLoop(slidesLeft, {
            speed: 1,
            repeat: -1,
            paddingRight: 20,
            reversed: false,
        });

        slidesLeft.forEach(slide => {
            slide.addEventListener("mouseenter", () => gsap.to(timelineLeft, { timeScale: 0, overwrite: true}));
            slide.addEventListener("mouseleave", () => gsap.to(timelineLeft, {
                timeScale: 1,
                overwrite: true
            }));
        });
    });


    return (
        <div id='about' className="bg-dot-black/35 w-full flex flex-col items-center relative ">
            <div className="max-w-[70rem] w-full flex flex-col py-14 px-5 relative">

                {/* Title */}
                <div className="flex flex-col gap-2 mb-10">
                    <h3 className='text-3xl font-bold text-center'>WHAT THEY SAY</h3>
                    <p className='text-neutral-500 text-center'>ABOUT US</p>
                </div>

                <div className="max-w-[90rem] w-full flex -translate-x-96 overflow- mb-5 z-10">
                    <div className="flex gap-5 w-[calc(384*7)]">
                        {
                            RIGHT_REVIEW.map((user) => (
                                <div key={user.id} className="slideRight hover:bg-white/75 w-96 h-48 flex flex-col gap-4 rounded-lg bg-white border p-5 text-black">
                                    <div className="flex gap-3 items-center">
                                        <Image src={user.profile} width={40} height={40} alt='profile' className='rounded-full' />
                                        <div className="flex flex-col">
                                            <span className='font-medium'>{user.name}</span>
                                            <span className='font-medium text-neutral-400 text-xs'>{user.tag}</span>
                                        </div>
                                    </div>
                                    <p className='line-clamp-4 break-words'>{user.message}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="max-w-[90rem] w-full flex -translate-x-[30rem] overflow-  ">
                    <div className="flex gap-5 w-[calc(320*7)] ">
                        {
                            LEFT_REVIEW.map((user) => (
                                <div key={user.id} className="slideLeft hover:bg-white/75 w-96 h-48 flex flex-col gap-4 rounded-lg bg-white border p-5 text-black">
                                    <div className="flex gap-3 items-center">
                                        <Image src={user.profile} width={40} height={40} alt='profile' className='rounded-full' />
                                        <div className="flex flex-col">
                                            <span className='font-medium'>{user.name}</span>
                                            <span className='font-medium text-neutral-400 text-xs'>{user.tag}</span>
                                        </div>
                                    </div>
                                    <p className='line-clamp-4 break-words'>{user.message}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>


                {/* Overlay */}
                <h4 className='font-extrabold text-neutral-400 opacity-20 text-9xl absolute top-20 select-none'>WHY US</h4>

            </div>
        </div>
    )
}

export default Review
