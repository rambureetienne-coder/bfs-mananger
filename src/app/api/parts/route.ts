import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all parts
export async function GET() {
  try {
    const parts = await prisma.part.findMany({
      orderBy: { createdAt: "asc" },
    });
    const mapped = parts.map((p: any) => ({
      id: p.id,
      name: p.name,
      department: p.department,
      material: p.material,
      manufacturer: p.manufacturer,
      cost: p.cost,
      weight: p.weight,
      quantity: p.quantity,
      status: p.status,
      linkedTaskId: p.linkedTaskId || undefined,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/parts error:", error);
    return NextResponse.json({ error: "Failed to fetch parts" }, { status: 500 });
  }
}

// POST create a part
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const part: any = await prisma.part.create({
      data: {
        name: body.name,
        department: body.department,
        material: body.material || "",
        manufacturer: body.manufacturer || "",
        weight: body.weight,
        cost: body.cost,
        quantity: body.quantity,
        status: body.status,
        linkedTaskId: body.linkedTaskId || null,
      },
    });
    const mapped = {
      id: part.id,
      name: part.name,
      department: part.department,
      material: part.material,
      manufacturer: part.manufacturer,
      cost: part.cost,
      weight: part.weight,
      quantity: part.quantity,
      status: part.status,
      linkedTaskId: part.linkedTaskId || undefined,
    };
    return NextResponse.json(mapped, { status: 201 });
  } catch (error) {
    console.error("POST /api/parts error:", error);
    return NextResponse.json({ error: "Failed to create part" }, { status: 500 });
  }
}

// PUT update a part
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const part: any = await prisma.part.update({
      where: { id: body.id },
      data: {
        name: body.name,
        department: body.department,
        material: body.material || "",
        manufacturer: body.manufacturer || "",
        weight: body.weight,
        cost: body.cost,
        quantity: body.quantity,
        status: body.status,
        linkedTaskId: body.linkedTaskId || null,
      },
    });
    const mapped = {
      id: part.id,
      name: part.name,
      department: part.department,
      material: part.material,
      manufacturer: part.manufacturer,
      cost: part.cost,
      weight: part.weight,
      quantity: part.quantity,
      status: part.status,
      linkedTaskId: part.linkedTaskId || undefined,
    };
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("PUT /api/parts error:", error);
    return NextResponse.json({ error: "Failed to update part" }, { status: 500 });
  }
}

// DELETE a part
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await prisma.part.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/parts error:", error);
    return NextResponse.json({ error: "Failed to delete part" }, { status: 500 });
  }
}
