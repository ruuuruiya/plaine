import { updateHealthStatus } from '@/app/actions/userActions';
import { NotifContext } from '@/components/NotifWrapper';
import { LoadingGenerate, PoweredBy } from '@/components/Utils'
import React, { useContext, useState } from 'react'
import Markdown from 'react-markdown';

const HealthDescription = ({ description, setStatus, setDescription }) => {

    const { setNotif } = useContext(NotifContext);
    const [loading, setLoading] = useState(false);

    const handleUpdateStatus = async () => {
        try {
            setLoading(true);
            const res = await updateHealthStatus();
            if(res.success) {
                setStatus(res.data.status);
                setDescription(res.data.description);
                setLoading(false);
            } else {
                throw new Error(res.message);
            };
        } catch (err) {
            setLoading(false);
            setNotif({ active: true, message: "Failed to Update", status: -1 });
        };
    };

    return (
        <div className="w-full md:flex-auto md:w-full h-auto flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2 min-h-7">
                <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium">Why this status?</span>
                    { !loading && (
                        <button onClick={handleUpdateStatus} className="border border-neutral-400 font-medium px-2 py-1 text-center hover:bg-neutral-100 active:scale-95 rounded-md duration-300 flex gap-1 items-center">
                            <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.84998 7.49998C1.84998 4.66458 4.05979 1.84998 7.49998 1.84998C10.2783 1.84998 11.6515 3.9064 12.2367 5H10.5C10.2239 5 10 5.22386 10 5.5C10 5.77614 10.2239 6 10.5 6H13.5C13.7761 6 14 5.77614 14 5.5V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4.31318C12.2955 3.07126 10.6659 0.849976 7.49998 0.849976C3.43716 0.849976 0.849976 4.18537 0.849976 7.49998C0.849976 10.8146 3.43716 14.15 7.49998 14.15C9.44382 14.15 11.0622 13.3808 12.2145 12.2084C12.8315 11.5806 13.3133 10.839 13.6418 10.0407C13.7469 9.78536 13.6251 9.49315 13.3698 9.38806C13.1144 9.28296 12.8222 9.40478 12.7171 9.66014C12.4363 10.3425 12.0251 10.9745 11.5013 11.5074C10.5295 12.4963 9.16504 13.15 7.49998 13.15C4.05979 13.15 1.84998 10.3354 1.84998 7.49998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            <span className='text-xs'>re-check</span>
                        </button>
                    )}
                </div>
                <PoweredBy description={"Health status and recommendations is assessed using Gemini AI, which analyzes your interactions and collected data"} />
            </div>

            <div className="h-full border border-neutral-400 rounded-xl p-5">
                { loading ? (
                    <div className="h-full flex items-center justify-center">
                        <LoadingGenerate description={"Updating Health Status"}/>
                    </div>
                ) : (
                    <div className='text-neutral-600'>
                        <Markdown>
                            {description}
                        </Markdown>
                    </div>
                )}
            </div>
        </div>
    )
};

export default HealthDescription;
