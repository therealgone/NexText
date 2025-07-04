import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const client = new MongoClient(process.env.MONGODB_URI!);

// Function to generate a random short code
function generateShortCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body;
        
        if(!email || !password || !name) {
            return new Response("Name, Email and Password Required", {status: 400});
        }

        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not defined in environment variables");
            return new Response("Database configuration error", {status: 500});
        }

        try {
            await client.connect();
        } catch (connectionError) {
            console.error("MongoDB connection error:", connectionError);
            return new Response("Database connection failed", {status: 500});
        }

        const db = client.db("NexText");
        const existinguser = await db.collection("users").findOne({email});

        if(existinguser) {
            return new Response("User already exists", {status: 400});
        }
        
        const hashedpassword = await bcrypt.hash(password, 10);
        const shortCode = generateShortCode();
        
        await db.collection("users").insertOne({
            name,
            email,
            password: hashedpassword,
            shortCode,
            createdAt: new Date()
        });
        
        return new Response("User created successfully", {status: 201});
    } 
    catch(err) {
        console.error("Registration error details:", {
            error: err,
            message: err instanceof Error ? err.message : "Unknown error",
            stack: err instanceof Error ? err.stack : undefined
        });
        return new Response("Internal Server Error", {status: 500});
    } finally {
        try {
            await client.close();
        } catch (closeError) {
            console.error("Error closing MongoDB connection:", closeError);
        }
    }
} 