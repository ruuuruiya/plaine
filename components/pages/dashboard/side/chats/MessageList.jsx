import Image from 'next/image';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { CodeBlock } from './utils/CodeBlock';
import { MemoizedReactMarkdown } from './utils/MemoizedMarkdown';
import { useContext } from 'react';
import { ModalContext } from '@/components/ModalWrapper';
import { LoadingGenerate } from '@/components/Utils';

const MessageList = ({ messages, session, loading = false }) => {

    const { setShowModal } = useContext(ModalContext);

    return (
    <>
        <div className="flex flex-col gap-10 py-5">
            {
                messages.map((message, i) => {
                    if (message.role === "user" || message.role === "model") {
                        return (
                            <div key={i} className="flex items-start gap-3 md:gap-5">

                                <Image
                                    src={message.role === "user" ? (session?.user?.image || "/assets/icons/default_pfp.png")  : "/assets/images/logo_black_white_circle.png"}
                                    width={100}
                                    height={100}
                                    alt='profile'
                                    className='w-8 md:w-10 md:h-10 aspect-square rounded-full border border-neutral-300'
                                />

                                <div className="overflow-hidden flex flex-col items-start gap-1">

                                    <p className='font-medium text-sm text-nowrap'>{message.role === "user" ? "You" : `${"Plaine"} AI`}</p>

                                    { message?.files?.length > 0 && (
                                        <div className='flex gap-2 flex-wrap'>
                                            {
                                                message.files.map((file, i) => (
                                                    <Image key={i} src={file} width={100} height={100} onClick={() => setShowModal({ active: true, title: "Image", backdrop: true, content: <Image src={file} width={1000} height={1000} alt='img' className='w-full h-full rounded-xl object-cover border border-neutral-300' />})} alt='img' className='w-20 h-20 rounded-xl object-cover border border-neutral-300 cursor-pointer'/>
                                                ))
                                            }
                                        </div>
                                    )}

                                    <MemoizedReactMarkdown
                                        className='max-w-full prose !prose-stone prose-sm md:prose-lg'
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            p: ({ node, ...props }) => <p className="text-black" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-blue-600 no-underline hover:underline" {...props} />,
                                            table: ({ node, ...props }) => (
                                                <div className="overflow-x-auto">
                                                    <table className="table-auto border-collapse" {...props} />
                                                </div>
                                            ),
                                            img: ({ node, ...props }) => <img className="max-w-full h-auto my-2" {...props} />,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-400 pl-4 italic my-2" {...props} />,
                                            pre: ({ node, ...props }) => <pre className='!p-4 bg-gray-100' {...props} />,
                                            code({ node, className, children, ...props }) {

                                                // Check if match language
                                                const match = /language-(\w+)/.exec(className || '');

                                                return match ? (
                                                    <CodeBlock
                                                        key={Math.random()}
                                                        language={(match && match[1]) || ''}
                                                        value={String(children).replace(/\n$/, '')}
                                                        {...props}
                                                    />
                                                ) : (
                                                    <code className={""} {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            },
                                        }}
                                    >
                                        {message.parts[0].text}
                                    </MemoizedReactMarkdown>

                                </div>

                            </div>
                        )
                    }
                })
            }

            { loading && (
                <div className="flex items-center gap-3 md:gap-5">
                    <Image src="/assets/images/logo_black_white_circle.png" width={80} height={80} alt='profile' className='w-8 md:w-10 md:h-10 aspect-square rounded-full border border-neutral-300'/>
                    <div className="w-fit">
                        <LoadingGenerate description={"Generating AI Response"} />
                    </div>
                </div>
            )}
        </div>
    </>
    )
};

export default MessageList;
