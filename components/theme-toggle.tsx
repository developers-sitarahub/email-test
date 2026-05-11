"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-secondary/50 border border-border animate-pulse" />
    );
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-300 ${
        isDark
          ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          : "bg-amber-50 border-amber-200/50 text-amber-600 hover:text-amber-700 hover:bg-amber-100/50 shadow-sm shadow-amber-200/20"
      }`}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={resolvedTheme}
          initial={{ y: -10, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 10, opacity: 0, rotate: 45 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="w-4.5 h-4.5 fill-current" />
          ) : (
            <Sun className="w-4.5 h-4.5 fill-current" />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Subtle indicator for system mode */}
      {theme === "system" && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-background" title="System Theme Active" />
      )}
    </motion.button>
  );
}

