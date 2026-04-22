"use client";

import { motion } from "framer-motion";
import { Send, Loader2, Users, CheckCircle2, ArrowRight } from "lucide-react";

interface ActionBarProps {
  totalEmails: number;
  sentEmails: number;
  isSending: boolean;
  onSendAll: () => void;
  hasGeneratedPreviews: boolean;
}

export function ActionBar({
  totalEmails,
  sentEmails,
  isSending,
  onSendAll,
  hasGeneratedPreviews,
}: ActionBarProps) {
  const progress = totalEmails > 0 ? (sentEmails / totalEmails) * 100 : 0;
  const isComplete = sentEmails === totalEmails && totalEmails > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="mx-auto max-w-7xl px-6 pb-6">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="flex items-center justify-between gap-6 px-6 py-5 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 dark:shadow-black/20 pointer-events-auto"
        >
          {/* Stats Section */}
          <div className="flex items-center gap-8">
            {/* Total Recipients */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Users className="w-5 h-5 text-primary dark:text-accent" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Recipients
                </p>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  {totalEmails}
                </p>
              </div>
            </div>

            {/* Sent Count - Show when sending or complete */}
            {(isSending || isComplete) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                  isComplete 
                    ? "bg-gradient-to-br from-success/20 to-success/10" 
                    : "bg-secondary"
                }`}>
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <Send className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {isComplete ? "Completed" : "Sent"}
                  </p>
                  <p className={`text-xl font-bold tabular-nums ${
                    isComplete ? "text-success" : "text-foreground"
                  }`}>
                    {sentEmails}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Progress Bar - Show when sending */}
          {isSending && !isComplete && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              className="flex-1 max-w-md"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Sending emails...
                </span>
                <span className="text-xs font-bold text-foreground tabular-nums">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center gap-2 text-success"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-semibold">All emails sent successfully!</span>
            </motion.div>
          )}

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSendAll}
            disabled={!hasGeneratedPreviews || isSending || totalEmails === 0 || isComplete}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all ${
              isComplete
                ? "bg-success/10 text-success cursor-default"
                : "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            }`}
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : isComplete ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete</span>
              </>
            ) : (
              <>
                <span>Send All</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
