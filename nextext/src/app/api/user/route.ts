import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongo";
import { Session } from "next-auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions) as Session & { user: { email: string } };
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { db } = await connectToDatabase();
        const user = await db.collection("users").findOne(
            { email: session.user.email },
            { projection: { shortCode: 1, name: 1, email: 1 } }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user details:", error);
        return NextResponse.json(
            { error: "Failed to fetch user details" },
            { status: 500 }
        );
    }
} 