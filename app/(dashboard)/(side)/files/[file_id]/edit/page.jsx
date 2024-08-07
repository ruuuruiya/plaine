import { auth } from '@/app/api/auth/[...nextauth]/route'
import EditMedicalFilePage from '@/components/pages/dashboard/side/files/EditMedicalFilePage';
import connectDB from '@/config/db';
import File from '@/models/fileSchema';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Edit File',
    description: 'Manage your file',
};

const page = async ({ params: { file_id }}) => {

    const auth_session = await auth();
    const user_id = auth_session?.user?.user_id;

    // Get File
    await connectDB();
    const file = await File.findOne({ user_id, file_id }).lean();
    if (!file) redirect('/files');
    const { _id, ...plainFile } = file;

    return (
        <EditMedicalFilePage initialFile={plainFile} />
    )
}

export default page
