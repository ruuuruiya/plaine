"use client"

import React, { useContext, useState } from 'react'
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { FiUploadCloud } from 'react-icons/fi';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation'
import { LoadingGenerate, PageTitle } from '@/components/Utils';
import { NotifContext } from '@/components/NotifWrapper';
import { askMedicine } from '@/app/actions/chatActions';
import { nanoid } from '@/lib/utils';
import MessageList from '../chats/MessageList';
import Link from 'next/link';

const AskMedicinePage = ({ medicineLists, session }) => {

    const [loadingAI, setLoadingAI] = useState(false);
    const { setNotif } = useContext(NotifContext);

    // Chat
    const [messages, setMessages] = useState([]);
    const [chatId, setChatId] = useState('');
    const [input, setInput] = useState('');
    const [errorInput, setErrorInput] = useState('');

    const handleInput = (e) => {
        const inputText = e.target.value;
        if (inputText.length <= 5000) {
            setInput(inputText);
            setErrorInput('');
        };
    };

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

    // Selected Medicine
    const searchParams = useSearchParams();
    const initialSelected = searchParams.get('med_id') || '';
    const [selected, setSelected] = useState(initialSelected);
    const [query, setQuery] = useState('');

    const filteredMedicineLists = query === '' ? medicineLists : medicineLists.filter((med) => {
        return med.name.toLowerCase().includes(query.toLowerCase())
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!input.trim()) {
            setErrorInput("Please provide question");
            return;
        };

        try {
            setLoadingAI(true);
            const formData = new FormData();
            if (selected) formData.append('med_id', selected);
            if (image) formData.append('image', image);

            const chat_id = nanoid();
            const res = await askMedicine(input, chat_id, formData);
            if (!res.success) {
                throw new Error(res.message);
            } else {
                setMessages(res.data);
                setChatId(chat_id);
                setLoadingAI(false)
            };
        } catch (err) {
            setLoadingAI(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    return (
        <div className='p-5 flex flex-col gap-5'>
            <PageTitle title={"Ask AI"} back='/medicines' />

            <div className="flex gap-5 flex-col md:flex-row">
                <div className="w-full md:w-[40%] min-w-80 h-fit border border-neutral-400 p-5 rounded-xl flex flex-col gap-5">

                    {/* Choose Medicine */}
                    <div className="flex flex-col gap-2 relative">
                        <label htmlFor='selectedmed' className="font-medium text-black">
                            Choose Medicine
                        </label>

                        { selected && <button onClick={() => setSelected('')} className="absolute cursor-pointer right-2 text-red-500 text-xs top-2 hover:text-red-900">Remove</button> }

                        <Combobox immediate value={selected} onChange={setSelected} onClose={() => setQuery('')}>
                            <ComboboxInput
                                displayValue={(med_id) => {
                                    const result = medicineLists.find(item => item.med_id === med_id);
                                    return result?.name;
                                }}
                                onChange={(e) => setQuery(e.target.value)}
                                className={" w-full p-3 pr-10 rounded-lg focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black"}
                                placeholder='Search my medicine...'
                            />

                            <ComboboxButton className="group absolute inset-y-0 right-1 px-2.5 top-8 ">
                                <svg className='group-data-[active]:rotate-180 transition duration-300' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </ComboboxButton>

                            <ComboboxOptions
                                transition
                                anchor="bottom"
                                className="w-[var(--input-width)] rounded-xl flex flex-col gap-2 bg-white p-2 mt-2 origin-top border border-neutral-400 transition duration-200 ease-out empty:invisible data-[closed]:scale-90 data-[closed]:opacity-0"
                            >
                                {filteredMedicineLists.map((med) => (
                                    <ComboboxOption
                                        key={med.med_id}
                                        value={med.med_id}
                                        className="data-[focus]:bg-neutral-200 data-[selected]:bg-neutral-200 p-2 rounded-lg cursor-pointer"
                                    >
                                        <div className="flex gap-2 items-center">
                                            <Image src={med.image} width={100} height={100} alt='img' className='rounded-lg w-10 aspect-square'/>
                                            <div className="text-sm text-black line-clamp-1 font-medium">{med.name}</div>
                                        </div>
                                    </ComboboxOption>
                                ))}

                            </ComboboxOptions>
                        </Combobox>
                    </div>

                    <div className="flex items-center pt-2">
                        <div className="border-t border-gray-400 w-full"></div>
                        <div className="px-3 leading-none text-neutral-400 text-sm">OR</div>
                        <div className="border-t border-gray-400 w-full"></div>
                    </div>

                    {/* Upload Medicine */}
                    <div className="flex flex-col gap-2 relative ">
                        <label htmlFor='image' className="font-medium text-black">
                            Upload Image
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

                <div className="w-full min-w-52 h-fit border border-neutral-400 rounded-xl p-5 ">

                    { messages?.length === 0 ? (
                        <div className="flex flex-col gap-10">
                            <div className="flex flex-col gap-2">
                                <label htmlFor='input' className="font-medium text-black">
                                    Question
                                </label>
                                <textarea
                                    className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-300 border border-neutral-400 focus:border-neutral-950 bg-white text-black ${errorInput && "border-red-500"}`}
                                    rows={7}
                                    id="input"
                                    placeholder="Type here"
                                    value={input}
                                    onChange={handleInput}
                                />
                                <div className={`flex items-center ${errorInput ? "justify-between" : "justify-end"}`}>
                                    {errorInput && <p className="text-red-500 text-xs w-full">{errorInput}</p>}
                                </div>
                            </div>

                            <button disabled={loadingAI} onClick={handleSubmit} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                                { loadingAI ? (
                                    <LoadingGenerate description={"Generating AI Response"}/>
                                ) : (
                                    <span className='text-neutral-700 text-sm'>Start Asking</span>
                                )}
                            </button>

                            <div className="flex flex-col gap-2">
                                <label htmlFor='input' className="font-medium text-black">
                                    Suggested Question
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { title: "Side Effects", text: "What are the most common and serious side effects of this medicine?" },
                                        { title: "Allergic Reactions", text: "What are the signs of an allergic reaction to this medicine?" },
                                        { title: "Intended Usage", text: "What are the main uses and conditions this medicine treats?" },
                                    ].map((item, i) => (
                                        <div key={i} onClick={(e) => { setErrorInput(''); setInput(item.text); }} className="flex flex-col gap-1 w-full rounded-xl border border-neutral-400 hover:border-neutral-800 active:scale-95 cursor-pointer duration-300 p-4">
                                            <h5 className='font-bold '>{item.title}</h5>
                                            <span className=''>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => setMessages([])} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                                    <span>Start New</span>
                                </button>
                                <Link href={`/chats/${chatId}`} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                                    <span>Continue Asking</span>
                                </Link>
                            </div>
                            <MessageList messages={messages} session={session} />

                        </>
                    )}

                </div>
            </div>
        </div>
    )
}

export default AskMedicinePage
