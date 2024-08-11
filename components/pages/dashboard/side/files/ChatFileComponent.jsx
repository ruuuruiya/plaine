"use client"

import { useContext, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { NotifContext } from '@/components/NotifWrapper'
import { ModalContext } from '@/components/ModalWrapper'
import ChatPanelFileComponent from './ChatPanelFileComponent';
import MessageList from '../chats/MessageList';
import { clearMedicalFileChat, postMedicalFileChat } from '@/app/actions/fileActions'

const ChatFileComponent = ({ file_id, initialName = "", initialMessages = [], session }) => {

    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');

    const [loading, setLoading] = useState(false);
    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    const handleClearChat = async () => {
        try {
            if (loading) return;
            setConfirmationLoading(true);
            const res = await clearMedicalFileChat(file_id);
            if (res?.success) {
                setMessages([]);
                setConfirmationLoading(false);
                setNotif({ active: true, message: res.message, status: 1 });
                setShowModal({ active: false });
            } else {
                throw new Error(res.message);
            };

        } catch (err) {
            setConfirmationLoading(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input?.trim()) return;
        if (loading) return;
        if (messages.length >= 500) {
            setNotif({ active: true, message: "Limit Reached Please Clear Chat", status: -1 });
            return;
        };
        setInput('');

        try {
            setMessages((messages) => [...messages, {
                role: 'user',
                parts: [{ text: input }],
            }])
            setTimeout(() => msgRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
            setLoading(true);

            const res = await postMedicalFileChat(input, file_id);

            if (!res.success) {
                throw new Error(res.message);
            } else {
                setMessages((messages) => {
                    const updatedMessages = messages.slice(0, -1);
                    return [...updatedMessages, ...res.data];
                });
                setLoading(false);
            };
        } catch (err) {
            setLoading(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    // Scroll to Last Message
    const msgRef = useRef(null);
    useEffect(() => {
        msgRef.current?.scrollIntoView({ behavior: "instant" })
    }, []);

    return (
        <>
            {/* Title */}
            <div className="w-full flex items-center justify-center mt-3 md:px-3 px-4">
                <div className="rounded-xl max-w-[55rem] w-full h-full border px-3 py-3 border-neutral-400 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={"/files"} className='cursor-pointer'>
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </Link>
                        <h2 className='line-clamp-1 font-medium text-sm'>{initialName}</h2>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="dropdown cursor-pointer dropdown-end">
                            <svg tabIndex={0} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>

                            <ul tabIndex={0} className="dropdown-content menu z-[1] p-2 shadow mt-2 rounded-md bg-white  border border-dark-900 w-40">
                                <li>
                                    <span onClick={() => setShowModal({ active: true, title: "Clear Chat", handleSubmit: handleClearChat, btnCancel: "Cancel", btnSubmit: "Clear Chat", content: <p>Are you sure you would like to clear this chat?</p>, backdrop: true })} className="flex gap-3 text-red-500">
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                        <span>Clear Chat</span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* List of Chat */}
            <div className="scrollbar-none overflow-y-auto h-full md:px-3 px-4 max-w-[45rem] w-full mx-auto ">
                { messages?.length === 0 ? (
                    <div className="select-none h-[calc(100%-2.5rem)] flex items-center justify-center">
                        <div className="flex flex-col gap-5 items-center pt-10">
                            <Image src={"/assets/images/logo_black_white_circle.png"} width={100} height={100} alt='logo' className='aspect-square w-20' />
                            <span className='text-xl font-bold text-center text-neutral-600'>Ask Anything</span>
                        </div>
                    </div>
                ) : (
                    <MessageList messages={messages} session={session} loading={loading}/>
                )}
                <div className="h-10 w-full" ref={msgRef}></div>
            </div>

            {/* Chat Prompt */}
            <ChatPanelFileComponent
                loading={loading}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
            />
        </>
    )
};

export default ChatFileComponent;
