import { NextResponse } from "next/server";
import { bootstrapDemoUser } from "@/lib/auth/bootstrapDemoUser";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const demoUser = await bootstrapDemoUser();
    return NextResponse.json({
      success: true,
      message: "Demo user initialized successfully.",
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
      },
    });
  } catch (error: any) {
    console.error("Bootstrap demo API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize demo mode." },
      { status: 500 }
    );
  }
}
