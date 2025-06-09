import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return new Response("Unauthorized", { status: 401 });
        }

        await client.connect();
        const db = client.db("NexText");
        
        const user = await db.collection("users").findOne(
            { email: session.user.email },
            { projection: { shortCode: 1, name: 1 } }
        );

        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        return new Response(JSON.stringify({
            shortCode: user.shortCode,
            name: user.name
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        return new Response("Internal Server Error", { status: 500 });
    } finally {
        await client.close();
    }
} 