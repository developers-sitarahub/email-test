"use client";

import { motion } from "framer-motion";
import { Mail, Zap, Circle, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession, signIn, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.05);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 dark:shadow-primary/10"
            >
              <Mail className="w-5 h-5 text-white" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent blur-md"
              />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mail by GPSERP
              </h1>
              <p className="text-xs text-muted-foreground">
                AI-powered email automation
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-medium border transition-all ${isOnline
                ? "bg-success/10 text-success border-success/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
                }`}
            >
              <motion.span
                animate={{
                  scale: isOnline ? [1, 1.2, 1] : 1,
                  opacity: isOnline ? [1, 0.5, 1] : 0.5,
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Circle
                  className={`w-2 h-2 ${isOnline ? "fill-success text-success" : "fill-destructive text-destructive"
                    }`}
                />
              </motion.span>
              <span>{isOnline ? "All systems operational" : "Connection issue"}</span>
            </motion.div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth section */}
            <div className="flex items-center gap-4 ml-2 pl-4 border-l border-border">
              {session ? (
                <div className="flex items-center gap-3 group cursor-pointer relative">
                  <div className="flex flex-col text-right hidden lg:flex">
                    <span className="text-xs font-bold text-foreground leading-tight">
                      {session.user?.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-none">
                      {session.user?.email}
                    </span>
                  </div>
                  <div className="relative">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={session.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + session.user?.email}
                      alt="avatar"
                      className="w-9 h-9 rounded-xl border border-border shadow-sm group-hover:border-primary/50 transition-colors"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-background" />
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="ml-2 p-2 rounded-lg bg-secondary/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all flex items-center gap-2 group/signout"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => signIn("google")}
                  className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-bold shadow-lg shadow-primary/20 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    Connect Gmail
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
