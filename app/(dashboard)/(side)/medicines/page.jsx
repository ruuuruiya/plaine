import { auth } from "@/app/api/auth/[...nextauth]/route";
import MedicinePage from "@/components/pages/dashboard/side/medicines/MedicinePage";
import connectDB from "@/config/db";
import Medicine from "@/models/medicineSchema";

export const metadata = {
    title: "Medicines",
    description: "Manage your medicines",
};

const Page = async () => {
    const auth_session = await auth();
    const user_id = auth_session?.user?.user_id;

    // Get Meds
    await connectDB();
    const medicines = await Medicine.find({ user_id }).sort({ updated_at: -1 }).lean();
    let plainMedicines = medicines.map((obj) => {
        let { _id, ...rest } = obj;
        return rest;
    });

    return <MedicinePage initialMedicines={plainMedicines} />;
};

export default Page;
