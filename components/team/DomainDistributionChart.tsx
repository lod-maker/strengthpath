"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TeamMember } from "@/lib/types";
import { GALLUP_DOMAINS, getDomainColor } from "@/lib/gallupDomains";

interface DomainDistributionChartProps {
  members: TeamMember[];
  compact?: boolean;
}

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  Executing:
    "getting things done — reliable delivery, process discipline, and consistent follow-through",
  Influencing:
    "driving action in others — persuasion, authority, confidence, and stakeholder management",
  "Relationship Building":
    "team cohesion and empathy — trust-building, collaboration, and understanding others",
  "Strategic Thinking":
    "big-picture analysis — pattern recognition, vision, learning, and complex problem-solving",
};

export default function DomainDistributionChart({ members, compact }: DomainDistributionChartProps) {
  // Count dominant domains, total strengths, and member names per domain
  const domainStats = Object.keys(GALLUP_DOMAINS).map((domain) => {
    const dominantMembers = members.filter((m) => m.dominantDomain === domain);
    const dominantCount = dominantMembers.length;

    let totalStrengths = 0;
    members.forEach((m) => {
      const allStrengths = [...m.topFive, ...m.strengthsSixToTen];
      allStrengths.forEach((strength) => {
        if (GALLUP_DOMAINS[domain].includes(strength)) {
          totalStrengths++;
        }
      });
    });

    return {
      domain,
      dominant: dominantCount,
      totalStrengths,
      color: getDomainColor(domain),
      memberNames: dominantMembers.map((m) => m.name),
    };
  });

  const maxStrengths = Math.max(...domainStats.map((d) => d.totalStrengths), 1);
  const totalAllStrengths = domainStats.reduce((sum, d) => sum + d.totalStrengths, 0);

  // Sort by total strengths descending for the bar chart
  const sortedStats = [...domainStats].sort((a, b) => b.totalStrengths - a.totalStrengths);

  const strongDomains = domainStats.filter((d) => d.dominant > 0);
  const gapDomains = domainStats.filter((d) => d.totalStrengths === 0);

  // Check for heavy concentration (≥70% of all top-10 strengths in one domain)
  const concentratedDomain = totalAllStrengths > 0
    ? domainStats.find((d) => d.totalStrengths / totalAllStrengths >= 0.7)
    : null;

  return (
    <div className={`rounded-2xl border border-border bg-surface ${compact ? "p-4 space-y-4" : "p-6 space-y-6"}`}>
      <div>
        <h3 className={`${compact ? "text-sm" : "text-lg"} font-semibold text-white mb-1`}>Domain Distribution</h3>
        {!compact && (
          <p className="text-sm text-gray-400">
            How strengths are distributed across the four CliftonStrengths domains
          </p>
        )}
      </div>

      {/* Domain Balance Cards */}
      <div>
        {!compact && <p className="text-xs text-gray-500 mb-2">Members whose primary domain is each category</p>}
        <div className={`grid ${compact ? "grid-cols-2 gap-2" : "grid-cols-2 md:grid-cols-4 gap-3"}`}>
          {domainStats.map((d) => (
            <div
              key={d.domain}
              className={`rounded-xl border border-border bg-surface-lighter ${compact ? "p-3 space-y-1" : "p-4 space-y-2"}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-xs font-medium text-gray-300 truncate">
                  {compact && d.domain === "Relationship Building" ? "Relationship" :
                   compact && d.domain === "Strategic Thinking" ? "Strategic" :
                   d.domain}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`${compact ? "text-lg" : "text-2xl"} font-bold text-white`}>{d.dominant}</span>
                <span className="text-xs text-gray-500">dominant</span>
              </div>
              {/* Mini progress bar */}
              <div className="w-full h-1.5 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: d.color,
                    width: `${maxStrengths > 0 ? (d.totalStrengths / maxStrengths) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-500">{d.totalStrengths} strengths in top 10</p>
              {!compact && d.memberNames.length > 0 && (
                <p className="text-[10px] text-gray-400 truncate">
                  {d.memberNames.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div>
        {!compact && (
          <p className="text-xs text-gray-500 mb-2">
            Total individual strengths across the team in each domain (top 10 only)
          </p>
        )}
        <div className={compact ? "h-36" : "h-56"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedStats}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis type="number" stroke="#6B7280" fontSize={12} />
              <YAxis
                type="category"
                dataKey="domain"
                stroke="#6B7280"
                fontSize={12}
                width={130}
                tickFormatter={(value) => {
                  if (value === "Relationship Building") return "Relationship";
                  if (value === "Strategic Thinking") return "Strategic";
                  return value;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A2E",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value, name) => [
                  value,
                  name === "dominant" ? "Dominant Domain Count" : "Total Strengths in Top 10",
                ]}
              />
              <Bar dataKey="totalStrengths" radius={[0, 4, 4, 0]} name="Total Strengths">
                {sortedStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Gaps Analysis — hidden in compact mode */}
      {!compact && <div className="pt-4 border-t border-border space-y-3">
        <h4 className="text-sm font-semibold text-white">Team Gaps Analysis</h4>

        {strongDomains.length > 0 && (
          <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-4 space-y-2">
            <p className="text-sm text-green-400 font-medium">Team is strong in:</p>
            {strongDomains.map((d) => (
              <p key={d.domain} className="text-sm text-gray-300">
                <span className="text-white font-medium">{d.domain}</span>
                {" — "}
                {DOMAIN_DESCRIPTIONS[d.domain]
                  ? `Your team naturally gravitates toward ${DOMAIN_DESCRIPTIONS[d.domain]}. You'll excel at roles that require this.`
                  : `${d.dominant} member${d.dominant !== 1 ? "s" : ""} lead with this domain.`}
              </p>
            ))}
          </div>
        )}

        {gapDomains.length > 0 &&
          gapDomains.map((d) => (
            <div key={d.domain} className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-1">
              <p className="text-sm text-amber-400 font-medium">Team gap: {d.domain}</p>
              <p className="text-sm text-gray-300">
                {DOMAIN_DESCRIPTIONS[d.domain]
                  ? `Your team may need to consciously invest in ${DOMAIN_DESCRIPTIONS[d.domain]}.`
                  : `No team members have strengths in this domain.`}{" "}
                Consider seeking teammates with{" "}
                <span className="text-white font-medium">
                  {GALLUP_DOMAINS[d.domain].slice(0, 4).join(", ")}
                </span>{" "}
                to balance this.
              </p>
            </div>
          ))}

        {concentratedDomain && (
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-1">
            <p className="text-sm text-amber-400 font-medium">Watch for: Heavy concentration</p>
            <p className="text-sm text-gray-300">
              Your team is heavily concentrated in{" "}
              <span className="text-white font-medium">{concentratedDomain.domain}</span>{" "}
              ({Math.round((concentratedDomain.totalStrengths / totalAllStrengths) * 100)}% of strengths).
              This means you&apos;ll be very strong at{" "}
              {DOMAIN_DESCRIPTIONS[concentratedDomain.domain] || "this area"}{" "}
              but may have blind spots. Diverse domain coverage leads to more balanced delivery.
            </p>
          </div>
        )}
      </div>}
    </div>
  );
}
