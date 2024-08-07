"use client"

import { createContext, useState } from "react";
export const ModalContext = createContext();

const ModalWrapper = ({ children }) => {

    const [showModal, setShowModal] = useState({
        active: false,
        title: "",
        handleSubmit: () => {},
        btnCancel: "",
        btnSubmit: "",
        content: <></>,
        backdrop: false
    });

    const [confirmationLoading, setConfirmationLoading] = useState(false);

    return (
        <ModalContext.Provider value={{ setShowModal, setConfirmationLoading }}>

            { children }

            { showModal.active && (
                <dialog className={`modal modal-open`}>
                    <div className="modal-box scrollbar-none flex flex-col gap-5 bg-white">

                        {
                            confirmationLoading ? (
                                <div className="h-40 flex items-center justify-center">
                                    <span className="loading loading-spinner loading-lg"></span>
                                </div>
                            ) : (
                                <>
                                    {/* Title */}
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg">{showModal.title}</h3>
                                        <button onClick={() => setShowModal({ active: false })} className="btn btn-sm btn-circle btn-ghost">✕</button>
                                    </div>

                                    {/* Content */}
                                    {showModal.content}

                                    {/* Button */}
                                    { (showModal.btnCancel && showModal.btnSubmit) &&
                                        <div className="flex gap-2 mt-3">
                                            <button type="button" onClick={() => setShowModal({ active: false })} className="w-fit text-red-500 border border-red-500 px-5 p-4 rounded-lg active:scale-95 hover:bg-red-500/20 cursor-pointer duration-300 flex gap-2 items-center justify-center">
                                                <span className='text-sm leading-3'>{showModal.btnCancel}</span>
                                            </button>
                                            <button onClick={showModal.handleSubmit} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                                                <span>{showModal.btnSubmit}</span>
                                            </button>
                                        </div>
                                    }
                                </>
                            )
                        }

                    </div>

                    { !confirmationLoading && showModal.backdrop &&
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setShowModal({ active: false });
                            }}
                            className="modal-backdrop"
                        >
                            <button>close</button>
                        </form>
                    }
                </dialog>
            )}
        </ModalContext.Provider>
    )
}

export default ModalWrapper
