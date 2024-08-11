import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/config/db";
import ProfilePage from "@/components/pages/dashboard/side/profile/ProfilePage";
import Record from "@/models/recordSchema";

export const metadata = {
    title: "Profile",
    description: "Manage your profile",
};

const Page = async () => {
    const auth_session = await auth();
    const user_id = auth_session?.user?.user_id;

    // Get records
    await connectDB();
    const records = await Record.findOne({ user_id }).lean();
    const { _id, ...plainRecords } = records;

    return <ProfilePage initialRecords={plainRecords} />;
};

export default Page;
