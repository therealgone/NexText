import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { Session } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session & { user: { email: string } };

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Get all conversations where the user is a participant
    const conversations = await db
      .collection("conversations")
      .aggregate([
        {
          $match: {
            "participants.email": session.user.email
          }
        },
        {
          $lookup: {
            from: "messages",
            let: { conversationId: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$conversationId", "$$conversationId"] }
                }
              },
              {
                $sort: { createdAt: -1 }
              },
              {
                $limit: 1
              }
            ],
            as: "lastMessage"
          }
        },
        {
          $lookup: {
            from: "users",
            let: { participantEmails: "$participants.email" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$email", "$$participantEmails"] }
                }
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                  email: 1,
                  shortCode: 1
                }
              }
            ],
            as: "participantDetails"
          }
        },
        {
          $project: {
            _id: 1,
            participants: {
              $map: {
                input: "$participantDetails",
                as: "user",
                in: {
                  name: "$$user.name",
                  email: "$$user.email",
                  shortCode: "$$user.shortCode"
                }
              }
            },
            lastMessage: {
              $arrayElemAt: ["$lastMessage", 0]
            }
          }
        },
        {
          $sort: {
            "lastMessage.createdAt": -1
          }
        }
      ])
      .toArray();

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
} 