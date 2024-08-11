"use client"

import { useContext, useState } from 'react';
import { postFeedback } from '@/app/actions/feedbackActions';
import { NotifContext } from '@/components/NotifWrapper';
import { LoadingGenerate, PageTitle } from '@/components/Utils';

const FeedbackPage = () => {

    const { setNotif } = useContext(NotifContext);

    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFeedback = (e) => {
        const inputText = e.target.value;
        if (inputText.length <= 1000) {
            setFeedback(inputText);
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim().length || feedback.length > 1000) return;
        try {
            setLoading(true);
            const res = await postFeedback(feedback);
            if (res?.success) {
                setNotif({ active: true, message: res.message, status: 1 });
                setFeedback("");
                setLoading(false);
            } else {
                throw new Error(res.message);
            };
        } catch (err) {
            setLoading(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    return (
        <div className='p-5 flex flex-col gap-5'>
            <PageTitle title={"Feedback"} description={"Help Us Serve You Better!"} />

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <textarea
                    className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-300 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                    rows={7}
                    id="username"
                    placeholder="We value your input and would greatly appreciate it if you could take a moment to leave us your feedback"
                    value={feedback}
                    onChange={handleFeedback}
                />

                <button disabled={loading} type='submit' className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                    { loading ?
                        <LoadingGenerate description={"Submitting"}/>
                    :
                        <span className='text-neutral-800'>
                            Submit Feedback
                        </span>
                    }
                </button>
            </form>
        </div>
    )
};

export default FeedbackPage;
