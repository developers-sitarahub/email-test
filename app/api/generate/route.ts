import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const { prompt, model, csvData, campaignName, include, config } = await request.json();

    if (!prompt || !csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // Determine headers and clean data rows
    let headers: string[] = [];
    let dataToProcess: string[][] = [];

    // Filter out completely blank rows
    const cleanCsvData = csvData.filter((row: string[]) => row.some(cell => cell && typeof cell === 'string' && cell.trim() !== ""));

    if (cleanCsvData.length > 1 && cleanCsvData[0].some((c: string) => c.toLowerCase().includes("email") || c.toLowerCase().includes("name"))) {
      headers = cleanCsvData[0];
      dataToProcess = cleanCsvData.slice(1, 6);
    } else {
      dataToProcess = cleanCsvData.slice(0, 5);
    }

    if (dataToProcess.length === 0) {
      return NextResponse.json({ error: "No valid email IDs found" }, { status: 400 });
    }

    const useMock = !process.env.GEMINI_API_KEY;
    const modelId = "gemini-flash-latest"; // Using the alias confirmed to work in this environment

    // ── Create a Campaign row if user is signed in ─────────────────────
    let campaign: { id: string } | null = null;
    let userId: string | null = null;

    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (dbUser) {
        userId = dbUser.id;
        campaign = await prisma.campaign.create({
          data: {
            userId: dbUser.id,
            name: campaignName || `Campaign ${new Date().toLocaleDateString()}`,
            prompt,
            model: modelId,
            status: "generating",
          },
        });
      }
    }

    const recipientsContext = dataToProcess.map((row, idx) => {
      const rowContext = headers.length > 0 ? headers.map((h, i) => `${h}: ${row[i] || "N/A"}`).join(", ") : row.join(", ");
      return `Recipient ${idx}: ${rowContext}`;
    }).join("\n");

    const batchPrompt = `You are an AI email copywriter and layout designer.
Your task is to generate a **structured, block-based email in JSON format**, based on user input and optional configuration.

Base prompt: "${prompt}"

We have ${dataToProcess.length} email IDs. Write a personalized cold email for each one based on the Base prompt and their Recipient data.
You MUST output ONLY a valid JSON array of objects. Each object represents an email and MUST STRICTLY follow this exact schema:

{
  "subject": "string (the catchy subject line)",
  "blocks": [
    {
      "type": "text | image | cta | signature",
      "content": {
         "text": "content for text/cta/signature",
         "url": "image url if type is image",
         "link": "url if type is cta"
      },
      "styles": {
         "alignment": "left | center",
         "fontSize": "14px",
         "color": "#1f2937",
         "backgroundColor": "#4f46e5"
      }
    }
  ]
}

Configuration:
- headerImage block enabled: ${include?.headerImage ? 'true' : 'false'} (Use a relevant unsplash photo URL)
- cta block enabled: ${include?.cta ? 'true' : 'false'} (Use link: "${config?.ctaLink}", text: "${config?.ctaText}")
- signature block enabled: ${include?.signature ? 'true' : 'false'} (Use details: "${config?.signature}")

RULES:
1. Include image block ONLY IF headerImage block enabled is true. Place at the top.
2. Include cta block ONLY IF cta block enabled is true. Use exactly the text and link provided.
3. Include signature block ONLY IF signature block enabled is true.
4. Break text into multiple text blocks for readability.
5. Return ONLY a valid JSON array of these objects.

Recipients Data:
${recipientsContext}`;

    let batchGeneratedEmails: string[] = [];

    if (useMock) {
      console.log("Mocking generation because GEMINI_API_KEY is missing.");
      batchGeneratedEmails = dataToProcess.map((row) => `(Mock) Hi ${row[0] || "there"},\n\n${prompt}`);
    } else {
      let textResponse = "";
      let attempts = 0;
      const maxAttempts = 5;
      const modelsToTry = [modelId, "gemini-1.5-flash-8b", "gemini-1.5-flash-latest"];

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const currentModelId = modelsToTry[(attempt - 1) % modelsToTry.length];
        const currentModel = genAI.getGenerativeModel({ 
          model: currentModelId,
          generationConfig: { responseMimeType: "application/json" }
        });

        try {
          console.log(`AI Generation attempt ${attempt} using ${currentModelId}...`);
          const result = await currentModel.generateContent(batchPrompt);
          textResponse = result.response.text().trim();
          if (textResponse) break; 
        } catch (e: any) {
          console.warn(`Attempt ${attempt} (${currentModelId}) failed:`, e.message);
          if (attempt === maxAttempts) throw e;
          
          // Exponential backoff: 3s, 6s, 9s, 12s
          const delay = attempt * 3000;
          console.log(`Waiting ${delay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // Robust JSON Extraction: Find the first [ and last ]
      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      const cleanedJson = jsonMatch ? jsonMatch[0] : textResponse;
      
      let parsedArray: any;
      try {
        parsedArray = JSON.parse(cleanedJson);
      } catch (e) {
        console.error("JSON parse failed. Original response snippet:", textResponse.substring(0, 100));
        throw new Error("AI returned malformed JSON content.");
      }

      // If AI wrapped the array in an object (e.g. { emails: [...] })
      if (!Array.isArray(parsedArray) && typeof parsedArray === "object") {
         const possibleArray = Object.values(parsedArray).find(val => Array.isArray(val));
         if (possibleArray) parsedArray = possibleArray as any[];
      }

      if (Array.isArray(parsedArray)) {
        batchGeneratedEmails = parsedArray.map(obj => typeof obj === 'string' ? obj : JSON.stringify(obj));

        // Fallback: If AI skipped empty recipients or generated too many, pad or slice it.
        if (batchGeneratedEmails.length < dataToProcess.length) {
           const shortfall = dataToProcess.length - batchGeneratedEmails.length;
           for (let i = 0; i < shortfall; i++) {
             const fallbackObj = { subject: "Reaching out", blocks: [{ type: "text", content: { text: "Hi there, reaching out." } }] };
             batchGeneratedEmails.push(JSON.stringify(fallbackObj));
           }
        } else if (batchGeneratedEmails.length > dataToProcess.length) {
           batchGeneratedEmails = batchGeneratedEmails.slice(0, dataToProcess.length);
        }

        if (userId) {
          const estimatedTokens = Math.round((batchPrompt.length + textResponse.length) / 4);
          await prisma.geminiUsage.create({
            data: {
              userId,
              campaignId: campaign?.id,
              tokensUsed: estimatedTokens,
              model: modelId,
            },
          });
        }
      } else {
        throw new Error("AI did not return a recognizable array format.");
      }
    }

    // ── Process results ────────────────────────────────────────────────
    const results: { original: string[]; generated: string }[] = [];

    for (let i = 0; i < dataToProcess.length; i++) {
        const row = dataToProcess[i];
        const generated = batchGeneratedEmails[i];

        // Persist each EmailDraft
        if (campaign) {
          const emailIdx = headers.findIndex((h) => h.toLowerCase().includes("email"));
          await prisma.emailDraft.create({
            data: {
              campaignId: campaign.id,
              recipientEmail: emailIdx >= 0 ? row[emailIdx] : row[0] || "unknown",
              recipientData: JSON.stringify(Object.fromEntries(headers.map((h, idx) => [h, row[idx] ?? ""]))),
              generatedText: generated,
            },
          });
        }

        results.push({ original: row, generated });
    }

    // Mark campaign status
    if (campaign) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "completed" },
      });
    }

    return NextResponse.json({ results, headers, campaignId: campaign?.id ?? null });
  } catch (error: any) {
    console.error("API error unhandled exception:", error);
    return NextResponse.json({ error: error.message || "Unknown fatal error" }, { status: 500 });
  }
}
