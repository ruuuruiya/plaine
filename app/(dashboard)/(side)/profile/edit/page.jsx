import EditProfilePage from '@/components/pages/dashboard/side/profile/EditProfilePage'
import { auth } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/config/db';
import Record from '@/models/recordSchema';

export const metadata = {
    title: 'Edit Profile',
    description: 'Manage your profile',
};

const Page = async () => {

    const auth_session = await auth();
    const user_id = auth_session?.user?.user_id;

    // Get records
    await connectDB();
    const records = await Record.findOne({ user_id }).lean();
    const { _id, ...plainRecords } = records;

    return (
        <EditProfilePage initialRecords={plainRecords} />
    )
}

export default Page
