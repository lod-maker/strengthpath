"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { OutsideTrackRole } from "@/lib/types";
import { ACCENTURE_ROLES, getRoleDomainColor } from "@/lib/accentureRoles";
import { Compass } from "lucide-react";

interface OutsideTrackRolesProps {
  roles: OutsideTrackRole[];
}

function getFitBadgeVariant(tier: string): "strong" | "good" | "developing" {
  if (tier.includes("Exceptional") || tier.includes("Strong")) return "strong";
  if (tier.includes("Good") || tier.includes("Moderate")) return "good";
  return "developing";
}

export default function OutsideTrackRoles({
  roles,
}: OutsideTrackRolesProps) {
  if (!roles || roles.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Compass className="w-5 h-5 text-accent" />
        Future Growth Paths
      </h3>
      <p className="text-sm text-gray-400">
        Strong-fit roles outside your current track that could be future career
        moves.
      </p>

      <div className="space-y-3">
        {roles.map((role, index) => {
          const roleData = ACCENTURE_ROLES.find((r) => r.name === role.role);
          const domainColor = roleData
            ? getRoleDomainColor(roleData.domain)
            : "#9CA3AF";

          return (
            <motion.div
              key={role.role}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="rounded-xl border border-border bg-surface p-5 hover:border-border-light transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-base font-semibold text-white">
                    {role.role}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    {roleData && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: domainColor + "20",
                          color: domainColor,
                        }}
                      >
                        {roleData.domain}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      via {role.naturalTrack}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">
                    {role.fitScore}
                  </span>
                  <Badge variant={getFitBadgeVariant(role.fitTier)}>
                    {role.fitTier}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                {role.explanation}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
