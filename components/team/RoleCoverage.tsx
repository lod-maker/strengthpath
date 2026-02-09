"use client";

import React from "react";
import { TeamMember } from "@/lib/types";
import { ACCENTURE_ROLES, TRACKS } from "@/lib/accentureRoles";
import { CheckCircle } from "lucide-react";

interface RoleCoverageProps {
  members: TeamMember[];
  trackId?: string;
}

function getSaturationStyle(count: number): string {
  if (count === 0) return "border border-white/5 text-gray-600 opacity-40";
  if (count <= 2) return "bg-green-500/5 border border-green-500/20 text-green-400";
  if (count <= 5) return "bg-green-500/15 border border-green-500/30 text-green-300";
  return "bg-amber-500/15 border border-amber-500/30 text-amber-400";
}

export default function RoleCoverage({ members, trackId: filterTrackId }: RoleCoverageProps) {
  // Build role → member names map
  const roleToMembers: Record<string, string[]> = {};
  members.forEach((m) => {
    if (m.topRoleMatch) {
      if (!roleToMembers[m.topRoleMatch]) roleToMembers[m.topRoleMatch] = [];
      roleToMembers[m.topRoleMatch].push(m.name);
    }
  });

  // Determine which roles to show — filtered by track or all
  const filteredTrack = filterTrackId ? TRACKS[filterTrackId as keyof typeof TRACKS] : null;
  const relevantRoleNames = filteredTrack
    ? new Set(filteredTrack.accessibleRoles)
    : null;

  // Build role → count map
  const roleCounts: Record<string, number> = {};
  ACCENTURE_ROLES.forEach((r) => {
    if (relevantRoleNames && !relevantRoleNames.has(r.name)) return;
    roleCounts[r.name] = roleToMembers[r.name]?.length || 0;
  });

  // Get roles grouped by track — if filtering, show only the filtered track
  const rolesByTrack = filterTrackId && filteredTrack
    ? [{
        trackId: filterTrackId,
        trackTitle: filteredTrack.title,
        roles: filteredTrack.accessibleRoles.map((roleName) => ({
          name: roleName,
          count: roleCounts[roleName] || 0,
        })),
      }]
    : Object.entries(TRACKS).map(([tId, track]) => ({
        trackId: tId,
        trackTitle: track.title,
        roles: track.accessibleRoles.map((roleName) => ({
          name: roleName,
          count: roleCounts[roleName] || 0,
        })),
      }));

  const totalRoles = relevantRoleNames ? relevantRoleNames.size : ACCENTURE_ROLES.length;
  const coveredCount = Object.values(roleCounts).filter((c) => c > 0).length;

  // Summary data
  const sortedByCount = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);
  const topSaturated = sortedByCount.filter(([, c]) => c > 0).slice(0, 3);
  const leastCovered = sortedByCount.filter(([, c]) => c === 0).slice(0, 3);
  const oversaturated = sortedByCount.filter(([, c]) => c >= 6);
  const gaps = sortedByCount.filter(([, c]) => c === 0);

  // Short display name helper for tooltips
  function getShortNames(names: string[]): string {
    return names
      .map((n) => {
        const parts = n.split(" ");
        return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
      })
      .join(", ");
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Role Coverage</h3>
          <p className="text-sm text-gray-400">
            {filteredTrack
              ? `Which of the ${totalRoles} ${filteredTrack.title} roles the team covers`
              : "Which of the 28 Accenture technology roles the team naturally covers"}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-white">{coveredCount}/{totalRoles}</p>
          <p className="text-xs text-gray-500">roles covered</p>
        </div>
      </div>

      {/* Saturation legend */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded border border-white/5 bg-white/3" />
          0 matches
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-green-500/10 border border-green-500/20" />
          1-2
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
          3-5
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" />
          6+ (oversaturated)
        </span>
      </div>

      {/* Roles by Track */}
      <div className="space-y-4">
        {rolesByTrack.map(({ trackId, trackTitle, roles }) => {
          const trackCovered = roles.filter((r) => r.count > 0).length;

          return (
            <div key={trackId} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-300">{trackTitle}</h4>
                <span className="text-xs text-gray-500">
                  {trackCovered}/{roles.length} covered
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => {
                  const matchedMembers = roleToMembers[role.name];
                  const tooltip =
                    role.count > 0
                      ? `${role.name} (${role.count}): ${getShortNames(matchedMembers || [])}`
                      : "No team member currently matches this role";

                  return (
                    <div
                      key={role.name}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${getSaturationStyle(role.count)}`}
                      title={tooltip}
                    >
                      {role.count > 0 && <CheckCircle className="w-3 h-3" />}
                      {role.name}
                      {role.count > 0 && (
                        <span className="opacity-60">({role.count})</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight summary */}
      <div className="pt-4 border-t border-border space-y-3">
        <h4 className="text-sm font-semibold text-white">Role Insights</h4>

        {oversaturated.length > 0 && (
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-1">
            <p className="text-sm text-amber-400 font-medium">Heads up: Oversaturated roles</p>
            {oversaturated.map(([role, count]) => (
              <p key={role} className="text-sm text-gray-300">
                <span className="text-white font-medium">{role}</span> has {count} matches — your team is heavily concentrated here. Consider diversifying into less covered roles.
              </p>
            ))}
          </div>
        )}

        {gaps.length > 0 && (
          <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 space-y-1">
            <p className="text-sm text-red-400 font-medium">
              Gap: {gaps.length} uncovered role{gaps.length !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-gray-300">
              No one on the team naturally maps to{" "}
              <span className="text-white font-medium">
                {gaps.slice(0, 5).map(([r]) => r).join(", ")}
                {gaps.length > 5 ? ` and ${gaps.length - 5} more` : ""}
              </span>
              . These could be development opportunities.
            </p>
          </div>
        )}

        {oversaturated.length === 0 && gaps.length === 0 && (
          <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-4">
            <p className="text-sm text-green-400 font-medium">Balanced</p>
            <p className="text-sm text-gray-300">
              Your team has good role coverage across the board with no major gaps or oversaturation.
            </p>
          </div>
        )}

        {/* Quick summary: top saturated + least covered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topSaturated.length > 0 && (
            <div className="rounded-xl border border-border bg-surface-lighter p-3 space-y-1.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Most Matched</p>
              {topSaturated.map(([role, count]) => (
                <p key={role} className="text-xs text-gray-300">
                  {role} <span className="text-white font-medium">({count})</span>
                </p>
              ))}
            </div>
          )}
          {leastCovered.length > 0 && (
            <div className="rounded-xl border border-border bg-surface-lighter p-3 space-y-1.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Uncovered</p>
              {leastCovered.map(([role]) => (
                <p key={role} className="text-xs text-gray-400">{role}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
