import { auth } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/config/db';
import File from '@/models/fileSchema';
import ChatFileComponent from '@/components/pages/dashboard/side/files/ChatFileComponent';

export const metadata = {
    title: 'Ask File',
    description: 'Manage your file',
};

const Page = async ({ params: { file_id }}) => {

    const auth_session = await auth();
    const user_id = auth_session?.user?.user_id;

    // Get File Details
    await connectDB();
    const file = await File.findOne({ user_id, file_id }).select('name messages').lean();
    if (!file) redirect("/files/");

    return (
        <div className="h-full overflow-hidden flex flex-col justify-between">
            <ChatFileComponent
                file_id={file_id}
                initialName={file.name}
                initialMessages={file?.messages}
                session={auth_session}
            />
        </div>
    )
}

export default Page
