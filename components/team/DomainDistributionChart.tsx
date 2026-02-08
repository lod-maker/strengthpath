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
}

export default function DomainDistributionChart({ members }: DomainDistributionChartProps) {
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

  // Sort by total strengths descending for the bar chart
  const sortedStats = [...domainStats].sort((a, b) => b.totalStrengths - a.totalStrengths);

  const strongDomains = domainStats.filter((d) => d.dominant > 0).map((d) => d.domain);
  const weakDomain = sortedStats[sortedStats.length - 1];

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Domain Distribution</h3>
        <p className="text-sm text-gray-400">
          How strengths are distributed across the four CliftonStrengths domains
        </p>
      </div>

      {/* Domain Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {domainStats.map((d) => (
          <div
            key={d.domain}
            className="rounded-xl border border-border bg-surface-lighter p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs font-medium text-gray-300 truncate">{d.domain}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{d.dominant}</span>
              <span className="text-xs text-gray-500">
                {d.dominant === 1 ? "member" : "members"}
              </span>
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
            {d.memberNames.length > 0 && (
              <p className="text-[10px] text-gray-400 truncate">
                {d.memberNames.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="h-56">
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

      {/* Team Gaps Analysis */}
      <div className="pt-4 border-t border-border space-y-3">
        <h4 className="text-sm font-semibold text-white">Team Gaps Analysis</h4>

        {strongDomains.length > 0 && (
          <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-4">
            <p className="text-sm text-green-400 font-medium mb-1">Team is strong in:</p>
            <p className="text-sm text-gray-300">{strongDomains.join(", ")}</p>
          </div>
        )}

        {weakDomain && weakDomain.totalStrengths === 0 && (
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
            <p className="text-sm text-amber-400 font-medium mb-1">Team gap:</p>
            <p className="text-sm text-gray-300">
              {weakDomain.domain} — consider seeking teammates with{" "}
              <span className="text-white font-medium">
                {GALLUP_DOMAINS[weakDomain.domain].slice(0, 4).join(", ")}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
