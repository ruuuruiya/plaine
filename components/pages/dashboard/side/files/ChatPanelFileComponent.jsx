

import ReactTextareaAutosize from 'react-textarea-autosize';
import { useEnterSubmit } from "@/lib/hooks/useEnterSubmit";

const ChatPanelFileComponent = ({ loading, input, setInput, handleSubmit }) => {

    const { formRef, onKeyDown } = useEnterSubmit();

    const handleInputChange = (e) => {
        const inputText = e.target.value;
        if (inputText.length <= 5000) {
            setInput(e.target.value);
        };
    };

    return (
        <>
            <div className='w-full mx-auto relative '>
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
                        className="p-3 pr-14 pl-5 border placeholder:select-none border-neutral-400 bg-white rounded-xl focus:outline-none focus:border-dark-400 bg-transparent w-full md:max-w-[50rem] resize-none scrollbar-none"
                    />

                    <p className=' text-xs text-center font-medium text-neutral-500 select-none'>Always double-check critical details</p>

                    <div className="w-full md:max-w-[50rem] relative">
                        <button type='submit' disabled={loading || input?.trim() === ''} className="absolute right-5 -top-[4.3rem]">
                            <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </button>
                    </div>
                </form>

            </div>
        </>
    )
};

export default ChatPanelFileComponent;
