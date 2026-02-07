"use client";

import React from "react";
import { motion } from "framer-motion";
import { StrengthDomains } from "@/lib/types";
import { getDomainColor } from "@/lib/gallupDomains";

interface StrengthDomainsCardProps {
  domains: StrengthDomains;
}

const DOMAIN_LABELS: Record<string, string> = {
  executing: "Executing",
  influencing: "Influencing",
  relationshipBuilding: "Relationship Building",
  strategicThinking: "Strategic Thinking",
};

export default function StrengthDomainsCard({
  domains,
}: StrengthDomainsCardProps) {
  const domainEntries = [
    { key: "executing", strengths: domains.executing },
    { key: "influencing", strengths: domains.influencing },
    { key: "relationshipBuilding", strengths: domains.relationshipBuilding },
    { key: "strategicThinking", strengths: domains.strategicThinking },
  ].filter((d) => d.strengths && d.strengths.length > 0);

  const maxCount = Math.max(...domainEntries.map((d) => d.strengths.length), 1);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Your Strength Domains
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        <span className="text-white font-medium">{domains.dominantDomain}</span>
        {domains.secondaryDomain && (
          <>
            {" "}
            dominant, with{" "}
            <span className="text-white font-medium">
              {domains.secondaryDomain}
            </span>{" "}
            as secondary
          </>
        )}
      </p>

      <div className="space-y-5">
        {domainEntries.map(({ key, strengths }, index) => {
          const label = DOMAIN_LABELS[key];
          const color = getDomainColor(label);
          const pct = (strengths.length / maxCount) * 100;
          const isDominant = label === domains.dominantDomain;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {label}
                  </span>
                  {isDominant && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                      Dominant
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-400">
                  {strengths.length} strength{strengths.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="h-3 rounded-full bg-surface-lighter overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: pct + "%" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {strengths.map((name: string) => (
                  <span
                    key={name}
                    className="text-xs px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: color + "20",
                      color: color,
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
