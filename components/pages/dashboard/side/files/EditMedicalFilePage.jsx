"use client"

import { useContext, useEffect, useState } from 'react'
import Image from 'next/image';
import { PiFilePdfDuotone } from "react-icons/pi";
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { FiUploadCloud } from 'react-icons/fi';
import { updateMedicalFile } from '@/app/actions/fileActions';
import { NotifContext } from '@/components/NotifWrapper';
import { ModalContext } from '@/components/ModalWrapper';
import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/Utils';
import Link from 'next/link';

const EditMedicalFilePage = ({ initialFile }) => {

    const router = useRouter();

    // Form
    const [name, setName] = useState('');
    const [totalPage, setTotalPage] = useState(0);
    const [label, setLabel] = useState('');
    const [summary, setSummary] = useState('');
    const [type, setType] = useState('EMBEDDINGS');
    const {
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
    } = useImageUpload();

    // UI
    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    // Error UI
    const [errorName, setErrorName] = useState('');

    // Hydrate
    useEffect(() => {
        setImage(initialFile.cover_url);
        setPreviewUrl(initialFile.cover_url);
        setTotalPage(initialFile.total_page)
        setName(initialFile.name);
        setLabel(initialFile.label);
        setSummary(initialFile.summary);
        setType(initialFile.type);
    }, []);

    const handleName = (e) => {
        const inputText = e.target.value;
        if (inputText.length <= 50) {
            setErrorName("");
            setName(inputText);
        };
    };

    const handleLabel = (e) => {
        const inputText = e.target.value;
        if (inputText.length <= 20) {
            setLabel(inputText);
        };
    };

    const handleSummary = (e) => {
        const inputText = e.target.value;
        if (inputText.length <= 1000) {
            setSummary(inputText);
        };
    };

    const handleReview  = () => {

        if (!name.trim()) {
            setErrorName("file name is required");
            setNotif({ active: true, message: "file name is required", status: -1 });
            return;
        };

        const data = {
            name,
            totalPage,
            label,
            summary,
            type,
            image,
            previewUrl
        };

        setShowModal({ active: true, title: "Review", handleSubmit, btnCancel: "Cancel", btnSubmit: "Submit", content: <ReviewMedicalFile data={data} />, backdrop: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setConfirmationLoading(true);

            // Construct
            const formData = new FormData();
            formData.append('data', JSON.stringify({
                file_id: initialFile.file_id,
                name,
                label,
                summary,
            }));

            if (image?.type?.includes("image")) {
                const compressedImg = await imageCompression(image, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1080,
                    useWebWorker: true
                });
                formData.append("cover", compressedImg);
            } else {
                formData.append("cover", image || '');
            };

            const res = await updateMedicalFile(formData);
            if (res?.success) {
                router.replace('/files');
                setConfirmationLoading(false);
                setShowModal({ active: false });
                setNotif({ active: true, message: "File Updated", status: 1 });
            }else {
                throw new Error(res.message);
            };

        } catch (err) {
            setConfirmationLoading(false)
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    return (
        <div className='p-5 flex flex-col gap-5'>
            <PageTitle title={"Edit File"} back='/files' />

            <div className="flex gap-5 flex-col md:flex-row">
                <div className="w-full md:w-2/5 min-w-72 h-fit border border-neutral-400 p-5 rounded-xl flex flex-col gap-10">

                    {/* Medical File */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="font-medium text-black">
                            Medical File<span className='text-red-500'>*</span>
                        </label>

                        <Link href={initialFile.file_url} target='_blank' className={`cursor-pointer w-full border border-neutral-400 font-medium py-3 px-4 bg-neutral-100 rounded-lg duration-300 flex gap-2`}>
                            <>
                                <div className="w-fit">
                                    <PiFilePdfDuotone size={'20px'} className='text-red-600' />
                                </div>
                                <div className="w-fit ">
                                    <p className='text-sm line-clamp-1 text-start text-neutral-700'>{initialFile.name}</p>
                                </div>
                            </>
                        </Link>
                    </div>

                    {/* Cover */}
                    <div className="flex flex-col gap-2 relative mb-4">
                        <label className="font-medium text-black">
                            Upload Cover
                        </label>

                        { previewUrl && <button onClick={handleRemoveImage} className="absolute cursor-pointer right-2 text-red-500 text-xs top-2 hover:text-red-900">Remove</button> }

                        {/* Drop zone */}
                        <div
                            onClick={handleZoneClick}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
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

                </div>

                <div className="w-full border border-neutral-400 rounded-xl p-5">

                    <div className="flex flex-col gap-5">

                        {/* File Name */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="font-medium text-black">
                                File Name<span className='text-red-500'>*</span>
                            </label>

                            <input
                                className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black ${errorName && "border-red-500"}`}
                                type="text"
                                id="name"
                                placeholder="Medical File Name"
                                value={name}
                                onChange={handleName}
                            />

                            <div className={`flex items-center ${errorName ? "justify-between" : "justify-end"}`}>
                                {errorName && <p className="text-red-500 text-xs w-full">{errorName}</p>}
                                <div className="text-neutral-500 text-xs">{name.length}/50</div>
                            </div>
                        </div>

                        {/* Total Page */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="page" className="font-medium text-black">
                                Total Page
                            </label>

                            <input
                                className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-neutral-100 text-black `}
                                type="text"
                                id="page"
                                value={totalPage}
                                disabled={true}
                            />

                            <div className={`flex items-center`}>
                                <div className="text-transparent text-sm">X</div>
                            </div>
                        </div>

                        {/* Label */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="label" className="font-medium text-black flex gap-2 items-center">
                                Label
                                <div data-tip="Provide a name or identifier for your file" className="tooltip tooltip-top before:text-xs before:max-w-28">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                </div>
                            </label>

                            <div className="flex gap-2 relative">
                                <input
                                    className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                    type="text"
                                    id="label"
                                    placeholder="E.g., Lab Results, prescription"
                                    value={label}
                                    onChange={handleLabel}
                                />
                            </div>

                            <div className={`flex items-center justify-end`}>
                                <div className="text-neutral-500 text-xs">{label.length}/20</div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-2 md:items-center justify-between flex-col md:flex-row">
                                <div className="font-medium text-black flex gap-2 items-center">
                                    Summary
                                </div>
                            </div>

                            <textarea
                                className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                rows={7}
                                id="summary"
                                placeholder="Describe what the document is about"
                                value={summary}
                                onChange={handleSummary}
                            />

                            <div className={`flex items-center justify-end`}>
                                <div className="text-neutral-500 text-xs">{summary.length}/1000</div>
                            </div>
                        </div>

                        {/* File Type */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="type" className="font-medium text-black flex gap-2 items-center">
                                Content Type
                                <div data-tip="Select how AI analyzes your file" className="tooltip tooltip-top before:text-xs before:max-w-44">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                </div>
                            </label>

                            <div className="select-none w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-neutral-100 text-black ">
                                {type === 'EMBEDDINGS' ? "Mostly Text" : "Mostly Image/Table/Visuals"}
                            </div>

                            <div className={`flex items-center`}>
                                <div className="text-transparent text-sm">X</div>
                            </div>
                        </div>

                        <button onClick={handleReview} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                            Update
                        </button>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditMedicalFilePage;

const ReviewMedicalFile = ({ data }) => {
    return (
        <div className="flex flex-col gap-5">

            {/* Medical File */}
            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Medical File</h2>
                <div className={`w-full border border-neutral-400 font-medium py-5 px-4  rounded-lg duration-300 flex items-center gap-2`}>
                    <div className="w-fit">
                        <PiFilePdfDuotone size={'28px'} className='text-red-600' />
                    </div>
                    <div className="w-fit overflow-hidden ">
                        <p className='text-sm line-clamp-1  text-start text-neutral-700'>{data.name}</p>
                    </div>
                </div>
            </div>

            {/* Cover */}
            { data.previewUrl &&
                <div className="flex flex-col gap-3">
                    <h2 className="font-bold">Cover</h2>
                    <Image src={data.previewUrl} width={100} height={100} alt='img' className='rounded-xl border border-neutral-300 object-cover aspect-square w-20' />
                </div>
            }

            {/* Details */}
            <div className="flex flex-col gap-3">
                <h2 className="font-bold">File Details</h2>
                <div className="flex flex-col gap-3 border border-neutral-500 rounded-xl p-3">
                    <p><span className="font-medium">File Name:</span> <span className="text-neutral-500">{data.name}</span></p>
                    <p><span className="font-medium">Total Page:</span> <span className="text-neutral-500">{data.totalPage}</span></p>
                    <p><span className="font-medium">Label:</span> <span className="text-neutral-500">{data.label || "-"}</span></p>
                </div>
            </div>

            {/* Summary */}
            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Summary</h2>
                <div className="flex flex-col gap-3 border border-neutral-500 rounded-xl p-3">
                    <span className='text-neutral-500'>{data.summary || "No Summary"}</span>
                </div>
            </div>

            {/* Conotent Type */}
            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Content Type</h2>
                <div className="flex flex-col gap-3 border border-neutral-500 rounded-xl p-3">
                    <span className='text-neutral-500'>
                        {data.type === 'EMBEDDINGS' ? "Mostly Text" : "Mostly Image/Table/Visuals"}
                    </span>
                </div>
            </div>
        </div>
    )
};
