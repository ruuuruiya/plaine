import Link from "next/link"
import React from 'react'

const PoweredBy = ({ description }) => {
    return (
        <div className="flex gap-1 items-center">
            <svg width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" fill="url(#prefix__paint0_radial_980_20147)"/><defs><radialGradient id="prefix__paint0_radial_980_20147" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)"><stop offset=".067" stopColor="#9168C0"/><stop offset=".343" stopColor="#5684D1"/><stop offset=".672" stopColor="#1BA1E3"/></radialGradient></defs></svg>
            <span className='text-xs text-neutral-500'>Powered by <span className='font-medium text-neutral-900'>Gemini AI</span></span>
            <div className="tooltip tooltip-left before:p-2 before:max-w-40 before:text-xs " data-tip={description}>
                <svg width="13" height="13" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </div>
        </div>
    )
};

const LoadingGenerate = ({ description }) => {
    return (
        <div className="flex gap-2 items-center text-neutral-500 justify-center w-full">
            <span className="loading loading-ring loading-sm"></span>
            <span className='text-xs'>{description}</span>
            <span className="loading loading-ring loading-sm"></span>
        </div>
    )
};

const LoadingPage = () => {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <span className="loading loading-infinity loading-lg"></span>
        </div>
    )
};

const PageTitle = ({ children, title, description, back = "" }) => {
    return (
         <div className="flex gap-5 justify-between items-center">
            <div className="flex gap-2 items-center w-fit shrink-0">
                { back && <Link href={back}><svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg> </Link>}
                <div className="flex flex-col">
                    <h1 className='text-xl font-bold text-neutral-900'>{title}</h1>
                    <span className='text-sm text-neutral-500'>{description}</span>
                </div>
            </div>

            {children}
        </div>
    )
};

const Stepper = ({ step, stepArr }) => {
    return (
        <div className="flex items-center w-full justify-end py-1">
            {stepArr.map((stepEach, i) => (
                <React.Fragment key={i}>
                    <div className={`shrink-0 rounded-full aspect-square max-w-8 w-full flex items-center justify-center md:mr-2 ${step >= i+1 ? "bg-black" : "bg-neutral-400"} `}>
                        <span className="text-white">{step > i+1 ? "✓" : i+1}</span>
                    </div>
                    <span className={`mr-2 font-medium hidden md:block ${step >= i+1 ? "text-black" : "text-neutral-400"}`}>{stepEach}</span>
                    { i+1 !== stepArr.length && <hr className={`md:mr-2 max-w-20 w-full ${step > i+1 ? "border-black" : "border-neutral-400"}`}/>}
                </React.Fragment>
            ))}
        </div>
    )
};

export { PoweredBy, LoadingGenerate, LoadingPage, PageTitle, Stepper }
