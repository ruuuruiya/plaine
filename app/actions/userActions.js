"use server"

import connectDB from "@/config/db"
import User from "@/models/userSchema";
import { auth } from "../api/auth/[...nextauth]/route";
import genAI, { safetySettings } from "@/config/gemini";
import Record from "@/models/recordSchema";
import { calculateAge } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import Medicine from "@/models/medicineSchema";
import Chat from "@/models/chatSchema";

export async function updatePotentialHealthIssues() {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {
        await connectDB();

        // Construct
        const record = await Record.findOne({ user_id }).lean();
        const prompt =
            `Here is user information:
            Name: ${record?.username || "User"}
            Age: ${record?.birthdate ? calculateAge(record?.birthdate) + " years old" : "Not Provided"}
            Gender: ${record?.gender}
            Height: ${record?.height}
            Weight: ${record?.weight}
            Blood pressure: ${record?.blood_pressure}
            Blood sugar levels: ${record?.blood_sugar_level}
            Allergies: ${record?.allergies?.join(', ') || "None Reported"}
            Current medications: ${record?.medications?.map(item => `${item.name}-${item.frequency}`)?.join(', ') || "None Reported"}
            Medical conditions: ${record?.medical_conditions?.join(', ') || "None Reported"}
            Surgical history: ${record?.surgical_history?.map(item => `${item.name}-${item.date}`)?.join(', ') || "None Reported"}
            Exercise: ${record?.exercise}
            Dietary: ${record?.dietary}
            Habits: ${record?.habits}
            Occupation: ${record?.occupation}
            Location: ${record?.location?.name ? record?.location?.name : "Prefer Not To Say"}
            Goals: ${record?.goals?.join(', ') || "None Reported"}
            `;

        // Ask Gemini
        const aiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction:
            `You are an AI health risk assessor. Your task is to analyze the provided user health profile and identify potential health issues or risks. Generate a list of 5 potential health concerns based on the information given.

            Guidelines:
            1. Carefully review all aspects of the user's health profile, including age, gender, medical history, current medications, and lifestyle factors.
            2. Identify 5 distinct potential health issues or risks that are most relevant to the user's profile.
            3. For each potential health issue:
                - Start with an emoji that represents the health concern
                - Provide a concise description of the potential issue (aim for 8-15 words)
                - Ensure the description is clear, informative, and directly related to information in the user's profile
                - Use medical terminology appropriately, but explain any complex terms
                - Focus on potential risks rather than making definitive diagnoses

            4. Consider both current health conditions and potential future risks based on the profile.
            5. If the profile lacks sufficient information for 5 distinct issues, include general health risks associated with the user's age group or known factors.
            6. Maintain a professional and factual tone, avoiding alarmist language.

            Format your response as a valid JSON array of 5 strings, where each string represents a potential health issue.
            Ensure that your assessment is based solely on the information provided in the user's health profile. Do not make assumptions beyond what is explicitly stated or strongly implied by the given data.
            `,
            safetySettings,
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 1.8,
                topP: 0.95,
            },
        });
        const aiResult = await aiModel.generateContent(prompt);
        const aiResponseText = aiResult.response.text();

        // Js Array
        const jsArray = JSON.parse(aiResponseText);
        if (!Array.isArray(jsArray)) throw new Error('Parsed JSON is not an array');

        await User.updateOne({ user_id }, {
            'health_issues': jsArray,
        });

        return { success: true, message: "Updated", data: jsArray };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function updateAllRecommendations() {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        await connectDB();

        // Construct
        const record = await Record.findOne({ user_id }).lean();
        const prompt =
            `Here is user information:
            Name: ${record?.username || "User"}
            Age: ${record?.birthdate ? calculateAge(record?.birthdate) + " years old" : "Not Provided"}
            Gender: ${record?.gender}
            Height: ${record?.height}
            Weight: ${record?.weight}
            Blood pressure: ${record?.blood_pressure}
            Blood sugar levels: ${record?.blood_sugar_level}
            Allergies: ${record?.allergies?.join(', ') || "None Reported"}
            Current medications: ${record?.medications?.map(item => `${item.name}-${item.frequency}`)?.join(', ') || "None Reported"}
            Medical conditions: ${record?.medical_conditions?.join(', ') || "None Reported"}
            Surgical history: ${record?.surgical_history?.map(item => `${item.name}-${item.date}`)?.join(', ') || "None Reported"}
            Exercise: ${record?.exercise}
            Dietary: ${record?.dietary}
            Habits: ${record?.habits}
            Occupation: ${record?.occupation}
            Location: ${record?.location?.name ? record?.location?.name : "Prefer Not To Say"}
            Goals: ${record?.goals?.join(', ') || "None Reported"}

            please provide the recommendations for food, exercise, and activity
            `;

        // Ask
        const aiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction:
            `You are a personalized health and wellness advisor. Your task is to provide tailored recommendations based on the user's profile using the following JSON schema:
            {
                "food": ["string"],
                "exercise": ["string"],
                "activity": ["string"],
            }
            Follow this Guidelines:
                1. You will be given a user profile containing their information or not provided
                2. The focus area food, exercise, and activity (fun things to do)
                3. Based on the user profile, generate 5 specific, personalized recommendations.
                4. Each recommendation should:
                    - Start with an emoji related to the recommendation
                    - Be concise yet descriptive (aim for 3-7 words)
                    - Take into account the user's health conditions, age, gender, and other relevant profile information if provided

            Format your response as a valid JSON Object.
            `,
            safetySettings,
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 1.8,
                topP: 0.95,
            },
        });
        const aiResult = await aiModel.generateContent(prompt);
        const aiResponseText = aiResult.response.text();

        // Parsing Response - Object
        const jsObject = JSON.parse(aiResponseText);

        await User.updateOne({ user_id }, {
            'recommendations.food': jsObject.food,
            'recommendations.exercise': jsObject.exercise,
            'recommendations.activity': jsObject.activity,
        });

        return { success: true, message: "Updated", data: jsObject };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function updateRecommendations(state) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        if (typeof state !== 'string' || !['food', 'exercise', 'activity'].includes(state)) {
            throw new Error('Invalid Request Body');
        };

        await connectDB();

        // Construct
        const record = await Record.findOne({ user_id }).lean();
        const prompt =
            `Here is user information:
            Name: ${record?.username || "User"}
            Age: ${record?.birthdate ? calculateAge(record?.birthdate) + " years old" : "Not Provided"}
            Gender: ${record?.gender}
            Height: ${record?.height}
            Weight: ${record?.weight}
            Blood pressure: ${record?.blood_pressure}
            Blood sugar levels: ${record?.blood_sugar_level}
            Allergies: ${record?.allergies?.join(', ') || "None Reported"}
            Current medications: ${record?.medications?.map(item => `${item.name}-${item.frequency}`)?.join(', ') || "None Reported"}
            Medical conditions: ${record?.medical_conditions?.join(', ') || "None Reported"}
            Surgical history: ${record?.surgical_history?.map(item => `${item.name}-${item.date}`)?.join(', ') || "None Reported"}
            Exercise: ${record?.exercise}
            Dietary: ${record?.dietary}
            Habits: ${record?.habits}
            Occupation: ${record?.occupation}
            Location: ${record?.location?.name ? record?.location?.name : "Prefer Not To Say"}
            Goals: ${record?.goals?.join(', ') || "None Reported"}

            please provide ${state === "activity" ? "fun things to do" : state} recommendations
            `;

        // Ask
        const aiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction:
            `You are a personalized health and wellness advisor. Your task is to provide tailored recommendations based on the user's profile and a specified focus area.

            Follow this Guidelines:
                1. You will be given a user profile containing their information or not provided
                2. The focus area is: '${state === "activity" ? "fun things to do" : state}'
                3. Based on the user profile and the focus area, generate 5 specific, personalized recommendations.
                4. Each recommendation should:
                    - Start with an emoji related to the recommendation
                    - Be concise yet descriptive (aim for 3-7 words)
                    - Be directly relevant to this focus area: ${state === "activity" ? "fun things to do" : state}
                    - Take into account the user's health conditions, age, gender, and other relevant profile information if provided

            Format your response as a valid JSON array of 5 strings, where each string is a single recommendation.
            `,
            safetySettings,
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 1.8,
                topP: 0.95,
            },
        });
        const aiResult = await aiModel.generateContent(prompt);
        const aiResponseText = aiResult.response.text();

        // Parsing Response - Array
        const jsArray = JSON.parse(aiResponseText);
        if (!Array.isArray(jsArray)) throw new Error('Parsed JSON is not an array');

        if (state === 'food') {
            await User.updateOne({ user_id }, {
                'recommendations.food': jsArray,
            });
        } else if (state === 'exercise') {
            await User.updateOne({ user_id }, {
                'recommendations.exercise': jsArray,
            });
        } else if (state === 'activity') {
            await User.updateOne({ user_id }, {
                'recommendations.activity': jsArray,
            });
        };
        return { success: true, message: "Updated", data: jsArray };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function updateHealthStatus() {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        await connectDB();
        const [record, medicines, chats] = await Promise.all([
            Record.findOne({ user_id }).lean(),
            Medicine.find({ user_id }).select('name').lean(),
            Chat.find({ user_id }).select('title').lean(),
        ]);

        // Construct
        const prompt =
            `Here is user information:
            Name: ${record?.username || "User"}
            Age: ${record?.birthdate ? calculateAge(birthdate) + " years old" : "Not Provided"}
            Gender: ${record?.gender}
            Height: ${record?.height}
            Weight: ${record?.weight}
            Blood pressure: ${record?.blood_pressure}
            Blood sugar levels: ${record?.blood_sugar_level}
            Allergies: ${record?.allergies?.join(', ') || "None Reported"}
            Current medications: ${record?.medications?.map(item => `${item.name}-${item.frequency}`)?.join(', ') || "None Reported"}
            Medical conditions: ${record?.medical_conditions?.join(', ') || "None Reported"}
            Surgical history: ${record?.surgical_history?.map(item => `${item.name}-${item.date}`)?.join(', ') || "None Reported"}
            Exercise: ${record?.exercise}
            Dietary: ${record?.dietary}
            Habits: ${record?.habits}
            Occupation: ${record?.occupation}
            Location: ${record?.location?.name ? record?.location?.name : "Prefer Not To Say"}
            Medicines of Interest: ${medicines?.map(item => item.name).join(', ') || "None Specified"}
            Goals: ${record?.goals?.join(', ') || "None Reported"}

            Recent Conversation Topics: ${chats?.map(item => item.title).join(', ') || "No Previous Conversations"}
            `;

        // Ask
        const aiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: `
                You are an advanced AI health assistant tasked with providing personalized health assessments. Analyze the given user profile and generate a health status. Using the following JSON schema:

                {
                    "status": "string",
                    "description": "string"
                }

                Follow This Guidelines:
                1. The "status" field must be one of the following values in string format: "0", "1", "2", "3", "4", or "5".
                    These status values correspond to the following health conditions:
                    - "0" means Curious or The health status is unknown or not yet assessed. Further evaluation is needed.
                    - "1" means Optimal or Your health is in excellent shape, with no concerns or issues. Keep up the good work!
                    - "2" means Good or Your health is stable and generally positive. There might be minor issues, but overall, you're doing well.
                    - "3" means Moderate or Your health is showing some signs of concern. It's important to monitor and address any potential issues.
                    - "4" means Unwell or Your health is noticeably poor. It's advisable to seek medical advice or take significant steps to improve your condition.
                    - "5" means Critical or Your health is in a serious state. Immediate action is required, and professional medical assistance should be sought without delay.

                2. Description Field:
                    - Provide a 2-3 sentence personalized explanation for the chosen status justifying your choice of health status based on the provided information.
                    - Use the user's name and reference specific health indicators from their profile.
                    - Maintain a supportive and motivational tone, especially for statuses 2-4.
                    - For status 5, convey urgency while remaining professional.

                3. Information Handling
                    - If the information provided is insufficient to make a proper assessment, assign the status "0" (Curious) and explain why more information is needed.
                    - Do not make assumptions about missing information.
                    - Consider the user's recent conversation topics for context, if provided and needed.

                4. Tone and Approach:
                    - Address the user by name and maintain a professional yet empathetic tone.
                    - Encourage positive health behaviors and professional medical consultation when appropriate.
                    - For any concerning health indicators, suggest discussing them with a healthcare provider.

                5. Holistic Assessment:
                    - Consider all provided information, including lifestyle factors and medical history.
                    - Look for potential interactions between medications, conditions, and lifestyle factors.

                Please analyze the given medical information and provide your assessment in the specified JSON format, ensuring a personalized response using the username provided as if you are talking to the user personally. Adopt a supportive and motivational tone, especially for statuses 2-4, encouraging the user to take positive steps for their health. For status 5, maintain a serious and urgent tone.
                Remember, your role is to provide informative insights and encourage health-positive behaviors, not to diagnose or prescribe treatments. Always emphasize the importance of professional medical advice for specific health concerns.
            `,
            safetySettings,
            generationConfig: {
                responseMimeType: "application/json"
            },
        });
        const aiResult = await aiModel.generateContent(prompt);
        const aiResponseText = aiResult.response.text();

        // Parsing Response
        const jsObject = JSON.parse(aiResponseText);

        await User.updateOne({ user_id }, {
            'health_status.status': jsObject.status,
            'health_status.description': jsObject.description,
            last_login: new Date(),
        });

        revalidatePath('/dashboard');
        return { success: true, message: "Status Updated", data: jsObject };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};
