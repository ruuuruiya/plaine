"use client"

import { useContext, useRef, useState } from 'react'
import Image from 'next/image';
import { PiFilePdfDuotone } from "react-icons/pi";
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { FiUploadCloud } from 'react-icons/fi';
import { LoadingGenerate, PageTitle, PoweredBy } from '@/components/Utils';
import { getFileSummary, postMedicalFile } from '@/app/actions/fileActions';
import { NotifContext } from '@/components/NotifWrapper';
import { ModalContext } from '@/components/ModalWrapper';
import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/navigation';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.min.mjs'

const FILE_MAX_SIZE = 20;
const FILE_MAX_PAGE = 100;

const AddMedicalFilePage = () => {

    const router = useRouter();

    // Form
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [totalPage, setTotalPage] = useState(0);
    const [label, setLabel] = useState('');
    const [summary, setSummary] = useState('');
    const [type, setType] = useState('VISION');
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
    const [loadFile, setLoadFile] = useState(false);
    const [loadSummary, setLoadSummary] = useState(false);
    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    // Error UI
    const [errorFile, setErrorFile] = useState('');
    const [errorName, setErrorName] = useState('');

    // Util
    const [fileDoc, setFileDoc] = useState(null);
    const fileRef = useRef(null);

    const handleFileOnChange = async (e) => {
        const selectedFile = e.target.files[0];
        try {
            if (selectedFile.type !== 'application/pdf') {
                throw new Error("format PDF");
            } else if (selectedFile.size / 1024 / 1024 > FILE_MAX_SIZE) {
                throw new Error(`max ${FILE_MAX_SIZE} mb`);
            } else {
                setLoadFile(true);
                setErrorFile('');

                // Get PDF Document
                await import('pdfjs-dist/build/pdf.worker.min.mjs')
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                if (pdfDoc.numPages > FILE_MAX_PAGE) throw new Error(`max ${FILE_MAX_PAGE} pages`);
                setFile(selectedFile);
                setFileDoc(pdfDoc);

                // Fill Form
                setName(selectedFile.name.split(".")[0].substring(0, 40) || "");
                setErrorName('');
                setTotalPage(pdfDoc.numPages || 0);

                setLoadFile(false);
            };
        } catch (err) {
            setErrorFile(err.message);
            setLoadFile(false);
        } finally {
            e.target.value = '';
        };
    };

    const handleFileRemove = () => {
        setFile(null);
        setLoadFile(false);
        setErrorFile('');
        setFileDoc(null);
    };

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

    const handleGenerateSummary = async () => {
        try {
            setLoadSummary(true);

            if (!fileDoc) {
                setErrorFile('file is required');
                throw new Error("file is required");
            };

            // Get Page Info
            const page = await fileDoc.getPage(1);
            const viewport = page.getViewport({ scale: 1.0 });

            // Create Canvas
            const canvas = document.createElement('canvas');
            const canvasContext = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render the PDF page as an image on the canvas
            await page.render({ canvasContext, viewport }).promise;

            // Convert to File
            const blob = await new Promise(resolve => canvas.toBlob(resolve));
            const file = new File([blob], `page-1.png`, {
                type: 'image/png'
            });
            page.cleanup();

            // Construct
            const formData = new FormData();
            formData.append('file', file);

            // Get Summary Based on First Page Image
            const res = await getFileSummary(formData);
            if (res.success) {
                setSummary(res.data);
                setNotif({ active: true, message: "Summary Generated", status: 1 });
                setLoadSummary(false);
            } else {
                throw new Error("Failed to Generate");
            };
        } catch (err) {
            setLoadSummary(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    const handleReview  = () => {

        if (!file || !fileDoc) {
            setErrorFile("File is required");
            setNotif({ active: true, message: "File is required", status: -1 });
            return;
        };

        if (!name.trim()) {
            setErrorName("File name is required");
            setNotif({ active: true, message: "File name is required", status: -1 });
            return;
        };

        const data = {
            file,
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

            // Loop Each Page
            let allImage = [];
            let allText = "";
            for (let pageNum = 1; pageNum <= totalPage; pageNum++) {

                // Get Page Info
                const page = await fileDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.0 });

                // Check Type
                if (type === 'VISION') {

                    // Create Canvas
                    const canvas = document.createElement('canvas');
                    const canvasContext = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render the PDF page as an image on the canvas
                    await page.render({ canvasContext, viewport }).promise;

                    // Convert Canvas => Blob => File
                    const blob = await new Promise(resolve => canvas.toBlob(resolve));
                    const file = new File([blob], `page-${pageNum}.png`, {
                        type: 'image/png'
                    });
                    allImage.push(file);

                } else if (type === 'EMBEDDINGS') {

                    // Convert Each Page to Text
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    allText += ` ${pageText} `;

                    // Convert Each Page to File Object
                    const canvas = document.createElement('canvas');
                    const canvasContext = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render the PDF page as an image on the canvas
                    await page.render({ canvasContext, viewport }).promise;

                    // Convert Canvas => Blob => File
                    const blob = await new Promise(resolve => canvas.toBlob(resolve));
                    const file = new File([blob], `page-${pageNum}.png`, {
                        type: 'image/png'
                    });
                    allImage.push(file);

                } else {
                    throw new Error("Invalid Content Type");
                };
            };

            // Construct
            const formData = new FormData();
            formData.append('file', file);
            formData.append('data', JSON.stringify({
                name,
                totalPage,
                label,
                summary,
                type,
            }));

            // Append Content to FormData
            for(let i = 0; i < allImage.length; i++) {
                formData.append('contentVision', allImage[i]);
            };
            formData.append('contentEmbeddings', allText);

            // Cover
            if (image) {
                const compressedImg = await imageCompression(image, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1080,
                    useWebWorker: true
                });
                formData.append('cover', compressedImg);
            };

            const res = await postMedicalFile(formData);
            if (res?.success) {
                router.replace('/files');
                setConfirmationLoading(false);
                setShowModal({ active: false });
                setNotif({ active: true, message: "File Uploaded", status: 1 });
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
            <PageTitle title={"New File"} back='/files' />

            <div className="flex gap-5 flex-col md:flex-row">
                <div className="w-full md:w-2/5 min-w-72 h-fit border border-neutral-400 p-5 rounded-xl flex flex-col gap-10">

                    {/* Medical File */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="font-medium text-black">
                            Medical File<span className='text-red-500'>*</span>
                        </label>

                        <input
                            id='file'
                            type="file"
                            ref={fileRef}
                            onChange={handleFileOnChange}
                            accept="application/pdf"
                            className='hidden'
                        />

                        { !file ? (
                            <button
                                disabled={loadFile}
                                onClick={() => fileRef.current.click()}
                                className={`${errorFile && "border-red-500"} w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center`}>
                                { loadFile ? (
                                    <LoadingGenerate description={"Uploading"}/>
                                ) : (
                                    <div className="flex gap-2 items-center">
                                        <svg className='text-neutral-700' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.81825 1.18188C7.64251 1.00615 7.35759 1.00615 7.18185 1.18188L4.18185 4.18188C4.00611 4.35762 4.00611 4.64254 4.18185 4.81828C4.35759 4.99401 4.64251 4.99401 4.81825 4.81828L7.05005 2.58648V9.49996C7.05005 9.74849 7.25152 9.94996 7.50005 9.94996C7.74858 9.94996 7.95005 9.74849 7.95005 9.49996V2.58648L10.1819 4.81828C10.3576 4.99401 10.6425 4.99401 10.8182 4.81828C10.994 4.64254 10.994 4.35762 10.8182 4.18188L7.81825 1.18188ZM2.5 9.99997C2.77614 9.99997 3 10.2238 3 10.5V12C3 12.5538 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2238 12.2239 9.99997 12.5 9.99997C12.7761 9.99997 13 10.2238 13 10.5V12C13 13.104 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2238 2.22386 9.99997 2.5 9.99997Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                        <span className='text-neutral-700 text-sm'>Upload File</span>
                                    </div>
                                )}
                            </button>
                        ) : (
                            <>
                                <button onClick={handleFileRemove} className="absolute cursor-pointer right-2 text-red-500 text-xs top-2 hover:text-red-900">remove</button>
                                <button
                                    disabled={loadFile}
                                    onClick={() => fileRef.current.click()}
                                    className={`${errorFile && "border-red-500"} w-full border border-neutral-400 font-medium py-3 px-4 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2`}>
                                    { loadFile ? (
                                        <LoadingGenerate description={"Uploading"}/>
                                    ) : (
                                        <>
                                            <div className="w-fit">
                                                <PiFilePdfDuotone size={'20px'} className='text-red-600' />
                                            </div>
                                            <div className="w-fit ">
                                                <p className='text-sm line-clamp-1 text-start text-neutral-700'>{file.name}</p>
                                            </div>
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        <div className={`flex items-center`}>
                            {errorFile && <p className="text-red-500 text-xs">{errorFile}</p>}
                        </div>

                        <div className="flex flex-col text-neutral-500 text-xs">
                            <span>*pdf file</span>
                            <span>*max {FILE_MAX_SIZE} MB ({FILE_MAX_PAGE} pages)</span>
                        </div>
                    </div>

                    {/* Cover */}
                    <div className="flex flex-col gap-2 relative mb-4">
                        <label className="font-medium text-black">
                            Upload Cover
                        </label>

                        { previewUrl && <button onClick={handleRemoveImage} className="absolute cursor-pointer right-2 text-red-500 text-xs top-2 hover:text-red-900">remove</button> }

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

                        {/* Generate Summary */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-2 md:items-center justify-between flex-col md:flex-row">
                                <div className="font-medium text-black flex gap-2 items-center">
                                    Summary
                                    { loadSummary ? (
                                        <LoadingGenerate description={"Generating"}/>
                                    ) : (
                                        <button onClick={handleGenerateSummary} className="border border-neutral-400 font-medium px-2 py-1 text-center hover:bg-neutral-100 active:scale-95 rounded-md duration-300 flex gap-1 items-center">
                                            <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.84998 7.49998C1.84998 4.66458 4.05979 1.84998 7.49998 1.84998C10.2783 1.84998 11.6515 3.9064 12.2367 5H10.5C10.2239 5 10 5.22386 10 5.5C10 5.77614 10.2239 6 10.5 6H13.5C13.7761 6 14 5.77614 14 5.5V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4.31318C12.2955 3.07126 10.6659 0.849976 7.49998 0.849976C3.43716 0.849976 0.849976 4.18537 0.849976 7.49998C0.849976 10.8146 3.43716 14.15 7.49998 14.15C9.44382 14.15 11.0622 13.3808 12.2145 12.2084C12.8315 11.5806 13.3133 10.839 13.6418 10.0407C13.7469 9.78536 13.6251 9.49315 13.3698 9.38806C13.1144 9.28296 12.8222 9.40478 12.7171 9.66014C12.4363 10.3425 12.0251 10.9745 11.5013 11.5074C10.5295 12.4963 9.16504 13.15 7.49998 13.15C4.05979 13.15 1.84998 10.3354 1.84998 7.49998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                            <span className='text-xs'>generate</span>
                                        </button>
                                    )}
                                </div>
                                <PoweredBy description={"Leveraging Google's Gemini AI Vision to produce concise file summaries"} />
                            </div>

                            <textarea
                                className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                rows={7}
                                id="summary"
                                placeholder="a brief overview of the document's content"
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

                            <select
                                id='type'
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className={`select w-full shrink rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}>

                                <option value="VISION">Mostly Image/Table/Visuals</option>
                                <option value="EMBEDDINGS">Mostly Text</option>

                            </select>

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

        </div>
    )
}

export default AddMedicalFilePage;

const ReviewMedicalFile = ({ data }) => {
    return (
        <div className="flex flex-col gap-5">

            {/* Medical File */}
            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Medical File</h2>
                <div className={`w-full border border-neutral-400 font-medium py-5 px-4  active:scale-95 rounded-lg duration-300 flex items-center gap-2`}>
                    <div className="w-fit">
                        <PiFilePdfDuotone size={'28px'} className='text-red-600' />
                    </div>
                    <div className="w-fit ">
                        <p className='text-sm line-clamp-1 text-start text-neutral-700'>{data.file.name}</p>
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
