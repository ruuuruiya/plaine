"use client"

import { ModalContext } from "@/components/ModalWrapper";
import { HEALTH_STATUS } from "@/lib/globals";
import Image from "next/image";
import React, { useContext } from "react";

const HealthStatus = ({ status }) => {

    const { setShowModal } = useContext(ModalContext);

    return (
        <div className="w-full md:flex-none md:w-52 h-52 flex flex-col gap-2">
            <div className="flex gap-2 justify-between items-center min-h-7">
                <div className="flex gap-1 items-center">
                    <h3 className="text-sm font-medium">Status</h3>
                    <div data-tip="Current health status based on your profile (Updated Daily)" className="tooltip tooltip-right before:p-1 before:max-w-40 before:text-xs">
                        <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </div>
                </div>
                <span className="text-sm">{`${HEALTH_STATUS[status].name} ${HEALTH_STATUS[status].emoji}`}</span>
            </div>
            <div onClick={() => setShowModal({ active: true, title: "Health Status", backdrop: true, content: <StatusDetails />})} className="h-full border border-neutral-400 rounded-xl flex items-center justify-center cursor-pointer active:scale-95 hover:bg-neutral-100 transition-all duration-300">
                <Image src={HEALTH_STATUS[status].icon} width={308} height={161} alt="status" className="w-32" />
            </div>
        </div>
    );
};

export default HealthStatus;

const StatusDetails = () => {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                {Object.entries(HEALTH_STATUS).map(([key, status]) => (
                    <div key={key} className="flex flex-row items-center gap-5 border border-neutral-500 rounded-xl p-5">
                        <Image
                            src={status.icon}
                            width={308}
                            height={161}
                            alt={`${status.name} icon`}
                            className="h-fit flex-initial w-20"
                        />
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium">{`${status.name} ${status.emoji}`}</span>
                            <p className="text-xs text-neutral-400">{status.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};
