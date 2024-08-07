import { auth } from '@/app/api/auth/[...nextauth]/route';
import SettingsPage from '@/components/pages/dashboard/top/SettingsPage';

export const metadata = {
    title: 'Settings',
    description: 'Manage your account settings',
};

const Page = async () => {
    const auth_session = await auth();
    const email = auth_session?.user?.email;
    return <SettingsPage email={email}/>
};

export default Page
