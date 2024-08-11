import Link from "next/link";
import React from "react";

const LastCTA = ({ session }) => {
    return (
        <div className=" bg-dot-black/35 w-full flex flex-col items-center relative">
            <div className="max-w-[70rem] w-full flex flex-col py-14 px-5 relative ">
                <div className="flex flex-col gap-2 w-full items-center py-20 px-4 rounded-xl bg-cover bg-fixed border border-neutral-400 bg-white">
                    <span className="text-neutral-500 text-center text-xs italic">
                        YOUR HEALTH JOURNEY
                    </span>
                    <h3 className="text-3xl font-extrabold text-center">
                        WITH PLAINE
                    </h3>
                    <p className="text-neutral-500 text-center max-w-[30rem] mb-10">
                        Transforming complex healthcare into accessible digital
                        solutions.
                    </p>
                    {session ? (
                        <Link
                            href={"/dashboard"}
                            className="px-5 bg-black text-white font-bold hover:border-black text-center hover:bg-neutral-800 hover:scale-105 active:scale-95 py-3 rounded-md duration-300 text-nowrap"
                        >
                            DASHBOARD
                        </Link>
                    ) : (
                        <Link
                            href={"/login"}
                            className="px-5 bg-black text-white font-bold hover:border-black text-center hover:bg-neutral-800 hover:scale-105 active:scale-95 py-3 rounded-md duration-300 text-nowrap"
                        >
                            JOIN US
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LastCTA;
