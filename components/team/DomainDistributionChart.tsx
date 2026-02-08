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

interface DomainData {
  domain: string;
  dominant: number;
  totalStrengths: number;
  color: string;
}

export default function DomainDistributionChart({ members }: DomainDistributionChartProps) {
  // Count dominant domains and total strengths per domain
  const domainStats = Object.keys(GALLUP_DOMAINS).map((domain) => {
    const dominantCount = members.filter((m) => m.dominantDomain === domain).length;
    
    // Count all top 10 strengths in this domain
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
    };
  });

  // Sort by total strengths descending
  domainStats.sort((a, b) => b.totalStrengths - a.totalStrengths);

  const strongDomains = domainStats.filter((d) => d.dominant > 0).map((d) => d.domain);
  const weakDomain = domainStats[domainStats.length - 1];

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Domain Distribution</h3>
        <p className="text-sm text-gray-400">
          How strengths are distributed across the four CliftonStrengths domains
        </p>
      </div>

      {/* Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={domainStats}
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
                // Shorten long names
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
              formatter={(value: number | undefined, name: string) => [
                value,
                name === "dominant" ? "Dominant Domain Count" : "Total Strengths in Top 10",
              ]}
            />
            <Bar dataKey="totalStrengths" radius={[0, 4, 4, 0]} name="Total Strengths">
              {domainStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {domainStats.map((d) => (
          <div key={d.domain} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <div className="text-xs">
              <span className="text-gray-400">{d.domain}: </span>
              <span className="text-white font-medium">{d.dominant}</span>
              <span className="text-gray-500"> dom, </span>
              <span className="text-white font-medium">{d.totalStrengths}</span>
              <span className="text-gray-500"> total</span>
            </div>
          </div>
        ))}
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
