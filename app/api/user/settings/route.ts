import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        headerImage: true,
        signatureHtml: true,
      },
    });

    return NextResponse.json({
      headerImage: user?.headerImage || null,
      signatureHtml: user?.signatureHtml || null,
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { headerImage, signatureHtml } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(headerImage !== undefined && { headerImage }),
        ...(signatureHtml !== undefined && { signatureHtml }),
      },
      select: {
        headerImage: true,
        signatureHtml: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
