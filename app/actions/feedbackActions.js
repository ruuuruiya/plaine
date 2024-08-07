"use server";

import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/config/db";
import Feedback from "@/models/feedbackSchema";

export async function postFeedback(feedback) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {
        if(!feedback.trim() || feedback.length > 1000) throw new Error("Invalid Request Body");
        await connectDB();
        await Feedback.create({
            user_id,
            feedback,
        });
        return { success: true, message: "Feedback Sent!" }
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};
