"use client";

import React, { useState, useMemo } from "react";
import { TeamMember } from "@/lib/types";
import { GALLUP_DOMAINS, getDomainColor } from "@/lib/gallupDomains";

interface TrackGroup {
  title: string;
  abbrev: string;
  members: TeamMember[];
}

interface StrengthHeatmapProps {
  members: TeamMember[];
  highlightMemberId?: string | null;
  compareMode?: boolean;
  trackGroups?: TrackGroup[];
}

type SortMode = "domain" | "coverage";

// Group strengths by domain
const DOMAIN_GROUPS = Object.entries(GALLUP_DOMAINS).map(([domain, strengths]) => ({
  domain,
  color: getDomainColor(domain),
  strengths: strengths.map((s) => ({ name: s, domain })),
}));

// All 34 strengths flat list
const ALL_STRENGTHS = DOMAIN_GROUPS.flatMap((g) =>
  g.strengths.map((s) => ({ ...s, color: g.color }))
);

// Build display names: first name only, append last initial if duplicates exist
function getDisplayNames(members: TeamMember[]): Map<string, string> {
  const firstNames: Record<string, string[]> = {};
  members.forEach((m) => {
    const first = m.name.split(" ")[0];
    if (!firstNames[first]) firstNames[first] = [];
    firstNames[first].push(m.id);
  });

  const nameMap = new Map<string, string>();
  members.forEach((m) => {
    const parts = m.name.split(" ");
    const first = parts[0];
    if (firstNames[first].length > 1 && parts.length > 1) {
      nameMap.set(m.id, `${first} ${parts[1][0]}.`);
    } else {
      nameMap.set(m.id, first);
    }
  });
  return nameMap;
}

// Get density opacity for a count
function getDensityOpacity(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 0.2;
  if (count <= 5) return 0.5;
  if (count <= 9) return 0.8;
  return 1;
}

function getDensityLabel(count: number): string | null {
  if (count === 0) return "\u26A0\uFE0F Gap";
  if (count >= 10) return "\uD83D\uDCAA Deep";
  return null;
}

