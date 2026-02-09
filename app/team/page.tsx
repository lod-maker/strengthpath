"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TeamMember } from "@/lib/types";
import { GALLUP_DOMAINS, getDomainColor } from "@/lib/gallupDomains";
import { ACCENTURE_ROLES, TRACKS } from "@/lib/accentureRoles";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import DomainDistributionChart from "@/components/team/DomainDistributionChart";
import StrengthHeatmap from "@/components/team/StrengthHeatmap";
import RoleCoverage from "@/components/team/RoleCoverage";
import {
  ArrowLeft, Users, RefreshCw, Layers, Target, Sparkles,
  List, LayoutGrid, Search, ArrowUpDown, MapPin, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SortField = "name" | "track" | "dominantDomain" | "topRoleMatch";
type SortDir = "asc" | "desc";
type ViewTab = "all" | "mytrack" | "compare";

function computeStats(members: TeamMember[]) {
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
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [currentUser, setCurrentUser] = useState<{ name: string; track: string } | null>(null);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>("all");
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({});
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read user identity from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("strengthpath_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

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

  // Find the current user in the members list
  const myMember = useMemo(
    () => (currentUser ? members.find((m) => m.name === currentUser.name) : null),
    [members, currentUser]
  );

  const isCurrentUserMember = (member: TeamMember) =>
    currentUser !== null && member.name === currentUser.name;

  // Handle remove with ownership verification
  const handleRemoveMember = async (id: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/team/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterName: currentUser.name }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove member");
      }
      setMembers((prev) => prev.filter((m) => m.id !== id));
      // Clear localStorage since user removed themselves
      try { localStorage.removeItem("strengthpath_user"); } catch {}
      setCurrentUser(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to remove member. Please try again.");
    }
  };

  // Find Me handler
  const handleFindMe = () => {
    if (!myMember) return;
    setHighlightedMemberId(myMember.id);
    document.getElementById(`member-${myMember.id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => {
      setHighlightedMemberId(null);
    }, 3000);
  };

  // Active members based on viewTab
  const activeMembers = useMemo(() => {
    if (viewTab === "mytrack" && currentUser) {
      return members.filter((m) => m.track === currentUser.track);
    }
    return members;
  }, [members, viewTab, currentUser]);

  // Stats for active members
  const stats = useMemo(() => computeStats(activeMembers), [activeMembers]);

  // Insights
  const insights = useMemo(() => {
    if (activeMembers.length < 2) return null;
    const strengthCount: Record<string, number> = {};
    activeMembers.forEach((m) => {
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
  }, [activeMembers]);

  // Filtered and sorted members for list/card views
  const filteredMembers = useMemo(() => {
    let result = activeMembers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }
    if (trackFilter !== "all") {
      result = result.filter((m) => m.track === trackFilter);
    }
    result = [...result].sort((a, b) => {
      const aVal = (a[sortField] || "").toLowerCase();
      const bVal = (b[sortField] || "").toLowerCase();
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [activeMembers, searchQuery, trackFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const uniqueTracks = useMemo(
    () => [...new Set(members.map((m) => m.track))].sort(),
    [members]
  );

  // Compare Tracks data
  const membersByTrack = useMemo(() => {
    const grouped: Record<string, TeamMember[]> = {};
    Object.values(TRACKS).forEach((t) => { grouped[t.title] = []; });
    members.forEach((m) => {
      if (grouped[m.track]) grouped[m.track].push(m);
    });
    return grouped;
  }, [members]);

  const trackEntries = useMemo(
    () => Object.entries(TRACKS).map(([id, t]) => ({
      id,
      title: t.title,
      accessibleRoles: t.accessibleRoles,
      members: membersByTrack[t.title] || [],
    })),
    [membersByTrack]
  );

  const toggleTrackExpand = (title: string) => {
    setExpandedTracks((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Helper: get track badge class
  const getTrackBadgeClass = (track: string) => {
    if (track === "Tech Transformation") return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    if (track === "Tech Delivery") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (track === "Modern Engineering") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  // Render stats row for a set of members
  const renderStatsRow = (m: TeamMember[], rolesTotal?: number) => {
    const s = computeStats(m);
    if (!s) return null;
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Members</span>
          </div>
          <p className="text-3xl font-bold text-white">{s.memberCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-accent" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Domains</span>
          </div>
          <p className="text-3xl font-bold text-white">{s.domainsCovered}/{s.domainsTotal}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Strengths</span>
          </div>
          <p className="text-3xl font-bold text-white">{s.uniqueStrengths}/34</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Roles</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {s.rolesCovered}/{rolesTotal ?? s.rolesTotal}
          </p>
        </div>
      </div>
    );
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
                <span className="text-sm font-semibold text-white">StrengthPath</span>
                <span className="text-[10px] text-gray-400 tracking-wide">
                  Team Map <span className="text-accent/60">(beta)</span>
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Find Me button */}
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFindMe}
                disabled={!myMember}
                title={
                  myMember
                    ? "Scroll to your card"
                    : "Join the Team Map from your results page to find yourself here"
                }
              >
                <MapPin className="w-4 h-4 mr-2" />
                Find Me
              </Button>
            )}
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
            Team Map <span className="text-accent/60 text-xs">(beta)</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Collective Strength Profile
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            See how the team&apos;s strengths complement each other, identify gaps, and
            understand role coverage.
          </p>
        </motion.div>

        {/* Track view tabs */}
        {!loading && !error && members.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            {(["all", "mytrack", "compare"] as ViewTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setViewTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                  viewTab === tab
                    ? "bg-accent/20 border-accent/30 text-accent"
                    : "border-border text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab === "all" ? "All Tracks" : tab === "mytrack" ? "My Track" : "Compare Tracks"}
              </button>
            ))}
          </div>
        )}

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
              No teammates have joined the Team Map yet. Complete your analysis and
              click &quot;Join Team Map&quot; to be the first!
            </p>
            <Link href="/analyze">
              <Button>Analyze Your Strengths</Button>
            </Link>
          </motion.div>
        )}

        {/* My Track — no user state */}
        {!loading && !error && members.length > 0 && viewTab === "mytrack" && !currentUser && (
          <div className="rounded-xl bg-accent/5 border border-accent/20 p-6 text-center">
            <p className="text-accent font-medium mb-2">Complete your analysis first</p>
            <p className="text-sm text-gray-400 mb-4">
              To see your track&apos;s data, complete your strength analysis and join the Team Map.
            </p>
            <Link href="/analyze">
              <Button size="sm">Analyze Your Strengths</Button>
            </Link>
          </div>
        )}

        {/* ═══════════════ ALL TRACKS / MY TRACK view ═══════════════ */}
        {!loading && !error && members.length > 0 && (viewTab === "all" || (viewTab === "mytrack" && currentUser)) && (
          <motion.div
            key={viewTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* My Track label */}
            {viewTab === "mytrack" && currentUser && (
              <div className="text-center text-sm text-accent">
                Showing {activeMembers.length} member{activeMembers.length !== 1 ? "s" : ""} in {currentUser.track}
              </div>
            )}

            {/* Summary Stats Row */}
            {stats && <section>{renderStatsRow(activeMembers)}</section>}

            {/* Team Members */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Team Members ({activeMembers.length})
              </h2>

              {/* Controls row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50"
                  />
                </div>
                {viewTab === "all" && (
                  <select
                    value={trackFilter}
                    onChange={(e) => setTrackFilter(e.target.value)}
                    className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50 appearance-none cursor-pointer"
                  >
                    <option value="all">All Tracks</option>
                    {uniqueTracks.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-colors ${viewMode === "list" ? "bg-accent/20 text-accent" : "text-gray-500 hover:text-gray-300"}`}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-2 transition-colors ${viewMode === "card" ? "bg-accent/20 text-accent" : "text-gray-500 hover:text-gray-300"}`}
                    title="Card view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List view */}
              {viewMode === "list" && (
                <div className="rounded-2xl border border-border bg-surface overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          {([
                            ["name", "Name"],
                            ["track", "Track"],
                            ["dominantDomain", "Domain"],
                            ["topRoleMatch", "Top Role Match"],
                          ] as [SortField, string][]).map(([field, label]) => (
                            <th
                              key={field}
                              onClick={() => handleSort(field)}
                              className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium cursor-pointer hover:text-gray-300 transition-colors select-none"
                            >
                              <span className="inline-flex items-center gap-1">
                                {label}
                                {sortField === field && (
                                  <ArrowUpDown className="w-3 h-3 text-accent" />
                                )}
                              </span>
                            </th>
                          ))}
                          <th className="px-4 py-3 w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.map((member) => {
                          const isSelf = isCurrentUserMember(member);
                          const isHighlighted = highlightedMemberId === member.id;
                          return (
                            <tr
                              key={member.id}
                              id={`member-${member.id}`}
                              className={`group border-b border-border/50 last:border-0 transition-all ${
                                isHighlighted
                                  ? "ring-2 ring-accent animate-pulse bg-accent/5"
                                  : "hover:bg-white/[0.02]"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div>
                                    <p className="font-medium text-white">
                                      {member.name}
                                      {isSelf && <span className="ml-1.5 text-xs text-yellow-400">&#11088; You</span>}
                                    </p>
                                    <p className="text-xs text-gray-500 italic">{member.persona}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getTrackBadgeClass(member.track)}`}>
                                  {member.track}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: getDomainColor(member.dominantDomain) }}
                                  />
                                  <span className="text-gray-300 text-xs">{member.dominantDomain}</span>
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-300 text-xs">
                                {member.topRoleMatch || "\u2014"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {isSelf && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Remove ${member.name} from the Team Map?`)) {
                                        handleRemoveMember(member.id);
                                      }
                                    }}
                                    className="text-[10px] text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    Remove
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {filteredMembers.length === 0 && (
                    <div className="py-8 text-center text-sm text-gray-500">
                      No members match your search.
                    </div>
                  )}
                </div>
              )}

              {/* Card view */}
              {viewMode === "card" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMembers.map((member, i) => {
                    const isHighlighted = highlightedMemberId === member.id;
                    return (
                      <motion.div
                        key={member.id}
                        id={`member-${member.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={isHighlighted ? "ring-2 ring-accent animate-pulse rounded-2xl" : ""}
                      >
                        <TeamMemberCard
                          member={member}
                          onRemove={handleRemoveMember}
                          isCurrentUser={isCurrentUserMember(member)}
                        />
                      </motion.div>
                    );
                  })}
                  {filteredMembers.length === 0 && (
                    <div className="col-span-full py-8 text-center text-sm text-gray-500">
                      No members match your search.
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Team Insights */}
            {insights && (
              <section className="rounded-2xl border border-border bg-surface p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Team Insights</h3>
                {insights.shared.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Shared Strengths</p>
                    <div className="flex flex-wrap gap-2">
                      {insights.shared.map(([name, count]) => (
                        <span key={name} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
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
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Unique Differentiators</p>
                    <div className="flex flex-wrap gap-2">
                      {insights.unique.map((name) => (
                        <span key={name} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
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

            {/* Small team banner */}
            {activeMembers.length >= 1 && activeMembers.length <= 4 && (
              <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 text-sm text-accent">
                The team insights get more powerful as more people join. Share the link with your teammates!
              </div>
            )}

            {/* Domain Distribution */}
            <section>
              <DomainDistributionChart members={activeMembers} />
            </section>

            {/* Strength Heatmap */}
            <section>
              <StrengthHeatmap members={activeMembers} highlightMemberId={highlightedMemberId} />
            </section>

            {/* Role Coverage */}
            <section>
              <RoleCoverage members={activeMembers} />
            </section>
          </motion.div>
        )}

        {/* ═══════════════ COMPARE TRACKS view ═══════════════ */}
        {!loading && !error && members.length > 0 && viewTab === "compare" && (
          <motion.div
            key="compare"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Compare Stats */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Stats by Track</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trackEntries.map((te) => (
                  <div key={te.id} className="space-y-3">
                    <h3 className={`text-sm font-semibold px-3 py-1.5 rounded-lg border inline-block ${getTrackBadgeClass(te.title)}`}>
                      {te.title}
                    </h3>
                    {renderStatsRow(te.members, te.accessibleRoles.length)}
                  </div>
                ))}
              </div>
            </section>

            {/* Compare Domain Distribution */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Domain Distribution by Track</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {trackEntries.map((te) => (
                  <div key={te.id}>
                    <h3 className={`text-xs font-semibold mb-2 px-2 py-1 rounded border inline-block ${getTrackBadgeClass(te.title)}`}>
                      {te.title} ({te.members.length})
                    </h3>
                    {te.members.length > 0 ? (
                      <DomainDistributionChart members={te.members} compact />
                    ) : (
                      <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-gray-500">
                        No members in this track
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Compare Heatmap — 3-column density */}
            <section>
              <StrengthHeatmap
                members={members}
                compareMode
                trackGroups={trackEntries.map((te) => ({
                  title: te.title,
                  abbrev: te.title === "Tech Transformation" ? "TT" : te.title === "Tech Delivery" ? "TD" : "ME",
                  members: te.members,
                }))}
              />
            </section>

            {/* Compare Role Coverage */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Role Coverage by Track</h2>
              <div className="space-y-6">
                {trackEntries.map((te) => (
                  <div key={te.id}>
                    <h3 className={`text-xs font-semibold mb-2 px-2 py-1 rounded border inline-block ${getTrackBadgeClass(te.title)}`}>
                      {te.title} ({te.members.length})
                    </h3>
                    <RoleCoverage members={te.members} trackId={te.id} />
                  </div>
                ))}
              </div>
            </section>

            {/* Compare Team Members — grouped by track */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Team Members by Track</h2>
              <div className="space-y-4">
                {trackEntries.map((te) => (
                  <div key={te.id} className="rounded-2xl border border-border bg-surface overflow-hidden">
                    <button
                      onClick={() => toggleTrackExpand(te.title)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <span className={`text-sm font-semibold px-2 py-1 rounded border ${getTrackBadgeClass(te.title)}`}>
                        {te.title} ({te.members.length})
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedTracks[te.title] ? "rotate-180" : ""}`} />
                    </button>
                    {expandedTracks[te.title] && (
                      <div className="px-5 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {te.members.map((member) => (
                          <TeamMemberCard
                            key={member.id}
                            member={member}
                            onRemove={handleRemoveMember}
                            isCurrentUser={isCurrentUserMember(member)}
                          />
                        ))}
                        {te.members.length === 0 && (
                          <p className="col-span-full text-sm text-gray-500 py-4">No members in this track</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
