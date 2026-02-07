"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const REACTIONS = [
  { emoji: "🎯", label: "Spot on", value: "spot_on" },
  { emoji: "👍", label: "Helpful", value: "helpful" },
  { emoji: "🤔", label: "Partly right", value: "partly_right" },
  { emoji: "👎", label: "Off track", value: "off_track" },
];

interface FeedbackCardProps {
  topRole: string;
  trackTitle: string;
}

export default function FeedbackCard({ topRole, trackTitle }: FeedbackCardProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showComment, setShowComment] = useState(false);

  const handleSubmit = async () => {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reaction: selectedReaction,
          comment: comment.trim() || null,
          topRole,
          trackTitle,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Feedback is best-effort, don't block the user
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center"
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">
          Thanks for the feedback!
        </h3>
        <p className="text-sm text-gray-400">
          This helps us improve StrengthPath for the whole team.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="rounded-2xl border border-border bg-surface p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-white">
          How accurate were these results?
        </h3>
      </div>

      <p className="text-sm text-gray-400 mb-5">
        Your feedback helps us improve recommendations for the team.
      </p>

      {/* Reaction buttons */}
      <div className="flex flex-wrap gap-3 mb-5">
        {REACTIONS.map((r) => {
          const isSelected = selectedReaction === r.value;
          return (
            <button
              key={r.value}
              onClick={() => {
                setSelectedReaction(r.value);
                setShowComment(true);
              }}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200
                ${
                  isSelected
                    ? "border-accent bg-accent/10 scale-105"
                    : "border-border bg-surface-light hover:border-border-light hover:bg-surface-lighter"
                }
              `}
            >
              <span className="text-xl">{r.emoji}</span>
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-white" : "text-gray-400"
                }`}
              >
                {r.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Optional comment */}
      <AnimatePresence>
        {showComment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Anything else? e.g. 'My #1 match was exactly what my manager suggested' or 'I expected to see Scrum Master higher'..."
              className="w-full rounded-xl border border-border bg-surface-lighter text-white text-sm p-4 h-24 resize-none placeholder:text-gray-500 focus:outline-none focus:border-accent/50 transition-colors mb-4"
            />

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!selectedReaction}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