export default function StrengthHeatmap({ members, highlightMemberId, compareMode, trackGroups }: StrengthHeatmapProps) {
  const [sortMode, setSortMode] = useState<SortMode>("domain");

  const displayNames = useMemo(() => getDisplayNames(members), [members]);

  // Compute coverage count per strength
  const strengthCoverage = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_STRENGTHS.forEach((s) => {
      let count = 0;
      members.forEach((m) => {
        if (m.topFive.includes(s.name) || m.strengthsSixToTen.includes(s.name)) {
          count++;
        }
      });
      counts[s.name] = count;
    });
    return counts;
  }, [members]);

  // Get rank for a member's strength
  function getRankLabel(m: TeamMember, strength: string): string {
    const top5Idx = m.topFive.indexOf(strength);
    if (top5Idx >= 0) return `#${top5Idx + 1}`;
    const top10Idx = m.strengthsSixToTen.indexOf(strength);
    if (top10Idx >= 0) return `#${top10Idx + 6}`;
    return "";
  }

  // Determine ordered strengths based on sort mode
  const orderedStrengths = useMemo(() => {
    if (sortMode === "coverage") {
      return [...ALL_STRENGTHS].sort(
        (a, b) => (strengthCoverage[b.name] || 0) - (strengthCoverage[a.name] || 0)
      );
    }
    return ALL_STRENGTHS; // domain order
  }, [sortMode, strengthCoverage]);

  // Group for domain headers (only used in domain sort mode)
  const domainGrouped = useMemo(() => {
    if (sortMode !== "domain") return null;
    return DOMAIN_GROUPS;
  }, [sortMode]);

  // Compute per-track coverage for compare mode
  const trackCoverages = useMemo(() => {
    if (!compareMode || !trackGroups) return null;
    return trackGroups.map((tg) => {
      const counts: Record<string, number> = {};
      ALL_STRENGTHS.forEach((s) => {
        let count = 0;
        tg.members.forEach((m) => {
          if (m.topFive.includes(s.name) || m.strengthsSixToTen.includes(s.name)) {
            count++;
          }
        });
        counts[s.name] = count;
      });
      return { ...tg, counts };
    });
  }, [compareMode, trackGroups]);

  if (members.length === 0) return null;

  // ─── Compare Mode rendering ───────────────────────────────────────────
  if (compareMode && trackCoverages && trackCoverages.length > 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 overflow-x-auto">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-white mb-1">Strength Heatmap — Track Comparison</h3>
          <p className="text-sm text-gray-400">
            Density of each strength across the three tracks
          </p>
        </div>

        {/* Density legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Density:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded border border-dashed border-white/10" />
            <span className="text-xs text-gray-500">0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-accent/20" />
            <span className="text-xs text-gray-500">1-2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-accent/50" />
            <span className="text-xs text-gray-500">3-5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-accent/80" />
            <span className="text-xs text-gray-500">6-9</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-accent shadow-[0_0_6px_rgba(var(--accent-rgb),0.4)]" />
            <span className="text-xs text-gray-500">10+</span>
          </div>
        </div>

        <div className="min-w-max">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 px-2 text-gray-500 font-medium sticky left-0 bg-surface z-10">
                  Strength
                </th>
                {trackCoverages.map((tg) => (
                  <th key={tg.abbrev} className="py-2 px-3 text-center text-gray-400 font-semibold">
                    {tg.abbrev}
                    <div className="text-[9px] text-gray-500 font-normal">{tg.members.length}m</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOMAIN_GROUPS.map(({ domain, color, strengths }) => (
                <React.Fragment key={domain}>
                  {/* Domain header */}
                  <tr>
                    <td colSpan={trackCoverages.length + 1} className="sticky left-0 z-10">
                      <div className="flex items-center gap-2 py-2 px-2 mt-2">
                        <div
                          className="w-full h-0.5 rounded-full absolute left-0"
                          style={{ backgroundColor: color, opacity: 0.3 }}
                        />
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0 relative"
                          style={{ backgroundColor: color }}
                        />
                        <span
                          className="text-xs font-semibold uppercase tracking-wider relative"
                          style={{ color }}
                        >
                          {domain}
                        </span>
                        <span className="text-[10px] text-gray-500 relative">
                          ({strengths.length})
                        </span>
                      </div>
                    </td>
                  </tr>
                  {strengths.map(({ name: strengthName }) => {
                    const totalCount = trackCoverages.reduce((sum, tg) => sum + (tg.counts[strengthName] || 0), 0);
                    const isZero = totalCount === 0;

                    return (
                      <tr
                        key={strengthName}
                        className={`border-t border-border/50 ${isZero ? "bg-red-500/[0.04]" : "hover:bg-white/[0.02]"}`}
                      >
                        <td className="py-1 px-2 sticky left-0 bg-surface z-10">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className={isZero ? "text-gray-500" : "text-gray-300"}>
                              {strengthName}
                            </span>
                            {isZero && <span className="text-[9px] ml-1">{"\u26A0\uFE0F"} Gap</span>}
                          </div>
                        </td>
                        {trackCoverages.map((tg) => {
                          const count = tg.counts[strengthName] || 0;
                          const opacity = getDensityOpacity(count);
                          const isDeep = count >= 10;

                          return (
                            <td key={tg.abbrev} className="py-0.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <div
                                  className={`w-5 h-5 rounded-sm ${count === 0 ? "border border-dashed border-white/10" : ""}`}
                                  style={
                                    count === 0
                                      ? undefined
                                      : {
                                          backgroundColor: color,
                                          opacity,
                                          boxShadow: isDeep ? `0 0 6px ${color}40` : undefined,
                                        }
                                  }
                                />
                                <span className={`text-[10px] ${count === 0 ? "text-gray-600" : "text-gray-400"}`}>
                                  {count}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ─── Normal Mode rendering ────────────────────────────────────────────
  const colCount = members.length + 3; // strength col + member cols + density col + coverage col

  const renderStrengthRow = (
    strength: { name: string; domain: string; color: string },
    coverageCount: number
  ) => {
    const isZero = coverageCount === 0;
    const isDeep = coverageCount >= 10;
    const densityLabel = getDensityLabel(coverageCount);
    const densityOpacity = getDensityOpacity(coverageCount);

    return (
      <tr
        key={strength.name}
        className={`border-t border-border/50 ${
          isZero
            ? "bg-red-500/[0.04]"
            : isDeep
            ? "bg-white/[0.02]"
            : "hover:bg-white/[0.02]"
        }`}
      >
        <td className="py-1 px-2 sticky left-0 bg-surface z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: strength.color }}
            />
            <span className={isZero ? "text-gray-500" : "text-gray-300"}>
              {strength.name}
            </span>
            {densityLabel && (
              <span className="text-[9px] ml-1">{densityLabel}</span>
            )}
          </div>
        </td>
        {members.map((m) => {
          const inTop5 = m.topFive.includes(strength.name);
          const inTop10 = m.strengthsSixToTen.includes(strength.name);
          const hasStrength = inTop5 || inTop10;
          const rankLabel = getRankLabel(m, strength.name);
          const tooltip = hasStrength
            ? `${m.name} — ${strength.name} is ${rankLabel}`
            : "";

          const isHighlighted = highlightMemberId === m.id;

          return (
            <td key={m.id} className={`py-0.5 px-0.5 text-center ${isHighlighted ? "bg-accent/10" : ""}`}>
              {inTop5 ? (
                <div
                  className="w-4 h-4 mx-auto rounded-sm cursor-default"
                  style={{ backgroundColor: strength.color }}
                  title={tooltip}
                />
              ) : inTop10 ? (
                <div
                  className="w-4 h-4 mx-auto rounded-sm cursor-default"
                  style={{ backgroundColor: strength.color, opacity: 0.3 }}
                  title={tooltip}
                />
              ) : (
                <div className="w-4 h-4 mx-auto rounded-sm bg-white/[0.03] border border-dashed border-white/[0.06]" />
              )}
            </td>
          );
        })}
        {/* Density column */}
        <td className="py-0.5 px-1 text-center sticky right-12 bg-surface z-10">
          <div
            className={`w-4 h-4 mx-auto rounded-sm ${isZero ? "border border-dashed border-white/10" : ""}`}
            style={
              isZero
                ? undefined
                : {
                    backgroundColor: strength.color,
                    opacity: densityOpacity,
                    boxShadow: isDeep ? `0 0 6px ${strength.color}40` : undefined,
                  }
            }
          />
        </td>
        {/* Coverage count */}
        <td className="py-1 px-2 text-center sticky right-0 bg-surface z-10">
          <span
            className={`font-medium ${
              isZero
                ? "text-red-400/60"
                : coverageCount === 1
                ? "text-gray-400"
                : isDeep
                ? "text-white font-bold"
                : "text-white"
            }`}
          >
            {coverageCount}/{members.length}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 overflow-x-auto">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-white mb-1">Strength Heatmap</h3>
        <p className="text-sm text-gray-400">
          Which strengths the team has covered and how deep the coverage is
        </p>
      </div>

      {/* Legend — density scale */}
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Density:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border border-dashed border-white/10" />
          <span className="text-xs text-gray-500">0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-accent/20" />
          <span className="text-xs text-gray-500">1-2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-accent/50" />
          <span className="text-xs text-gray-500">3-5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-accent/80" />
          <span className="text-xs text-gray-500">6-9</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-accent shadow-[0_0_6px_rgba(var(--accent-rgb),0.4)]" />
          <span className="text-xs text-gray-500">10+</span>
        </div>
      </div>

      {/* Per-person legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Per person:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-accent" />
          <span className="text-xs text-gray-500">Top 5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-accent/30" />
          <span className="text-xs text-gray-500">6-10</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-white/[0.03] border border-dashed border-white/[0.06]" />
          <span className="text-xs text-gray-500">Not in top 10</span>
        </div>
      </div>

      {/* Sort toggle */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">Sort by:</span>
        <button
          onClick={() => setSortMode("domain")}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            sortMode === "domain"
              ? "bg-accent/20 border-accent/30 text-accent"
              : "border-border text-gray-500 hover:text-gray-300"
          }`}
        >
          By Domain
        </button>
        <button
          onClick={() => setSortMode("coverage")}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            sortMode === "coverage"
              ? "bg-accent/20 border-accent/30 text-accent"
              : "border-border text-gray-500 hover:text-gray-300"
          }`}
        >
          By Coverage
        </button>
      </div>

      <div className="min-w-max">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 text-gray-500 font-medium sticky left-0 bg-surface z-10">
                Strength
              </th>
              {members.map((m) => (
                <th
                  key={m.id}
                  className="px-0.5 text-center font-medium"
                  style={{ height: "80px", verticalAlign: "bottom" }}
                >
                  <div
                    className="text-gray-400 whitespace-nowrap origin-bottom-left"
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      fontSize: "10px",
                      lineHeight: "16px",
                      maxHeight: "70px",
                      overflow: "hidden",
                    }}
                    title={m.name}
                  >
                    {displayNames.get(m.id)}
                  </div>
                </th>
              ))}
              <th className="py-2 px-1 text-center text-gray-500 font-medium sticky right-12 bg-surface z-10 text-[10px]">
                Density
              </th>
              <th className="py-2 px-2 text-center text-gray-500 font-medium sticky right-0 bg-surface z-10 text-[10px]">
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            {sortMode === "domain" && domainGrouped
              ? domainGrouped.map(({ domain, color, strengths }) => {
                  let domainStrengthsCovered = 0;
                  const domainMembersCovering = new Set<string>();

                  const rows = strengths.map(({ name: strengthName }) => {
                    const count = strengthCoverage[strengthName] || 0;
                    if (count > 0) {
                      domainStrengthsCovered++;
                      members.forEach((m) => {
                        if (m.topFive.includes(strengthName) || m.strengthsSixToTen.includes(strengthName)) {
                          domainMembersCovering.add(m.id);
                        }
                      });
                    }
                    return renderStrengthRow(
                      { name: strengthName, domain, color },
                      count
                    );
                  });

                  return (
                    <React.Fragment key={domain}>
                      {/* Domain group header */}
                      <tr>
                        <td colSpan={colCount} className="sticky left-0 z-10">
                          <div className="flex items-center gap-2 py-2 px-2 mt-2">
                            <div
                              className="w-full h-0.5 rounded-full absolute left-0"
                              style={{ backgroundColor: color, opacity: 0.3 }}
                            />
                            <div
                              className="w-3 h-3 rounded-sm flex-shrink-0 relative"
                              style={{ backgroundColor: color }}
                            />
                            <span
                              className="text-xs font-semibold uppercase tracking-wider relative"
                              style={{ color }}
                            >
                              {domain}
                            </span>
                            <span className="text-[10px] text-gray-500 relative">
                              ({strengths.length})
                            </span>
                          </div>
                        </td>
                      </tr>
                      {rows}
                      {/* Domain summary */}
                      <tr className="border-t border-border/30">
                        <td colSpan={colCount} className="py-1.5 px-2 sticky left-0 z-10">
                          <span className="text-[10px] text-gray-500 italic">
                            {domain}: {domainStrengthsCovered}/{strengths.length} strengths covered by{" "}
                            {domainMembersCovering.size} member
                            {domainMembersCovering.size !== 1 ? "s" : ""}
                          </span>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              : orderedStrengths.map((s) =>
                  renderStrengthRow(s, strengthCoverage[s.name] || 0)
                )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
