"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings2, ChevronDown, Sparkles, Brain, Zap, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ConfigPanelProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  model: string;
  onModelChange: (model: string) => void;
  session: any;
  signature: string;
  onSignatureChange: (val: string) => void;
  ctaText: string;
  onCtaTextChange: (val: string) => void;
  ctaLink: string;
  onCtaLinkChange: (val: string) => void;
  includeHeaderImage: boolean;
  onIncludeHeaderImageChange: (val: boolean) => void;
  includeCta: boolean;
  onIncludeCtaChange: (val: boolean) => void;
  includeSignature: boolean;
  onIncludeSignatureChange: (val: boolean) => void;
  customHeaderImage?: string | null;
  onCustomHeaderImageChange?: (val: string | null) => void;
  customSignatureHtml?: string | null;
  onCustomSignatureHtmlChange?: (val: string | null) => void;
  attachments?: { name: string, type: string, content: string }[];
  onAttachmentsChange?: (val: { name: string, type: string, content: string }[]) => void;
}

const models = [
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Most capable, best for complex tasks",
    icon: Brain,
    badge: "Recommended",
    color: "from-violet-500 to-purple-500"
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description: "Fast responses, great for bulk operations",
    icon: Zap,
    badge: null,
    color: "from-amber-500 to-orange-500"
  },
];

