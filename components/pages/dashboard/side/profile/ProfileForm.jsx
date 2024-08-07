import { useContext, useEffect, useState } from 'react'
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Field } from '@headlessui/react'
import { getGoalSuggestions } from '@/app/actions/profileActions';
import { EXERCISE_OPTIONS, DIETARY_OPTIONS, HABIT_OPTIONS, GENDER_OPTIONS, WEIGHT_OPTIONS, HEIGHT_OPTIONS, BLOOD_PRESSURE_OPTIONS, BLOOD_SUGAR_LEVEL_OPTIONS, FREQUENCY_OPTIONS } from '@/lib/globals';
import { LoadingGenerate, LoadingPage, PoweredBy } from '@/components/Utils';
import { NotifContext } from '@/components/NotifWrapper';

const ProfileForm = ({
    step,

    // Step 1
    username, setUsername,
    birthdate, setBirthdate,
    gender, setGender,
    height, setHeight,
    weight, setWeight,
    bloodPressure, setBloodPressure,
    bloodSugarLevel, setBloodSugarLevel,

    errorUsername, setErrorUsername,

    // Step 2
    allergies, setAllergies,
    medications, setMedications,
    medicalConditions, setMedicalConditions,
    surgicalHistory, setSurgicalHistory,

    // Step 3
    exercise, setExercise,
    dietary, setDietary,
    habits, setHabits,
    occupation, setOccupation,
    locationCoordinate, setLocationCoordinate,

    location, setLocation,

    // Step 4
    goals, setGoals,
    suggestions, setSuggestions,
}) => {

    // Load Google Maps API
    const [libraries, setLibraries] = useState(['places'])
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    if (!isLoaded) {
        return (
            <div className="w-full h-[calc(80vh-10rem)]">
                <LoadingPage />
            </div>
        )
    };

    return (

        <div className="w-full flex justify-center bg-white">
            <div className="max-w-7xl w-full">
                {
                    step === 1 ? (
                        <Step1
                            // Step 1
                            username={username} setUsername={setUsername}
                            birthdate={birthdate} setBirthdate={setBirthdate}
                            gender={gender} setGender={setGender}
                            height={height} setHeight={setHeight}
                            weight={weight} setWeight={setWeight}
                            bloodPressure={bloodPressure} setBloodPressure={setBloodPressure}
                            bloodSugarLevel={bloodSugarLevel} setBloodSugarLevel={setBloodSugarLevel}

                            errorUsername={errorUsername} setErrorUsername={setErrorUsername}
                        />
                    ) : step === 2 ? (
                        <Step2
                            // Step 2
                            allergies={allergies} setAllergies={setAllergies}
                            medications={medications} setMedications={setMedications}
                            medicalConditions={medicalConditions} setMedicalConditions={setMedicalConditions}
                            surgicalHistory={surgicalHistory} setSurgicalHistory={setSurgicalHistory}
                        />
                    ) : step === 3 ? (
                        <Step3
                            // Step 3
                            exercise={exercise} setExercise={setExercise}
                            dietary={dietary} setDietary={setDietary}
                            habits={habits} setHabits={setHabits}
                            occupation={occupation} setOccupation={setOccupation}
                            locationCoordinate={locationCoordinate} setLocationCoordinate={setLocationCoordinate}

                            location={location} setLocation={setLocation}
                        />
                    ) : step === 4 ? (
                        <Step4
                            // Prev Value to Generate Suggestions
                            birthdate={birthdate}
                            gender={gender}
                            height={height}
                            weight={weight}
                            bloodPressure={bloodPressure}
                            bloodSugarLevel={bloodSugarLevel}
                            allergies={allergies}
                            medications={medications}
                            medicalConditions={medicalConditions}
                            surgicalHistory={surgicalHistory}
                            exercise={exercise}
                            dietary={dietary}
                            habits={habits}
                            occupation={occupation}
                            location={location}

                            // Step 4
                            goals={goals} setGoals={setGoals}
                            suggestions={suggestions} setSuggestions={setSuggestions}
                        />
                    ): (
                        <div className="flex items-center justify-center h-full">
                            Refresh Page!
                        </div>
                    )
                }
            </div>
        </div>
    )
};

