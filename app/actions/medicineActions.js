"use server"

import Medicine from "@/models/medicineSchema";
import { auth } from "../api/auth/[...nextauth]/route";
import connectDB from "@/config/db";
import bucketGcs from '@/config/gcs'
import { revalidatePath } from "next/cache";
import { FREQUENCY_OPTIONS } from "@/lib/globals";
import genAI, { safetySettings } from "@/config/gemini";
import { nanoid } from "@/lib/utils";
import sharp from "sharp";

export async function postMedicine(formData) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        let image = formData.get('image');
        const data = formData.get('data');
        const { name = "", frequency = "", notes = "", indications = [], contraindications = [], side_effects = [] } = JSON.parse(data);
        if (!name.trim() || !image) throw new Error("Invalid Request Body");

        // POST GCS
        const arrBuffer = await image?.arrayBuffer();
        let buffer = Buffer.from(arrBuffer);
        buffer = await sharp(buffer).webp({ quality: 80 }).resize({ width: 540, height: 540 }).toBuffer();
        const filename = "medicines/" + nanoid() + ".webp"
        await bucketGcs.file(filename).save(buffer);
        image = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`;

        // Save DB
        await connectDB();
        await Medicine.create({
            user_id,
            name,
            frequency,
            notes,
            indications,
            contraindications,
            side_effects,
            image,
        });

        revalidatePath('/medicines');
        return { success: true, message: "Medicine Created" };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function updateMedicine(formData) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        let image = formData.get('image');
        const data = formData.get('data');
        const { med_id, name = "", frequency = "", notes = "", indications = [], contraindications = [], side_effects = [] } = JSON.parse(data);
        if (!med_id, !name.trim() || !image) throw new Error("Invalid Request Body");

        await connectDB();

        // Upload New Image
        if (image?.type?.includes("image")) {

            // Get Old Image
            const oldImage = await Medicine.findOne({ user_id, med_id }).select('image').lean();
            const oldImageUrl = oldImage.image;
            const oldFilename = "medicines/" + oldImageUrl.split('/').pop();

            // DELETE GCS
            await bucketGcs.file(oldFilename).delete();

            // POST GCS
            const arrBuffer = await image?.arrayBuffer();
            let buffer = Buffer.from(arrBuffer);
            buffer = await sharp(buffer).webp({ quality: 80 }).resize({ width: 540, height: 540 }).toBuffer();
            const newFilename = "medicines/" + nanoid() + ".webp"
            await bucketGcs.file(newFilename).save(buffer);
            image = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${newFilename}`;

        };

        // Update DB
        await Medicine.updateOne({ user_id, med_id }, {
            name,
            frequency,
            notes,
            indications,
            contraindications,
            side_effects,
            image,
        });

        revalidatePath('/medicines');
        return { success: true, message: "Medicine Updated" };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };

};

export async function removeMedicine(med_id) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {
        await connectDB();

        // Get Old Image
        const oldImage = await Medicine.findOne({ user_id, med_id }).select('image').lean();
        const oldImageUrl = oldImage.image;
        const oldFilename = "medicines/" + oldImageUrl.split('/').pop();

        // DELETE GCS
        await bucketGcs.file(oldFilename).delete();

        // Remove DB
        await Medicine.deleteOne({ user_id, med_id });

        revalidatePath('/medicines');
        return { success: true, message: "Medicine Deleted" }
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function getMedicineInformation(formData) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };

    try {

        // Validate
        const image = formData.get('image');
        if (!image) throw new Error("Image not defined!");

        // Get base64 img
        let encoded;
        let mimeType;
        if (image?.type?.includes("image")) {
            const bytes = await image.arrayBuffer();
            encoded = Buffer.from(bytes).toString('base64');
            mimeType = image.type;
        } else {
            const filename = "medicines/" + image.split('/').pop();
            const [buffer] = await bucketGcs.file(filename).download();
            encoded = buffer.toString('base64')
            mimeType = 'image/webp';
        };

        if (!encoded || !mimeType) throw new Error("Failed to Get");

        // Ask Gemini
        const aiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction:
                `You are an expert pharmacist with extensive knowledge of medications. Your task is to analyze images of medicines and provide accurate information about them. When presented with an image of a medicine, extract and organize the relevant details according to the following guidelines:
                You will be provided with an image of a medicine. Based on that image, define the information about the medicine using this JSON schema:
                {
                    "name": "string",
                    "frequency": "string",
                    "indications": ["string"],
                    "contraindications": ["string"],
                    "side_effects": ["string"]
                }

                Follow these guidelines:
                1. The "frequency" value must be one of the following options: ${FREQUENCY_OPTIONS.join(', ')}
                2. For "indications", "contraindications", and "side_effects", provide an array of strings, even if there's only one item.
                3. If you cannot identify the medicine or any specific information, leave it empty for that field.
                4. If the entire medicine is unknown, return:
                {
                    "name": "",
                    "frequency": "",
                    "indications": [],
                    "contraindications": [],
                    "side_effects": []]
                }

                Ensure your response is valid JSON and matches the provided schema.
                `,
            safetySettings,
            generationConfig: {
                responseMimeType: "application/json"
            },
        });
        const aiResult = await aiModel.generateContent(["Describe this image", {
            inlineData: {
                data: encoded,
                mimeType,
            },
        }]);
        const aiResponseText = aiResult.response.text();

        // Parsing Response
        const jsObject = JSON.parse(aiResponseText);
        return { success: true, message: "Details Generated", data: jsObject };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};
