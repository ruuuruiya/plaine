import Navbar from "@/components/pages/landing/Navbar";
import Footer from "@/components/pages/landing/Footer";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const Layout = async ({ children }) => {
    const auth_session = await auth();

    return (
        <>
            <Navbar user={auth_session?.user} />
            <section>{children}</section>
            <Footer />
        </>
    );
};

export default Layout;
