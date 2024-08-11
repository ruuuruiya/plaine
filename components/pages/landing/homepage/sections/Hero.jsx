"use client";

import { useRef } from "react";
import { gsap } from "gsap/all";
import { useGSAP } from "@gsap/react";
import { TypeAnimation } from "react-type-animation";
import Link from "next/link";
import Image from "next/image";

const Hero = ({ session }) => {

    const obj1 = useRef();
    const obj2 = useRef();

    useGSAP(() => {
        gsap.to(obj1.current, {
            y: -20,
            repeat: -1,
            yoyo: true,
            duration: 5,
            ease: 'power1.inOut'
        });

        gsap.to(obj2.current, {
            y: -20,
            repeat: -1,
            yoyo: true,
            duration: 4,
            ease: 'power1.inOut'
        });
    });

    return (
        <div className="bg-dot-black/35 w-full flex flex-col items-center relative">
            <div className="max-w-[70rem] w-full flex md:flex-row flex-col gap-20 md:gap-10 py-20 md:py-32 px-5  relative">

                {/* Text */}
                <div
                    className="flex flex-col gap-8 justify-center w-full z-20"
                >
                    <h1 className="flex flex-col gap-2 text-5xl md:text-6xl font-extrabold leading-tight">
                        <span className="w-fit  bg-neutral-900 text-white px-4 py-2 -rotate-1 uppercase text-5xl">
                            Start Your
                        </span>
                        <span>
                            Health Journey
                            <br />
                            <TypeAnimation
                                sequence={[
                                    "Simplified",
                                    1000,
                                    "Personalized",
                                    1000,
                                    "Optimized",
                                    1000,
                                    "Enhanced",
                                    1000,
                                    "Empowered",
                                    1000,
                                ]}
                                speed={50}
                                repeat={Infinity}
                            />
                        </span>
                    </h1>

                    <span className="text-base font-normal text-neutral-500">
                        Let's simplify your medical world today!
                    </span>
                    <div className="flex gap-5 items-center">
                        {session ? (
                            <Link
                                href={"/dashboard"}
                                className="px-5 bg-black text-white font-bold hover:border-black text-center hover:bg-neutral-800 hover:scale-105 active:scale-95 py-3 rounded-md duration-300"
                            >
                                DASHBOARD
                            </Link>
                        ) : (
                            <Link
                                href={"/login"}
                                className="px-5 bg-black text-white font-bold hover:border-black text-center hover:bg-neutral-800 hover:scale-105 active:scale-95 py-3 rounded-md duration-300"
                            >
                                JOIN US
                            </Link>
                        )}
                        <Link
                            href={"#services"}
                            className="hover:text-neutral-400 hover:translate-x-3 transition-all duration-300"
                        >
                            See Services
                        </Link>
                    </div>
                </div>

                {/* Object */}
                <div
                    className="flex w-full justify-center relative "
                >
                    <Image
                        src={"/assets/images/character.png"}
                        width={1080}
                        height={1080}
                        alt="char"
                        className="w-[25rem] aspect-square select-none"
                    />

                    <div className="absolute -top-5 flex flex-col gap-1">
                        <span className="text-sm font-bold">Health Status</span>
                        <div className="flex gap-6 items-center">
                            <div className="border rounded-xl border-neutral-400 flex items-center justify-center p-5 bg-white cursor-pointer md:hover:border-neutral-800 md:active:scale-95 duration-300 ">
                                <Image src={"/assets/icons/status_0.png"} width={308} height={161} alt={`status icon`} className="w-20"/>
                            </div>
                            <Image src={"/assets/icons/status_1.png"} width={308} height={161} alt={`status icon`} className="w-20 opacity-60"/>
                            <Image src={"/assets/icons/status_2.png"} width={308} height={161} alt={`status icon`} className="w-20 opacity-40"/>
                        </div>
                    </div>

                    <div ref={obj1} className="absolute bg-white left-10 -z-10 top-36 -rotate-6 h-fit cursor-pointer md:hover:border-neutral-800 md:active:scale-95 duration-300 flex flex-col rounded-lg border border-neutral-400 p-4">
                        <Image src={"/assets/icons/drug.png"} width={445} height={445} alt="drugs" className="w-28 aspect-square rounded-xl border border-neutral-300 "/>
                        <h2 className="text-sm font-bold mt-2">My Drugs</h2>
                        <div className="flex flex-col justify-between h-full gap-2">
                            <p className="text-xs ">Use Case</p>
                            <p className="text-xs text-neutral-400">1x/Day</p>
                        </div>
                    </div>

                    <div ref={obj2} className="absolute bg-white right-2 top-52 rotate-12 scale-110 h-fit cursor-pointer md:hover:border-neutral-800 md:active:scale-95 duration-300 flex flex-col rounded-lg break-words border border-neutral-400 p-4">
                        <div className="w-32 aspect-square rounded-xl border border-neutral-300 flex items-center justify-center">
                            <Image src={"/assets/icons/folders.png"} width={445} height={445} alt="drugs" className="w-20"/>
                        </div>
                        <h2 className="text-sm font-bold mt-2">Medical Report</h2>
                        <p className="text-xs text-neutral-400 mt-2">13 pages</p>
                    </div>

                    <div className="absolute scale-50 opacity-40 -rotate-12 top-96">
                        <span className="text-sm font-bold">Recommendations</span>
                        <div className=" border bg-white border-neutral-400 rounded-xl p-5">
                            <ul className="flex flex-col gap-2">
                                <li className="text-sm text-neutral-600">
                                    <p>🤸 Stretch daily for better posture</p>
                                </li>
                                <li className="text-sm text-neutral-600">
                                    <p>🚶 Take brisk walks in nature</p>
                                </li>
                                <li className="text-sm text-neutral-600">
                                    <p>🧘 Practice mindfulness meditation</p>
                                </li>
                                <li className="text-sm text-neutral-600">
                                    <p>💪 Try yoga for flexibility</p>
                                </li>
                                <li className="text-sm text-neutral-600">
                                    <p>🚶 Walk while listening to calming music</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <svg className="absolute text-red-700 opacity-40 top-0 left-0 rotate-45" width="40" height="40" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <svg className="absolute text-green-700 opacity-40 bottom-0 left-0 rotate-12" width="40" height="40" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <svg className="absolute text-blue-700 opacity-40 top-0 right-0 transform -translate-x-1/2 rotate-3" width="40" height="40" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <svg className="absolute text-red-700 opacity-40 bottom-0 right-44 rotate-6" width="40" height="40" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <svg className="absolute text-green-700 opacity-40 top-1/2 right-0 transform -translate-y-1/2 rotate-3" width="40" height="40" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <svg className="absolute text-blue-700 opacity-40 top-1/4 left-1/4 rotate-12" width="40" height="40" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </div>

                {/* Overlay */}
                <h4 className="font-extrabold text-neutral-400 opacity-20 select-none text-9xl absolute -left-20 top-16">
                    HEALTH
                </h4>
                <h4 className="font-extrabold text-neutral-400 opacity-20 select-none text-9xl absolute -right-14 bottom-16">
                    INSIGHTS
                </h4>
            </div>
        </div>
    );
};

export default Hero;
