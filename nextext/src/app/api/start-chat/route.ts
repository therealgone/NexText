import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongo";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shortCode } = await request.json();
    if (!shortCode) {
      return NextResponse.json({ error: "Short code is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("NexText");

    // Get current user
    const userA = await db.collection("users").findOne({ email: session.user.email });
    if (!userA) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user with the provided short code
    const userB = await db.collection("users").findOne({ shortCode });
    if (!userB) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if conversation already exists
    const existingConversation = await db.collection("conversations").findOne({
      participants: {
        $all: [
          { $elemMatch: { userId: new ObjectId(userA._id) } },
          { $elemMatch: { userId: new ObjectId(userB._id) } }
        ]
      }
    });

    if (existingConversation) {
      return NextResponse.json({ 
        conversationId: existingConversation._id.toString(),
        isNew: false
      });
    }

    // Create new conversation
    const result = await db.collection("conversations").insertOne({
      participants: [
        { userId: new ObjectId(userA._id), email: userA.email },
        { userId: new ObjectId(userB._id), email: userB.email }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      conversationId: result.insertedId.toString(),
      isNew: true
    });
  } catch (error) {
    console.error("Start chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 