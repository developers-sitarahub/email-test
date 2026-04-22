"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Upload, Users, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import { useState, useCallback } from "react";

interface InputSectionProps {
  onDataChange: (data: string[][]) => void;
}

export function InputSection({ onDataChange }: InputSectionProps) {
  const [activeTab, setActiveTab] = useState<"csv" | "manual">("csv");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [manualInput, setManualInput] = useState("");

  const parseCSV = (text: string): string[][] => {
    return text
      .trim()
      .split("\n")
      .map((row) => row.split(",").map((cell) => cell.trim()));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const parsed = parseCSV(text);
          setRowCount(parsed.length);
          onDataChange(parsed);
        };
        reader.readAsText(file);
      }
    },
    [onDataChange]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const parsed = parseCSV(text);
          setRowCount(parsed.length);
          onDataChange(parsed);
        };
        reader.readAsText(file);
      }
    },
    [onDataChange]
  );

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      const emails = manualInput
        .split(/[\n,]/)
        .map((email) => email.trim())
        .filter((email) => email);
      setRowCount(emails.length);
      onDataChange(emails.map((email) => [email]));
    }
  };

  const clearFile = () => {
    setFileName(null);
    setRowCount(0);
    onDataChange([]);
  };

  const tabs = [
    { id: "csv" as const, label: "Upload CSV", icon: Upload },
    { id: "manual" as const, label: "Manual Entry", icon: Users },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl shadow-primary/5 dark:shadow-none"
    >
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-transparent dark:from-primary/10 dark:via-accent/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recipients</h2>
            <p className="text-xs text-muted-foreground">Import your contact list</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border bg-secondary/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="inputActiveTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === "csv" ? (
            <motion.div
              key="csv"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {fileName ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success/20 shadow-lg shadow-success/10">
                      <FileSpreadsheet className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {fileName}
                        </p>
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rowCount} recipients ready
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={clearFile}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex flex-col items-center justify-center gap-4 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10"
                      : "border-border hover:border-primary/50 bg-secondary/20 hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5"
                  }`}
                >
                  <motion.div
                    animate={isDragging ? { y: -8, scale: 1.1 } : { y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className={`flex items-center justify-center w-16 h-16 rounded-2xl transition-all ${
                      isDragging 
                        ? "bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/30" 
                        : "bg-secondary"
                    }`}
                  >
                    <Upload className={`w-7 h-7 ${isDragging ? "text-white" : "text-muted-foreground"}`} />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Drop your CSV file here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse from your computer
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground">
                    <span>Supports: .csv files</span>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </motion.label>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={"Enter email addresses, one per line:\n\njohn@company.com\njane@startup.io\ncontact@business.com"}
                className="w-full h-44 px-4 py-4 rounded-xl bg-input border border-border text-foreground placeholder-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono"
              />
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
              >
                Add Recipients
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
