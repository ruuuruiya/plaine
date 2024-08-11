import { auth } from "@/app/api/auth/[...nextauth]/route";
import AskMedicinePage from "@/components/pages/dashboard/side/medicines/AskMedicinePage";
import connectDB from "@/config/db";
import Medicine from "@/models/medicineSchema";

export const metadata = {
    title: "Ask Medicine",
    description: "Understanding your medicine",
};

const page = async () => {
    const auth_session = await auth();
    const user_id = auth_session?.user?.user_id;

    // Get Meds
    await connectDB();
    const medicines = await Medicine.find({ user_id }).select("name med_id image").lean();
    let plainMedicines = medicines.map((obj) => {
        let { _id, ...rest } = obj;
        return rest;
    });

    return (
        <AskMedicinePage
            medicineLists={plainMedicines}
            session={auth_session}
        />
    );
};

export default page;
