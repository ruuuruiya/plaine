'use server'

import connectDB from "@/config/db";
import { auth } from "../api/auth/[...nextauth]/route";
import Plan from "@/models/planSchema";
import { nanoid } from "@/lib/utils";
import { PLAN_COLUMN, PLAN_STATUS } from "@/lib/globals";
import { revalidatePath } from "next/cache";

export async function postCard(card) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        const { title, description, deadline, status, column } = card;
        if (
            typeof title !== 'string' || title.trim().length < 1 || title.length > 150
            || typeof description !== 'string' || description.length > 500
            || !status || !Object.keys(PLAN_STATUS).includes(status)
            || !column || !Object.keys(PLAN_COLUMN).includes(column)
        ) {
            throw new Error("Invalid Request Body");
        };

        // Check
        let plan = await Plan.findOne({ user_id });
        if (!plan) {
            await Plan.create({
                user_id,
                plans: [],
            });
            plan = await Plan.findOne({ user_id });
        };

        const plan_id = nanoid();
        const newPlan = {
            plan_id,
            title,
            description,
            deadline,
            status,
            column,
        };

        plan.plan_list.push(newPlan);
        await plan.save();

        revalidatePath('/plans');
        return { success: true, message: "Plan Created!", data: { plan_id }};
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function updateCard(card) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        const { plan_id, title, description, deadline, status, column, isColumnUpdated } = card;
        if (
            typeof title !== 'string' || title.trim().length < 1 || title.length > 150
            || typeof description !== 'string' || description.length > 500
            || !status || !Object.keys(PLAN_STATUS).includes(status)
            || !column || !Object.keys(PLAN_COLUMN).includes(column)
        ) {
            throw new Error("Invalid Request Body");
        };

        // Check
        const plan = await Plan.findOne({ user_id });
        if (!plan) throw new Error("Plan Not Found");
        const plan_list = plan.plan_list || [];

        // If Column Updated - Put into last Index
        let updatedArray;
        if (isColumnUpdated) {
            updatedArray = [...plan_list];
            const index = updatedArray.findIndex(item => item.plan_id === plan_id);
            if (index !== -1) {
                const objToMove = updatedArray.splice(index, 1)[0];
                objToMove.title = title;
                objToMove.description = description,
                objToMove.deadline = deadline,
                objToMove.status = status,
                objToMove.column = column,
                updatedArray.push(objToMove);
            } else {
                throw new Error("Plan Not Found");
            };
        } else {
            updatedArray = plan_list.map(item => {
                if (item.plan_id === plan_id) {
                    return {
                        ...item,
                        title: title,
                        description: description,
                        deadline: deadline,
                        status: status,
                        column: column,
                    };
                };
                return item;
            });
        };

        plan.plan_list = updatedArray;
        await plan.save();

        revalidatePath('/plans');
        return { success: true, message: "Plan Updated" };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function deleteCard(plan_id) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {

        // Validate
        if (!plan_id) throw new Error("Invalid Request Body");

        // Check
        const plan = await Plan.findOne({ user_id });
        if (!plan) throw new Error(`Plan Not Found`);
        const plan_list = plan.plan_list || [];

        const updatedArray = plan_list.filter(item => item.plan_id !== plan_id);
        plan.plan_list = updatedArray;
        await plan.save();

        revalidatePath('/plans');
        return { success: true, message: "Plan Deleted" };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Internal Server Error" };
    };
};

export async function updatePosition({ cards }) {

    const auth_session = await auth();
    if (!auth_session) return { success: false, message: "Unauthorized" };
    const user_id = auth_session?.user?.user_id;

    try {
        await connectDB();
        await Plan.updateOne({ user_id }, {
            plan_list: cards,
        });

        revalidatePath('/plans');
        return { success: true, message: "Plan Moved!" };
    } catch (err) {
        console.log(err.message);
        return { success: false, message: "Failed to Move" };
    };
};
