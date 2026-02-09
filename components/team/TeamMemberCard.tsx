"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TeamMember } from "@/lib/types";
import { getDomainColor } from "@/lib/gallupDomains";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TeamMemberCardProps {
  member: TeamMember;
  onRemove?: (id: string) => void;
  isCurrentUser?: boolean;
}

const trackColors: Record<string, string> = {
  "Tech Transformation": "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  "Tech Delivery": "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  "Modern Engineering": "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
};

const trackBadgeColors: Record<string, string> = {
  "Tech Transformation": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Tech Delivery": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Modern Engineering": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function TeamMemberCard({ member, onRemove, isCurrentUser }: TeamMemberCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const domainColor = getDomainColor(member.dominantDomain);
  const trackGradient = trackColors[member.track] || "from-gray-500/20 to-gray-600/10 border-gray-500/30";
  const trackBadge = trackBadgeColors[member.track] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  const hasMore = member.strengthsSixToTen.length > 0;

  const handleRemove = () => {
    if (onRemove && window.confirm(`Remove ${member.name} from the Team Map?`)) {
      onRemove(member.id);
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border bg-gradient-to-br ${trackGradient} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/5`}
    >
      {/* Domain indicator bar */}
      <div
        className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
        style={{ backgroundColor: domainColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3 mt-1">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate">
            {member.name}
            {isCurrentUser && <span className="ml-1.5 text-xs text-yellow-400">&#11088; You</span>}
          </h3>
          <p className="text-xs text-gray-400 italic">{member.persona}</p>
        </div>
        <span className={`text-[10px] font-medium px-2 py-1 rounded-full border ${trackBadge}`}>
          {member.track}
        </span>
      </div>

      {/* Domain pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: domainColor }}
        >
          {member.dominantDomain}
        </span>
        {member.secondaryDomain && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white/80"
            style={{ backgroundColor: getDomainColor(member.secondaryDomain), opacity: 0.7 }}
          >
            {member.secondaryDomain}
          </span>
        )}
      </div>

      {/* Top 5 strengths */}
      <div className="space-y-2">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Top 5 Strengths</p>
        <div className="flex flex-wrap gap-1.5">
          {member.topFive.map((strength, i) => (
            <span
              key={strength}
              className="text-xs font-medium px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300"
            >
              #{i + 1} {strength}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable Strengths 6-10 */}
      {hasMore && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Show less" : "Show 6-10"}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 pt-3 border-t border-white/10">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Strengths 6-10</p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.strengthsSixToTen.map((strength, i) => (
                      <span
                        key={strength}
                        className="text-xs font-medium px-2 py-1 rounded-md bg-white/3 border border-white/5 text-gray-400"
                      >
                        #{i + 6} {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Top role match */}
      {member.topRoleMatch && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Top Role Match</p>
          <p className="text-sm font-medium text-white">{member.topRoleMatch}</p>
        </div>
      )}

      {/* Remove link — only visible for the current user */}
      {isCurrentUser && (
        <button
          onClick={handleRemove}
          className="absolute bottom-3 right-3 text-[10px] text-gray-500 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          Remove me
        </button>
      )}
    </div>
  );
}
