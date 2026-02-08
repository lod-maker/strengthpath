"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TeamMember } from "@/lib/types";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import DomainDistributionChart from "@/components/team/DomainDistributionChart";
import StrengthHeatmap from "@/components/team/StrengthHeatmap";
import RoleCoverage from "@/components/team/RoleCoverage";
import { ArrowLeft, Users, RefreshCw } from "lucide-react";
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
        {!loading && !error && members.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Team Overview Grid */}
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
