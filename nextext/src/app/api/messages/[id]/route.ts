import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { Session } from "next-auth";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await getServerSession(authOptions) as Session & { user: { email: string } };

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // First verify the conversation exists and user is a participant
    const conversation = await db.collection("conversations").findOne({
      _id: new ObjectId(id),
      "participants.email": session.user.email
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Fetch messages for this conversation
    const messages = await db
      .collection("messages")
      .find({ conversationId: id })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await getServerSession(authOptions) as Session & { user: { email: string } };

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Verify conversation exists and user is a participant
    const conversation = await db.collection("conversations").findOne({
      _id: new ObjectId(id),
      "participants.email": session.user.email
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const message = {
      conversationId: id,
      content: content.trim(),
      senderEmail: session.user.email,
      createdAt: new Date(),
    };

    const result = await db.collection("messages").insertOne(message);
    const insertedMessage = {
      _id: result.insertedId,
      ...message
    };

    return NextResponse.json(insertedMessage, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
} 