export default ProfileForm;

const Step4 = ({

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
    location,

    // Step 4
    goals, setGoals,
    suggestions, setSuggestions

}) => {

    const { setNotif } = useContext(NotifContext);
    const [goalQuery, setGoalQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const regenerateSuggestions = async () => {
        setLoading(true);
        const records = { birthdate, gender, height, weight, bloodPressure, bloodSugarLevel, allergies, medications, medicalConditions, surgicalHistory, exercise, dietary, habits, occupation, location };
        try {
            const res = await getGoalSuggestions(records);
            setSuggestions(res?.data);
            setLoading(false);
        } catch (err) {
            setNotif({ active: true, message: "Something Went Wrong!", status: -1 });
            setLoading(false);
        };
    };

    useEffect(() => {
        const getSuggestions = async () => {
            if (suggestions.length === 0) {
                setLoading(true);
                const records = { birthdate, gender, height, weight, bloodPressure, bloodSugarLevel, allergies, medications, medicalConditions, surgicalHistory, exercise, dietary, habits, occupation, location };
                try {
                    const res = await getGoalSuggestions(records);
                    setSuggestions(res?.data);
                    setLoading(false);
                    if (goals?.length === 0) setGoals([res?.data[1], res?.data[5], res?.data[6]]);
                } catch (err) {
                    setNotif({ active: true, message: "Something Went Wrong!", status: -1 });
                    setLoading(false);
                };
            };
        };
        getSuggestions();
    }, []);

    const handleToggleChosen = (suggestion) => {
        if (goals.includes(suggestion)) {
            setGoals(goals.filter((goal) => goal.toLowerCase() !== suggestion.toLowerCase()));
        } else {
            if (goals.length < 20) {
                setGoals([...goals, suggestion]);
            };
        };
    };

    const handleAddGoal = (e, goalQuery) => {
        e.preventDefault();
        if (goals.length < 20) {
            if (!goalQuery.trim()) return;
            setGoals((goals) => [...goals, goalQuery]);
            setGoalQuery("");
        };
    };

    return (
        <div className="flex flex-col gap-5 p-5 ">
            <PageTitle title={"Preferences and Goals"} description={"Choose what fits your health ambitions"} />

            <div className="w-full border border-black rounded-xl p-5 flex flex-col gap-5 h-min">
                <div className="flex justify-between flex-col md:flex-row gap-3">
                    <div className="flex items-center gap-2">
                        <span className='text-sm font-medium'>AI Suggestions</span>
                        {
                            !loading && (
                                <button onClick={() => regenerateSuggestions()} className="border border-neutral-400 font-medium px-2 py-1 text-center hover:bg-neutral-100 active:scale-95 rounded-md duration-300 flex gap-1 items-center">
                                    <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.84998 7.49998C1.84998 4.66458 4.05979 1.84998 7.49998 1.84998C10.2783 1.84998 11.6515 3.9064 12.2367 5H10.5C10.2239 5 10 5.22386 10 5.5C10 5.77614 10.2239 6 10.5 6H13.5C13.7761 6 14 5.77614 14 5.5V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4.31318C12.2955 3.07126 10.6659 0.849976 7.49998 0.849976C3.43716 0.849976 0.849976 4.18537 0.849976 7.49998C0.849976 10.8146 3.43716 14.15 7.49998 14.15C9.44382 14.15 11.0622 13.3808 12.2145 12.2084C12.8315 11.5806 13.3133 10.839 13.6418 10.0407C13.7469 9.78536 13.6251 9.49315 13.3698 9.38806C13.1144 9.28296 12.8222 9.40478 12.7171 9.66014C12.4363 10.3425 12.0251 10.9745 11.5013 11.5074C10.5295 12.4963 9.16504 13.15 7.49998 13.15C4.05979 13.15 1.84998 10.3354 1.84998 7.49998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    <span className='text-xs'>regenerate</span>
                                </button>
                            )
                        }
                    </div>
                    <PoweredBy description={"Gemini AI provides personalized health goal suggestions based on your profile and input"}/>
                </div>

                <div className="flex flex-wrap gap-2">
                    { loading ? (
                        <LoadingGenerate description={"Generating Suggestions"} />
                    ) : (
                        <>
                            {suggestions.length === 0 ? (
                                <span className='text-neutral-500'>No Suggestions</span>
                            ) : (
                                <>
                                    {suggestions.map((suggestion, i) => (
                                        <div key={i} onClick={() => handleToggleChosen(suggestion)} className={`cursor-pointer border ${goals.includes(suggestion) ? 'border-black bg-neutral-100' : 'border-neutral-500'}  p-2 rounded-xl w-fit flex gap-2 items-center`}>
                                            <span className={`text-sm  ${goals.includes(suggestion) ? 'text-black font-medium' : ' text-neutral-500'}`}>{suggestion}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="border border-neutral-400 rounded-lg p-3 flex flex-wrap gap-2 md:gap-5 justify-center">
                    { goals.length === 0 ? (
                        <span className='text-neutral-500'>Add Your Health Goals</span>
                    ) : (
                        <>
                            {goals.map((goal, i) => (
                                <div key={i} className="border border-black p-2 md:p-4 rounded-xl w-fit flex gap-2 items-center">
                                    <svg onClick={() => setGoals((goals) => goals.filter((item) => item.toLowerCase() !== goal.toLowerCase()))} className='cursor-pointer shrink-0' width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    <span className='text-base md:text-xl break-all'>{goal}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <form className="flex gap-2">
                    <input
                        className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                        type="text"
                        id="goals"
                        placeholder="Add New Goals"
                        value={goalQuery}
                        onChange={(e) => { if (goalQuery.length <= 50) setGoalQuery(e.target.value) }}
                    />

                    <button onClick={(e) => handleAddGoal(e, goalQuery)} className="border border-neutral-400 font-medium px-7 text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 rounded-md duration-300 flex gap-2 items-center">
                        <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </button>
                </form>
            </div>

        </div>
    )
}

const Step3 = ({

    // Step 3
    exercise, setExercise,
    dietary, setDietary,
    habits, setHabits,
    occupation, setOccupation,
    locationCoordinate, setLocationCoordinate,

    location, setLocation

}) => {

    // Google Maps
    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions
    } = usePlacesAutocomplete({ debounce: 300 });

    const handleChangeLocation = async (location) => {
        setLocation(location);
        if (location) {
            const results = await getGeocode({ address: location });
            const { lat, lng } = await getLatLng(results[0]);
            setLocationCoordinate({ lat, lng });
        } else {
            setLocationCoordinate(null);
        };
    };

    return (
        <div className="flex flex-col gap-5 p-5 ">
            <PageTitle title={"Quality of Life"} description={"Optimizing care based on your daily realities"} />

            <div className="flex flex-col md:flex-row gap-5">

                {/* Location */}
                <div className="w-full border border-black rounded-xl p-5 flex flex-col gap-5 h-min">
                    <FormTitle title={"Environmental Factors"} description={"Evaluating environmental influences on wellbeing"} />

                    <div className='flex flex-col gap-5'>

                        {/* Location */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="location" className="font-medium text-black">
                                    Location
                                </label>
                                <div className="flex gap-1 items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="20" height="20"><path fill="#48b564" d="M35.76,26.36h0.01c0,0-3.77,5.53-6.94,9.64c-2.74,3.55-3.54,6.59-3.77,8.06	C24.97,44.6,24.53,45,24,45s-0.97-0.4-1.06-0.94c-0.23-1.47-1.03-4.51-3.77-8.06c-0.42-0.55-0.85-1.12-1.28-1.7L28.24,22l8.33-9.88	C37.49,14.05,38,16.21,38,18.5C38,21.4,37.17,24.09,35.76,26.36z"/><path fill="#fcc60e" d="M28.24,22L17.89,34.3c-2.82-3.78-5.66-7.94-5.66-7.94h0.01c-0.3-0.48-0.57-0.97-0.8-1.48L19.76,15	c-0.79,0.95-1.26,2.17-1.26,3.5c0,3.04,2.46,5.5,5.5,5.5C25.71,24,27.24,23.22,28.24,22z"/><path fill="#2c85eb" d="M28.4,4.74l-8.57,10.18L13.27,9.2C15.83,6.02,19.69,4,24,4C25.54,4,27.02,4.26,28.4,4.74z"/><path fill="#ed5748" d="M19.83,14.92L19.76,15l-8.32,9.88C10.52,22.95,10,20.79,10,18.5c0-3.54,1.23-6.79,3.27-9.3	L19.83,14.92z"/><path fill="#5695f6" d="M28.24,22c0.79-0.95,1.26-2.17,1.26-3.5c0-3.04-2.46-5.5-5.5-5.5c-1.71,0-3.24,0.78-4.24,2L28.4,4.74	c3.59,1.22,6.53,3.91,8.17,7.38L28.24,22z"/></svg>
                                    <span className='text-xs text-neutral-500'>Powered by <span className='font-medium text-neutral-900'>Google Maps</span></span>
                                    <div className="tooltip tooltip-left before:max-w-40 before:text-xs before:p-2" data-tip="Google Maps integration provides accurate location data and mapping services">
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <Field disabled={!ready}>
                                <Combobox value={location} onChange={handleChangeLocation} onClose={() => { clearSuggestions(); setValue("", false) }}>
                                    <ComboboxInput
                                        onChange={(e) => setValue(e.target.value)}
                                        className={" w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black"}
                                        placeholder='Search an address'
                                    />
                                    <ComboboxOptions
                                        transition
                                        anchor="bottom"
                                        className="w-[var(--input-width)] rounded-xl flex gap-2 flex-col bg-white p-2 origin-top border transition duration-200 ease-out empty:invisible data-[closed]:scale-95 data-[closed]:opacity-0">

                                        { status === "OK" && data.map(({ place_id, description }) => (
                                            <ComboboxOption key={place_id} value={description} className="data-[focus]:bg-neutral-200 p-2 rounded-lg cursor-pointer">
                                                {description}
                                            </ComboboxOption>
                                        ))}

                                    </ComboboxOptions>
                                </Combobox>
                            </Field>

                            <GoogleMap
                                zoom={12}
                                center={locationCoordinate || { lat: 37.400058, lng: -122.087393}}
                                mapContainerStyle={{ width: '100%', height: '15.4rem' }}
                            >
                                {locationCoordinate && <Marker position={locationCoordinate} />}
                            </GoogleMap>


                            <div className={`flex items-center`}>
                                <div className="text-transparent text-sm">X</div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Lifestyle */}
                <div className="w-full border border-black rounded-xl p-5 flex flex-col gap-5 h-min">
                    <FormTitle title={"Lifestyle"} description={"Assessing lifestyle factors influencing your health"} />

                    <div className='flex flex-col gap-5'>

                        {/* Exercise n Dietary */}
                        <div className="flex gap-2">
                            <SelectionInput title={"Exercise"} value={exercise} setValue={setExercise} options={EXERCISE_OPTIONS} />
                            <SelectionInput title={"Dietary"} value={dietary} setValue={setDietary} options={DIETARY_OPTIONS} />
                        </div>

                        {/* Smoking n Drinking Habits */}
                        <SelectionInput title={"Smoking & Drinking"} value={habits} setValue={setHabits} options={HABIT_OPTIONS} />

                        {/* Occupation */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="occupation" className="font-medium text-black">
                                Occupation
                            </label>

                            <input
                                className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                type="text"
                                id="occupation"
                                placeholder="What do you do for work?"
                                value={occupation}
                                onChange={(e) => { if(e.target.value.length <= 50) setOccupation(e.target.value) }}
                            />

                            <div className={`flex items-center`}>
                                <div className="text-transparent text-sm">X</div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>

    )
};

const Step2 = ({

    // Step 2
    allergies, setAllergies,
    medications, setMedications,
    medicalConditions, setMedicalConditions,
    surgicalHistory, setSurgicalHistory,

}) => {

    const [allergy, setAllergy] = useState("");
    const [medic, setMedic] = useState({ name: "", frequency: "daily" });
    const [medicalCond, setMedicalCond] = useState("");
    const [surgical, setSurgical] = useState({ name: "", date: "" });

    const handleAddAllergy = (e, allergy) => {
        e.preventDefault();
        if (allergies.length < 20) {
            if (!allergy.trim()) return;
            setAllergies((allergies) => [...allergies, allergy]);
            setAllergy("");
        }
    };

    const handleAddMedic = (e, medic) => {
        e.preventDefault();
        if (medications.length < 20) {
            if (!medic.name.trim()) return;
            setMedications((medications) => [...medications, medic]);
            setMedic({ name: "", frequency: "daily" });
        }
    };

    const handleAddSurgical = (e, surgical) => {
        e.preventDefault();
        if (surgicalHistory.length < 20) {
            if (!surgical.name.trim()) return;
            setSurgicalHistory((surgicalHistory) => [...surgicalHistory, surgical]);
            setSurgical({ name: "", date: "" });
        }
    };

    const handleAddMedicalCond = (e, medicalCond) => {
        e.preventDefault();
        if (medicalConditions.length < 20) {
            if (!medicalCond.trim()) return;
            setMedicalConditions((allergies) => [...allergies, medicalCond]);
            setMedicalCond("");
        }
    };

    return (
        <div className="flex flex-col gap-5 p-5 ">
            <PageTitle title={"Medical Records"} description={"Ensure personalized and effective care"} />

            <div className="flex flex-col gap-5">

                {/* Row 1 */}
                <div className="flex flex-col md:flex-row gap-5">

                    {/* Allergies */}
                    <div className="w-full border border-black rounded-xl p-5 flex flex-col gap-5 h-min">
                        <FormTitle title={"Allergy Profile"} description={"Key information for your safety and comfort"} />

                        <div className='flex flex-col gap-5'>
                            <div className="flex flex-col gap-2">
                                <form className="flex gap-2">
                                    <input
                                        className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                        type="text"
                                        id="allergy"
                                        placeholder="List allergens (e.g., peanuts, latex)"
                                        value={allergy}
                                        onChange={(e) => { if(e.target.value.length <= 50) setAllergy(e.target.value) }}
                                    />

                                    <button onClick={(e) => handleAddAllergy(e, allergy)} className="border border-neutral-400 font-medium px-7 text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 rounded-md duration-300 flex gap-2 items-center">
                                        <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    </button>
                                </form>

                                <div className="border border-neutral-400 rounded-lg p-3 flex flex-wrap gap-2">
                                    { allergies.length === 0 ? (
                                        <span className='text-neutral-500'>No Allergy</span>
                                    ) : (
                                        <>
                                            {allergies.map((allergy, i) => (
                                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                    <svg onClick={() => setAllergies((allergies) => allergies.filter((item) => item.toLowerCase() !== allergy.toLowerCase()))} className='cursor-pointer shrink-0' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                                    <span className='break-all'>{allergy}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="w-full border border-black rounded-xl p-5 flex flex-col gap-5 h-min">
                        <FormTitle title={"Current Medications"} description={"Ensuring safe and effective healthcare"} />

                        <div className='flex flex-col gap-5'>
                            <div className="flex flex-col gap-2">
                                <form className="flex gap-2">
                                    <input
                                        className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                        type="text"
                                        id="medicName"
                                        placeholder="Medication names"
                                        value={medic.name}
                                        onChange={(e) => { if(e.target.value.length <= 50) setMedic({ ...medic, name: e.target.value }) }}
                                    />
                                    <select
                                        id='medicFrequency'
                                        value={medic.frequency}
                                        onChange={(e) => setMedic({ ...medic, frequency: e.target.value })}
                                        className={`select w-fit shrink rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}>

                                        { FREQUENCY_OPTIONS.map((item, i) => (
                                            <option key={i} value={item}>{item}</option>
                                        ))}

                                    </select>

                                    <button onClick={(e) => handleAddMedic(e, medic)} className="border border-neutral-400 font-medium px-7 text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 rounded-md duration-300 flex gap-2 items-center">
                                        <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    </button>
                                </form>

                                <div className="border border-neutral-400 rounded-lg p-3 flex flex-wrap gap-2">
                                    { medications.length === 0 ? (
                                        <span className='text-neutral-500'>No Medications</span>
                                    ) : (
                                        <>
                                            {medications.map((medic, i) => (
                                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                    <svg onClick={() => setMedications((medications) => medications.filter(item => item.name.toLowerCase() !== medic.name.toLowerCase()))} className='cursor-pointer shrink-0' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                                    <span className='break-all'>{medic.name} - {medic.frequency}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Row 2 */}
                <div className="flex flex-col md:flex-row gap-5">

                    {/* Medical Conditions */}
                    <div className="w-full border border-black rounded-xl p-5 flex flex-col gap-5 h-min">
                        <FormTitle title={"Medical Conditions"} description={"Essential insights for personalized care"} />

                        <div className='flex flex-col gap-5'>
                            <div className="flex flex-col gap-2">
                                <form className="flex gap-2">
                                    <input
                                        className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                        type="text"
                                        id="medical"
                                        placeholder="List ongoing health issues"
                                        value={medicalCond}
                                        onChange={(e) => { if(e.target.value.length <= 50) setMedicalCond(e.target.value) }}
                                    />

                                    <button onClick={(e) => handleAddMedicalCond(e, medicalCond)} className="border border-neutral-400 font-medium px-7 text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 rounded-md duration-300 flex gap-2 items-center">
                                        <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    </button>
                                </form>

                                <div className="border border-neutral-400 rounded-lg p-3 flex flex-wrap gap-2">
                                    { medicalConditions.length === 0 ? (
                                        <span className='text-neutral-500'>No Medical Conditions</span>
                                    ) : (
                                        <>
                                            {medicalConditions.map((medicalCond, i) => (
                                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                    <svg onClick={() => setMedicalConditions((medicalConditions) => medicalConditions.filter((item) => item.toLowerCase() !== medicalCond.toLowerCase()))} className='cursor-pointer shrink-0' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                                    <span className='break-all'>{medicalCond}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Surgical History */}
                    <div className="w-full border border-black rounded-xl p-5 flex flex-col gap-5 h-min">
                        <FormTitle title={"Surgical History"} description={"Informing future care decisions"} />

                        <div className='flex flex-col gap-5'>
                            <div className="flex flex-col gap-2">
                                <form className="flex gap-2">
                                    <input
                                        className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                        type="text"
                                        id="surgical"
                                        placeholder="Surgical name"
                                        value={surgical.name}
                                        onChange={(e) => { if(e.target.value.length <= 50) setSurgical({ ...surgical, name: e.target.value }) }}
                                    />
                                    <input
                                        className={`datepicker-input w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                        id="surgicalDate"
                                        type="date"
                                        value={surgical.date}
                                        onChange={(e) => setSurgical({ ...surgical, date: e.target.value })}
                                    />
                                    <button onClick={(e) => handleAddSurgical(e, surgical)} className="border border-neutral-400 font-medium px-7 text-center hover:bg-neutral-100 hover:scale-105 active:scale-95 rounded-md duration-300 flex gap-2 items-center">
                                        <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    </button>
                                </form>

                                <div className="border border-neutral-400 rounded-lg p-3 flex flex-wrap gap-2">
                                    { surgicalHistory.length === 0 ? (
                                        <span className='text-neutral-500'>No Surgical History</span>
                                    ) : (
                                        <>
                                            {surgicalHistory.map((surgical, i) => (
                                                <div key={i} className="border border-black p-2 rounded-xl w-fit flex gap-2 items-center">
                                                    <svg onClick={() => setSurgicalHistory((surgicalHistory) => surgicalHistory.filter(item => item.name !== surgical.name))} className='cursor-pointer shrink-0' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                                    <span className='break-all'>{surgical.name} - {surgical.date}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

const Step1 = ({

    // Step 1
    username, setUsername,
    birthdate, setBirthdate,
    gender, setGender,
    height, setHeight,
    weight, setWeight,
    bloodPressure, setBloodPressure,
    bloodSugarLevel, setBloodSugarLevel,

    errorUsername, setErrorUsername

}) => {

    const handleUsername = (e) => {
        const inputText = e.target.value;
        if (inputText.length <= 50) {
            setErrorUsername("");
            setUsername(inputText);
        };
    };

    return (
        <div className="flex flex-col gap-5 p-5 ">
            <PageTitle title={"Personal Information"} description={"Personalizing Your Health Experience"} />

            <div className="flex flex-col md:flex-row gap-5">

                {/* Basic Information */}
                <div className="w-full border border-black rounded-xl p-5 flex flex-col gap-5 h-min">
                    <FormTitle title={"Basic Information"} description={"We collect this data from your google account"} />

                    <div className='flex flex-col gap-5'>

                        {/* Username */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="username" className="font-medium text-black">
                                Name<span className='text-red-500'>*</span>
                            </label>

                            <input
                                className={`w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black ${errorUsername && "border-red-500"}`}
                                type="text"
                                id="username"
                                placeholder="a name that represents you"
                                value={username}
                                onChange={handleUsername}
                            />

                            <div className={`flex items-center ${errorUsername ? "justify-between" : "justify-end"}`}>
                                {errorUsername && <p className="text-red-500 text-xs w-full">{errorUsername}</p>}
                                <div className="text-neutral-500 text-xs">{username.length}/50</div>
                            </div>
                        </div>

                        {/* Birthdate */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="birthdate" className="font-medium text-black">
                                Birthdate
                            </label>

                            <input
                                className={`datepicker-input w-full p-3 rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}
                                id="birthdate"
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                            />

                            <div className={`flex items-center`}>
                                <div className="text-transparent text-sm">X</div>
                            </div>
                        </div>

                        {/* Gender */}
                        <SelectionInput title={"Gender"} value={gender} setValue={setGender} options={GENDER_OPTIONS}/>

                    </div>
                </div>

                {/* Biometric Data */}
                <div className="w-full border border-black rounded-xl p-5 flex flex-col gap-5 h-min">
                    <FormTitle title={"Biometric Information"} description={"Essentials for monitoring your health conditions"} />

                    <form className='flex flex-col gap-5'>

                        {/* Weight n Height */}
                        <div className="flex gap-2">
                            <SelectionInput title={"Weight"} value={weight} setValue={setWeight} options={WEIGHT_OPTIONS}/>
                            <SelectionInput title={"Height"} value={height} setValue={setHeight} options={HEIGHT_OPTIONS}/>
                        </div>

                        {/* Blood Pressure */}
                        <SelectionInput title={"Blood Pressure"} value={bloodPressure} setValue={setBloodPressure} options={BLOOD_PRESSURE_OPTIONS}/>

                        {/* Blood Sugar Levels */}
                        <SelectionInput title={"Blood Sugar Levels"} value={bloodSugarLevel} setValue={setBloodSugarLevel} options={BLOOD_SUGAR_LEVEL_OPTIONS}/>

                    </form>
                </div>
            </div>
        </div>
    )
};

const SelectionInput = ({ title, desc, value, setValue, options }) => {
    return (
        <div className="w-full flex flex-col gap-2">
            <label htmlFor={title} className="font-medium text-black">
                {title}
                <span className="text-neutral-500 text-xs pl-3 italic font-normal">{desc}</span>
            </label>

            <select
                id={title}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`select w-full rounded-md focus:outline-none placeholder:text-neutral-500 border border-neutral-400 focus:border-neutral-950 bg-white text-black`}>

                { options.map((item, i) => (
                    <option key={i} value={item}>{item}</option>
                ))}

            </select>

            <div className={`flex items-center`}>
                <div className="text-transparent text-sm">X</div>
            </div>
        </div>
    )
};

const FormTitle = ({ title, description }) => {
    return (
        <div className="flex flex-col gap-1">
            <h2 className='text-lg font-medium'>{title}</h2>
            <span className='text-sm text-neutral-500'>{description}</span>
        </div>
    )
};

const PageTitle = ({ title, description }) => {
    return (
        <div className="flex justify-between gap-3 md:items-end flex-col md:flex-row">
            <div className="flex flex-col gap-1">
                <h1 className='text-xl font-bold'>{title}</h1>
                <span className='text-sm text-neutral-500'>{description}</span>
            </div>
            <div className="flex gap-1 items-center">
                <span className='text-sm font-medium'>Learn how we use your information</span>
                <div className="tooltip tooltip-bottom md:tooltip-left before:max-w-48 md:before:max-w-72 before:text-xs before:p-2" data-tip="To improve accuracy and personalize your experience, understanding your data is essential. Sharing is optional.">
                    <svg  width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </div>
            </div>
        </div>
    )
};
