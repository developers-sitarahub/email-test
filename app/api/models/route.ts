import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getFreshAccessToken } from "@/lib/google-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAccessToken = await getFreshAccessToken(session.user.id);

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
      headers: { "Authorization": `Bearer ${userAccessToken}` }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Failed to fetch models");
    }

    const data = await response.json();

    // Filter for models that support generateContent and are relevant for chat/email
    const filteredModels = data.models
      .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
      .map((m: any) => ({
        id: m.name, // e.g. "models/gemini-1.5-flash"
        name: m.displayName || m.name.replace("models/", ""),
        description: m.description,
      }));

    return NextResponse.json({ models: filteredModels });
  } catch (error: any) {
    console.error("Models API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
