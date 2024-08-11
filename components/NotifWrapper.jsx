"use client"

import { createContext, useState } from "react";
export const NotifContext = createContext();

const NotifWrapper = ({ children }) => {

    const [notif, setNotif] = useState({ active: false, message: "", status: 0 });
    if (notif.active) setTimeout(() => setNotif({ active: false, message: "", status: 0 }), 2000);

    return (
        <NotifContext.Provider value={{ setNotif }}>
            { children }
            { notif.active && notif.message && (
                <div className="z-[99999] mt-20 toast toast-top toast-center ">
                    <div className={`alert alert-info ${(notif?.status === -1) ? "bg-red-500" : (notif?.status === 1) ? "bg-green-500" : "bg-black"} font-medium drop-shadow-lg flex items-center justify-center`}>
                        <span className='text-white'>{notif?.message}</span>
                    </div>
                </div>
            )}
        </NotifContext.Provider>
    )
};

export default NotifWrapper;
