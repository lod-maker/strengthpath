"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnalysisResult, TrackId, PerfectFitRole, StretchRole, CautionRole, DomainMapping } from "@/lib/types";
import { TRACKS } from "@/lib/accentureRoles";
import FeedbackCard from "./FeedbackCard";
import {
  Download,
  RefreshCw,
  Trophy,
  Compass,
  AlertTriangle,
  Users,
  Rocket,
  Star,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  ShieldAlert,
  Brain,
} from "lucide-react";

interface ResultsDashboardProps {
  analysis: AnalysisResult;
  trackId: TrackId;
  onReset: () => void;
  profileIcon?: string | null;
}

// ─── Helper: Star rating ────────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= count ? "text-amber-400 fill-amber-400" : "text-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Helper: Domain color ───────────────────────────────────────────────────

function getDomainColor(domain: string): string {
  const d = domain.toLowerCase();
  if (d.includes("executing")) return "#10B981";
  if (d.includes("influencing")) return "#8B5CF6";
  if (d.includes("relationship")) return "#F59E0B";
  if (d.includes("strategic")) return "#3B82F6";
  return "#9CA3AF";
}

// ─── Expandable Card ────────────────────────────────────────────────────────

function ExpandableCard({
  children,
  header,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden hover:border-border-light transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 flex items-center justify-between gap-4"
      >
        <div className="flex-1 min-w-0">{header}</div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ResultsDashboard({
  analysis,
  trackId,
  onReset,
  profileIcon,
}: ResultsDashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const track = TRACKS[trackId];
  const { persona, domainMapping, perfectFitRoles, stretchRoles, cautionRoles, teamDynamics, actionPlan } = analysis;

  const handleDownload = async () => {
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: "#0A0A0F",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save("StrengthPath-Report.pdf");
    } catch (err) {
      console.error("PDF download failed:", err);
    }
  };

  return (
    <div ref={dashboardRef} className="space-y-8">

      {/* ═══════════════════════════════════════════════════════════════════════
          EXECUTIVE SUMMARY / PERSONA
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 p-8"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {/* AI-generated profile icon */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-accent/30">
                {profileIcon ? (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    src={`data:image/png;base64,${profileIcon}`}
                    alt="Profile icon"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 animate-pulse" />
                )}
              </div>
              <div className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-bold tracking-wide">
                {persona.moniker}
              </div>
            </div>
            <p className="text-base text-gray-300 leading-relaxed">
              {persona.narrative}
            </p>

            {/* Top 5 chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {persona.topFive.map((s, i) => (
                <span
                  key={s}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300"
                >
                  #{i + 1} {s}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={onReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Domain summary bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dominant Domain</p>
            <p className="text-sm font-semibold text-white">{persona.dominantDomain.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{persona.dominantDomain.description}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Secondary Domain</p>
            <p className="text-sm font-semibold text-white">{persona.secondaryDomain.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{persona.secondaryDomain.description}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">The Gap</p>
            <p className="text-sm font-semibold text-amber-400">{persona.gap.domain}</p>
            <p className="text-xs text-gray-400 mt-0.5">{persona.gap.description}</p>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          DOMAIN MAPPING
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-accent" />
          Strength Domain Mapping
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domainMapping.map((dm: DomainMapping) => {
            const color = getDomainColor(dm.domain);
            return (
              <div
                key={dm.domain}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-semibold text-white">
                    {dm.domain}
                  </span>
                  {dm.isPrimary && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                      Primary
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {dm.strengths.map((s) => (
                    <div key={s.name} className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-mono w-6 text-right">#{s.rank}</span>
                        <span className="text-sm font-medium text-gray-200">{s.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 text-right">{s.drive}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PERFECT FIT ROLES
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-accent" />
          Perfect Fit Roles — {track.title}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Roles within your track that match your talent DNA.
        </p>
        <div className="space-y-3">
          {perfectFitRoles.map((role: PerfectFitRole, i: number) => (
            <ExpandableCard
              key={role.role}
              defaultOpen={i === 0}
              header={
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl gradient-accent flex items-center justify-center text-white font-bold text-sm">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-white">{role.role}</h4>
                    <Stars count={role.stars} />
                  </div>
                </div>
              }
            >
              <div className="rounded-xl bg-surface-light p-4">
                <p className="text-sm font-medium text-accent mb-1">Why This Role</p>
                <p className="text-sm text-gray-300 leading-relaxed">{role.why}</p>
              </div>
              <div className="rounded-xl bg-accent/5 border border-accent/15 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-accent" />
                  <p className="text-sm font-medium text-accent">Strength Synergy</p>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{role.synergy}</p>
              </div>
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <p className="text-sm font-medium text-amber-400">Watch Out</p>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{role.watchOut}</p>
              </div>
            </ExpandableCard>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STRETCH / CROSSOVER ROLES
      ═══════════════════════════════════════════════════════════════════════ */}
      {stretchRoles && stretchRoles.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-accent" />
            Future Growth Paths
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Strong fits outside your current track — roles to grow into.
          </p>
          <div className="space-y-3">
            {stretchRoles.map((role: StretchRole) => (
              <div
                key={role.role}
                className="rounded-2xl border border-border bg-surface p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-white">{role.role}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      via {role.naturalTrack}
                    </p>
                  </div>
                  <Stars count={role.stars} />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{role.why}</p>
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs text-accent font-medium">{role.timeline}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          CAUTION ROLES
      ═══════════════════════════════════════════════════════════════════════ */}
      {cautionRoles && cautionRoles.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Approach with Caution
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Roles that could drain rather than energise you.
          </p>
          <div className="space-y-3">
            {cautionRoles.map((role: CautionRole) => (
              <div
                key={role.role}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-base font-semibold text-white">{role.role}</h4>
                  <Stars count={role.stars} />
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">The Friction</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{role.friction}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">The Mismatch</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{role.mismatch}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TEAM DYNAMICS
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-accent" />
          Team Dynamics
        </h3>
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-5">
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-wider mb-2">What You Bring</p>
            <p className="text-sm text-gray-300 leading-relaxed">{teamDynamics.whatYouBring}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-wider mb-3">Seek Out Teammates With</p>
            <div className="space-y-2">
              {teamDynamics.seekOutTeammatesWith.map((t) => (
                <div key={t.strength} className="rounded-xl bg-surface-light p-3 flex items-start gap-3">
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">
                    {t.strength}
                  </span>
                  <p className="text-sm text-gray-400">{t.why}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-wider mb-2">Ideal Team Composition</p>
            <p className="text-sm text-gray-300 leading-relaxed">{teamDynamics.idealTeamComposition}</p>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════════
          ACTION PLAN
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Rocket className="w-5 h-5 text-accent" />
          Your Action Plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Immediate */}
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
            <p className="text-xs font-medium text-accent uppercase tracking-wider mb-2">Immediate Placement</p>
            <p className="text-base font-semibold text-white mb-1">{actionPlan.immediatePlacement.role}</p>
            <p className="text-sm text-gray-300 leading-relaxed">{actionPlan.immediatePlacement.why}</p>
          </div>

          {/* 6 month */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-medium text-accent uppercase tracking-wider mb-2">6-Month Development</p>
            <p className="text-sm text-gray-300 leading-relaxed">{actionPlan.sixMonthDevelopment}</p>
          </div>

          {/* Blind spot */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">Blind Spot Management</p>
            <p className="text-sm text-gray-300 leading-relaxed">{actionPlan.blindSpotManagement}</p>
          </div>

          {/* 18 month */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-medium text-accent uppercase tracking-wider mb-2">18-Month Growth Target</p>
            <p className="text-base font-semibold text-white mb-1">{actionPlan.eighteenMonthTarget.role}</p>
            <p className="text-sm text-gray-300 leading-relaxed">{actionPlan.eighteenMonthTarget.requirement}</p>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FEEDBACK
      ═══════════════════════════════════════════════════════════════════════ */}
      <FeedbackCard
        topRole={perfectFitRoles[0]?.role || "N/A"}
        trackTitle={track.title}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          BOTTOM ACTIONS
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t border-border"
      >
        <Button variant="outline" onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Analyze a Different Track
        </Button>
        <Button onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download Full Report
        </Button>
      </motion.div>
    </div>
  );
}
