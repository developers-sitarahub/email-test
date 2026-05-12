import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function ownsProfile(brandId: string, userId: string) {
  const profile = await prisma.brandProfile.findFirst({ where: { id: brandId, userId } });
  return !!profile;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [signatures, ctas, headers] = await Promise.all([
    prisma.brandSignature.findMany({ where: { brandId: id }, orderBy: { createdAt: "asc" } }),
    prisma.brandCta.findMany({ where: { brandId: id }, orderBy: { createdAt: "asc" } }),
    prisma.brandHeader.findMany({ where: { brandId: id }, orderBy: { createdAt: "asc" } }),
  ]);

  return NextResponse.json({ signatures, ctas, headers });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!await ownsProfile(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { type, ...data } = await req.json();

    if (type === "signature") {
      const { name, content, imageUrl, imageLink, isDefault } = data;
      if (isDefault) await prisma.brandSignature.updateMany({ where: { brandId: id }, data: { isDefault: false } });
      const item = await prisma.brandSignature.create({
        data: {
          brand: { connect: { id } },
          name,
          content,
          imageUrl: imageUrl || null,
          imageLink: imageLink || null,
          isDefault: !!isDefault
        }
      });
      return NextResponse.json({ item });
    }

    if (type === "cta") {
      const { name, text, link, isDefault } = data;
      if (isDefault) await prisma.brandCta.updateMany({ where: { brandId: id }, data: { isDefault: false } });
      const item = await prisma.brandCta.create({
        data: {
          brand: { connect: { id } },
          name,
          text,
          link,
          isDefault: !!isDefault
        }
      });
      return NextResponse.json({ item });
    }

    if (type === "header") {
      const { name, imageUrl, isDefault } = data;
      if (isDefault) await prisma.brandHeader.updateMany({ where: { brandId: id }, data: { isDefault: false } });
      const item = await prisma.brandHeader.create({
        data: {
          brand: { connect: { id } },
          name,
          imageUrl,
          isDefault: !!isDefault
        }
      });
      return NextResponse.json({ item });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