export function ConfigPanel({
  prompt,
  onPromptChange,
  model,
  onModelChange,
  session,
  signature,
  onSignatureChange,
  ctaText,
  onCtaTextChange,
  ctaLink,
  onCtaLinkChange,
  includeHeaderImage,
  onIncludeHeaderImageChange,
  includeCta,
  onIncludeCtaChange,
  includeSignature,
  onIncludeSignatureChange,
  customHeaderImage,
  onCustomHeaderImageChange,
  customSignatureHtml,
  onCustomSignatureHtmlChange,
  attachments,
  onAttachmentsChange,
}: ConfigPanelProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openSection, setOpenSection] = useState<"header" | "cta" | "signature" | "attachments" | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (onAttachmentsChange && attachments) {
          onAttachmentsChange([...attachments, { name: file.name, type: file.type, content: reader.result as string }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    if (onAttachmentsChange && attachments) {
      const newAtt = [...attachments];
      newAtt.splice(index, 1);
      onAttachmentsChange(newAtt);
    }
  };

  const signatureRef = useRef<HTMLDivElement>(null);
  // We can remove the useEffect because we will use dangerouslySetInnerHTML for initial mount,
  // and manage updates through onBlur. If we need to force updates, we would use a key.

  const handleSignaturePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Let text/html pass through normally, but try to catch direct image pastes (like from snipping tool)
    const items = e.clipboardData?.items;
    if (!items) return;

    let hasImage = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        hasImage = true;
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            document.execCommand('insertHTML', false, `<img src="${base64}" alt="Pasted Image" style="max-height: 100px; margin: 4px 0;" />`);
          };
          reader.readAsDataURL(file);
        }
        break; // Only handle the first image to prevent duplicate inserts if there are multiple formats
      }
    }
  };

  const selectedModel = models.find((m) => m.id === model) || models[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const variables = [
    { label: "{{name}}", color: "from-blue-500 to-cyan-500" },
    { label: "{{email}}", color: "from-emerald-500 to-teal-500" },
    { label: "{{company}}", color: "from-orange-500 to-amber-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl shadow-accent/5 dark:shadow-none"
    >
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-accent/5 via-primary/5 to-transparent dark:from-accent/10 dark:via-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg shadow-accent/20">
            <Settings2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Configuration</h2>
            <p className="text-xs text-muted-foreground">Customize your AI generation</p>
          </div>
        </div>

        {session && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-bold text-success uppercase tracking-wider">
              Sender: {session.user?.email}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Master Prompt */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="w-4 h-4 text-accent" />
              Master Prompt
            </label>
            <span className="text-xs text-muted-foreground">
              {prompt.length} / 2000
            </span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            maxLength={2000}
            placeholder="Write a friendly, personalized cold email that introduces our SaaS product. Keep it concise and professional with a clear call-to-action..."
            className="w-full h-36 px-4 py-4 rounded-xl bg-input border border-border text-foreground placeholder-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all leading-relaxed"
          />
          <div className="flex flex-wrap gap-2">
            {variables.map((variable) => (
              <motion.button
                key={variable.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPromptChange(prompt + " " + variable.label)}
                className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${variable.color} text-white text-xs font-mono font-medium shadow-md hover:shadow-lg transition-shadow`}
              >
                {variable.label}
              </motion.button>
            ))}
            <span className="text-xs text-muted-foreground self-center ml-1">
              Click to insert variable
            </span>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            AI Model
          </label>
          <div ref={dropdownRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-input border border-border text-foreground hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${selectedModel.color} shadow-lg`}>
                  <selectedModel.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{selectedModel.name}</p>
                    {selectedModel.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary dark:text-accent text-[10px] font-semibold uppercase tracking-wide">
                        {selectedModel.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedModel.description}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 w-full mt-2 rounded-xl border border-border bg-popover shadow-2xl overflow-hidden"
                >
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onModelChange(m.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-secondary ${model === m.id ? "bg-secondary/50" : ""
                        }`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${model === m.id
                        ? `bg-gradient-to-br ${m.color} shadow-lg`
                        : "bg-secondary"
                        }`}>
                        <m.icon className={`w-5 h-5 ${model === m.id ? "text-white" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{m.name}</p>
                          {m.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary dark:text-accent text-[10px] font-semibold uppercase tracking-wide">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                      </div>
                      {model === m.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Design & Signature Accordion */}
        <div className="space-y-4 pt-4 border-t border-border mt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Email Design Settings
          </label>

          {/* Tabs Header */}
          <div className="flex border-b border-border overflow-x-auto hide-scrollbar gap-2">
            <button
              onClick={() => setOpenSection(openSection === "header" ? null : "header")}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center justify-center ${openSection === "header" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <span className={`transition-all ${includeHeaderImage ? "px-3 py-1 border border-success/50 rounded-full bg-success/10 text-success shadow-sm" : ""}`}>
                Header Image
              </span>
            </button>
            <button
              onClick={() => setOpenSection(openSection === "cta" ? null : "cta")}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center justify-center ${openSection === "cta" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <span className={`transition-all ${includeCta ? "px-3 py-1 border border-success/50 rounded-full bg-success/10 text-success shadow-sm" : ""}`}>
                CTA Button
              </span>
            </button>
            <button
              onClick={() => setOpenSection(openSection === "signature" ? null : "signature")}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center justify-center ${openSection === "signature" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <span className={`transition-all ${includeSignature ? "px-3 py-1 border border-success/50 rounded-full bg-success/10 text-success shadow-sm" : ""}`}>
                Signature
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {openSection && (
              <motion.div
                key={openSection}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-border rounded-xl overflow-hidden mt-2"
              >
                {openSection === "header" && (
                  <div className="p-4 space-y-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={includeHeaderImage} onChange={(e) => onIncludeHeaderImageChange(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
                      Include AI Header Image
                    </label>
                    {includeHeaderImage && onCustomHeaderImageChange && (
                      <div className="space-y-2 p-3 bg-secondary/20 rounded-xl border border-border">
                        <span className="text-xs text-muted-foreground font-medium">Custom Header Image</span>
                        <div className="flex items-center gap-4">
                          {customHeaderImage && (
                            <img src={customHeaderImage} alt="Header Preview" className="h-10 w-20 object-cover rounded shadow" />
                          )}
                          <input type="file" accept="image/*" className="text-xs text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={(e) => handleImageUpload(e, (base64) => onCustomHeaderImageChange(base64))} />
                          {customHeaderImage && (
                            <button onClick={() => onCustomHeaderImageChange(null)} className="text-xs text-destructive hover:underline">Remove</button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {openSection === "cta" && (
                  <div className="p-4 space-y-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={includeCta} onChange={(e) => onIncludeCtaChange(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
                      Include AI CTA Button
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground font-medium">Button Link (URL)</span>
                        <input
                          type="text"
                          value={ctaLink}
                          onChange={(e) => onCtaLinkChange(e.target.value)}
                          placeholder="https://your-website.com"
                          disabled={!includeCta}
                          className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground font-medium">Button Text</span>
                        <input
                          type="text"
                          value={ctaText}
                          onChange={(e) => onCtaTextChange(e.target.value)}
                          placeholder="Book a Demo"
                          disabled={!includeCta}
                          className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {openSection === "signature" && (
                  <div className="p-4 space-y-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={includeSignature} onChange={(e) => onIncludeSignatureChange(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
                      Include AI Signature
                    </label>
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground font-medium">Email Signature (Paste rich text & images here)</span>
                      <div
                        ref={signatureRef}
                        contentEditable={includeSignature}
                        suppressContentEditableWarning={true}
                        dangerouslySetInnerHTML={{ __html: customSignatureHtml ?? signature.replace(/\n/g, '<br/>') }}
                        onBlur={(e) => {
                          if (onCustomSignatureHtmlChange) onCustomSignatureHtmlChange(e.currentTarget.innerHTML);
                          else onSignatureChange(e.currentTarget.innerHTML);
                        }}
                        onPaste={handleSignaturePaste}
                        className={`w-full min-h-[6rem] max-h-48 overflow-y-auto px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 ${!includeSignature ? 'opacity-50 cursor-not-allowed bg-secondary/50 text-foreground' : 'cursor-text bg-white text-black'}`}
                        style={{ minHeight: '6rem' }}
                      />
                      {includeSignature && onCustomSignatureHtmlChange && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Add Image to Signature (HTML Base64):</span>
                          <input type="file" accept="image/*" className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20" onChange={(e) => handleImageUpload(e, (base64) => {
                            const imgTag = `<br/><img src="${base64}" alt="Signature" style="max-height: 50px; margin-top: 8px;" />`;
                            onCustomSignatureHtmlChange((customSignatureHtml || signature) + imgTag);
                          })} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

          {/* Attachments Section - Always Visible Below */}
          <div className="pt-4 mt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Attachments</label>
              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-secondary text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors">
                <input type="file" multiple className="hidden" onChange={handleAttachmentUpload} />
                Add Attachment
              </label>
            </div>
            {attachments && attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30 text-success text-xs shadow-sm">
                    <span className="truncate max-w-[150px] font-medium" title={att.name}>{att.name}</span>
                    <button onClick={() => removeAttachment(idx)} className="text-success hover:text-destructive transition-colors">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
