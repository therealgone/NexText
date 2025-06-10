import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongo";
import { Session } from "next-auth";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const session = await getServerSession() as Session & { user: { email: string } };
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("NexText");

    // First try to find the conversation
    const conversation = await db.collection("conversations").findOne({
      _id: new ObjectId(id),
      "participants.email": session.user.email
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await db.collection("messages")
      .find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const session = await getServerSession() as Session & { user: { email: string } };
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("NexText");

    // Verify conversation exists and user is a participant
    const conversation = await db.collection("conversations").findOne({
      _id: new ObjectId(id),
      "participants.email": session.user.email
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const message = {
      conversationId: conversation._id,
      content: content.trim(),
      sender: session.user.email,
      createdAt: new Date()
    };

    const result = await db.collection("messages").insertOne(message);
    const insertedMessage = {
      _id: result.insertedId,
      ...message
    };

    return NextResponse.json(insertedMessage, { status: 201 });
  } catch (err) {
    console.error("Error sending message:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 