import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
    });
    const mapped = users.map((u: any) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      department: u.department,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST create a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const user: any = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email || `${body.name.toLowerCase().replace(/\s/g, '.')}.${uniqueSuffix}@bfs.team`,
        role: body.role,
        department: body.department,
      },
    });
    const mapped = {
      id: user.id,
      name: user.name,
      role: user.role,
      department: user.department,
    };
    return NextResponse.json(mapped, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
