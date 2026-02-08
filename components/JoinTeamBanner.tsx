"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnalysisResult, ExtractedStrengths, Track, TrackId } from "@/lib/types";
import { Users, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface JoinTeamBannerProps {
  analysis: AnalysisResult;
  trackId: TrackId;
  userName: string;
  strengths: ExtractedStrengths;
}

export default function JoinTeamBanner({
  analysis,
  trackId,
  userName,
  strengths,
}: JoinTeamBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Pre-fill name from PDF extraction, but skip generic fallback
  const [name, setName] = useState(
    userName && userName !== "Team Member" ? userName : ""
  );

  const canJoin = name.trim().length > 0;

  const handleJoin = async () => {
    if (!canJoin) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Extract minimal data for TeamMember
      const topFive = analysis.persona.topFive;

      // Get strengths 6-10 from the full strengths list
      const strengthsSixToTen = strengths
        .filter((s) => s.rank >= 6 && s.rank <= 10)
        .map((s) => s.name);

      // Get track title from TRACKS
      const { TRACKS } = await import("@/lib/accentureRoles");
      const trackTitle = TRACKS[trackId]?.title || trackId;

      // Get top role match from perfect fit roles
      const topRoleMatch = analysis.perfectFitRoles?.[0]?.role || "";

      const response = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          track: trackTitle,
          topFive,
          strengthsSixToTen,
          dominantDomain: analysis.persona.dominantDomain.name,
          secondaryDomain: analysis.persona.secondaryDomain.name,
          gap: analysis.persona.gap.domain,
          persona: analysis.persona.moniker,
          topRoleMatch,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${response.status}`);
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Join Team Map error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="w-full"
      >
        <div className="rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 to-transparent p-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Users className="w-32 h-32" />
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Join the Team Map
              </h3>
              <p className="text-gray-300 max-w-xl">
                Share your strength profile with the team to help visualize our collective talents, gaps, and role coverage.
              </p>
            </div>

            {/* Name input + actions row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <label htmlFor="team-name" className="text-sm text-gray-400 whitespace-nowrap">
                  Your name:
                </label>
                <input
                  id="team-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={isSubmitting || isSuccess}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50 disabled:opacity-50"
                />
              </div>

              <div className="flex items-center gap-3">
                {isSuccess ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Added to Team Map!</span>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" onClick={handleDismiss} disabled={isSubmitting}>
                      No thanks
                    </Button>
                    <Button onClick={handleJoin} disabled={isSubmitting || !canJoin}>
                      {isSubmitting ? (
                        <span className="animate-pulse">Joining...</span>
                      ) : (
                        "Join Team Map"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
