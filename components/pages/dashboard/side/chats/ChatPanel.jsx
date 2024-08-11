
import { useEnterSubmit } from '@/lib/hooks/useEnterSubmit';
import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import ReactTextareaAutosize from 'react-textarea-autosize';
import { HiPaperClip } from "react-icons/hi";
import { NotifContext } from '@/components/NotifWrapper';
import { ModalContext } from '@/components/ModalWrapper';

const ChatPanel = ({ loading, input, setInput, files, setFiles, totalFiles, handleSubmit }) => {

    const { formRef, onKeyDown } = useEnterSubmit();
    const { setNotif } = useContext(NotifContext);
    const { setShowModal } = useContext(ModalContext);

    const handleInputChange = (e) => {
        const inputText = e.target.value;
        if (inputText.length <= 5000) {
            setInput(e.target.value);
        };
    };

    // Manage File
    const fileInputRef = useRef(null);
    const [active, setActive] = useState(false);

    const createFileURL = (file) => {
        return { file, url: URL.createObjectURL(file) };
    };

    const handleFile = (selectedFiles) => {
        if (loading) return;
        if ((totalFiles.length + selectedFiles.length + files.length) > 5) {
            setNotif({ active: true, message: "Max 5 Files", status: -1 });
            return;
        };

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        for (const file of selectedFiles) {
            if (!validTypes.includes(file.type)) {
                setNotif({ active: true, message: "Image Only", status: -1 });
                return;
            }
            if (file.size / 1024 / 1024 > 4) {
                setNotif({ active: true, message: "Max 4 MB", status: -1 });
                return;
            }
        };
        setFiles(totalFiles => [...totalFiles, ...selectedFiles.map(createFileURL)]);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        handleFile(selectedFiles);
        e.target.value = '';
    };

    const handleRemoveFile = (index) => {
        setFiles(totalFiles => {
            const newFiles = [...totalFiles];
            URL.revokeObjectURL(newFiles[index].url);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive(true);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setActive(false);
        const selectedFiles = Array.from(e.dataTransfer.files);
        handleFile(selectedFiles);
        e.target.value = '';
    };

    const handleZoneClick = () => {
        fileInputRef.current.click();
    };

    useEffect(() => {
        return () => {
            files.forEach(fileObj => URL.revokeObjectURL(fileObj.url));
        };
    }, []);

    const renderFilePreview = (fileObj, index) => {

        const { file, url } = fileObj;

        if (file.type.startsWith('image/')) {
            return (
                <div key={index} className="shrink-0 relative select-none">
                    <Image onClick={() => setShowModal({ active: true, title: "Image", backdrop: true, content: <Image src={url} width={100} height={100} alt='img' className='w-full h-full rounded-xl object-cover border border-neutral-300' />})} src={url} width={100} height={100} alt='img' className='w-20 h-20 rounded-xl object-cover border border-neutral-300 cursor-pointer'/>
                    <div onClick={() => handleRemoveFile(index)} className='absolute rounded-full p-1 bg-white border border-neutral-200 aspect-square -top-2 -left-2 cursor-pointer hover:bg-neutral-300 duration-300'>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </div>
                </div>
            );
        };

        return null;
    };

    return (
        <>
            <div className='w-full mx-auto relative '>

                {/* Drop Zone */}
                { files.length > 0 && (
                    <div className={`w-full flex items-center justify-center px-4 -mb-4`}>
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragLeave={() => setActive(false)}
                            className={`${active && "bg-neutral-500"} duration-200 scrollbar-none max-w-[45rem] w-full flex gap-5 p-4 bg-neutral-50 rounded-t-xl overflow-x-auto border border-neutral-200`}>
                            {files.map((fileObj, index) => renderFilePreview(fileObj, index))}

                        </div>
                    </div>
                )}

                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="max-h-60 flex flex-col gap-2 items-center justify-start pt-3 px-3 relative ">

                    <ReactTextareaAutosize
                        tabIndex={0}
                        onKeyDown={onKeyDown}
                        rows={1}
                        value={input}
                        onChange={handleInputChange}
                        placeholder='Type Message...'
                        spellCheck={false}
                        className="p-3 pr-14 pl-14 border placeholder:select-none border-neutral-400 bg-white rounded-xl focus:outline-none focus:border-dark-400 bg-transparent w-full md:max-w-[50rem] resize-none scrollbar-none"
                    />

                    <p className=' text-xs text-center font-medium text-neutral-500 select-none'>Always double-check critical details</p>

                    <div className="w-full md:max-w-[50rem] relative ">
                        <div
                            onClick={handleZoneClick}
                            data-tip={`Max 5 files Image only 4MB each`}
                            className="absolute left-5 -top-[4rem] cursor-pointer tooltip tooltip-top before:max-w-28">
                            <HiPaperClip className='scale-125 text-neutral-800'/>
                            <input
                                multiple
                                disabled={loading}
                                type='file'
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className='hidden'
                                accept='.jpg, .jpeg, .png'
                            />
                        </div>
                        <button type='submit' disabled={loading || (input?.trim() === '' && files.length === 0)} className="absolute right-5 -top-[4.3rem]">
                            <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
};

export default ChatPanel;
