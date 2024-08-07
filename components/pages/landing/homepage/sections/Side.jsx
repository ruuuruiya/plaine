
"use client"

import Link from 'next/link'
import { Tilt } from 'react-tilt'

const Side = () => {


    return (
        <div className="bg-dot-black/35 w-full flex flex-col items-center relative">
            <div className="max-w-[70rem] w-full flex md:flex-row flex-col gap-10 pb-32 pt-10 px-5 relative">

            {/* Object */}
            <Tilt className="w-full h-96 rounded-xl flex flex-col gap-2 items-center justify-center p-[2px] bg-blue-400 bg-gradient-to-r from-primary via-red-500 to-green-500 animate-gradient">
                <div className="w-full h-full bg-white bg-dot-black/35 flex items-center justify-center rounded-xl">
                    <span className='text-center'>See Clearly, Heal Transparently</span>
                </div>
            </Tilt>

            {/* Text */}
            <div className="flex flex-col gap-2 w-full self-center">
                <span className='text-neutral-500'>Empowering AI-Driven Healthcare</span>
                <h3 className='text-3xl font-bold'>We Value <span className='underline underline-offset-8'>Transparency</span></h3>
                <p className='text-neutral-800 mt-3'>
                    At Plaine, your medical information fuels our AI. By sharing your health data, you enable our artificial intelligence to learn, improve diagnoses, and enhance your treatment plans. We're transparent about how we use your data: it's anonymized, secured, and applied to advance medical research and personalize care. Trust in our commitment to responsible AI and data ethics for a healthier future.
                </p>
                <Link href={"#services"} className="flex gap-2 items-center cursor-pointer w-fit hover:translate-x-3 duration-500 mt-3">
                    <span>See Services</span>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </Link>
            </div>

            {/* Overlay */}
            <h4 className='font-extrabold text-neutral-400 opacity-20 text-9xl absolute top-36 left-20 select-none'>TRANSPARENT</h4>

            </div>
        </div>
    )
}

export default Side
