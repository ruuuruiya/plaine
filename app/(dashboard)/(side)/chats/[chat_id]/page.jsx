import { auth } from "@/app/api/auth/[...nextauth]/route";
import ChatComponent from "@/components/pages/dashboard/side/chats/ChatComponent";
import connectDB from "@/config/db";
import Chat from "@/models/chatSchema";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Chat",
    description: "Chat with AI",
};

const Page = async ({ params: { chat_id } }) => {
    const auth_session = await auth();
    const user_id = auth_session?.user?.user_id;

    // Get Chat Details
    await connectDB();
    const chat = await Chat.findOne({ user_id, chat_id }).select("messages title files type").lean();
    if (!chat) redirect("/chats/new");

    return (
        <div className="h-full overflow-hidden flex flex-col justify-between">
            <ChatComponent
                chat_id={chat_id}
                initialMessages={chat?.messages}
                initialFiles={chat?.files}
                initialTitle={chat?.title}
                initialType={chat?.type}
                session={auth_session}
            />
        </div>
    );
};

export default Page;
