"use client";

import React from "react";
import { TeamMember } from "@/lib/types";
import { ACCENTURE_ROLES, TRACKS } from "@/lib/accentureRoles";
import { CheckCircle, AlertCircle } from "lucide-react";

interface RoleCoverageProps {
  members: TeamMember[];
}

export default function RoleCoverage({ members }: RoleCoverageProps) {
  // Get all unique roles that team members match to
  const coveredRoles = new Set(
    members.map((m) => m.topRoleMatch).filter(Boolean)
  );

  // Get all 27 roles grouped by track
  const rolesByTrack = Object.entries(TRACKS).map(([trackId, track]) => ({
    trackId,
    trackTitle: track.title,
    roles: track.accessibleRoles.map((roleName) => ({
      name: roleName,
      isCovered: coveredRoles.has(roleName),
    })),
  }));

  const totalRoles = ACCENTURE_ROLES.length;
  const coveredCount = coveredRoles.size;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Role Coverage</h3>
          <p className="text-sm text-gray-400">
            Which of the 27 Accenture technology roles the team naturally covers
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-white">{coveredCount}/{totalRoles}</p>
          <p className="text-xs text-gray-500">roles covered</p>
        </div>
      </div>

      {/* Roles by Track */}
      <div className="space-y-4">
        {rolesByTrack.map(({ trackId, trackTitle, roles }) => {
          const trackCovered = roles.filter((r) => r.isCovered).length;
          
          return (
            <div key={trackId} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-300">{trackTitle}</h4>
                <span className="text-xs text-gray-500">
                  {trackCovered}/{roles.length} covered
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <div
                    key={role.name}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
                      role.isCovered
                        ? "bg-green-500/10 border border-green-500/20 text-green-400"
                        : "bg-white/3 border border-white/10 text-gray-500"
                    }`}
                  >
                    {role.isCovered ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3 opacity-50" />
                    )}
                    {role.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Uncovered roles summary */}
      {coveredCount < totalRoles && (
        <div className="pt-4 border-t border-border">
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
            <p className="text-sm text-amber-400 font-medium mb-2">
              Uncovered Roles ({totalRoles - coveredCount})
            </p>
            <p className="text-xs text-gray-400">
              These roles don&apos;t have a natural match on the current team. Consider these gaps when forming project teams or making new hires.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
