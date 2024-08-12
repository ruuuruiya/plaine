"use server"

import { auth } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/config/db";
import mongoose from "mongoose";
import Record from "@/models/recordSchema";
import User from "@/models/userSchema";
import { redirect } from "next/navigation";
import genAI, { safetySettings } from "@/config/gemini";
import { updateAllRecommendations, updateHealthStatus, updatePotentialHealthIssues } from "./userActions";
import { calculateAge, nanoid } from "@/lib/utils";
import Plan from "@/models/planSchema";

export async function getGoalSuggestions(records) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };

    const {
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
    } = records;

    // Construct Prompt
    const prompt =
        `Here is user information:
        age: ${birthdate ? calculateAge(birthdate) + " years old" : "Not Provided"}
        gender: ${gender}
        height: ${height}
        weight: ${weight}
        blood pressure: ${bloodPressure}
        blood sugar levels: ${bloodSugarLevel}
        allergies: ${allergies.join(', ')}
        medications: ${medications.map(item => `${item.name}-${item.frequency}`).join(', ')}
        medical conditions: ${medicalConditions.join(', ')}
        surgical history: ${surgicalHistory.map(item => `${item.name}-${item.date}`).join(', ')}
        exercise: ${exercise}
        dietary: ${dietary}
        habits: ${habits}
        occupation: ${occupation}
        location: ${location ? location : "Prefer Not To Say"}
        `;

    try {
        const aiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: "You are an AI health assistant. Your task is to analyze the provided user health information and generate an array of 10 personalized health goals. Each goal should be concise, consisting of 2-5 words. If limited or no user information is provided, suggest general health improvement goals. The goals should be practical, actionable, and relevant to improving overall health and well-being. Return your response as a valid JSON array of strings.",
            generationConfig: {
                responseMimeType: "application/json"
            },
            safetySettings,
        });
        const aiResult = await aiModel.generateContent(prompt);
        const aiResponseText = aiResult.response.text();

        // Parsing Response
        const jsArray = JSON.parse(aiResponseText);
        if (!Array.isArray(jsArray) || jsArray.length === 0) throw new Error('Parsed JSON is not a valid array');
        return { success: true, message: "Goal Suggestions Updated", data: jsArray};
    } catch (err) {
        console.log(err.message);
        return { success: true, message: "Goal Suggestions Updated", data: [ "Lose weight", "Build muscle", "Eat more fruits and vegetables", "Drink more water", "Reduce stress", "Get better sleep", "Quit smoking", "Reduce alcohol intake", "Improve flexibility", "Increase cardiovascular fitness" ]};
    };
};

export async function updateRecords(records) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    // Redirect URL initialization
    let redirectTo = "";

    try {
        const updatedRecords = {
            user_id,

            username: records.username,
            birthdate: records.birthdate,
            gender: records.gender,
            height: records.height,
            weight: records.weight,
            blood_pressure: records.bloodPressure,
            blood_sugar_level: records.bloodSugarLevel,

            allergies: records.allergies,
            medications: records.medications,
            medical_conditions: records.medicalConditions,
            surgical_history: records.surgicalHistory,

            exercise: records.exercise,
            dietary: records.dietary,
            habits: records.habits,
            occupation: records.occupation,
            location: records.location,

            goals: records.goals,
        };

        await connectDB();

        // Check if updating existing record or onboarding
        const prevRecord = await Record.findOne({ user_id });
        if (prevRecord) {
            // Update existing record
            await Record.updateOne({ user_id }, updatedRecords);
            redirectTo = '/profile';
        } else {
            // Onboarding: Create new record, update user, and initialize plans
            records.user_id = user_id;
            const session = await mongoose.startSession();
            await session.withTransaction(async () => {
                await Record.create([updatedRecords], { session });
                await User.updateOne({ user_id }, { is_first_login: false }, { session });
                await Plan.create({ user_id, plans: [] }, { session });
            })
            await session.endSession();

            // Retrieve information for dashboard and initial plan setup
            await Promise.all([
                updateHealthStatus(),
                updateAllRecommendations(),
                updatePotentialHealthIssues(),
                Plan.updateOne({ user_id }, {
                    plan_list: [
                        { plan_id: nanoid(), title: "Improve my overall fitness by incorporating regular exercise into my routine.", description: "", deadline: "", status: "0", column: "0" },
                        { plan_id: nanoid(), title: "Increasing my intake of fresh fruits, vegetables, lean proteins, and whole grains.", description: "", deadline: "", status: "1", column: "0" },
                        { plan_id: nanoid(), title: "Cultivate a balanced lifestyle by integrating wellness practices that support both my physical and mental health.", description: "", deadline: "", status: "2", column: "1" },
                    ]
                })
            ]);
            redirectTo = '/dashboard';
        };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    } finally {
        if (redirectTo) {
            redirect(redirectTo);
        };
    };
};
