import { auth } from "@/app/api/auth/[...nextauth]/route";
import OnboardingPage from "@/components/pages/onboarding/OnboardingPage";
import connectDB from "@/config/db";
import User from "@/models/userSchema";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Onboarding',
    description: 'Complete your profile',
};

const Page = async () => {

    const auth_session = await auth();
    if (!auth_session) redirect('/');
    const user_id = auth_session?.user?.user_id;

    // Check is_first_login
    await connectDB();
    const user = await User.findOne({ user_id }).select('username is_first_login').lean();
    if (!user?.is_first_login) redirect('/dashboard');

    return (
        <OnboardingPage initialUsername={user.username}/>
    )
};

export default Page
