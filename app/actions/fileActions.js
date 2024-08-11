"use server"

import { revalidatePath } from 'next/cache';
import { auth } from '../api/auth/[...nextauth]/route';
import sharp from 'sharp';
import natural from 'natural'
import File from '@/models/fileSchema';
import { nanoid } from "@/lib/utils";
import connectDB from '@/config/db';
import bucketGcs from '@/config/gcs'
import pineconeIndex from "@/config/pinecone";
import genAI, { safetySettings } from "@/config/gemini";

export async function getFileSummary(formData) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };

    try {

        // Image to Base64
        const file = formData.get('file');
        if (!file) throw new Error("Invalid Request Body");
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Generate Title
        const aiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction:
            `You are an expert content analyst specializing in visual interpretation. Your task is to analyze a document without any prior context and generate concise, descriptive summaries.

            When presented with a document, Follow these guidelines:
            1. Carefully analyze all visual elements present.
            2. Identify the main subject or theme of the document.
            3. Determine any notable actions, emotions, or relationships depicted.
            4. Consider the setting and any relevant contextual clues.

            Your goal is to capture the essence of the document in a clear, informative summary and should be 2-3 sentence yet descriptive enough
            `,
            safetySettings,
        });
        const aiResponse = await aiModel.generateContent(["Generate Summary", {
            inlineData: {
                data: base64,
                mimeType: 'image/png',
            },
        }]);
        const aiResponseText = aiResponse.response.text();
        return { success: true, message: "Summary Generated", data: aiResponseText }
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function postMedicalFile(formData) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {
        const file_id = nanoid();

        // Validate
        const file = formData.get('file');
        const cover = formData.get('cover');
        const data = formData.get('data');
        const contentEmbeddings = formData.get('contentEmbeddings');
        const contentVision = formData.getAll('contentVision');
        const {
            name = "Filename",
            totalPage = 0,
            label = "",
            summary = "",
            type = "VISION",
        } = JSON.parse(data);
        if (!file || !name || !type) throw new Error("Invalid Request Body");

        // Check ContentType
        let visionUrls = [];
        if (type === 'VISION') {

            // POST GCS
            const files = await Promise.all(contentVision.map(async(file) => {
                const arrBuff = await file.arrayBuffer();
                const buffer = await sharp(Buffer.from(arrBuff)).webp({ quality: 60 }).toBuffer();
                const filenameGcs = 'files/visions/' + nanoid() + '.webp';
                await bucketGcs.file(filenameGcs).save(buffer);
                return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filenameGcs}`;
            }));
            visionUrls = [...files];

        } else if (type === 'EMBEDDINGS') {

            // 1. Chunking Text
            const tokenizer = new natural.WordTokenizer();
            const words = tokenizer.tokenize(contentEmbeddings);

            const chunks = [];
            let currentChunk = [];
            let currentLength = 0;
            const targetChunkSize = 2000;

            for (const word of words) {
                if (currentLength + word.length + 1 > targetChunkSize && currentLength > 0) {
                    chunks.push(currentChunk.join(' '));
                    currentChunk = [];
                    currentLength = 0;
                }
                currentChunk.push(word);
                currentLength += word.length + 1; // +1 for space
            };

            if (currentChunk.length > 0) {
                chunks.push(currentChunk.join(' '));
            };

            // 2. Generate embeddings for each chunk
            const embeds = await Promise.all(chunks.map(async(text) => {
                const aiModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
                const result = await aiModel.embedContent(text);
                return result.embedding.values;
            }));

            // 3. Construct Vector Object
            const vectors = embeds.map((embed, i) => ({
                id: `chunk_${nanoid()}`,
                values: embed,
                metadata: { text: chunks[i] }
            }));

            // 4. Upsert Batch
            const batchSize = 100;
            const batches = [];
            for (let i = 0; i < vectors.length; i += batchSize) {
                const batch = vectors.slice(i, i + batchSize);
                batches.push(batch);
            };

            await Promise.all(batches.map((batch, i) => {
                pineconeIndex.namespace(file_id).upsert(batch);
            }));

            // NB: Embeddings is using Vision as well
            // POST GCS
            const files = await Promise.all(contentVision.map(async(file) => {
                const arrBuff = await file.arrayBuffer();
                const buffer = await sharp(Buffer.from(arrBuff)).webp({ quality: 60 }).toBuffer();
                const filenameGcs = 'files/visions/' + nanoid() + '.webp';
                await bucketGcs.file(filenameGcs).save(buffer);
                return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filenameGcs}`;
            }));
            visionUrls = [...files];

        } else {
            throw new Error("Invalid Content Type");
        };

        // Check Cover Image n File
        let coverUrl = '';
        let fileUrl = '';
        if (cover && file) {

            // Parallel Cover n File
            const [arrBufferCover, arrBufferFile] = await Promise.all([cover?.arrayBuffer(), file?.arrayBuffer()]);
            const bufferCover = await sharp(Buffer.from(arrBufferCover)).webp({ quality: 80 }).resize({ width: 540, height: 540 }).toBuffer();
            const bufferFile = Buffer.from(arrBufferFile);

            const filenameCover = 'files/cover/' + nanoid() + ".webp"
            const filenameFile = 'files/pdf/' + nanoid() + '.pdf';

            await Promise.all([bucketGcs.file(filenameCover).save(bufferCover), bucketGcs.file(filenameFile).save(bufferFile)])
            coverUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filenameCover}`;
            fileUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filenameFile}`;

        } else {

            // File Only
            const arrBufferFile = await file?.arrayBuffer();
            let bufferFile = Buffer.from(arrBufferFile);
            const filenameFile = 'files/pdf/' + nanoid() + '.pdf';
            await bucketGcs.file(filenameFile).save(bufferFile);
            fileUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filenameFile}`;

        };

        await connectDB();
        await File.create({
            user_id,
            file_id,
            name,
            total_page: totalPage,
            label,
            summary,
            type,
            file_url: fileUrl,
            cover_url: coverUrl,
            vision_urls: visionUrls,
        });

        revalidatePath('/files');
        return { success: true, message: "File Uploaded" };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function updateMedicalFile(formData) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        let cover = formData.get('cover');
        const data = formData.get('data');
        const {
            file_id,
            name = "",
            label = "",
            summary = ""
        } = JSON.parse(data);
        if (!file_id || !name.trim()) throw new Error("Invalid Request Body");

        await connectDB();

        // Upload New Cover
        if (cover?.type?.includes("image")) {

            // DELETE GCS - OldCover if Available
            const oldCover = await File.findOne({ user_id, file_id }).select('cover_url').lean();
            const oldCoverName = oldCover.cover_url ? "files/cover/" + oldCover.cover_url.split('/').pop() : "";
            if (oldCoverName) {
                await bucketGcs.file(oldCoverName).delete();
            };

            // POST GCS
            const arrayBuffer = await cover?.arrayBuffer();
            let bufferCover = await sharp(Buffer.from(arrayBuffer)).webp({ quality: 80 }).resize({ width: 540, height: 540 }).toBuffer();
            const filenameCover = 'files/cover/' + nanoid() + ".webp"
            await bucketGcs.file(filenameCover).save(bufferCover);
            cover = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filenameCover}`;

        } else if (cover === '') { // Remove Cover

            // DELETE GCS - OldCover if Available
            const oldCover = await File.findOne({ user_id, file_id }).select('cover_url').lean();
            const oldCoverName = oldCover.cover_url ? "files/cover/" + oldCover.cover_url.split('/').pop() : "";
            if (oldCoverName) {
                await bucketGcs.file(oldCoverName).delete();
            };
            cover = "";

        };

        await File.updateOne({ user_id, file_id }, {
            name,
            label,
            summary,
            cover_url: cover,
        });

        revalidatePath('/files');
        return { success: true, message: "File Updated" };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function removeFile(file_id) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        if (!file_id) throw new Error("Invalid Request Body");

        // Get File
        await connectDB();
        const oldData = await File.findOne({ user_id, file_id }).lean();
        if (!oldData) throw new Error("File Not Found");
        const oldFilename = "files/pdf/" + oldData.file_url.split('/').pop();
        const oldCoverName = oldData?.cover_url ? "files/cover/" + oldData.cover_url.split('/').pop() : "";
        const oldVisionUrls = oldData?.vision_urls;

        // Wrap Promise
        let promiseAll = [];

            // Remove File
            promiseAll.push(bucketGcs.file(oldFilename).delete());

            // Remove Cover
            if (oldCoverName) promiseAll.push(bucketGcs.file(oldCoverName).delete());

            // GCS / Pinecone
            if (oldData.type === 'VISION') {
                oldVisionUrls.forEach(url => {
                    const toRemove = "files/visions/" + url.split('/').pop();
                    promiseAll.push(bucketGcs.file(toRemove).delete());
                });
            } else if (oldData.type === 'EMBEDDINGS') {
                oldVisionUrls.forEach(url => {
                    const toRemove = "files/visions/" + url.split('/').pop();
                    promiseAll.push(bucketGcs.file(toRemove).delete());
                });
                promiseAll.push(pineconeIndex.namespace(file_id).deleteAll());
            };

            // DB
            const deleteDB = File.deleteOne({ user_id, file_id });
            promiseAll.push(deleteDB);

        // Run
        await Promise.all(promiseAll);

        revalidatePath('/files');
        return { success: true, message: "File Deleted!" }
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function postMedicalFileChat(input, file_id) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        if (input.length > 5000 || !file_id) throw new Error("Invalid Request Body");

        // Get Prev Messages n Files
        await connectDB();
        const file = await File.findOne({ file_id, user_id }).select('messages type vision_urls');
        const prevMessages = file?.messages || [];

        // AI
        const aiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction:
            `You are an intelligent document analysis assistant. Your primary function is to help users understand and extract information from the documents they provide. Follow these guidelines:

            1. Answer questions based solely on the information given in the provided document context.

            2. If the user's query can be fully answered using the document:
            - Provide a clear, concise answer.
            - Cite specific parts of the document to support your response.

            3. If the document contains partial information to answer the query:
            - Offer the available information from the document.
            - Clearly state that the answer is incomplete based on the given context.
            - Suggest what additional information might be needed for a complete answer.

            4. If the document doesn't contain relevant information to the query:
            - Politely inform the user that the current document doesn't address their question.
            - Avoid making assumptions or providing information not present in the document.

            5. If the user doesn't ask a specific question:
            - Offer to summarize the key points of the document.
            - Suggest potential topics or questions they might want to explore based on the document's content.

            6. Always maintain a professional, helpful tone.

            7. If asked about your capabilities or the source of your information, clarify that you are an AI assistant designed to help understand the specific document provided, and your knowledge is limited to that document.

            8. Do not provide any information beyond what is contained in the document or make guesses about information not explicitly stated.

            Remember, your primary goal is to help users understand and extract value from the document they've provided.
            `,
            safetySettings,
        });

        // Remember last 10 messages
        const MAX_CHAT = 10;
        const updatedPrevMessages = prevMessages.slice(-MAX_CHAT).map((item) => {
            return {
                role: item.role,
                parts: [...item.parts]
            }
        });
        const aiChat = aiModel.startChat({
            history: updatedPrevMessages,
        });

        // Check ContentType and Mutating Prompt
        let aiResponseText = '';
        if (file.type === 'VISION') {

            // Convert each vision_urls into inlineData base64
            const filePromises = file.vision_urls.map(async (visionUrl) => {
                const filenameGcs = "files/visions/" + visionUrl.split('/').pop();
                const [buffer] = await bucketGcs.file(filenameGcs).download();

                return {
                    inlineData: {
                        data: buffer.toString('base64'),
                        mimeType: 'image/webp',
                    },
                };
            });

            const results = await Promise.all(filePromises);
            const aiResponse = await aiChat.sendMessage([input, ...results]);
            aiResponseText = aiResponse.response.text();

            // Log. Show Token Usage
            console.log(aiResponse.response.usageMetadata);

        } else if (file.type === 'EMBEDDINGS') {

            // Convert Prompt to Embeddings
            const aiEmbeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
            const embeddingResult = await aiEmbeddingModel.embedContent(input);

            // Query Pinecone
            let pineconeResult = await pineconeIndex.namespace(file_id).query({
                topK: 5,
                vector: embeddingResult?.embedding?.values,
                includeValues: false,
                includeMetadata: true,
            });

            const mergedText = pineconeResult?.matches?.map(item => item?.metadata?.text).join('. ') || "";
            const updatedInput =`
            Context: ${mergedText}

            User Question: ${input}
            `

            // Convert each vision_urls into inlineData base64
            const filePromises = file.vision_urls.map(async (visionUrl) => {
                const filenameGcs = "files/visions/" + visionUrl.split('/').pop();
                const [buffer] = await bucketGcs.file(filenameGcs).download();

                return {
                    inlineData: {
                        data: buffer.toString('base64'),
                        mimeType: 'image/webp',
                    },
                };
            });

            const results = await Promise.all(filePromises);
            const aiResponse = await aiChat.sendMessage([updatedInput, ...results]);
            aiResponseText = aiResponse.response.text();

            // Log. Show Token Usage
            console.log(aiResponse.response.usageMetadata);
        };

        // Construct
        const newMessages = [
            { role: 'user', parts: [{ text: input }] },
            { role: 'model', parts: [{ text: aiResponseText }] },
        ];

        // Push DB
        file.messages = [...file.messages, ...newMessages];
        await file.save();

        revalidatePath(`/files/${file_id}/ask`);
        return { success: true, message: "Chat Sent!", data: newMessages };

    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function clearMedicalFileChat(file_id) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        if (!file_id) throw new Error("Invalid Request Body");

        await connectDB();
        await File.updateOne({ user_id, file_id }, {
            messages: [],
        });

        revalidatePath(`/files/${file_id}/ask`)
        return { success: true, message: "Chat Cleared!" }
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};
