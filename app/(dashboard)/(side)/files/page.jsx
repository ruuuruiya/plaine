import { auth } from "@/app/api/auth/[...nextauth]/route";
import MedicalFilePage from "@/components/pages/dashboard/side/files/MedicalFilePage";
import connectDB from "@/config/db";
import File from "@/models/fileSchema";

export const metadata = {
    title: "Medical File",
    description: "Manage your file",
};

const Page = async () => {
    const auth_session = await auth();
    const user_id = auth_session?.user?.user_id;

    // Get Files
    await connectDB();
    const files = await File.find({ user_id }).sort({ updated_at: -1 }).lean();
    let plainFiles = files.map((obj) => {
        let { _id, ...rest } = obj;
        return rest;
    });

    return <MedicalFilePage initialFiles={plainFiles} />;
};

export default Page;
