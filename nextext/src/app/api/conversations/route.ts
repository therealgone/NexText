import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("NexText");

    // Find all conversations where the user is a participant
    const conversations = await db.collection("conversations")
      .find({ "participants.email": session.user.email })
      .toArray();

    // Get the latest message for each conversation
    const conversationsWithLatestMessage = await Promise.all(
      conversations.map(async (conversation) => {
        const latestMessage = await db.collection("messages")
          .findOne(
            { conversationId: conversation._id },
            { sort: { createdAt: -1 } }
          );

        // Get the other participant's details
        const otherParticipant = conversation.participants.find(
          (p: { email: string }) => p.email !== session.user.email
        );

        return {
          id: conversation._id.toString(),
          otherParticipant: otherParticipant,
          latestMessage: latestMessage ? {
            content: latestMessage.content,
            createdAt: latestMessage.createdAt
          } : null,
          updatedAt: conversation.updatedAt
        };
      })
    );

    // Sort conversations by latest message or update time
    conversationsWithLatestMessage.sort((a, b) => {
      const timeA = a.latestMessage?.createdAt || a.updatedAt;
      const timeB = b.latestMessage?.createdAt || b.updatedAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    return NextResponse.json(conversationsWithLatestMessage);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 