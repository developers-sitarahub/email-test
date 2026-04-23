"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { InputSection } from "@/components/dashboard/input-section";
import { ConfigPanel } from "@/components/dashboard/config-panel";
import { ChatInterface } from "@/components/dashboard/chat-interface";
import { PreviewGrid } from "@/components/dashboard/preview-grid";
import { ActionBar } from "@/components/dashboard/action-bar";

interface EmailPreview {
  original: string[];
  generated: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 1. All Hooks Must Be At The Top
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [prompt, setPrompt] = useState(
    "Write a friendly cold email about our SaaS product that helps teams collaborate better. Keep it concise, professional, and include a clear call-to-action."
  );
  const [model, setModel] = useState("gemini-1.5-pro");
  const [previews, setPreviews] = useState<EmailPreview[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentEmails, setSentEmails] = useState(0);

  // Email Design Settings
  const [signature, setSignature] = useState("Best regards,\n" + (session?.user?.name || "The Team"));
  const [ctaText, setCtaText] = useState("Book a Meeting");
  const [ctaLink, setCtaLink] = useState("https://calendly.com/your-link");
  const [includeHeaderImage, setIncludeHeaderImage] = useState(false);
  const [includeCta, setIncludeCta] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);

  // Custom Uploads
  const [customHeaderImage, setCustomHeaderImage] = useState<string | null>(null);
  const [customSignatureHtml, setCustomSignatureHtml] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<{ name: string, type: string, content: string }[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      axios.get("/api/user/settings").then((res) => {
        if (res.data.headerImage) setCustomHeaderImage(res.data.headerImage);
        if (res.data.signatureHtml) setCustomSignatureHtml(res.data.signatureHtml);
      }).catch(err => console.error("Failed to load settings", err));
    }
  }, [status]);

  const saveSettings = async (headerImg: string | null, sigHtml: string | null) => {
    try {
      await axios.post("/api/user/settings", {
        headerImage: headerImg,
        signatureHtml: sigHtml
      });
    } catch (error) {
      console.error("Failed to save settings", error);
    }
  };

  const calculateRecipientCount = useCallback((data: string[][]) => {
    if (data.length === 0) return 0;
    const hasHeader = data[0].some(cell =>
      cell.toLowerCase().includes("email") || cell.toLowerCase().includes("name")
    );
    return hasHeader ? Math.max(0, data.length - 1) : data.length;
  }, []);

  const handleDataChange = useCallback((data: string[][]) => {
    setCsvData(data);
    setPreviews([]);
    setHeaders([]);
    setSentEmails(0);
  }, []);

  const handleProcess = useCallback(async () => {
    if (csvData.length === 0) return;
    setIsProcessing(true);
    setPreviews([]);

    try {
      const response = await axios.post("/api/generate", {
        prompt,
        model,
        csvData,
        include: { headerImage: includeHeaderImage, cta: includeCta, signature: includeSignature },
        config: { signature, ctaText, ctaLink }
      });

      const { results, headers: returnedHeaders } = response.data;
      setHeaders(returnedHeaders || []);

      const processedPreviews: EmailPreview[] = results;
      for (let i = 0; i < processedPreviews.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setPreviews((prev) => [...prev, processedPreviews[i]]);
      }
    } catch (error: any) {
      console.error("Error generating emails:", error);
      const msg = error.response?.data?.error || error.message;
      if (msg.includes("503") || msg.includes("high demand")) {
        alert("The AI service is currently busy (High Demand). Please wait a minute and try again.");
      } else {
        alert("Failed to generate emails: " + msg);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [csvData, prompt, model]);

  const handlePreviewEdit = useCallback((index: number, newGenerated: string) => {
    setPreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews[index] = { ...newPreviews[index], generated: newGenerated };
      return newPreviews;
    });
  }, []);

  const handleSendAll = useCallback(async () => {
    if (previews.length === 0) return;
    if (!session) {
      alert("Please connect your Gmail account first.");
      return;
    }

    setIsSending(true);
    setSentEmails(0);

    // Find the email index from headers
    const emailIdx = headers.findIndex(h => h.toLowerCase().includes("email"));

    for (const preview of previews) {
      try {
        const recipientEmail = emailIdx >= 0 ? preview.original[emailIdx] : preview.original[0];

        let parsedPayload = typeof preview.generated === 'string' ? JSON.parse(preview.generated) : preview.generated;

        // Filter out blocks if user explicitly disabled them
        if (parsedPayload && parsedPayload.blocks) {
          if (!includeHeaderImage) {
            parsedPayload.blocks = parsedPayload.blocks.filter((b: any) => b.type !== 'image');
          }
          if (!includeCta) {
            parsedPayload.blocks = parsedPayload.blocks.filter((b: any) => b.type !== 'cta');
          }
          if (!includeSignature) {
            parsedPayload.blocks = parsedPayload.blocks.filter((b: any) => b.type !== 'signature');
          }

          // Inject custom header and signature if applicable
          if (customHeaderImage && includeHeaderImage) {
            const headerBlock = parsedPayload.blocks.find((b: any) => b.type === 'image');
            if (headerBlock) {
              headerBlock.content.url = customHeaderImage;
            } else {
              parsedPayload.blocks.unshift({ type: 'image', content: { url: customHeaderImage }, styles: { alignment: 'center' } });
            }
          }
          if (customSignatureHtml && includeSignature) {
            const sigBlock = parsedPayload.blocks.find((b: any) => b.type === 'signature');
            if (sigBlock) {
              sigBlock.content.text = customSignatureHtml;
              sigBlock.isHtml = true; // flag to render as HTML
            }
          }
        }

        await axios.post("/api/send-email", {
          to: recipientEmail || "unknown@example.com",
          emailData: parsedPayload,
          attachments: attachments
        });
        setSentEmails((prev) => prev + 1);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Failed to send email", error);
      }
    }
    setIsSending(false);
  }, [previews, session, headers, signature, ctaText, ctaLink]);

  // 2. Redirect Logic Effect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // 3. Conditional Returns After Hooks
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse text-primary border border-primary/20">
            AI
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Checking connection...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 pb-36">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
              Hello, <span className="text-primary">{session?.user?.name?.split(" ")[0]}</span>!
            </h1>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl">
              Your personalized outreach dashboard is ready. Upload your CSV and let AI do the work.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-center gap-4"
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">Sender Configured</span>
              <span className="text-[10px] text-muted-foreground">{session?.user?.email}</span>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <InputSection onDataChange={handleDataChange} />
            <ConfigPanel
              prompt={prompt}
              onPromptChange={setPrompt}
              model={model}
              onModelChange={setModel}
              session={session}
              signature={signature}
              onSignatureChange={setSignature}
              ctaText={ctaText}
              onCtaTextChange={setCtaText}
              ctaLink={ctaLink}
              onCtaLinkChange={setCtaLink}
              includeHeaderImage={includeHeaderImage}
              onIncludeHeaderImageChange={setIncludeHeaderImage}
              includeCta={includeCta}
              onIncludeCtaChange={setIncludeCta}
              includeSignature={includeSignature}
              onIncludeSignatureChange={setIncludeSignature}
              customHeaderImage={customHeaderImage}
              onCustomHeaderImageChange={(val) => {
                setCustomHeaderImage(val);
                saveSettings(val, customSignatureHtml);
              }}
              customSignatureHtml={customSignatureHtml}
              onCustomSignatureHtmlChange={(val) => {
                setCustomSignatureHtml(val);
                saveSettings(customHeaderImage, val);
              }}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
            <ChatInterface
              onApplyPrompt={setPrompt}
              csvHeaders={csvData.length > 0 ? csvData[0] : []}
              session={session}
            />
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start lg:col-span-3">
            <PreviewGrid
              previews={previews}
              isProcessing={isProcessing}
              onGenerate={handleProcess}
              onPreviewEdit={handlePreviewEdit}
              hasData={csvData.length > 0}
              signature={signature}
              ctaText={ctaText}
              ctaLink={ctaLink}
              customHeaderImage={customHeaderImage}
              customSignatureHtml={customSignatureHtml}
              includeHeaderImage={includeHeaderImage}
              includeCta={includeCta}
              includeSignature={includeSignature}
            />
          </div>
        </div>
      </main>

      <ActionBar
        totalEmails={calculateRecipientCount(csvData)}
        sentEmails={sentEmails}
        isSending={isSending}
        onSendAll={handleSendAll}
        hasGeneratedPreviews={previews.length > 0}
      />
    </div>
  );
}
