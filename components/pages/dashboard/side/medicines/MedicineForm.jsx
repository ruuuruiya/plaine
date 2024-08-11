"use client"

import { useContext, useState } from 'react'
import Image from 'next/image';
import { FiUploadCloud } from "react-icons/fi";
import { FREQUENCY_OPTIONS } from '@/lib/globals';
import { LoadingGenerate, PoweredBy } from '@/components/Utils';
import { getMedicineInformation } from '@/app/actions/medicineActions';
import { NotifContext } from '@/components/NotifWrapper';
import { ModalContext } from '@/components/ModalWrapper';

const MedicineForm = ({
    image,
    setImage,
    previewUrl,
    setPreviewUrl,
    errorImage,
    setErrorImage,
    active,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleZoneClick,
    handleRemoveImage,
    setActive,

    name, setName,
    frequency, setFrequency,
    notes, setNotes,
    indications, setIndications,
    contraindications, setContraindications,
    sideEffects, setSideEffects,
    handleSubmit
}) => {


    const { setNotif } = useContext(NotifContext);
    const { setShowModal } = useContext(ModalContext);

    const [inputIndication, setInputIndication] = useState('');
    const [inputContraindication, setInputContraindication] = useState('');
    const [inputSideEffect, setInputSideEffect] = useState('');
    const [errorName, setErrorName] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);

    const handleGenerate = async () => {
        if (!image) {
            setErrorImage("Image is required");
            return;
        };

        const formData = new FormData();
        formData.append("image", image);

        try {
            setLoadingAI(true);
            const res = await getMedicineInformation(formData);
            if (res?.success) {
                const resData = res?.data || [];
                if (resData?.name) {
                    setName(resData?.name);
                    setErrorName('');
                    if (resData?.frequency) setFrequency(resData?.frequency);
                    if (resData?.indications?.length > 0) setIndications(resData?.indications);
                    if (resData?.contraindications?.length > 0) setContraindications(resData?.contraindications);
                    if (resData?.side_effects?.length > 0) setSideEffects(resData?.side_effects);
                    setNotif({ active: true, message: "Medicine Identified", status: 1 });
                    setLoadingAI(false);
                } else {
                    throw new Error("Failed to Identify!");
                }
            } else {
                throw new Error(res.message);
            };
        } catch (err) {
            setLoadingAI(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    const handleName = (e) => {
        const inputText = e.target.value;
        if (inputText.length <= 50) {
            setErrorName("");
            setName(inputText);
        };
    };

    const handleNotes = (e) => {
        const inputText = e.target.value;
        if (inputText.length <= 200) {
            setNotes(inputText);
        };
    };

    const handleAddIndication = (e, inputIndication) => {
        e.preventDefault();
        if (indications.length < 20) {
            if (!inputIndication.trim()) return;
            setIndications((indications) => [...indications, inputIndication]);
            setInputIndication("");
        }
    };

    const handleAddContraindication = (e, inputContraindication) => {
        e.preventDefault();
        if (contraindications.length < 20) {
            if (!inputContraindication.trim()) return;
            setContraindications((contraindications) => [...contraindications, inputContraindication]);
            setInputContraindication("");
        }
    };

    const handleAddSideEffect = (e, inputSideEffect) => {
        e.preventDefault();
        if (sideEffects.length < 20) {
            if (!inputSideEffect.trim()) return;
            setSideEffects((sideEffects) => [...sideEffects, inputSideEffect]);
            setInputSideEffect("");
        }
    };

    const handleReview  = () => {

        if (!name.trim()) {
            setErrorName("Name is required");
            setNotif({ active: true, message: "Name is required", status: -1 });
            return;
        };

        if (!image) {
            setErrorImage("Image is required");
            setNotif({ active: true, message: "Image is required", status: -1 });
            return;
        };

        const med = {
            name,
            frequency,
            notes,
            indications,
            contraindications,
            side_effects: sideEffects,
            previewUrl,
        };

        setShowModal({ active: true, title: "Review", handleSubmit, btnCancel: "Cancel", btnSubmit: "Submit", content: <ReviewMedicine med={med} />, backdrop: true });
    };

    return (
        <div className="flex gap-5 flex-col md:flex-row">

            <div className="w-full md:w-2/5 min-w-72 h-fit border border-neutral-400 p-5 rounded-xl">

                <div className="flex flex-col gap-2 relative mb-4">
                    <label htmlFor='image' className="font-medium text-black">
                        Upload Image<span className='text-red-500'>*</span>
                    </label>

                    { previewUrl && <button onClick={handleRemoveImage} disabled={loadingAI} className="absolute cursor-pointer right-2 text-red-500 text-xs top-2 hover:text-red-900">Remove</button> }

                    {/* Drop zone */}
                    <div
                        onClick={handleZoneClick}
                        onDragOver={loadingAI ? () => {} : handleDragOver}
                        onDrop={loadingAI ? () => {} : handleDrop}
                        onDragLeave={() => setActive(false)}
                        className={`relative border-2 border-neutral-400 border-dashed ${errorImage && "border-red-500"} rounded-xl cursor-pointer w-full aspect-square flex items-center justify-center hover:bg-neutral-100 duration-200 ${active && "bg-neutral-100"}`}
                    >

                        {previewUrl ? (
                            <Image src={previewUrl} fill={true} alt="image" className={`object-cover rounded-xl duration-300 ${active && "opacity-55"}`} placeholder="empty"/>
                        ) : (
                            <div className="flex flex-col gap-2 text-neutral-400 text-xs items-center">
                                <FiUploadCloud className='text-3xl'/>
                                <p><span className='font-bold text-neutral-500'>Click to upload</span> or drag and drop</p>
                                <p>up to 4MB file</p>
                            </div>
                        )}

                        <input
                            disabled={loadingAI}
                            id='image'
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".jpg, .jpeg, .png"
                            className='hidden'
                        />
                    </div>

                    <div className={`flex items-center`}>
                        {errorImage && <p className="text-red-500 text-xs">{errorImage}</p>}
                        <div className="text-transparent text-sm">X</div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-end">
                        <PoweredBy description={"Gemini AI processes the image to provide precise medicine details"}/>
                    </div>
                    <button type='button' onClick={handleGenerate} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                        { loadingAI ? (
                            <LoadingGenerate description={"Identifying Medicine"}/>
                        ) : (
                            <span className='text-neutral-700 text-sm'>Generate Details</span>
                        )}
                    </button>
                    <p className='text-xs text-neutral-500'>Provide a clear image for accurate medicine identification by AI and confirm all details carefully.</p>
                </div>
            </div>

            <div className="w-full border border-neutral-400 rounded-xl p-5">
                <div className='flex flex-col gap-5'>

                    {/* Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="font-medium text-black">
                            Medicine Name<span className='text-red-500'>*</span>
                        </label>

                        <input
                            className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black ${errorName && "border-red-500"}`}
                            type="text"
                            id="name"
                            placeholder="Medicine name"
                            value={name}
                            onChange={handleName}
                        />

                        <div className={`flex items-center ${errorName ? "justify-between" : "justify-end"}`}>
                            {errorName && <p className="text-red-500 text-xs w-full">{errorName}</p>}
                            <div className="text-neutral-500 text-xs">{name.length}/50</div>
                        </div>
                    </div>

                    {/* Frequency */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="font-medium text-black">
                            Frequency
                        </label>
                        <select
                            id='medicFrequency'
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className={`select w-full shrink rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}>

                            { FREQUENCY_OPTIONS.map((item, i) => (
                                <option key={i} value={item}>{item}</option>
                            ))}

                        </select>
                        <div className={`flex items-center`}>
                            <div className="text-transparent text-sm">X</div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="notes" className="font-medium text-black">
                            Personal Notes
                        </label>

                        <input
                            className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black `}
                            type="text"
                            id="notes"
                            placeholder="Add extra notes"
                            value={notes}
                            onChange={handleNotes}
                        />

                        <div className={`flex items-center justify-end`}>
                            <div className="text-neutral-500 text-xs">{notes.length}/200</div>
                        </div>
                    </div>

                    {/* Indications */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="indication" className="font-medium text-black flex gap-1 items-center">
                            Indications
                            <div className="tooltip tooltip-top before:p-2 before:max-w-40 before:text-xs " data-tip={"Conditions or symptoms that this medication treats or prevents"}>
                                <svg width="13" height="13" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </div>
                        </label>

                        <form className="flex gap-2">
                            <input
                                className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                type="text"
                                id="indication"
                                placeholder="Type Here"
                                value={inputIndication}
                                onChange={(e) => { if(e.target.value.length <= 50) setInputIndication(e.target.value) }}
                            />

                            <button onClick={(e) => handleAddIndication(e, inputIndication)} className="border border-neutral-400 font-medium px-7 text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 rounded-md duration-300 flex gap-2 items-center">
                                <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </button>
                        </form>

                        <div className="border border-neutral-400 rounded-lg p-3 flex flex-wrap gap-2">
                            {
                                indications.length === 0 ? (
                                    <span className='text-neutral-300'>E.g., Pain relief, fever reduction</span>
                                ) : (
                                    <>
                                        { indications.map((indication, i) => (
                                            <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                <svg onClick={() => setIndications((indications) => indications.filter((item) => item.toLowerCase() !== indication.toLowerCase()))} className='cursor-pointer shrink-0' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                                <span className='break-all'>{indication}</span>
                                            </div>
                                        ))}
                                    </>
                                )
                            }
                        </div>

                        <div className={`flex items-center`}>
                            <div className="text-transparent text-sm">X</div>
                        </div>
                    </div>

                    {/* ContraIndications */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="contraindication" className="font-medium text-black flex gap-1 items-center">
                            Contraindications
                            <div className="tooltip tooltip-top before:p-2 before:max-w-40 before:text-xs " data-tip={"Conditions or situations where this medication should not be used due to potential harm or ineffectiveness"}>
                                <svg width="13" height="13" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </div>
                        </label>


                        <form className="flex gap-2">
                            <input
                                className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                type="text"
                                id="contraindication"
                                placeholder="Type Here"
                                value={inputContraindication}
                                onChange={(e) => { if(e.target.value.length <= 50) setInputContraindication(e.target.value) }}
                            />

                            <button onClick={(e) => handleAddContraindication(e, inputContraindication)} className="border border-neutral-400 font-medium px-7 text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 rounded-md duration-300 flex gap-2 items-center">
                                <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </button>
                        </form>

                        <div className="border border-neutral-400 rounded-lg p-3 flex flex-wrap gap-2">
                            {
                                contraindications.length === 0 ? (
                                    <span className='text-neutral-300'>E.g., Allergies, medical conditions</span>
                                ) : (
                                    <>
                                         {contraindications.map((contraindication, i) => (
                                            <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                <svg onClick={() => setContraindications((contraindications) => contraindications.filter((item) => item.toLowerCase() !== contraindication.toLowerCase()))} className='cursor-pointer shrink-0' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                                <span className='break-all'>{contraindication}</span>
                                            </div>
                                        ))}
                                    </>
                                )
                            }
                        </div>

                        <div className={`flex items-center`}>
                            <div className="text-transparent text-sm">X</div>
                        </div>
                    </div>

                    {/* Side Effects */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="sifeEffects" className="font-medium text-black flex gap-1 items-center">
                            Side Effects
                            <div className="tooltip tooltip-top before:p-2 before:max-w-40 before:text-xs " data-tip={"Potential unwanted or adverse effects that may occur while using this medication"}>
                                <svg width="13" height="13" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </div>
                        </label>


                        <form className="flex gap-2">
                            <input
                                className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                type="text"
                                id="sifeEffects"
                                placeholder="Type Here"
                                value={inputSideEffect}
                                onChange={(e) => { if(e.target.value.length <= 50) setInputSideEffect(e.target.value) }}
                            />

                            <button onClick={(e) => handleAddSideEffect(e, inputSideEffect)} className="border border-neutral-400 font-medium px-7 text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 rounded-md duration-300 flex gap-2 items-center">
                                <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </button>
                        </form>

                        <div className="border border-neutral-400 rounded-lg p-3 flex flex-wrap gap-2">
                            {
                                sideEffects.length === 0 ? (
                                    <span className='text-neutral-300'>E.g., Irritation, dizziness, headache</span>
                                ) : (
                                    <>
                                        { sideEffects.map((sideEffect, i) => (
                                            <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                <svg onClick={() => setSideEffects((sideEffects) => sideEffects.filter((item) => item.toLowerCase() !== sideEffect.toLowerCase()))} className='cursor-pointer shrink-0' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                                <span className='break-all'>{sideEffect}</span>
                                            </div>
                                        ))}
                                    </>
                                )
                            }
                        </div>

                        <div className={`flex items-center`}>
                            <div className="text-transparent text-sm">X</div>
                        </div>
                    </div>

                    <button onClick={handleReview} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                        Submit
                    </button>

                </div>
            </div>
        </div>
    )
}

export default MedicineForm

const ReviewMedicine = ({ med }) => {
    return (
        <div className="flex flex-col gap-5">

            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Image</h2>
                <Image src={med.previewUrl} width={100} height={100} alt='img' className='rounded-xl border border-neutral-300 object-cover aspect-square w-20' />
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
                    {
                        med.indications.length === 0 ? (
                            <span className='text-neutral-500'>No Indications</span>
                        ) : (
                            <>
                                { med.indications.map((indication, i) => (
                                    <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                        <span className='break-all'>{indication}</span>
                                    </div>
                                ))}
                            </>
                        )
                    }
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Contraindications</h2>
                <div className="flex gap-2 flex-wrap border border-neutral-500 rounded-xl p-3">
                    {
                        med.contraindications.length === 0 ? (
                            <span className='text-neutral-500'>No Contraindications</span>
                        ) : (
                            <>
                                { med.contraindications.map((contraindication, i) => (
                                    <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                        <span className='break-all'>{contraindication}</span>
                                    </div>
                                ))}
                            </>
                        )
                    }
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Side Effects</h2>
                <div className="flex gap-2 flex-wrap border border-neutral-500 rounded-xl p-3">
                    {
                        med.side_effects.length === 0 ? (
                            <span className='text-neutral-500'>No Side Effects</span>
                        ) : (
                            <>
                                { med.side_effects.map((side_effect, i) => (
                                    <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                        <span className='break-all'>{side_effect}</span>
                                    </div>
                                ))}
                            </>
                        )
                    }
                </div>
            </div>

        </div>
    )
};
