"use client"

import { useContext, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ModalContext } from '@/components/ModalWrapper'
import { NotifContext } from '@/components/NotifWrapper'
import { removeMedicine } from '@/app/actions/medicineActions'
import { PageTitle } from '@/components/Utils'

const MedicinePage = ({ initialMedicines }) => {

    const [filter, setFilter] = useState('');
    const [medicines, setMedicines] = useState(initialMedicines || []);
    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    const filteredMedicine = medicines.filter(med =>
        med?.name?.toLowerCase().includes(filter?.toLowerCase())
    );

    const handleDelete = async (med_id) => {
        try {
            if (!med_id) throw new Error("Medicine Not Found");
            setConfirmationLoading(true);
            const res = await removeMedicine(med_id);
            if (res?.success) {
                setConfirmationLoading(false);
                setNotif({ active: true, message: res.message, status: 1 });
                setMedicines((medicine) => medicine.filter(item => item.med_id !== med_id));
                setShowModal({ active: false });
            } else {
                throw new Error(res.message);
            };
        } catch (err) {
            setConfirmationLoading(false)
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    return (
        <div className='p-5 flex flex-col gap-5'>
            <PageTitle title={"Medicine Overview"} description={"Know Your Prescription Better"} />

            <div className="flex gap-2 items-center">
                <div className="w-full relative">
                    <svg className='absolute top-3 left-4 text-neutral-500' width="25" height="25" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <input
                        className={`h-12 bg-white pl-12 w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-300 border border-neutral-400 focus:border-neutral-950 text-black`}
                        type="text"
                        id="search"
                        placeholder="Search medicines..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 shrink-0">
                    <Link href={'/medicines/new'} className="h-12 border border-neutral-800 font-medium px-4 md:px-6 bg-white hover:bg-neutral-200 active:scale-95 rounded-md duration-300 flex gap-2 items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H8.00003V10.5C8.00003 10.7761 7.77617 11 7.50003 11C7.22389 11 7.00003 10.7761 7.00003 10.5V8H4.50003C4.22389 8 4.00003 7.77614 4.00003 7.5C4.00003 7.22386 4.22389 7 4.50003 7H7.00003V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        <span className='text-neutral-800 text-sm leading-tight'>New</span>
                    </Link>
                    <Link href={"/medicines/ask"} data-tip="Ask AI" className="before:text-xs tooltip tooltip-bottom h-12 border border-neutral-800 px-4 rounded-md active:scale-95 bg-white hover:bg-neutral-200 cursor-pointer duration-300 flex gap-2 items-center justify-center">
                        <Image src={"/assets/images/logo_black_transparent.png"} width={100} height={100} alt='ai' className='w-5' />
                    </Link>
                </div>
            </div>

            { filteredMedicine.length === 0 ? (
                <div className="font-medium text-neutral-500 w-full h-20 flex items-center justify-center">
                    No Medicines Found
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 justify-between gap-4">
                    {filteredMedicine.map((med) => (
                        <div onClick={() => setShowModal({ active: true, title: "Details", content: <MedDetails med={med} handleDelete={handleDelete} />, backdrop: true })} key={med.med_id} className="cursor-pointer md:hover:border-neutral-800 md:active:scale-95 duration-300 flex flex-col rounded-lg break-words border border-neutral-400 p-4">
                            <Image src={med.image} width={540} height={540} alt="img" className="aspect-square rounded-xl w-full border border-neutral-300" />
                            <h2 className="text-sm font-bold mt-2">{med.name}</h2>
                            <div className="flex flex-col justify-between h-full gap-2">
                                <p className="text-xs ">{med.indications[0] || "-"}</p>
                                <p className="text-xs text-neutral-400">{med.frequency}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}


        </div>
    )
};

export default MedicinePage;

const MedDetails = ({ med, handleDelete }) => {

    const { setShowModal } = useContext(ModalContext);

    return (
        <div className="flex flex-col gap-5">

            <div className="flex flex-col gap-3">
                <Image src={med?.image} width={540} height={540} alt='img' className='rounded-xl border border-neutral-300 object-cover aspect-square w-full' />
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Basic Information</h2>
                <div className="flex flex-col gap-3 border border-neutral-500 rounded-xl p-3">
                    <p><span className="font-medium">Name:</span> <span className="text-neutral-500">{med.name}</span></p>
                    <p><span className="font-medium">Frequency:</span> <span className="text-neutral-500">{med.frequency}</span></p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="font-bold">My Notes</h2>
                <div className="flex flex-col gap-3 border border-neutral-500 rounded-xl p-3">
                    { med.notes ? (
                        <>{med.notes}</>
                    ) : (
                        <span className='text-neutral-500'>No Notes</span>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Indications</h2>
                <div className="flex gap-2 flex-wrap border border-neutral-500 rounded-xl p-3">
                    { med.indications.length === 0 ? (
                        <span className='text-neutral-500'>No Indications</span>
                    ) : (
                        <>
                            {med.indications.map((indication, i) => (
                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                    <span className='break-all'>{indication}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Contraindications</h2>
                <div className="flex gap-2 flex-wrap border border-neutral-500 rounded-xl p-3">
                    { med.contraindications.length === 0 ? (
                        <span className='text-neutral-500'>No Contraindications</span>
                    ) : (
                        <>
                            {med.contraindications.map((contraindication, i) => (
                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                    <span className='break-all'>{contraindication}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Side Effects</h2>
                <div className="flex gap-2 flex-wrap border border-neutral-500 rounded-xl p-3">
                    { med.side_effects.length === 0 ? (
                        <span className='text-neutral-500'>No Side Effects</span>
                    ) : (
                        <>
                            {med.side_effects.map((side_effect, i) => (
                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                    <span className='break-all'>{side_effect}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            <div className="flex gap-2 mt-3">
                <div onClick={() => setShowModal({ active: true, title: "Delete Medicine", handleSubmit: () => handleDelete(med.med_id), btnCancel: "Cancel", btnSubmit: "Delete", content: <p>Are you sure you would like to delete {med.name}?</p>, backdrop: true })} data-tip="Delete" className="tooltip tooltip-top w-fit text-red-500 border border-red-500 px-5 p-4 rounded-lg active:scale-95 hover:bg-red-500/20 cursor-pointer duration-300 flex gap-2 items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </div>
                <Link onClick={() => setShowModal({ active: false })} href={`/medicines/ask?med_id=${med.med_id}`} data-tip="Ask AI" className="tooltip tooltip-top w-fit px-5 p-4 border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                    <Image src={"/assets/images/logo_black_transparent.png"} width={100} height={100} alt='ai' className='w-7' />
                </Link>
                <Link onClick={() => setShowModal({ active: false })} href={`/medicines/${med.med_id}/edit`} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645ZM12.5 2.20711L8.91091 5.79618L7.87266 7.87267L8.12731 8.12732L10.2038 7.08907L13.7929 3.5L12.5 2.20711ZM9.99998 2L8.99998 3H4.9C4.47171 3 4.18056 3.00039 3.95552 3.01877C3.73631 3.03668 3.62421 3.06915 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3.06915 3.62421 3.03669 3.73631 3.01878 3.95552C3.00039 4.18056 3 4.47171 3 4.9V11.1C3 11.5283 3.00039 11.8194 3.01878 12.0445C3.03669 12.2637 3.06915 12.3758 3.10899 12.454C3.20487 12.6422 3.35785 12.7951 3.54601 12.891C3.62421 12.9309 3.73631 12.9633 3.95552 12.9812C4.18056 12.9996 4.47171 13 4.9 13H11.1C11.5283 13 11.8194 12.9996 12.0445 12.9812C12.2637 12.9633 12.3758 12.9309 12.454 12.891C12.6422 12.7951 12.7951 12.6422 12.891 12.454C12.9309 12.3758 12.9633 12.2637 12.9812 12.0445C12.9996 11.8194 13 11.5283 13 11.1V6.99998L14 5.99998V11.1V11.1207C14 11.5231 14 11.8553 13.9779 12.1259C13.9549 12.407 13.9057 12.6653 13.782 12.908C13.5903 13.2843 13.2843 13.5903 12.908 13.782C12.6653 13.9057 12.407 13.9549 12.1259 13.9779C11.8553 14 11.5231 14 11.1207 14H11.1H4.9H4.87934C4.47686 14 4.14468 14 3.87409 13.9779C3.59304 13.9549 3.33469 13.9057 3.09202 13.782C2.7157 13.5903 2.40973 13.2843 2.21799 12.908C2.09434 12.6653 2.04506 12.407 2.0221 12.1259C1.99999 11.8553 1.99999 11.5231 2 11.1207V11.1206V11.1V4.9V4.87935V4.87932V4.87931C1.99999 4.47685 1.99999 4.14468 2.0221 3.87409C2.04506 3.59304 2.09434 3.33469 2.21799 3.09202C2.40973 2.71569 2.7157 2.40973 3.09202 2.21799C3.33469 2.09434 3.59304 2.04506 3.87409 2.0221C4.14468 1.99999 4.47685 1.99999 4.87932 2H4.87935H4.9H9.99998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <span className='text-sm leading-3'>Edit</span>
                </Link>
            </div>
        </div>
    )
};
