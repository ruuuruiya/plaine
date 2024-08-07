"use server"

import connectDB from "@/config/db";
import { auth } from "../api/auth/[...nextauth]/route";
import Chat from "@/models/chatSchema";
import genAI, { safetySettings } from "@/config/gemini";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { calculateAge, nanoid } from "@/lib/utils";
import Medicine from "@/models/medicineSchema";
import bucketGcs from '@/config/gcs'
import Record from "@/models/recordSchema";

export async function askMedicine(input, chat_id, formData) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        const med_id = formData.get('med_id');
        const image = formData.get('image');

        // Construct
        const newFormData = new FormData();
        if (image) {
            newFormData.append('file', image);
        };
        if (med_id) {

            // GET GCS
            await connectDB();
            const med = await Medicine.findOne({ user_id, med_id });
            const image = med?.image;
            const filenameGcs = "medicines/" + image.split('/').pop();
            const [buffer] = await bucketGcs.file(filenameGcs).download();

            const newImage = new File([buffer], filenameGcs, {
                type: 'image/webp',
                lastModified: new Date().getTime(),
            });
            newFormData.append('file', newImage);
        };

        // Ask
        const res = await postMessage(input, chat_id, newFormData, 'MEDICINE');
        return res;
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };

};

export async function postMessage(input, chat_id, formData, type) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        if (input.length > 5000 || !chat_id) throw new Error("Invalid Request Body");

        // Get File Images
        const fileLists = formData.getAll('file');
        const filePairs = await Promise.all(fileLists.map(async(file) => {

            // POST GCS
            const arrBuff = await file.arrayBuffer();
            const buffer = await sharp(Buffer.from(arrBuff)).webp({ quality: 60, effort: 2 }).toBuffer();
            const filenameGcs = 'chat/' + nanoid() + '.webp';
            await bucketGcs.file(filenameGcs).save(buffer);

            return {
                url: `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filenameGcs}`,
                geminiData: {
                    inlineData: {
                        data: buffer.toString('base64'),
                        mimeType: 'image/webp',
                    },
                },
            };

        }));

        const imageDB = filePairs.map(item => item.url);
        const imageGemini = filePairs.map(item => item.geminiData);

        // Get Prev Messages n Files & RECORDS
        await connectDB();
        const [chat, record] = await Promise.all([
            Chat.findOne({ chat_id }).select('messages files type'),
            Record.findOne({ user_id }),
        ])
        const prevMessages = chat?.messages || [];

        // Construct
        const prompt =
            `Here is user information:
            age: ${record?.birthdate ? calculateAge(birthdate) + " years old" : "Prefer Not To Say"}
            gender: ${record?.gender}
            height: ${record?.height}
            weight: ${record?.weight}
            blood pressure: ${record?.blood_pressure}
            blood sugar levels: ${record?.blood_sugar_level}
            Allergies: ${record?.allergies?.join(', ') || "None Reported"}
            Current medications: ${record?.medications?.map(item => `${item.name}-${item.frequency}`)?.join(', ') || "None Reported"}
            Medical conditions: ${record?.medical_conditions?.join(', ') || "None Reported"}
            Surgical history: ${record?.surgical_history?.map(item => `${item.name}-${item.date}`)?.join(', ') || "None Reported"}
            exercise: ${record?.exercise}
            dietary: ${record?.dietary}
            habits: ${record?.habits}
            occupation: ${record?.occupation}
            location: ${record?.location?.name ? record?.location?.name : "Prefer Not To Say"}
            Goals: ${record?.goals?.join(', ') || "None Reported"}

            User Question: ${input}
            `;

        const baseInstruction =
            `You are an AI-powered personalized healthcare assistant. You have access to the user's health profile and should use this information to provide tailored, relevant responses. Always maintain a professional, empathetic, and supportive tone.

            When responding:
            1. Address the user's specific question or concern first.
            2. Incorporate relevant details from their health profile to personalize your response.
            3. Provide clear, accurate information based on current medical knowledge.
            4. Explain medical terms in simple language when necessary.
            5. Always emphasize the importance of consulting with a qualified healthcare professional for personalized medical advice, diagnosis, or treatment.
            6. Respect the user's privacy and do not reference any information they've marked as "Prefer Not To Say".
            7. If the user's profile indicates any concerning health metrics or conditions, gently suggest they discuss these with their healthcare provider.
            8. Tailor lifestyle recommendations to the user's specific situation (age, medical conditions, exercise habits, etc.).
            9. Be mindful of potential interactions between the user's current medications and any new treatments or supplements you discuss.
            10. If discussing symptoms or treatments, consider the user's allergies and existing medical conditions.
            11. Factor in the user's location when suggesting healthcare resources or discussing region-specific health concerns.
            12. Do not make definitive diagnoses or prescribe treatments. Instead, provide general information and encourage professional medical consultation.

            Remember, your goal is to provide helpful, personalized health information while encouraging appropriate professional medical care.
            `;

        // AI Model Based on ContentType
        const chatType = chat ? chat.type : (type === 'MEDICINE' ? 'MEDICINE' : 'BASE');

        let aiModel;
        if (chatType === 'MEDICINE') {
            aiModel = genAI.getGenerativeModel({
                model: 'gemini-1.5-pro',
                systemInstruction:
                `${baseInstruction}

                As a specialized pharmaceutical assistant:
                1. Provide detailed, personalized information about medications, considering the user's current medications, allergies, and medical conditions.
                2. Discuss potential interactions between the user's current medications and any new medicines they inquire about.
                3. When explaining medication effects or side effects, consider the user's age, gender, and existing health conditions.
                4. If discussing lifestyle changes related to medication use, take into account the user's exercise habits, dietary preferences, and occupation.
                5. Be particularly cautious when discussing medications if the user has multiple medical conditions or is taking several medications.
                6. If the user asks about alternative medicines or supplements, provide factual information while considering their current health status and medications.

                Always prioritize the user's safety and encourage them to consult their healthcare provider before making any changes to their medication regimen.
                `,
                safetySettings,
            });
        } else if (chatType === 'BASE') {
            aiModel = genAI.getGenerativeModel({
                model: 'gemini-1.5-pro',
                systemInstruction:
                `${baseInstruction}

                As a general healthcare assistant:
                1. Provide personalized health information and guidance based on the user's age, gender, medical history, and current health status.
                2. When discussing preventive care or health screenings, consider the user's age, gender, and risk factors indicated in their profile.
                3. If providing lifestyle recommendations, tailor them to the user's current exercise habits, dietary preferences, and occupation.
                4. When explaining symptoms or discussing potential health risks, take into account the user's existing medical conditions, medications, and vital signs (like blood pressure and blood sugar levels).
                5. If the user asks about weight management or fitness, consider their current weight, height, exercise habits, and any relevant medical conditions.
                6. When discussing stress management or mental health, consider the user's occupation and any related information in their profile.
                7. If providing nutritional advice, take into account any dietary restrictions, allergies, or relevant medical conditions the user has reported.

                Strive to provide a holistic view of the user's health, considering all aspects of their profile in your responses.
                `,
                safetySettings,
            });
        } else {
            throw new Error("Invalid Chat Type");
        };

        // Append Inline Data to Prev Message based on Files - Only to Last 30 Messages
        const MAX_CHAT = 30;
        const updatedPrevMessages = await Promise.all(prevMessages.slice(-MAX_CHAT).map(async (item) => {
            const { role, parts, files } = item;
            const newItem = { role, parts: [...parts] };

            if (files && files.length > 0) {
                const filePromises = files.map(async (fileUrl) => {
                    const filenameGcs = "chat/" + fileUrl.split('/').pop();
                    const [buffer] = await bucketGcs.file(filenameGcs).download();
                    return {
                        inlineData: {
                            data: buffer.toString('base64'),
                            mimeType: 'image/webp',
                        },
                    };
                });

                const results = await Promise.all(filePromises);
                newItem.parts.push(...results);
            };
            return newItem;
        }));

        // Ask
        const aiChat = aiModel.startChat({
            history: updatedPrevMessages,
        });
        const aiResponse = await aiChat.sendMessage([prompt, ...imageGemini]);
        const aiResponseText = aiResponse.response.text();

        // Log. Show Token Usage
        console.log(aiResponse.response.usageMetadata);

        // Construct
        const newMessages = [
            { role: 'user', parts: [{ text: input }], files: imageDB },
            { role: 'model', parts: [{ text: aiResponseText }] },
        ];

        // If New Chat
        if (!chat) {

            // Generate Title
            const aiModel = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction:
                `You are a skilled title generator. Your task is to create concise, informative chat titles based on user prompts.

                Follow these guidelines:
                1. Analyze the user's prompt to identify the main topic or question.
                2. Create a title that accurately summarizes the core content of the prompt.
                3. Keep the title concise, using no more than 7 words.
                4. Ensure the title is clear, specific, and representative of the user's intent.
                5. Use active language and keywords from the prompt when appropriate.
                6. If the prompt is a question, try to capture its essence without using question marks.
                7. Avoid vague or overly general titles.
                8. Do not include user names or personal information in the title.

                Your goal is to create a title that gives an immediate understanding of what the chat is about.
                `,
                safetySettings,
            });
            const aiResponse = await aiModel.generateContent([input, ...imageGemini]);
            const aiResponseText = aiResponse.response.text();

            await Chat.create({
                chat_id,
                user_id,
                title: aiResponseText || input.substring(0, 100),
                messages: newMessages,
                files: imageDB,
                type: chatType,
            });

        } else {
            chat.messages = [...chat.messages, ...newMessages];
            chat.files = [...chat.files, ...imageDB];
            await chat.save();
        };

        revalidatePath(`/chats/${chat_id}`);
        return { success: true, message: "Chat Sent!", data: newMessages };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function removeChat(chat_id) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        if (!chat_id) throw new Error("Invalid Request Body");

        // Get File Lists
        await connectDB();
        const chat = await Chat.findOne({ user_id, chat_id }).select('files');
        if (!chat) throw new Error("Chat Not Found");
        const files = chat.files || [];

        // DELETE GCS
        await Promise.all(files.map((url) => {
            const filenameGcs = "chat/" + url.split('/').pop();
            return bucketGcs.file(filenameGcs).delete();
        }));

        // Remove DB
        await Chat.deleteOne({ user_id, chat_id });
        revalidatePath('/chats');

        return { success: true, message: "Chat Deleted!" }
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function removeAllChat() {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Get File Lists
        await connectDB();
        const chats = await Chat.find({ user_id }).select('files');
        if (chats.length === 0) return { success: true, message: "Chat Deleted!" };
        const files = chats.flatMap(obj => obj.files);

        // DELETE GCS
        await Promise.all(files.map((url) => {
            const filenameGcs = "chat/" + url.split('/').pop();
            return bucketGcs.file(filenameGcs).delete();
        }));

        // Remove DB
        await Chat.deleteMany({ user_id });
        revalidatePath('/chats');

        return { success: true, message: "Chat Deleted!" }
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function updateChatTitle(input, chat_id) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        if (!input || typeof input !== 'string' || input.length < 1 || input.length > 100) throw new Error("Invalid Request");

        await connectDB();
        await Chat.updateOne({ user_id, chat_id }, {
            title: input
        });

        revalidatePath(`/chats`);
        revalidatePath(`/chats/${chat_id}`);
        return { success: true, message: "Chat Updated!" }
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};
