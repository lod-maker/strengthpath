"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { TeamComplementarity } from "@/lib/types";

interface TeamInsightsProps {
  team: TeamComplementarity;
}

export default function TeamInsights({ team }: TeamInsightsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Users className="w-5 h-5 text-accent" />
        Team Dynamics
      </h3>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-border bg-surface p-6 space-y-5"
      >
        {/* Your contribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
            What You Bring to the Team
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {team.yourContribution}
          </p>
        </div>

        {/* Seek in teammates */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
            Seek in Teammates
          </h4>
          <div className="flex flex-wrap gap-2">
            {team.seekInTeammates.map((item, index) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 text-sm font-medium"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Ideal composition */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
            Ideal Team Composition
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {team.idealTeamComposition}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
