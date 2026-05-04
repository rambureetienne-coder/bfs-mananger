import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Sponsor } from "@prisma/client";

// GET all sponsors
export async function GET() {
  try {
    const sponsors: Sponsor[] = await prisma.sponsor.findMany({
      orderBy: { createdAt: "asc" },
    });
    const mapped = sponsors.map((s: Sponsor) => ({
      id: s.id,
      company: s.company,
      contactName: s.contactName,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      status: s.status,
      amount: s.amount,
      lastContactDate: s.lastContactDate || "",
      comments: s.comments || "",
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/sponsors error:", error);
    return NextResponse.json({ error: "Failed to fetch sponsors" }, { status: 500 });
  }
}

// POST create a sponsor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sponsor: Sponsor = await prisma.sponsor.create({
      data: {
        company: body.company,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone || "",
        status: body.status,
        amount: body.amount,
        lastContactDate: body.lastContactDate || null,
        comments: body.comments || null,
      },
    });
    const mapped = {
      id: sponsor.id,
      company: sponsor.company,
      contactName: sponsor.contactName,
      contactEmail: sponsor.contactEmail,
      contactPhone: sponsor.contactPhone,
      status: sponsor.status,
      amount: sponsor.amount,
      lastContactDate: sponsor.lastContactDate || "",
      comments: sponsor.comments || "",
    };
    return NextResponse.json(mapped, { status: 201 });
  } catch (error) {
    console.error("POST /api/sponsors error:", error);
    return NextResponse.json({ error: "Failed to create sponsor" }, { status: 500 });
  }
}

// PUT update a sponsor
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const sponsor: Sponsor = await prisma.sponsor.update({
      where: { id: body.id },
      data: {
        company: body.company,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone || "",
        status: body.status,
        amount: body.amount,
        lastContactDate: body.lastContactDate || null,
        comments: body.comments || null,
      },
    });
    const mapped = {
      id: sponsor.id,
      company: sponsor.company,
      contactName: sponsor.contactName,
      contactEmail: sponsor.contactEmail,
      contactPhone: sponsor.contactPhone,
      status: sponsor.status,
      amount: sponsor.amount,
      lastContactDate: sponsor.lastContactDate || "",
      comments: sponsor.comments || "",
    };
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("PUT /api/sponsors error:", error);
    return NextResponse.json({ error: "Failed to update sponsor" }, { status: 500 });
  }
}

// DELETE a sponsor
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await prisma.sponsor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sponsors error:", error);
    return NextResponse.json({ error: "Failed to delete sponsor" }, { status: 500 });
  }
}
