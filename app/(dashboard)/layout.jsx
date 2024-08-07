import { auth } from '@/app/api/auth/[...nextauth]/route';
import BaseLayout from '@/components/pages/dashboard/BaseLayout';
import connectDB from '@/config/db';
import User from '@/models/userSchema';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

const Layout = async ({ children }) => {
    return (
        <Suspense fallback={<LoadingDashboard />}>
            <DashboardWrapper>
                {children}
            </DashboardWrapper>
        </Suspense>
    )
};

export default Layout

const DashboardWrapper = async ({ children }) => {

    const auth_session = await auth();
    if (!auth_session) redirect('/');
    const user_id = auth_session?.user?.user_id;

    // Check is_first_login
    await connectDB();
    const user = await User.findOne({ user_id }).select('is_first_login').lean();
    if (user?.is_first_login) redirect('/onboarding');

    return (
        <BaseLayout user={auth_session?.user}>
            {children}
        </BaseLayout>
    )
};

const LoadingDashboard = () => {
    return (
        <div className="w-full h-full flex items-center justify-center min-h-dvh">
            <span className="loading loading-infinity loading-lg"></span>
        </div>
    )
};
