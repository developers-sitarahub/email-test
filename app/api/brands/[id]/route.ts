import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const brand = await prisma.brandProfile.update({
      where: { id, userId: (session.user as any).id },
      data: {
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
    });

    return NextResponse.json({ brand });
  } catch (error: any) {
    console.error("PATCH /api/brands/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.brandProfile.delete({
      where: { id, userId: (session.user as any).id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/brands/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
