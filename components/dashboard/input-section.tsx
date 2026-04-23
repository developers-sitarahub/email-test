"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Upload, Users, FileSpreadsheet, X, CheckCircle2, Maximize } from "lucide-react";
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
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [hasHeaderRow, setHasHeaderRow] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
          
          // Determine if first row is a header
          const hasHeader = parsed.length > 0 && parsed[0].some(cell => 
            cell.toLowerCase().includes("email") || cell.toLowerCase().includes("name")
          );
          
          const actualCount = hasHeader ? Math.max(0, parsed.length - 1) : parsed.length;
          setRowCount(actualCount);
          setHasHeaderRow(hasHeader);
          setParsedData(parsed);
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
          
          // Determine if first row is a header
          const hasHeader = parsed.length > 0 && parsed[0].some(cell => 
            cell.toLowerCase().includes("email") || cell.toLowerCase().includes("name")
          );
          
          const actualCount = hasHeader ? Math.max(0, parsed.length - 1) : parsed.length;
          setRowCount(actualCount);
          setHasHeaderRow(hasHeader);
          setParsedData(parsed);
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
        .filter((email) => email && email.includes("@")); // Filter for valid-looking emails
      setRowCount(emails.length);
      onDataChange(emails.map((email) => [email]));
    }
  };

  const clearFile = () => {
    setFileName(null);
    setRowCount(0);
    setParsedData([]);
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
                <div className="space-y-4">
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
                          {rowCount} Email IDs found
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

                  {parsedData.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-border bg-card overflow-hidden text-xs shadow-sm"
                    >
                      <div className="overflow-x-auto max-h-[250px] hide-scrollbar">
                        <table className="w-full text-left">
                          <thead className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                            <tr>
                              <th className="px-4 py-2 font-semibold text-muted-foreground w-12 text-center border-r border-border/50">#</th>
                              {hasHeaderRow ? (
                                parsedData[0].map((header, i) => (
                                  <th key={i} className="px-4 py-2 font-semibold text-muted-foreground whitespace-nowrap">{header}</th>
                                ))
                              ) : (
                                parsedData[0].map((_, i) => (
                                  <th key={i} className="px-4 py-2 font-semibold text-muted-foreground whitespace-nowrap">Column {i + 1}</th>
                                ))
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {(hasHeaderRow ? parsedData.slice(1, 21) : parsedData.slice(0, 20)).map((row, i) => (
                              <tr key={i} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-4 py-2 text-muted-foreground/60 text-center border-r border-border/50 font-mono text-[10px]">{i + 1}</td>
                                {row.map((cell, j) => (
                                  <td key={j} className="px-4 py-2 text-foreground whitespace-nowrap max-w-[250px] truncate" title={cell}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 border-t border-border">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          {parsedData.length > (hasHeaderRow ? 21 : 20) ? `Showing first 20 rows of ${parsedData.length - (hasHeaderRow ? 1 : 0)}` : `Showing all ${parsedData.length - (hasHeaderRow ? 1 : 0)} rows`}
                        </div>
                        <button onClick={() => setIsFullscreen(true)} className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider font-bold text-primary hover:bg-primary/10 rounded transition-colors">
                          <Maximize className="w-3 h-3" />
                          Fullscreen
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
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

      {/* Fullscreen Data Modal */}
      <AnimatePresence>
        {isFullscreen && parsedData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm p-6"
          >
            <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-success" />
                  <h3 className="font-semibold text-foreground">{fileName} - Data Preview</h3>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground ml-2">
                    {parsedData.length - (hasHeaderRow ? 1 : 0)} rows
                  </span>
                </div>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto bg-card hide-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-muted-foreground w-12 text-center border-r border-border/50">#</th>
                      {hasHeaderRow ? (
                        parsedData[0].map((header, i) => (
                          <th key={i} className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap border-b border-border">{header}</th>
                        ))
                      ) : (
                        parsedData[0].map((_, i) => (
                          <th key={i} className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap border-b border-border">Column {i + 1}</th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(hasHeaderRow ? parsedData.slice(1, 1001) : parsedData.slice(0, 1000)).map((row, i) => (
                      <tr key={i} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-2 text-muted-foreground/60 text-center border-r border-border/50 font-mono text-xs">{i + 1}</td>
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-2 text-foreground whitespace-nowrap max-w-[400px] truncate" title={cell}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 1001 && (
                <div className="p-2 text-center text-xs text-muted-foreground bg-secondary/30 border-t border-border">
                  Showing first 1000 rows only to prevent lag. Your actual file has {parsedData.length - (hasHeaderRow ? 1 : 0)} rows.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
