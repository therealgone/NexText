import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const client = new MongoClient(process.env.MONGODB_URI!);

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password required");
                }

                try {
                    await client.connect();
                    const db = client.db('NexText');
                    const user = await db.collection('users').findOne({ email: credentials.email });

                    if (!user) {
                        throw new Error("No user found");
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) {
                        throw new Error("Invalid password");
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    throw error;
                } finally {
                    await client.close();
                }
            }
        })
    ],
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
    },
});

export { handler as GET, handler as POST };
