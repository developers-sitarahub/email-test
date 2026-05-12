import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const brands = await prisma.brandProfile.findMany({
      where: { userId: (session.user as any).id },
      include: {
        signatures: true,
        ctas: true,
        headers: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ brands });
  } catch (error: any) {
    console.error("GET /api/brands error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      brandName,
      websiteUrl,
      companyDescription,
      industry,
      targetAudience,
      tone,
      primaryGoal,
      defaultSignature,
      defaultCtaText,
      defaultCtaLink,
    } = body;

    if (!brandName)
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );

    const brand = await prisma.brandProfile.create({
      data: {
        user: { connect: { id: (session.user as any).id } },
        brandName,
        websiteUrl,
        companyDescription,
        industry,
        targetAudience,
        tone,
        primaryGoal,
        defaultSignature,
        defaultCtaText,
        defaultCtaLink,
      },
      include: {
        signatures: true,
        ctas: true,
        headers: true,
      },
    });

    return NextResponse.json({ brand });
  } catch (error: any) {
    console.error("POST /api/brands error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
