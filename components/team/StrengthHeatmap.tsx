"use client";

import React from "react";
import { TeamMember } from "@/lib/types";
import { GALLUP_DOMAINS, getDomainColor } from "@/lib/gallupDomains";

interface StrengthHeatmapProps {
  members: TeamMember[];
}

// All 34 Gallup strengths in domain order
const ALL_STRENGTHS = Object.entries(GALLUP_DOMAINS).flatMap(([domain, strengths]) =>
  strengths.map((s) => ({ name: s, domain }))
);

export default function StrengthHeatmap({ members }: StrengthHeatmapProps) {
  if (members.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 overflow-x-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Strength Heatmap</h3>
        <p className="text-sm text-gray-400">
          Which strengths the team has covered in their top 5 (dark) and top 10 (light)
        </p>
      </div>

      <div className="min-w-max">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 text-gray-500 font-medium sticky left-0 bg-surface z-10">
                Strength
              </th>
              {members.map((m) => (
                <th
                  key={m.id}
                  className="py-2 px-1 text-center text-gray-400 font-medium max-w-[60px] truncate"
                  title={m.name}
                >
                  {m.name.split(" ")[0]}
                </th>
              ))}
              <th className="py-2 px-2 text-center text-gray-500 font-medium">Coverage</th>
            </tr>
          </thead>
          <tbody>
            {ALL_STRENGTHS.map(({ name: strength, domain }) => {
              const domainColor = getDomainColor(domain);
              let coverageCount = 0;

              return (
                <tr key={strength} className="border-t border-border/50 hover:bg-white/2">
                  <td className="py-1.5 px-2 sticky left-0 bg-surface z-10">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: domainColor }}
                      />
                      <span className="text-gray-300">{strength}</span>
                    </div>
                  </td>
                  {members.map((m) => {
                    const inTop5 = m.topFive.includes(strength);
                    const inTop10 = m.strengthsSixToTen.includes(strength);
                    const hasStrength = inTop5 || inTop10;
                    
                    if (hasStrength) coverageCount++;

                    return (
                      <td key={m.id} className="py-1.5 px-1 text-center">
                        {inTop5 ? (
                          <div
                            className="w-5 h-5 mx-auto rounded-md"
                            style={{ backgroundColor: domainColor }}
                            title={`${m.name} - Top 5`}
                          />
                        ) : inTop10 ? (
                          <div
                            className="w-5 h-5 mx-auto rounded-md"
                            style={{ backgroundColor: domainColor, opacity: 0.3 }}
                            title={`${m.name} - Top 10`}
                          />
                        ) : (
                          <div className="w-5 h-5 mx-auto rounded-md bg-white/3" />
                        )}
                      </td>
                    );
                  })}
                  <td className="py-1.5 px-2 text-center">
                    <span
                      className={`font-medium ${
                        coverageCount === 0
                          ? "text-gray-500"
                          : coverageCount === 1
                          ? "text-gray-400"
                          : "text-white"
                      }`}
                    >
                      {coverageCount}/{members.length}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent" />
          <span className="text-xs text-gray-400">Top 5</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent/30" />
          <span className="text-xs text-gray-400">Top 10 (6-10)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/5" />
          <span className="text-xs text-gray-400">Not in top 10</span>
        </div>
      </div>
    </div>
  );
}
