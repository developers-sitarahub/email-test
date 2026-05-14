import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { processHtmlForS3 } from "@/lib/s3-upload";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    let {
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

    // Process default signature for base64 images
    if (defaultSignature) {
      defaultSignature = await processHtmlForS3(defaultSignature);
    }

    const brand = await prisma.brandProfile.update({
      where: { id, userId },
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
    const userId = (session?.user as any)?.id;

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.brandProfile.delete({
      where: { id, userId },
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
