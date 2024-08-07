import { auth } from '@/app/api/auth/[...nextauth]/route'
import EditMedicinePage from '@/components/pages/dashboard/side/medicines/EditMedicinePage'
import connectDB from '@/config/db';
import Medicine from '@/models/medicineSchema';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Edit Medicine',
    description: 'Manage your medicine',
};

const page = async ({ params: { med_id }}) => {

    const auth_session = await auth();
    const user_id = auth_session?.user?.user_id;

    // Get Med
    await connectDB();
    const medicine = await Medicine.findOne({ user_id, med_id }).lean();
    if (!medicine) redirect('/medicines');
    const { _id, ...plainMedicine } = medicine;

    return (
        <EditMedicinePage initialMedicine={plainMedicine}/>
    )
}

export default page
