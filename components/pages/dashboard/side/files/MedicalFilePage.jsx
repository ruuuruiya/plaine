"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useContext, useState } from 'react';
import { NotifContext } from '@/components/NotifWrapper';
import { ModalContext } from '@/components/ModalWrapper';
import { PiFilePdfDuotone } from 'react-icons/pi';
import { removeFile } from '@/app/actions/fileActions';
import { PageTitle } from '@/components/Utils';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { useRouter } from 'next/navigation';

const MedicalFilePage = ({ initialFiles }) => {

    const [filter, setFilter] = useState('');
    const [files, setFiles] = useState(initialFiles || []);
    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    const filteredFiles = files.filter(file =>
        file?.name?.toLowerCase().includes(filter?.toLowerCase())
    );

    const handleDelete = async(file_id) => {
        try {
            if (!file_id) throw new Error("File Not Found!");
            setConfirmationLoading(true);
            const res = await removeFile(file_id);
            if (res?.success) {
                setConfirmationLoading(false);
                setNotif({ active: true, message: res.message, status: 1 });
                setFiles((file) => file.filter(item => item.file_id !== file_id));
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
            <PageTitle title={"Medical Files"} description={"Talk to medical file with AI"} />

            <div className="flex gap-2 items-center">
                <div className="w-full relative">
                    <svg className='absolute top-3 left-4 text-neutral-500' width="25" height="25" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <input
                        className={`h-12 bg-white pl-12 w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-300 border border-neutral-400 focus:border-neutral-950 text-black`}
                        type="text"
                        id="search"
                        placeholder="Search files..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 shrink-0">
                    <Link href={'/files/new'} className="h-12  border border-neutral-800 font-medium px-4 md:px-6 bg-white hover:bg-neutral-200 active:scale-95 rounded-md duration-300 flex gap-2 items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H8.00003V10.5C8.00003 10.7761 7.77617 11 7.50003 11C7.22389 11 7.00003 10.7761 7.00003 10.5V8H4.50003C4.22389 8 4.00003 7.77614 4.00003 7.5C4.00003 7.22386 4.22389 7 4.50003 7H7.00003V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        <span className='text-neutral-800 text-sm leading-tight'>New</span>
                    </Link>
                    <button onClick={() => setShowModal({ active: true, title: "Pick a file", content: <FileAsk files={files} />, backdrop: true })} href={"/files/ask"} data-tip="Ask AI" className="before:text-xs tooltip tooltip-bottom h-12 border border-neutral-800 px-4 rounded-md active:scale-95 bg-white hover:bg-neutral-200 cursor-pointer duration-300 flex gap-2 items-center justify-center">
                        <Image src={"/assets/images/logo_black_transparent.png"} width={100} height={100} alt='ai' className='w-5' />
                    </button>
                </div>
            </div>

            { filteredFiles.length === 0 ? (
                <div className="font-medium text-neutral-500 w-full h-20 flex items-center justify-center">
                    No Files Found
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 justify-between gap-4">
                    {filteredFiles.map((file, i) => (
                        <div key={file.file_id} onClick={() => setShowModal({ active: true, title: "Details", content: <FileDetails file={file} handleDelete={handleDelete} />, backdrop: true })} className="cursor-pointer md:hover:border-neutral-800 md:active:scale-95 duration-300 flex flex-col rounded-lg break-words border border-neutral-400 p-4 relative">
                            { file.cover_url ? (
                                <Image src={file.cover_url} width={540} height={1000} alt="img" className="aspect-square rounded-xl w-full border border-neutral-300" />
                            ) : (
                                <div className="aspect-square rounded-xl w-full shrink-0 border border-neutral-300 flex items-center justify-center">
                                    <PiFilePdfDuotone size={'50px'} className='text-red-600' />
                                </div>
                            )}

                            <div className="flex flex-col justify-between h-full gap-2">
                                <h2 className="text-sm font-bold mt-2 line-clamp-2">{file.name}</h2>
                                <span className='text-neutral-400 text-xs'>{file.total_page} {file.total_page === 1 ? "page" : "pages"}</span>
                            </div>

                            { file.label && (
                                <div className="bg-neutral-800 rounded-sm font-medium p-1 text-white text-[8px] w-fit leading-tight absolute top-3 right-3 ">
                                    {file.label}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MedicalFilePage;

const FileAsk = ({ files }) => {

    const router = useRouter();
    const { setShowModal } = useContext(ModalContext);

    // Selected File
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState('');
    const [errorSelected, setErrorSelected] = useState('');

    const filteredFiles = query === '' ? files : files.filter((file) => {
        return file.name.toLowerCase().includes(query.toLowerCase())
    });

    const handleClick = () => {
        if (!selected) {
            setErrorSelected('pick a file');
            return;
        };
        setShowModal({ active: false });
        router.push(`/files/${selected}/ask`);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="relative">
                <Combobox
                    immediate
                    value={selected}
                    onChange={(value) => {
                        setErrorSelected('');
                        setSelected(value);
                    }}
                    onClose={() => setQuery('')}
                >
                    <ComboboxInput
                        displayValue={(file_id) => {
                            const result = files.find(item => item.file_id === file_id);
                            return result?.name;
                        }}
                        onChange={(e) => setQuery(e.target.value)}
                        className={`z-[100000] ${errorSelected && "border-red-500"} w-full p-3 pr-10 rounded-lg focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                        placeholder='Search files...'
                    />

                    <ComboboxButton className="group absolute inset-y-0 right-2 px-2.5">
                        <svg className='group-data-[active]:rotate-180 transition duration-300' width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </ComboboxButton>

                    <ComboboxOptions
                        transition
                        anchor="bottom"
                        className="z-[100000] w-[var(--input-width)] rounded-xl flex flex-col gap-2 bg-white p-2 mt-2 origin-top border border-neutral-400 transition duration-200 ease-out empty:invisible data-[closed]:scale-90 data-[closed]:opacity-0">

                        {filteredFiles.map((file) => (
                            <ComboboxOption
                                key={file.file_id}
                                value={file.file_id}
                                className=" data-[focus]:bg-neutral-200 data-[selected]:bg-neutral-200 p-2 rounded-lg cursor-pointer"
                            >
                                <div className="flex gap-2 items-center">
                                    { file.cover_url ? (
                                        <Image src={file.cover_url} width={540} height={540} alt='img' className='rounded-lg w-10 aspect-square'/>
                                    ) : (
                                        <div className="aspect-square rounded-lg w-10 shrink-0 border border-neutral-300 flex items-center justify-center">
                                            <PiFilePdfDuotone size={'20px'} className='text-red-600' />
                                        </div>
                                    )}
                                    <div className="text-sm text-black line-clamp-1 font-medium">{file.name}</div>
                                </div>
                            </ComboboxOption>
                        ))}

                    </ComboboxOptions>
                </Combobox>
            </div>
            { errorSelected &&
                <div className="flex text-red-500 text-sm -mt-2">
                    {errorSelected}
                </div>
            }

            <button onClick={handleClick} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                <span>Start Chat</span>
            </button>
        </div>
    )
};

const FileDetails = ({ file, handleDelete }) => {

    const { setShowModal } = useContext(ModalContext);

    return (
        <div className="flex flex-col gap-5">

            {/* Medical File */}
            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Medical File</h2>
                <Link href={file.file_url} target='_blank' className={`w-full border border-neutral-400 hover:bg-neutral-100 font-medium py-5 px-4  active:scale-95 rounded-lg duration-300 flex items-center gap-2 cursor-pointer`}>
                    <div className="w-fit">
                        <PiFilePdfDuotone size={'28px'} className='text-red-600' />
                    </div>
                    <div className="w-fit ">
                        <p className='text-sm line-clamp-1 text-start text-neutral-700'>{file.name}</p>
                    </div>
                </Link>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-3">
                <h2 className="font-bold">File Details</h2>
                <div className="flex flex-col gap-3 border border-neutral-500 rounded-xl p-3">
                    <p><span className="font-medium">File Name:</span> <span className="text-neutral-500 break-all">{file.name}</span></p>
                    <p><span className="font-medium">Total Page:</span> <span className="text-neutral-500">{file.total_page}</span></p>
                    <p><span className="font-medium">Label:</span> <span className="text-neutral-500">{file.label || "-"}</span></p>
                </div>
            </div>

            {/* Summary */}
            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Summary</h2>
                <div className="flex flex-col gap-3 border border-neutral-500 rounded-xl p-3">
                    <span className='text-neutral-500'>{file.summary || "No Summary"}</span>
                </div>
            </div>

            {/* Content Type */}
            <div className="flex flex-col gap-3">
                <h2 className="font-bold">Content Type</h2>
                <div className="flex flex-col gap-3 border border-neutral-500 rounded-xl p-3">
                    <span className='text-neutral-500'>
                        {file.type === 'EMBEDDINGS' ? "Mostly Text" : "Mostly Image/Table/Visuals"}
                    </span>
                </div>
            </div>

            {/* Button */}
            <div className="flex gap-2 mt-3">
                <div onClick={() => setShowModal({ active: true, title: "Delete File", handleSubmit: () => handleDelete(file.file_id), btnCancel: "Cancel", btnSubmit: "Delete", content: <p>Are you sure you would like to delete {file.name}?</p>, backdrop: true })} data-tip="Delete" className="tooltip tooltip-top w-fit text-red-500 border border-red-500 px-5 p-4 rounded-lg active:scale-95 hover:bg-red-500/20 cursor-pointer duration-300 flex gap-2 items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </div>
                <Link onClick={() => setShowModal({ active: false })} href={`/files/${file.file_id}/ask`} data-tip="Ask AI" className="tooltip tooltip-top w-fit px-5 p-4 border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                    <Image src={"/assets/images/logo_black_transparent.png"} width={100} height={100} alt='ai' className='w-7' />
                </Link>
                <Link onClick={() => setShowModal({ active: false })} href={`/files/${file.file_id}/edit`} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645ZM12.5 2.20711L8.91091 5.79618L7.87266 7.87267L8.12731 8.12732L10.2038 7.08907L13.7929 3.5L12.5 2.20711ZM9.99998 2L8.99998 3H4.9C4.47171 3 4.18056 3.00039 3.95552 3.01877C3.73631 3.03668 3.62421 3.06915 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3.06915 3.62421 3.03669 3.73631 3.01878 3.95552C3.00039 4.18056 3 4.47171 3 4.9V11.1C3 11.5283 3.00039 11.8194 3.01878 12.0445C3.03669 12.2637 3.06915 12.3758 3.10899 12.454C3.20487 12.6422 3.35785 12.7951 3.54601 12.891C3.62421 12.9309 3.73631 12.9633 3.95552 12.9812C4.18056 12.9996 4.47171 13 4.9 13H11.1C11.5283 13 11.8194 12.9996 12.0445 12.9812C12.2637 12.9633 12.3758 12.9309 12.454 12.891C12.6422 12.7951 12.7951 12.6422 12.891 12.454C12.9309 12.3758 12.9633 12.2637 12.9812 12.0445C12.9996 11.8194 13 11.5283 13 11.1V6.99998L14 5.99998V11.1V11.1207C14 11.5231 14 11.8553 13.9779 12.1259C13.9549 12.407 13.9057 12.6653 13.782 12.908C13.5903 13.2843 13.2843 13.5903 12.908 13.782C12.6653 13.9057 12.407 13.9549 12.1259 13.9779C11.8553 14 11.5231 14 11.1207 14H11.1H4.9H4.87934C4.47686 14 4.14468 14 3.87409 13.9779C3.59304 13.9549 3.33469 13.9057 3.09202 13.782C2.7157 13.5903 2.40973 13.2843 2.21799 12.908C2.09434 12.6653 2.04506 12.407 2.0221 12.1259C1.99999 11.8553 1.99999 11.5231 2 11.1207V11.1206V11.1V4.9V4.87935V4.87932V4.87931C1.99999 4.47685 1.99999 4.14468 2.0221 3.87409C2.04506 3.59304 2.09434 3.33469 2.21799 3.09202C2.40973 2.71569 2.7157 2.40973 3.09202 2.21799C3.33469 2.09434 3.59304 2.04506 3.87409 2.0221C4.14468 1.99999 4.47685 1.99999 4.87932 2H4.87935H4.9H9.99998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <span className='text-sm leading-3'>Edit</span>
                </Link>
            </div>

        </div>
    )
};
