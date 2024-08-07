import { updateChatTitle } from "@/app/actions/chatActions";
import { ModalContext } from "@/components/ModalWrapper";
import { NotifContext } from "@/components/NotifWrapper";
import { useContext, useRef, useState } from "react";

const EditTitleForm = ({ chat_id, prevTitle, setChatLists = () => {}, setTitle = () => {} }) => {

    const oldTitle = useRef(prevTitle);
    const [newTitle, setNewTitle] = useState(prevTitle);
    const [errorTitle, setErrorTitle] = useState('');
    const { setNotif } = useContext(NotifContext);
    const { setShowModal, setConfirmationLoading } = useContext(ModalContext);

    const handleEditTitle = async (e) => {
        e.preventDefault();

        if (!newTitle.trim()) {
            setErrorTitle("min 1 characters");
            return;
        };

        if (newTitle === oldTitle.current) {
            setShowModal({ active: false });
            return;
        };

        try {
            if (!chat_id) throw new Error("Chat Not Found!");
            setConfirmationLoading(true)
            const res = await updateChatTitle(newTitle, chat_id);
            if (res?.success) {
                setChatLists((chatLists) => chatLists.map((obj) => {
                    if (obj.chat_id === chat_id) {
                        return { ...obj, title: newTitle };
                    };
                    return obj;
                }));
                setTitle(newTitle);
                setConfirmationLoading(false);
                setShowModal({ active: false });
                setNotif({ active: true, message: res.message, status: 1 });
            } else {
                throw new Error(res.message);
            };
        } catch (err) {
            setConfirmationLoading(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    return (
        <>
            <form onSubmit={handleEditTitle} className="flex flex-col gap-2">
                <label htmlFor="title" className="font-medium text-black">
                    Title<span className="text-red-500">*</span>
                </label>

                <input
                    className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black ${errorTitle && "border-red-500"}`}
                    type="text"
                    id="title"
                    placeholder="chat title"
                    value={newTitle}
                    onChange={(e) => {
                        if(e.target.value.length <= 100) {
                            setErrorTitle('');
                            setNewTitle(e.target.value);
                        }
                    }}
                />

                <div className={`flex items-center ${errorTitle ? "justify-between" : "justify-end"}`}>
                    {errorTitle && <p className="text-red-500 text-xs w-full">{errorTitle}</p>}
                    <div className="text-neutral-500 text-xs">{newTitle.length}/100</div>
                </div>

                <div className="flex gap-2 mt-3">
                    <div onClick={() => setShowModal({ active: false })} className="w-fit text-red-500 border border-red-500 px-5 p-4 rounded-lg active:scale-95 hover:bg-red-500/20 cursor-pointer duration-300 flex gap-2 items-center justify-center">
                        <span className='text-sm leading-3'>{"Cancel"}</span>
                    </div>
                    <button type="submit" className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                        <span>{"Submit"}</span>
                    </button>
                </div>
            </form>
        </>
    )
}

export default EditTitleForm;
