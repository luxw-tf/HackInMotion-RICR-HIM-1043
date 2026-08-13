import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch both global default categories and user custom categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
      },
      include: {
        keywords: {
          select: { id: true, keyword: true, priority: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { name, type, isEssential, color, icon, keywords } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        userId,
        name: name.trim(),
        type: type || "EXPENSE",
        isEssential: !!isEssential,
        color: color || "#64748b",
        icon: icon || "Tag",
        keywords: {
          create: Array.isArray(keywords)
            ? keywords
                .map((k: string) => k.trim().toLowerCase())
                .filter(Boolean)
                .map((kw: string) => ({ keyword: kw, priority: 1 }))
            : [],
        },
      },
      include: {
        keywords: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Custom category created successfully.",
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { error: "Failed to create category." },
      { status: 500 }
    );
  }
}
