import connectDB from "@/config/db";
import { nanoid } from "@/lib/utils";
import User from "@/models/userSchema";
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    session: {
        stratergy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    jwt: {
        maxAge: 60 * 60 * 24 * 30,
    },
    pages: {
        signIn: '/login',
        signOut: '/',
    },
    callbacks: {
        async signIn({ user }) {
            try {
                await connectDB();
                const userExist = await User.findOne({ email: user.email });
                if (!userExist) {
                    const user_id = nanoid();
                    await User.create({
                        user_id,
                        email: user.email,
                        username: user.name,
                        is_first_login: true,
                    });
                };
                return true;
            } catch (err) {
                console.error("SignIn Error:", err);
                return false;
            };
        },
        async jwt({ token, user, account }) {
            if (account) {
                try {
                    await connectDB();
                    const userDB = await User.findOne({ email: user.email });
                    token.user_id = userDB.user_id;
                } catch (err) {
                    console.error("JWT Error:", err);
                };
            };
            return token;
        },
        async session({ session, token }) {
            session.user.user_id = token.user_id;
            return session;
        },
    },
})

export const { GET, POST } = handlers
