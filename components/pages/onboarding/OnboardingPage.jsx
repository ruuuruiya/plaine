"use client"

import { useContext, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Stepper } from "@/components/Utils";
import ProfileForm from "@/components/pages/dashboard/side/profile/ProfileForm";
import ReviewModal from "@/components/pages/dashboard/side/profile/ProfileReviewModal";
import { NotifContext } from "@/components/NotifWrapper";
import { updateRecords } from "@/app/actions/profileActions";
import { BLOOD_PRESSURE_OPTIONS, BLOOD_SUGAR_LEVEL_OPTIONS, DIETARY_OPTIONS, EXERCISE_OPTIONS, GENDER_OPTIONS, HABIT_OPTIONS, HEIGHT_OPTIONS, WEIGHT_OPTIONS } from "@/lib/globals";

const OnboardingPage = ({ initialUsername }) => {

    const [step, setStep] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const { setNotif } = useContext(NotifContext);

    // Step 1
    const [username, setUsername] = useState(initialUsername);
    const [birthdate, setBirthdate] = useState("");
    const [gender, setGender] = useState(GENDER_OPTIONS[0]);
    const [height, setHeight] = useState(HEIGHT_OPTIONS[0]);
    const [weight, setWeight] = useState(WEIGHT_OPTIONS[0]);
    const [bloodPressure, setBloodPressure] = useState(BLOOD_PRESSURE_OPTIONS[0]);
    const [bloodSugarLevel, setBloodSugarLevel] = useState(BLOOD_SUGAR_LEVEL_OPTIONS[0]);

    const [errorUsername, setErrorUsername] = useState("");

    // Step 2
    const [allergies, setAllergies] = useState([]);
    const [medications, setMedications] = useState([]);
    const [medicalConditions, setMedicalConditions] = useState([]);
    const [surgicalHistory, setSurgicalHistory] = useState([]);

    // Step 3
    const [exercise, setExercise] = useState(EXERCISE_OPTIONS[0]);
    const [dietary, setDietary] = useState(DIETARY_OPTIONS[0]);
    const [habits, setHabits] = useState(HABIT_OPTIONS[0]);
    const [occupation, setOccupation] = useState("");
    const [locationCoordinate, setLocationCoordinate] = useState(null);
    const [location, setLocation] = useState("");

    // Step 4
    const [goals, setGoals] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct
        const records = {
            username,
            birthdate,
            gender,
            height,
            weight,
            bloodPressure,
            bloodSugarLevel,

            allergies,
            medications,
            medicalConditions,
            surgicalHistory,

            exercise,
            dietary,
            habits,
            occupation,
            location: {
                name: location || '',
                coordinate: {...locationCoordinate},
            },

            goals,
        };

        try {
            setLoading(true);
            const res = await updateRecords(records);
            if (res && !res.success) throw new Error(res.message);
        } catch (err) {
            console.log(err.message);
            setLoading(false);
            setNotif({ active: true, message: err.message, status: -1 });
        };
    };

    const handleStepBack = () => {
        if (step > 1) {
            window.scrollTo({ top: 0, behavior: "instant" });
            setStep(step => step - 1)
        };
    };

    const handleStepNext = () => {
        if (step < 4) {

            // Input Validation
            if (step === 1) {
                if (!username.trim()) {
                    setErrorUsername("Name is required");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    return;
                };
            };

            window.scrollTo({ top: 0, behavior: "instant" });
            setStep(step => step + 1) ;
        } else if (step === 4) {
            setShowModal(true);
        };
    };

    return (
        <div className="bg-white min-h-dvh">
            <div className="fixed w-full flex justify-center items-center z-[50] bg-white border-b">
                <div className="flex justify-between items-center max-w-7xl w-full h-20 px-5 gap-5 ">
                    <Link href={"/"} className="flex items-center gap-3 w-fit shrink-0 ">
                        <Image src={"/assets/images/logo_black_transparent.png"} alt="logo" width={100} height={100} className="w-10" />
                        <h2 className="hidden md:block text-lg md:text-xl font-bold">{"ONBOARDING"}</h2>
                    </Link>

                    <Stepper step={step} stepArr={["Basic", "Medical", "Lifestyle", "Goals"]} />
                </div>
            </div>

            <div className="py-20">
                <ProfileForm
                    step={step}

                    // Step 1
                    username={username} setUsername={setUsername}
                    birthdate={birthdate} setBirthdate={setBirthdate}
                    gender={gender} setGender={setGender}
                    height={height} setHeight={setHeight}
                    weight={weight} setWeight={setWeight}
                    bloodPressure={bloodPressure} setBloodPressure={setBloodPressure}
                    bloodSugarLevel={bloodSugarLevel} setBloodSugarLevel={setBloodSugarLevel}

                    errorUsername={errorUsername} setErrorUsername={setErrorUsername}

                    // Step 2
                    allergies={allergies} setAllergies={setAllergies}
                    medications={medications} setMedications={setMedications}
                    medicalConditions={medicalConditions} setMedicalConditions={setMedicalConditions}
                    surgicalHistory={surgicalHistory} setSurgicalHistory={setSurgicalHistory}

                    // Step 3
                    exercise={exercise} setExercise={setExercise}
                    dietary={dietary} setDietary={setDietary}
                    habits={habits} setHabits={setHabits}
                    occupation={occupation} setOccupation={setOccupation}
                    locationCoordinate={locationCoordinate} setLocationCoordinate={setLocationCoordinate}

                    location={location} setLocation={setLocation}

                    // Step 4
                    goals={goals} setGoals={setGoals}
                    suggestions={suggestions} setSuggestions={setSuggestions}
                />
            </div>

            <div className="fixed w-full flex justify-center items-center bg-white z-[50] bottom-0 border-t">
                <div className={`flex ${step > 1 ? "justify-between" : "justify-end"} items-center max-w-7xl w-full h-20 px-5`}>
                    { step > 1 &&
                        <button onClick={handleStepBack} className="border border-neutral-400 font-medium px-7 py-4 text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 rounded-md duration-300 flex gap-2 items-center">
                            <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            <span>Back</span>
                        </button>
                    }

                    <button onClick={handleStepNext} className="border border-neutral-400 font-medium px-7 py-4 text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 rounded-md duration-300 flex gap-2 items-center">
                        <span>{step === 4 ? "Review" : "Next"}</span>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </button>
                </div>
            </div>

            { showModal && <ReviewModal
                setShowModal={setShowModal} handleSubmit={handleSubmit} loading={loading}

                // Step 1
                username={username}
                birthdate={birthdate}
                gender={gender}
                height={height}
                weight={weight}
                bloodPressure={bloodPressure}
                bloodSugarLevel={bloodSugarLevel}

                // Step 2
                allergies={allergies}
                medications={medications}
                medicalConditions={medicalConditions}
                surgicalHistory={surgicalHistory}

                // Step 3
                exercise={exercise}
                dietary={dietary}
                habits={habits}
                occupation={occupation}

                location={location}

                // Step 4
                goals={goals}
            />}

        </div>
    )
};



export default OnboardingPage;
