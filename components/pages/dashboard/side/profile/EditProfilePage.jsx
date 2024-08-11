"use client"

import { useContext, useState } from 'react'
import ProfileForm from '@/components/pages/dashboard/side/profile/ProfileForm';
import ReviewModal from './ProfileReviewModal';
import { updateRecords } from '@/app/actions/profileActions';
import { NotifContext } from '@/components/NotifWrapper';
import { PageTitle, Stepper } from '@/components/Utils';

const EditProfilePage = ({ initialRecords }) => {

    const [step, setStep] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const { setNotif } = useContext(NotifContext);

    // Step 1
    const [username, setUsername] = useState(initialRecords?.username);
    const [birthdate, setBirthdate] = useState(initialRecords?.birthdate);
    const [gender, setGender] = useState(initialRecords?.gender);
    const [height, setHeight] = useState(initialRecords?.height);
    const [weight, setWeight] = useState(initialRecords?.weight);
    const [bloodPressure, setBloodPressure] = useState(initialRecords?.blood_pressure);
    const [bloodSugarLevel, setBloodSugarLevel] = useState(initialRecords?.blood_sugar_level);

    const [errorUsername, setErrorUsername] = useState("");

    // Step 2
    const [allergies, setAllergies] = useState(initialRecords?.allergies);
    const [medications, setMedications] = useState(initialRecords?.medications);
    const [medicalConditions, setMedicalConditions] = useState(initialRecords?.medical_conditions);
    const [surgicalHistory, setSurgicalHistory] = useState(initialRecords?.surgical_history);

    // Step 3
    const [exercise, setExercise] = useState(initialRecords?.exercise);
    const [dietary, setDietary] = useState(initialRecords?.dietary);
    const [habits, setHabits] = useState(initialRecords?.habits);
    const [occupation, setOccupation] = useState(initialRecords?.occupation);
    const [locationCoordinate, setLocationCoordinate] = useState(initialRecords?.location?.coordinate?.lat ? initialRecords?.location?.coordinate : null);
    const [location, setLocation] = useState(initialRecords?.location?.name);

    // Step 4
    const [goals, setGoals] = useState(initialRecords?.goals);
    const [suggestions, setSuggestions] = useState([])

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
                name: location || "",
                coordinate: {...locationCoordinate},
            },

            goals,
        };

        try {
            setLoading(true);
            const res = await updateRecords(records);
            if (res && !res.success) throw new Error(res.message);
        } catch (err) {
            setLoading(false)
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
        <div className='h-full overflow-hidden flex flex-col justify-between'>
            <div className="p-5 bg-white border-b">
                <PageTitle title="Edit Profile">
                    <Stepper step={step} stepArr={["Basic", "Medical", "Lifestyle", "Goals"]} />
                </PageTitle>
            </div>

            <div className="scrollbar-none overflow-y-auto">
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

            <div className="w-full flex justify-center items-center bg-white border-t">
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

export default EditProfilePage;
