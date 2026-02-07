"use client";

import React from "react";
import { motion } from "framer-motion";
import { TRACKS } from "@/lib/accentureRoles";
import { TrackId } from "@/lib/types";
import { Briefcase, Rocket, Code2 } from "lucide-react";

interface RoleSelectorProps {
  selectedTrack: TrackId | null;
  onSelectTrack: (trackId: TrackId) => void;
}

const TRACK_ICON_MAP: Record<TrackId, React.ReactNode> = {
  tech_transformation: <Briefcase className="w-7 h-7" />,
  tech_delivery: <Rocket className="w-7 h-7" />,
  modern_engineering: <Code2 className="w-7 h-7" />,
};

const TRACK_ROLE_COUNTS: Record<TrackId, number> = {
  tech_transformation: 10,
  tech_delivery: 13,
  modern_engineering: 14,
};

export default function RoleSelector({
  selectedTrack,
  onSelectTrack,
}: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(Object.keys(TRACKS) as TrackId[]).map((trackId, index) => {
        const track = TRACKS[trackId];
        const isSelected = selectedTrack === trackId;

        return (
          <motion.button
            key={trackId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onSelectTrack(trackId)}
            className={`
              relative text-left p-6 rounded-2xl border-2 transition-all duration-300
              group cursor-pointer
              ${
                isSelected
                  ? "border-accent bg-accent/10 glow"
                  : "border-border bg-surface hover:border-accent/40 hover:bg-surface-light"
              }
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="track-indicator"
                className="absolute inset-0 rounded-2xl border-2 border-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            <div className="relative z-10">
              <div
                className={`
                  inline-flex p-3 rounded-xl mb-4 transition-colors duration-300
                  ${
                    isSelected
                      ? "bg-accent/20 text-accent"
                      : "bg-surface-lighter text-gray-400 group-hover:text-accent group-hover:bg-accent/10"
                  }
                `}
              >
                {TRACK_ICON_MAP[trackId]}
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">
                {track.title}
              </h3>

              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                {track.summary}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 rounded-md bg-surface-lighter">
                  {TRACK_ROLE_COUNTS[trackId]} roles accessible
                </span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
