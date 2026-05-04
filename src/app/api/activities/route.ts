import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all activities (latest 50)
export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { time: "desc" },
      take: 50,
    });
    const mapped = activities.map((a) => ({
      id: a.id,
      user: a.user,
      action: a.action,
      target: a.target,
      status: a.status,
      time: a.time.toISOString(),
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/activities error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

// POST create an activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const activity = await prisma.activity.create({
      data: {
        user: body.user,
        action: body.action,
        target: body.target,
        status: body.status,
      },
    });
    const mapped = {
      id: activity.id,
      user: activity.user,
      action: activity.action,
      target: activity.target,
      status: activity.status,
      time: activity.time.toISOString(),
    };
    return NextResponse.json(mapped, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities error:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
