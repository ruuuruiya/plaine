import "@/styles/globals.css";
import { inter } from "@/styles/fonts";
import SessionProvider from "@/components/SessionProvider";
import NotifWrapper from "@/components/NotifWrapper";
import ModalWrapper from "@/components/ModalWrapper";

export const metadata = {
    title: {
        template: `%s | Plaine`,
        default: `Plaine - Simplify Your Health Journey`,
    },
    description:
        "Plaine is your all-in-one AI health companion, revolutionizing personal healthcare. Provides health status updates, personalized recommendations, and potential health issues based on your interactions with the application. With Plaine, you can instantly communicate with AI for medical advice, understand complex medicine details and medical reports, and create tailored health plans. By integrating cutting-edge AI into every aspect, Plaine offers 24/7 access to personalized healthcare insights, making it easier than ever to take control of your well-being and make informed health decisions.",
};

const RootLayout = async ({ children }) => {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased relative text-neutral-900 bg-white`}>
                <SessionProvider>
                    <NotifWrapper>
                        <ModalWrapper>
                            {children}
                        </ModalWrapper>
                    </NotifWrapper>
                </SessionProvider>
            </body>
        </html>
    );
};

export default RootLayout;
