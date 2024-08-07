"use client"

import MessageList from './MessageList'
import ChatPanel from './ChatPanel'
import { useContext, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { postMessage, removeChat } from '@/app/actions/chatActions'
import { NotifContext } from '@/components/NotifWrapper'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ModalContext } from '@/components/ModalWrapper'
import EditTitleForm from './EditTitleForm'
import { CHAT_TYPE_OPTIONS } from '@/lib/globals'

const ChatComponent = ({ chat_id, initialMessages = [], initialFiles = [], initialTitle = "", initialType = "BASE", session }) => {

    const router = useRouter();
    const path = usePathname();

    const [totalFiles, setTotalFiles] = useState(initialFiles); // ['url', ...]
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [title, setTitle] = useState(initialTitle);
    const [files, setFiles] = useState([]);
    const [chatType, setChatType] = useState(initialType);

    const [loading, setLoading] = useState(false);
    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    const handleDelete = async (chat_id) => {
        try {
            if (!chat_id) throw new Error("Chat Not Found!");
            setConfirmationLoading(true);
            const res = await removeChat(chat_id);
            if (res?.success) {
                setConfirmationLoading(false);
                setNotif({ active: true, message: res.message, status: 1 });
                setShowModal({ active: false });
                router.replace('/chats');
            } else {
                throw new Error(res.message);
            };
        } catch (err) {
            setConfirmationLoading(false)
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        if (!input?.trim() && files.length === 0) return;
        if (loading) return;
        if (messages.length >= 500) {
            setNotif({ active: true, message: "Limit Reached! Start a New Chat", status: -1 });
            return;
        };
        setInput('');
        setFiles([]);

        try {
            setMessages((messages) => [...messages, {
                role: 'user',
                parts: [{ text: input }],
                files: files.map(item => item.url),
            }])
            setTimeout(() => msgRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
            setLoading(true);

            // Append Image
            const formData = new FormData();
            files.forEach((item) => {
                formData.append(`file`, item.file);
            });

            const res = await postMessage(input, chat_id, formData, chatType);

            if (!res.success) {
                throw new Error(res.message);
            } else {
                setMessages((messages) => {
                    const updatedMessages = messages.slice(0, -1); // Remove last element
                    return [...updatedMessages, ...res.data];
                });
                files.forEach(fileObj => URL.revokeObjectURL(fileObj.url));
                setTotalFiles((totalFiles) => [...totalFiles, ...res.data[0].files])
                setLoading(false);

                // Router Push
                if (path.includes('new')) {
                    router.push(`/chats/${chat_id}`, { shallow: true });
                    router.refresh();
                };
            };
        } catch (err) {
            setLoading(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    // // Scroll to Last Message
    const msgRef = useRef(null);
    useEffect(() => {
        msgRef.current?.scrollIntoView({ behavior: "instant" });
    }, []);

    return (
        <>
            {/* Title */}
            { title ?
                <div className="w-full flex items-center justify-center mt-3 md:px-3 px-4">
                    <div className="rounded-xl max-w-[55rem] w-full h-full border px-3 py-3 border-neutral-400 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link href={"/chats"} className='cursor-pointer'>
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </Link>
                            <h2 className='line-clamp-1 font-medium text-sm'>{title}</h2>
                        </div>

                        <div className="flex gap-4 items-center">
                            <div data-tip={initialType} className="tooltip tooltip-bottom">
                                {CHAT_TYPE_OPTIONS[initialType].icon}
                            </div>

                            <div className="dropdown cursor-pointer dropdown-end">
                                <svg tabIndex={0} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>

                                <ul tabIndex={0} className="dropdown-content menu z-[1] p-2 shadow mt-2 rounded-md bg-white  border border-dark-900 w-40">
                                    <li>
                                        <span onClick={() => setShowModal({ active: true, title: "Files", handleSubmit: () => {}, btnCancel: "", btnSubmit: "", content: <DisplayFiles totalFiles={totalFiles}/>, backdrop: true })}  className="flex gap-3 " >
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.30902 1C2.93025 1 2.58398 1.214 2.41459 1.55279L1.05279 4.27639C1.01807 4.34582 1 4.42238 1 4.5V13C1 13.5523 1.44772 14 2 14H13C13.5523 14 14 13.5523 14 13V4.5C14 4.42238 13.9819 4.34582 13.9472 4.27639L12.5854 1.55281C12.416 1.21403 12.0698 1.00003 11.691 1.00003L7.5 1.00001L3.30902 1ZM3.30902 2L7 2.00001V4H2.30902L3.30902 2ZM8 4V2.00002L11.691 2.00003L12.691 4H8ZM7.5 5H13V13H2V5H7.5ZM5.5 7C5.22386 7 5 7.22386 5 7.5C5 7.77614 5.22386 8 5.5 8H9.5C9.77614 8 10 7.77614 10 7.5C10 7.22386 9.77614 7 9.5 7H5.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                            <span>Files</span>
                                        </span>
                                    </li>
                                    <li>
                                        <span onClick={() => setShowModal({ active: true, title: "Edit Title", handleSubmit: () => {}, btnCancel: "", btnSubmit: "", content: <EditTitleForm chat_id={chat_id} prevTitle={title} setTitle={setTitle}/>, backdrop: true })}  className="flex gap-3 " >
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                            <span>Edit</span>
                                        </span>
                                    </li>
                                    <li>
                                        <span onClick={() => setShowModal({ active: true, title: "Delete Chat", handleSubmit: () => handleDelete(chat_id), btnCancel: "Cancel", btnSubmit: "Delete", content: <p>Are you sure you would like to delete this chat?</p>, backdrop: true })} className="flex gap-3 text-red-500">
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                            <span>Delete</span>
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                :
                <div className="w-full flex items-center justify-center mt-3 md:px-3 px-4">
                    <div className="rounded-xl max-w-[55rem] w-full h-full border px-3 py-3 border-neutral-400 bg-white flex items-center justify-between">

                        <h2 className='line-clamp-1 font-medium text-sm'>{"New Chat"}</h2>

                        <select
                            value={chatType}
                            onChange={(e) => setChatType(e.target.value)}
                            className={`text-sm rounded-md focus:outline-none focus:border-none bg-white text-black`}>

                            { Object.keys(CHAT_TYPE_OPTIONS).map(key => (
                                <option key={key} value={key}>{key}</option>
                            ))}

                        </select>

                    </div>
                </div>
            }

            {/* List of Chat */}
            <div className="scrollbar-none overflow-y-auto h-full md:px-3 px-4 max-w-[45rem] w-full mx-auto ">
                { messages?.length === 0 ? (
                    <div className="select-none h-[calc(100%-2.5rem)] flex items-center justify-center">
                        <div className="flex flex-col gap-5 items-center pt-10">
                            <Image src={"/assets/images/logo_black_white_circle.png"} width={100} height={100} alt='logo' className='aspect-square w-20' />
                            <span className='text-xl font-bold text-center text-neutral-600'>Feeling alright?</span>
                        </div>
                    </div>
                ) : (
                    <MessageList messages={messages} session={session} loading={loading}/>
                )}
                <div className="h-10 w-full" ref={msgRef}></div>
            </div>

            {/* Chat Prompt */}
            <ChatPanel
                loading={loading}
                input={input}
                setInput={setInput}
                files={files}
                setFiles={setFiles}
                totalFiles={totalFiles}
                handleSubmit={handleSubmit}
            />
        </>
    )
}

export default ChatComponent;

const DisplayFiles = ({ totalFiles }) => {
    const { setShowModal } = useContext(ModalContext);
    return (
        <div className="flex flex-wrap gap-3 ">
            {
                totalFiles.length === 0 ? (
                    <div className="">
                        No media yet
                    </div>
                ) : (
                    <>
                        {
                            totalFiles.map((file, i) => (
                                <Image key={i} src={file} width={100} height={100} onClick={() => setShowModal({ active: true, title: "Image", backdrop: true, content: <Image src={file} width={1080} height={1080} alt='img' className='w-full h-full rounded-xl object-cover border border-neutral-300' />, backdrop: true })} alt='img' className='w-20 h-20 rounded-xl object-cover border border-neutral-300 cursor-pointer'/>
                            ))
                        }
                    </>
                )
            }
        </div>
    )
}
