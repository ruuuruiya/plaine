const ReviewModal = ({
    setShowModal, handleSubmit, loading,

    // Step 1
    username,
    birthdate,
    gender,
    height,
    weight,
    bloodPressure,
    bloodSugarLevel,

    // Step 2
    allergies,
    medications,
    medicalConditions,
    surgicalHistory,

    // Step 3
    exercise,
    dietary,
    habits,
    occupation,

    location,

    // Step 4
    goals,
}) => {
    return (
        <dialog className={`modal modal-open`}>
            <div className="modal-box scrollbar-none flex flex-col gap-5 bg-white">

                { loading ? (
                    <div className="h-80 flex items-center justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <>
                        {/* Title */}
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Review Profile</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-sm btn-circle btn-ghost ">✕</button>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-3">
                                <h2 className="font-bold">Basic Information</h2>
                                <div className="flex flex-col gap-3 border border-neutral-500 rounded-xl p-3">
                                    <p><span className="font-medium">Name:</span> <span className="text-neutral-500">{username}</span></p>
                                    <p><span className="font-medium">Birthdate:</span> <span className="text-neutral-500">{birthdate || "Prefer Not To Say"}</span></p>
                                    <p><span className="font-medium">Gender:</span> <span className="text-neutral-500">{gender}</span></p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <h2 className="font-bold">Biometric Information</h2>
                                <div className="flex flex-col gap-3 border border-neutral-500 rounded-xl p-3">
                                    <p><span className="font-medium">Height:</span> <span className="text-neutral-500">{height}</span></p>
                                    <p><span className="font-medium">Weight:</span> <span className="text-neutral-500">{weight}</span></p>
                                    <p><span className="font-medium">Blood Pressure:</span> <span className="text-neutral-500">{bloodPressure}</span></p>
                                    <p><span className="font-medium">Blood Sugar Level:</span> <span className="text-neutral-500">{bloodSugarLevel}</span></p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <h2 className="font-bold">Allergies</h2>
                                <div className="flex gap-2 flex-wrap border border-neutral-500 rounded-xl p-3">
                                    { allergies.length === 0 ? (
                                        <span className='text-neutral-500'>No Allergy</span>
                                    ) : (
                                        <>
                                            {allergies.map((allergy, i) => (
                                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                    <span className='break-all'>{allergy}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <h2 className="font-bold">Medications</h2>
                                <div className="flex gap-2 flex-wrap border border-neutral-500 rounded-xl p-3">
                                    { medications.length === 0 ? (
                                        <span className='text-neutral-500'>No Medication</span>
                                    ) : (
                                        <>
                                            {medications.map((medication, i) => (
                                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                    <span className='break-all'>{medication.name} - {medication.frequency}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <h2 className="font-bold">Medical Conditions</h2>
                                <div className="flex gap-2 flex-wrap border border-neutral-500 rounded-xl p-3">
                                    { medicalConditions.length === 0 ? (
                                        <span className='text-neutral-500'>No Medical Condition</span>
                                    ) : (
                                        <>
                                            {medicalConditions.map((medicalCond, i) => (
                                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                    <span className='break-all'>{medicalCond}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <h2 className="font-bold">Surgical History</h2>
                                <div className="flex gap-2 flex-wrap border border-neutral-500 rounded-xl p-3">
                                    { surgicalHistory.length === 0 ? (
                                        <span className='text-neutral-500'>No Surgical History</span>
                                    ) : (
                                        <>
                                            {surgicalHistory.map((surgical, i) => (
                                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                    <span className='break-all'>{surgical.name} - {surgical.date}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <h2 className="font-bold">Quality of Life</h2>
                                <div className="flex flex-col gap-3 border border-neutral-500 rounded-xl p-3">
                                    <p><span className="font-medium">Location:</span> <span className="text-neutral-500">{location || "Prefer Not To Say"}</span></p>
                                    <p><span className="font-medium">Exercise:</span> <span className="text-neutral-500">{exercise}</span></p>
                                    <p><span className="font-medium">Dietary:</span> <span className="text-neutral-500">{dietary}</span></p>
                                    <p><span className="font-medium">Smoking & Drinking:</span> <span className="text-neutral-500">{habits}</span></p>
                                    <p><span className="font-medium">Occupation:</span> <span className="text-neutral-500">{occupation || "Prefer Not To Say"}</span></p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <h2 className="font-bold">Preferences & Goals</h2>
                                <div className="flex gap-2 flex-wrap border border-neutral-500 rounded-xl p-3">
                                    { goals.length === 0 ? (
                                        <span className='text-neutral-500'>No Goals</span>
                                    ) : (
                                        <>
                                            {goals.map((goal, i) => (
                                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                    <span className='break-all'>{goal}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Button */}
                        <div className="flex gap-2 mt-3">
                            <div onClick={() => setShowModal(false)} className="w-fit text-red-500 border border-red-500 px-5 p-4 rounded-lg active:scale-95 hover:bg-red-500/20 cursor-pointer duration-300 flex gap-2 items-center justify-center">
                                <span className='text-sm leading-3'>Cancel</span>
                            </div>
                            <button onClick={handleSubmit} className="w-full border border-neutral-400 font-medium py-3 hover:bg-neutral-100 active:scale-95 rounded-lg duration-300 flex gap-2 items-center justify-center">
                                <span>Submit</span>
                            </button>
                        </div>
                    </>
                )}

            </div>

            { !loading &&
                <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} className="modal-backdrop" >
                    <button>close</button>
                </form>
            }
        </dialog>
    )
};

export default ReviewModal;
