"use client"

import { NotifContext } from '@/components/NotifWrapper';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';

const LoginPage = () => {

    const { setNotif } = useContext(NotifContext);

    const handleSignIn = async () => {
        try {
            await signIn('google', { callbackUrl: "/dashboard" });
        } catch (error) {
            setNotif({ active: true, message: "Internal Server Error", status: -1 });
        };
    };

    return (
        <div className='h-dvh w-full flex flex-col items-center justify-center relative overflow-hidden bg-white'>
            <div className="flex flex-col items-center justify-center max-w-[35rem] w-full px-5 z-10">
                <Link href={"/"} className="flex items-center gap-5">
                    <Image src={"/assets/images/logo_black_transparent.png"} alt="logo" width={100} height={100} className="w-16" />
                    <h2 className="text-3xl font-bold">{"PLAINE"}</h2>
                </Link>

                <h1 className='text-3xl font-light mt-16'>Sign In</h1>

                <div onClick={handleSignIn} className="w-full rounded-md py-3 border border-neutral-400 bg-white hover:bg-neutral-100 flex items-center justify-center gap-3 active:scale-95 hover:scale-105 duration-300 cursor-pointer mt-10">
                    <Image src={"/assets/icons/google.svg"} alt="google" width={30} height={30} className="w-6" />
                    <p className="">Sign in with Google</p>
                </div>
            </div>

            <BackgroundCircles />
        </div>
    )
};

export default LoginPage;

const BackgroundCircles = () => {
    const circleSizes = [15, 30, 40, 50, 60, 70, 80, 90];
    return (
        <>
            {circleSizes.map((size, index) => (
                <div
                    key={index}
                    className={`aspect-square absolute rounded-full border border-neutral-200`}
                    style={{ width: `${size}rem` }}
                ></div>
            ))}
        </>
    );
};
