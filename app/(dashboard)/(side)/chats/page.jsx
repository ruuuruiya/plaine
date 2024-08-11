import { auth } from "@/app/api/auth/[...nextauth]/route";
import ChatListPage from "@/components/pages/dashboard/side/chats/ChatListPage";
import connectDB from "@/config/db";
import Chat from "@/models/chatSchema";

export const metadata = {
    title: "Chat",
    description: "Chat with AI",
};

const Page = async () => {
    const auth_session = await auth();
    const user_id = auth_session?.user?.user_id;

    // Get chat_lists and sort based on last update
    await connectDB();
    const chatLists = await Chat.find({ user_id }).select("chat_id title type").sort({ updated_at: -1 }).lean();
    let plainChatLists = chatLists.map((obj) => {
        let { _id, ...rest } = obj;
        return rest;
    });

    return <ChatListPage initialChatLists={plainChatLists} />;
};

export default Page;
