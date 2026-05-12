import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function ownsProfile(brandId: string, userId: string) {
  const profile = await prisma.brandProfile.findFirst({ where: { id: brandId, userId } });
  return !!profile;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const { id, assetId } = await params;
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!await ownsProfile(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { type, setDefault, ...updates } = await req.json();

    if (type === "signature") {
      if (setDefault) {
        await prisma.brandSignature.updateMany({ where: { brandId: id }, data: { isDefault: false } });
        await prisma.brandSignature.update({ where: { id: assetId }, data: { isDefault: true } });
      } else {
        const { name, content, imageUrl, imageLink } = updates;
        await prisma.brandSignature.update({
          where: { id: assetId },
          data: { name, content, imageUrl: imageUrl || null, imageLink: imageLink || null },
        });
      }
      const item = await prisma.brandSignature.findUnique({ where: { id: assetId } });
      return NextResponse.json({ item });
    }

    if (type === "cta") {
      if (setDefault) {
        await prisma.brandCta.updateMany({ where: { brandId: id }, data: { isDefault: false } });
        await prisma.brandCta.update({ where: { id: assetId }, data: { isDefault: true } });
      } else {
        await prisma.brandCta.update({ where: { id: assetId }, data: updates });
      }
      const item = await prisma.brandCta.findUnique({ where: { id: assetId } });
      return NextResponse.json({ item });
    }

    if (type === "header") {
      if (setDefault) {
        await prisma.brandHeader.updateMany({ where: { brandId: id }, data: { isDefault: false } });
        await prisma.brandHeader.update({ where: { id: assetId }, data: { isDefault: true } });
      } else {
        await prisma.brandHeader.update({ where: { id: assetId }, data: updates });
      }
      const item = await prisma.brandHeader.findUnique({ where: { id: assetId } });
      return NextResponse.json({ item });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const { id, assetId } = await params;
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!await ownsProfile(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { type } = await req.json();

    if (type === "signature") await prisma.brandSignature.delete({ where: { id: assetId } });
    else if (type === "cta") await prisma.brandCta.delete({ where: { id: assetId } });
    else if (type === "header") await prisma.brandHeader.delete({ where: { id: assetId } });
    else return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
