"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TeamMember } from "@/lib/types";
import { GALLUP_DOMAINS, getDomainColor } from "@/lib/gallupDomains";
import { ACCENTURE_ROLES } from "@/lib/accentureRoles";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import DomainDistributionChart from "@/components/team/DomainDistributionChart";
import StrengthHeatmap from "@/components/team/StrengthHeatmap";
import RoleCoverage from "@/components/team/RoleCoverage";
import { ArrowLeft, Users, RefreshCw, Layers, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/team");
      if (!response.ok) throw new Error("Failed to load team data");
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError("Failed to load team members. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRemoveMember = async (id: string) => {
    try {
      const response = await fetch(`/api/team/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove member");
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to remove member. Please try again.");
    }
  };

  // Compute stats
  const stats = useMemo(() => {
    if (members.length === 0) return null;

    const domains = Object.keys(GALLUP_DOMAINS);
    const coveredDomains = domains.filter(
      (d) => members.some((m) => m.dominantDomain === d)
    );

    const allStrengths = new Set<string>();
    members.forEach((m) => {
      m.topFive.forEach((s) => allStrengths.add(s));
      m.strengthsSixToTen.forEach((s) => allStrengths.add(s));
    });

    const coveredRoles = new Set(
      members.map((m) => m.topRoleMatch).filter(Boolean)
    );

    return {
      memberCount: members.length,
      domainsCovered: coveredDomains.length,
      domainsTotal: domains.length,
      coveredDomainNames: coveredDomains,
      uniqueStrengths: allStrengths.size,
      rolesCovered: coveredRoles.size,
      rolesTotal: ACCENTURE_ROLES.length,
    };
  }, [members]);

  // Compute team insights (shared & unique strengths)
  const insights = useMemo(() => {
    if (members.length < 2) return null;

    const strengthCount: Record<string, number> = {};
    members.forEach((m) => {
      [...m.topFive, ...m.strengthsSixToTen].forEach((s) => {
        strengthCount[s] = (strengthCount[s] || 0) + 1;
      });
    });

    const shared = Object.entries(strengthCount)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const unique = Object.entries(strengthCount)
      .filter(([, count]) => count === 1)
      .map(([name]) => name)
      .slice(0, 8);

    return { shared, unique };
  }, [members]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <div className="flex items-center gap-2">
              <img
                src="/accenture-logo.png"
                alt="Accenture"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-white">
                  StrengthPath
                </span>
                <span className="text-[10px] text-gray-400 tracking-wide">
                  Team Map
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={fetchMembers}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link href="/analyze">
              <Button size="sm">Analyze Your Strengths</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12 space-y-8">
        {/* Title section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            Team Map
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Collective Strength Profile
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            See how the team&apos;s strengths complement each other, identify gaps, and
            understand role coverage.
          </p>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
              <p className="text-gray-400">Loading team data...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <p className="text-red-400">{error}</p>
              <Button onClick={fetchMembers}>Try Again</Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && members.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-surface-lighter flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No teammates have joined yet
            </h2>
            <p className="text-gray-400 max-w-md mb-6">
              Complete your analysis and click &quot;Join Team Map&quot; to be the first.
              Your name, track, top strengths, and role matches will be visible to
              others who join.
            </p>
            <Link href="/analyze">
              <Button>Analyze Your Strengths</Button>
            </Link>
          </motion.div>
        )}

        {/* Team data */}
        {!loading && !error && members.length > 0 && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Summary Stats Row */}
            <section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Members */}
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Members</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.memberCount}</p>
                </div>
                {/* Domain Balance */}
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-accent" />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Domains</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {stats.domainsCovered}/{stats.domainsTotal}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {Object.keys(GALLUP_DOMAINS).map((d) => (
                      <div
                        key={d}
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getDomainColor(d),
                          opacity: stats.coveredDomainNames.includes(d) ? 1 : 0.2,
                        }}
                        title={d}
                      />
                    ))}
                  </div>
                </div>
                {/* Strength Coverage */}
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Strengths</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.uniqueStrengths}/34</p>
                  <p className="text-[10px] text-gray-500 mt-1">unique in top 10</p>
                </div>
                {/* Role Coverage */}
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Roles</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {stats.rolesCovered}/{stats.rolesTotal}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">roles covered</p>
                </div>
              </div>
            </section>

            {/* Team Members Grid */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Team Members ({members.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TeamMemberCard
                      member={member}
                      onRemove={handleRemoveMember}
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Team Insights */}
            {insights && (
              <section className="rounded-2xl border border-border bg-surface p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Team Insights</h3>

                {insights.shared.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      Shared Strengths
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {insights.shared.map(([name, count]) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent"
                        >
                          {name}
                          <span className="text-[10px] text-accent/60">{count}x</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      These strengths appear in multiple members&apos; top 10 — a strong team foundation.
                    </p>
                  </div>
                )}

                {insights.unique.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      Unique Differentiators
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {insights.unique.map((name) => (
                        <span
                          key={name}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Strengths only one member has — these people bring something no one else on the team does.
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Domain Distribution */}
            <section>
              <DomainDistributionChart members={members} />
            </section>

            {/* Strength Heatmap */}
            <section>
              <StrengthHeatmap members={members} />
            </section>

            {/* Role Coverage */}
            <section>
              <RoleCoverage members={members} />
            </section>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="text-xs text-gray-500">
            Only people who chose &quot;Join Team Map&quot; appear here. You can remove
            yourself anytime by clicking &quot;Remove me&quot; on your card.
          </p>
        </div>
      </footer>
    </div>
  );
}
