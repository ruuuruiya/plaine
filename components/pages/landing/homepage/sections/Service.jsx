"use client"

import Image from 'next/image';
import { Tilt } from 'react-tilt'

const Service = () => {
    return (
        <div id='services' className="bg-dot-black/35 w-full flex flex-col items-center relative">
            <div className="max-w-[70rem] w-full flex flex-col gap-5 py-20 px-5 relative ">

                <div className="h-2 w-6 bg-black"></div>

                <h2 className='text-center font-extrabold text-3xl'>SERVICES</h2>
                <span className='text-center text-neutral-500 max-w-[40rem] self-center mb-10'>How We Simplify Your Health Information</span>

                <div className="w-full flex justify-between gap-5 flex-col p-5 ">

                    <div className="flex gap-5 flex-col md:flex-row">
                        <Tilt className="w-full p-5 flex flex-col gap-2 items-center">
                            <Image src={"/assets/icons/1_service.png"} width={512} height={512} alt='img' className='mb-4 select-none w-20'/>
                            <h4 className='text-2xl font-extrabold text-purple-600'>ADVISOR</h4>
                            <h5 className='text-center text-xl font-bold'>AI Health Consult</h5>
                            <p className='text-center text-neutral-500'>Get instant medical insights through advanced AI technology. Your 24/7 health consultant.</p>
                        </Tilt>
                        <Tilt className="w-full p-5 flex flex-col gap-2 items-center">
                            <Image src={"/assets/icons/2_service.png"} width={512} height={512} alt='img' className='mb-4 select-none w-20'/>
                            <h4 className='text-2xl font-extrabold text-blue-600'>PERSONALIZED</h4>
                            <h5 className='text-center text-xl font-bold'>Recommendations</h5>
                            <p className='text-center text-neutral-500'>Personalized suggestions for diet, exercise, and activities based on your unique health profile.</p>
                        </Tilt>
                        <Tilt className="w-full p-5 flex flex-col gap-2 items-center">
                            <Image src={"/assets/icons/3_service.png"} width={512} height={512} alt='img' className='mb-4 select-none w-20'/>
                            <h4 className='text-2xl font-extrabold text-green-600'>MONITOR</h4>
                            <h5 className='text-center text-xl font-bold'>Health Status</h5>
                            <p className='text-center text-neutral-500'>Stay informed about your health with up-to-date insights from your interactions.</p>
                        </Tilt>
                    </div>

                    <div className="flex gap-5 flex-col md:flex-row">
                        <Tilt className="w-full p-5 flex flex-col gap-2 items-center">
                            <Image src={"/assets/icons/5_service.png"} width={512} height={512} alt='img' className='mb-4 select-none w-20'/>
                            <h4 className='text-2xl font-extrabold text-orange-600'>ORGANIZE</h4>
                            <h5 className='text-center text-xl font-bold'>Medicine Tracker</h5>
                            <p className='text-center text-neutral-500'>Efficiently manage your medications. Upload, organize, and access your medicine information anytime, with AI assistance at your fingertips.</p>
                        </Tilt>
                        <Tilt className="w-full p-5 flex flex-col gap-2 items-center">
                            <Image src={"/assets/icons/4_service.png"} width={512} height={512} alt='img' className='mb-4 select-none w-20'/>
                            <h4 className='text-2xl font-extrabold text-pink-600'>INTERPRET</h4>
                            <h5 className='text-center text-xl font-bold'>Medical Report Analysis</h5>
                            <p className='text-center text-neutral-500'>Upload and interact with your medical documents through AI. Get clear, actionable insights and understand your reports better than ever before.</p>
                        </Tilt>
                    </div>
                </div>

                <h4 className='font-extrabold text-neutral-400 opacity-20 text-9xl absolute rotate-90 -right-80 top-96 select-none'>AI POWERED</h4>

            </div>
        </div>
    )
}

export default Service
