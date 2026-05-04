import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Task } from "@prisma/client";

// GET all tasks
export async function GET() {
  try {
    const tasks: Task[] = await prisma.task.findMany({
      orderBy: { createdAt: "asc" },
    });
    const mapped = tasks.map((t: Task) => ({
      id: t.id,
      name: t.name,
      start: t.start.toISOString(),
      end: t.end.toISOString(),
      progress: t.progress,
      type: t.type,
      department: t.department,
      status: t.status,
      assignedTo: t.assignedToName || "",
      priority: t.priority || undefined,
      comments: t.comments || undefined,
      fileLink: t.fileLink || undefined,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST create a task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task: Task = await prisma.task.create({
      data: {
        name: body.name,
        start: new Date(body.start),
        end: new Date(body.end),
        progress: body.progress || 0,
        type: body.type || "task",
        department: body.department,
        status: body.status || "TODO",
        assignedToName: body.assignedTo || null,
        priority: body.priority || null,
        comments: body.comments || null,
        fileLink: body.fileLink || null,
      },
    });
    const mapped = {
      id: task.id,
      name: task.name,
      start: task.start.toISOString(),
      end: task.end.toISOString(),
      progress: task.progress,
      type: task.type,
      department: task.department,
      status: task.status,
      assignedTo: task.assignedToName || "",
      priority: task.priority || undefined,
      comments: task.comments || undefined,
      fileLink: task.fileLink || undefined,
    };
    return NextResponse.json(mapped, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PUT update a task
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const task: Task = await prisma.task.update({
      where: { id: body.id },
      data: {
        name: body.name,
        start: new Date(body.start),
        end: new Date(body.end),
        progress: body.progress,
        type: body.type,
        department: body.department,
        status: body.status,
        assignedToName: body.assignedTo || null,
        priority: body.priority || null,
        comments: body.comments || null,
        fileLink: body.fileLink || null,
      },
    });
    const mapped = {
      id: task.id,
      name: task.name,
      start: task.start.toISOString(),
      end: task.end.toISOString(),
      progress: task.progress,
      type: task.type,
      department: task.department,
      status: task.status,
      assignedTo: task.assignedToName || "",
      priority: task.priority || undefined,
      comments: task.comments || undefined,
      fileLink: task.fileLink || undefined,
    };
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("PUT /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE a task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
