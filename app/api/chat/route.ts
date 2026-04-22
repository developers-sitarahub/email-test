import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

export async function POST(req: Request) {
  try {
    const { messages, csvData } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 },
      );
    }

    // Mock response if no valid API key is present
    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === "dummy_key"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json({
        reply: `Mock Mode: I understand you want to personalize cold emails. Based on your prompt, here is a suggested template:\n\n"Hi {name},\n\nI noticed {company} has been doing great things recently. I'd love to show you how our product can help..."\n\n(Provide a GEMINI_API_KEY to see real AI responses.)`,
      });
    }

    const aiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Convert history into Gemini expected format
    let history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    if (history.length > 0 && history[0].role === "model") {
      history.shift(); // Gemini requires the first message to be from 'user'
    }

    const chat = aiModel.startChat({ history });

    let contextDataSummary = "";
    if (csvData && csvData.length > 0) {
      contextDataSummary = `Context: We have uploaded a CSV with ${csvData.length} rows. The headers seem to be: ${csvData[0].join(", ")}.`;
    }

    const latestMessage = messages[messages.length - 1].content;
    const finalPrompt = `${contextDataSummary}\n\nUser request: ${latestMessage}`;

    const result = await chat.sendMessage(finalPrompt);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate chat response" },
      { status: 500 },
    );
  }
}
