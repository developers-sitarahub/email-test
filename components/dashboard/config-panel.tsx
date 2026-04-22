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
}: ConfigPanelProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
                      className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-secondary ${
                        model === m.id ? "bg-secondary/50" : ""
                      }`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                        model === m.id 
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

        {/* Design & Signature */}
        <div className="space-y-4 pt-4 border-t border-border mt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            Email Design Settings
          </label>
          
          {/* Toggles */}
          <div className="flex flex-wrap gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={includeHeaderImage} onChange={(e) => onIncludeHeaderImageChange(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
              Include AI Header Image
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={includeCta} onChange={(e) => onIncludeCtaChange(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
              Include AI CTA Button
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={includeSignature} onChange={(e) => onIncludeSignatureChange(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
              Include AI Signature
            </label>
          </div>

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
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Email Signature</span>
            <textarea
              value={signature}
              onChange={(e) => onSignatureChange(e.target.value)}
              placeholder="Best regards,&#10;Your Name&#10;Your Title"
              disabled={!includeSignature}
              className="w-full h-24 px-3 py-2 rounded-lg bg-input border border-border text-sm placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
            />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
