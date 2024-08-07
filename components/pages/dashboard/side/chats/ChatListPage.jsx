"use client"

import { useContext, useState } from 'react'
import Link from 'next/link'
import { NotifContext } from '@/components/NotifWrapper';
import { removeAllChat, removeChat } from '@/app/actions/chatActions';
import { ModalContext } from '@/components/ModalWrapper';
import EditTitleForm from './EditTitleForm';
import { CHAT_TYPE_OPTIONS } from '@/lib/globals';
import { PageTitle } from '@/components/Utils';

const ChatListPage = ({ initialChatLists }) => {

    const [filter, setFilter] = useState('');
    const [chatLists, setChatLists] = useState(initialChatLists || []);

    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    const filteredChatLists = chatLists.filter(chat =>
        chat?.title?.toLowerCase().includes(filter?.toLowerCase())
    );

    const handleDelete = async (chat_id) => {
        try {
            if (!chat_id) throw new Error("Chat Not Found!");
            setConfirmationLoading(true);
            const res = await removeChat(chat_id);
            if (res?.success) {
                setConfirmationLoading(false);
                setNotif({ active: true, message: res.message, status: 1 });
                setChatLists((chatLists) => chatLists.filter(item => item.chat_id !== chat_id));
                setShowModal({ active: false });
            } else {
                throw new Error(res.message);
            };
        } catch (err) {
            setConfirmationLoading(false)
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    const handleDeleteAll = async () => {
        try {
            setConfirmationLoading(true);
            const res = await removeAllChat();
            if (res?.success) {
                setConfirmationLoading(false);
                setNotif({ active: true, message: res.message, status: 1 });
                setChatLists([]);
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
            <PageTitle title={"Chat Lists"} description={"Empowering Health Through AI"} />

            <div className="flex gap-2 items-center">
                <div className="w-full relative">
                    <svg className='absolute top-3 left-4 text-neutral-500' width="25" height="25" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <input
                        className={`h-12 bg-white pl-12 w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-300 border border-neutral-400 focus:border-neutral-950 text-black`}
                        type="text"
                        id="search"
                        placeholder="Search chats..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 shrink-0">
                    <Link href={'/chats/new'} className="h-12 border border-neutral-800 font-medium px-4 md:px-6 bg-white hover:bg-neutral-200 active:scale-95 rounded-md duration-300 flex gap-2 items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H8.00003V10.5C8.00003 10.7761 7.77617 11 7.50003 11C7.22389 11 7.00003 10.7761 7.00003 10.5V8H4.50003C4.22389 8 4.00003 7.77614 4.00003 7.5C4.00003 7.22386 4.22389 7 4.50003 7H7.00003V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        <span className='text-neutral-800 text-sm leading-tight'>New</span>
                    </Link>
                    <div onClick={() => setShowModal({ active: true, title: "Delete Chat", handleSubmit: handleDeleteAll, btnCancel: "Cancel", btnSubmit: "Delete All", content: <p>Are you sure you would like to delete all chats?</p>, backdrop: true })} data-tip="Clear Chats" className="before:text-xs tooltip tooltip-bottom h-12 border border-red-500 px-4 text-red-500 rounded-md active:scale-95 bg-white hover:bg-red-500/20 cursor-pointer duration-300 flex gap-2 items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </div>
                </div>
            </div>

            { chatLists.length === 0 ? (
                <div className="font-medium text-neutral-500 w-full h-20 flex items-center justify-center">
                    No Chat Found
                </div>
            ): (
                <>
                    <table className="table">
                        <thead>
                            <tr className='text-black'>
                                <th>Title</th>
                                <th className='text-center'>Type</th>
                                <th className='text-center'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            { filteredChatLists.map((chat, i) => (
                                <tr key={i} className='hover:bg-neutral-50 cursor-pointer'>
                                    <td className='w-full py-4'>
                                        <Link href={`/chats/${chat.chat_id}`} className='line-clamp-1 text-blue-500 hover:text-blue-900'>{chat.title}</Link>
                                    </td>

                                    <td className=' w-fit text-center'>
                                        <div data-tip={chat.type} className=" tooltip tooltip-top flex items-center justify-center">
                                            {CHAT_TYPE_OPTIONS[chat.type].icon}
                                        </div>
                                    </td>

                                    <td className='w-fit flex gap-1'>
                                        <span onClick={() => setShowModal({ active: true, title: "Edit Title", handleSubmit: () => {}, btnCancel: "", btnSubmit: "", content: <EditTitleForm chat_id={chat.chat_id} prevTitle={chat.title} setChatLists={setChatLists} />, backdrop: true })}  data-tip={"Edit"}  className="tooltip tooltip-top cursor-pointer flex justify-center hover:bg-neutral-300 rounded-full aspect-square w-fit p-2 duration-300" >
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                        </span>
                                        <span onClick={() => setShowModal({ active: true, title: "Delete Chat", handleSubmit: () => handleDelete(chat.chat_id), btnCancel: "Cancel", btnSubmit: "Delete", content: <p>Are you sure you would like to delete this chat?</p>, backdrop: true })} data-tip={"Delete"} className="tooltip tooltip-top cursor-pointer flex justify-center text-red-500 hover:bg-neutral-300 rounded-full aspect-square w-fit p-2 duration-300">
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                        </span>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

        </div>
    )
}

export default ChatListPage
