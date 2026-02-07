"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RoleMatch } from "@/lib/types";
import { ACCENTURE_ROLES, getRoleDomainColor } from "@/lib/accentureRoles";
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Calendar,
} from "lucide-react";

interface RoleMatchCardProps {
  match: RoleMatch;
  index: number;
}

function getFitColor(tier: string): string {
  if (tier === "Exceptional Fit") return "bg-emerald-500";
  if (tier === "Strong Fit") return "bg-emerald-400";
  if (tier === "Good Fit") return "bg-amber-500";
  if (tier === "Moderate Fit") return "bg-blue-400";
  return "bg-blue-500";
}

function getFitBadgeVariant(tier: string): "strong" | "good" | "developing" {
  if (tier.includes("Exceptional") || tier.includes("Strong")) return "strong";
  if (tier.includes("Good") || tier.includes("Moderate")) return "good";
  return "developing";
}

export default function RoleMatchCard({ match, index }: RoleMatchCardProps) {
  const [expanded, setExpanded] = useState(index === 0);

  const roleData = ACCENTURE_ROLES.find((r) => r.name === match.role);
  const domainColor = roleData
    ? getRoleDomainColor(roleData.domain)
    : "#9CA3AF";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="rounded-2xl border border-border bg-surface overflow-hidden hover:border-border-light transition-all duration-300"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-6 flex items-start gap-4 group"
      >
        {/* Rank badge */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl gradient-accent flex items-center justify-center text-white font-bold text-lg">
          #{match.rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold text-white">
                {match.role}
              </h4>
              <div className="flex items-center gap-2 mt-1.5">
                {roleData && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: domainColor + "20",
                      color: domainColor,
                    }}
                  >
                    {roleData.domain}
                  </span>
                )}
                {match.withinCurrentTrack && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-accent/10 text-accent font-medium">
                    Your Track
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {match.fitScore}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                  score
                </div>
              </div>

              <Badge variant={getFitBadgeVariant(match.fitTier)}>
                {match.fitTier}
              </Badge>

              {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-3 h-1.5 rounded-full bg-surface-lighter overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: match.fitScore + "%" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={"h-full rounded-full " + getFitColor(match.fitTier)}
            />
          </div>
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-5 border-t border-border pt-5">
              {/* Strength alignments */}
              <div>
                <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                  How Your Strengths Align
                </h5>
                <div className="space-y-3">
                  {match.strengthAlignments.map((sa) => (
                    <div
                      key={sa.strength}
                      className="rounded-xl bg-surface-light p-4"
                    >
                      <span className="text-sm font-semibold text-accent">
                        {sa.strength}
                      </span>
                      <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                        {sa.relevance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day in the life */}
              {match.dayInTheLife && (
                <div className="rounded-xl bg-accent/5 border border-accent/15 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <h5 className="text-sm font-medium text-accent">
                      A Day in This Role
                    </h5>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {match.dayInTheLife}
                  </p>
                </div>
              )}

              {/* Growth tip */}
              {match.growthTip && (
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <h5 className="text-sm font-medium text-amber-400">
                      Growth Tip
                    </h5>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {match.growthTip}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
