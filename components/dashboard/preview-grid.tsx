"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Loader2, Mail, FileText, Eye } from "lucide-react";

interface EmailPreview {
  original: string[];
  generated: string;
}

interface PreviewGridProps {
  previews: EmailPreview[];
  isProcessing: boolean;
  onGenerate: () => void;
  hasData: boolean;
  signature?: string;
  ctaText?: string;
  ctaLink?: string;
  customHeaderImage?: string | null;
  customSignatureHtml?: string | null;
  includeHeaderImage?: boolean;
  includeSignature?: boolean;
}

export function PreviewGrid({
  previews,
  isProcessing,
  onGenerate,
  hasData,
  signature = "",
  ctaText = "",
  ctaLink = "",
  customHeaderImage,
  customSignatureHtml,
  includeHeaderImage,
  includeSignature,
}: PreviewGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-border bg-card overflow-hidden h-full shadow-xl shadow-primary/5 dark:shadow-none"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-transparent dark:from-primary/10 dark:via-accent/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Preview</h2>
            <p className="text-xs text-muted-foreground">AI-generated emails</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGenerate}
          disabled={!hasData || isProcessing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate</span>
            </>
          )}
        </motion.button>
      </div>

      <div className="p-6 max-h-[600px] overflow-y-auto">
        {previews.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6"
            >
              <Sparkles className="w-9 h-9 text-primary dark:text-accent" />
            </motion.div>
            <h3 className="text-base font-medium text-foreground mb-2">
              {hasData ? "Ready to generate" : "No recipients yet"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {hasData
                ? "Click \"Generate\" to preview AI-generated emails for your recipients"
                : "Upload a CSV or manually enter recipients to get started"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {previews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="rounded-xl border border-border bg-gradient-to-br from-secondary/30 to-transparent overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-foreground">
                        Email #{index + 1}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary dark:text-accent text-[10px] font-semibold">
                      AI Generated
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2">
                    {/* Original Data */}
                    <div className="p-4 border-b md:border-b-0 md:border-r border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Source Data
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-input border border-border">
                        <code className="text-xs text-muted-foreground font-mono break-all">
                          {preview.original.join(", ")}
                        </code>
                      </div>
                    </div>

                    {/* Arrow indicator (hidden on mobile) */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Generated Email */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                          Generated Email
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-input border border-border flex flex-col gap-3">
                        {(() => {
                           let parsed: any;
                           try {
                             parsed = typeof preview.generated === 'string' ? JSON.parse(preview.generated) : preview.generated;
                           } catch (e) {
                             return <p className="text-sm text-foreground/90 whitespace-pre-wrap">{preview.generated}</p>;
                           }
                           
                           if (!parsed || !parsed.blocks) {
                             return <p className="text-sm text-foreground/90 whitespace-pre-wrap">{preview.generated}</p>;
                           }
                           
                           return (
                             <div className="flex flex-col gap-4">
                               {parsed.subject && (
                                 <div className="text-sm font-bold text-foreground border-b border-border pb-2">
                                   Subject: <span className="font-normal text-muted-foreground">{parsed.subject}</span>
                                 </div>
                               )}
                               
                               <div className="flex flex-col gap-3">
                                 {parsed.blocks.map((block: any, idx: number) => {
                                   if (block.type === 'text') {
                                     return (
                                       <p key={idx} style={{ textAlign: block.styles?.alignment || 'left', fontSize: block.styles?.fontSize || '14px', color: block.styles?.color || 'inherit' }} className="whitespace-pre-wrap leading-relaxed">
                                         {block.content?.text}
                                       </p>
                                     );
                                   }
                                   if (block.type === 'image') {
                                     // If the user explicitly turned off the header, we shouldn't show it in preview either
                                     if (includeHeaderImage === false) return null;
                                     const imgUrl = (includeHeaderImage && customHeaderImage) ? customHeaderImage : (block.content?.url || "https://images.unsplash.com/photo-1579389083078-4e7018379f7e?w=600&q=80");
                                     return (
                                       <div key={idx} style={{ textAlign: block.styles?.alignment || 'center' }} className="my-2">
                                         <img src={imgUrl} alt="Email Header" className="max-w-full h-auto rounded-lg" style={{ maxHeight: '200px', objectFit: 'cover', display: 'inline-block' }} />
                                       </div>
                                     );
                                   }
                                   if (block.type === 'cta') {
                                     return (
                                       <div key={idx} style={{ textAlign: block.styles?.alignment || 'center' }} className="mt-4 mb-2">
                                         <a href={block.content?.link || ctaLink} style={{ backgroundColor: block.styles?.backgroundColor || '#4f46e5', color: '#fff', fontSize: block.styles?.fontSize || '14px' }} className="inline-block px-6 py-2.5 font-medium rounded-lg no-underline hover:opacity-90">
                                           {block.content?.text || ctaText}
                                         </a>
                                       </div>
                                     );
                                   }
                                   if (block.type === 'signature') {
                                     if (includeSignature === false) return null;
                                     if (includeSignature && customSignatureHtml) {
                                       return (
                                         <div key={idx} style={{ textAlign: block.styles?.alignment || 'left', fontSize: block.styles?.fontSize || '14px', color: block.styles?.color || '#4b5563' }} className="mt-4 pt-4 border-t border-border" dangerouslySetInnerHTML={{ __html: customSignatureHtml }} />
                                       );
                                     }
                                     return (
                                       <div key={idx} style={{ textAlign: block.styles?.alignment || 'left', fontSize: block.styles?.fontSize || '14px', color: block.styles?.color || '#4b5563' }} className="mt-4 pt-4 border-t border-border whitespace-pre-wrap">
                                         {block.content?.text || signature}
                                       </div>
                                     );
                                   }
                                   return null;
                                 })}
                               </div>
                             </div>
                           );
                        })()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
