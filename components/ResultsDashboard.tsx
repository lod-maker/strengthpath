"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import RoleMatchCard from "./RoleMatchCard";
import OutsideTrackRoles from "./OutsideTrackRoles";
import StrengthDomainsCard from "./StrengthDomainsCard";
import GrowthAreas from "./GrowthAreas";
import TeamInsights from "./TeamInsights";
import { AnalysisResult, TrackId } from "@/lib/types";
import { TRACKS } from "@/lib/accentureRoles";
import FeedbackCard from "./FeedbackCard";
import {
  Download,
  RefreshCw,
  Trophy,
  Compass,
  Zap,
  Quote,
} from "lucide-react";

interface ResultsDashboardProps {
  analysis: AnalysisResult;
  trackId: TrackId;
  onReset: () => void;
}

export default function ResultsDashboard({
  analysis,
  trackId,
  onReset,
}: ResultsDashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const track = TRACKS[trackId];

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

      pdf.save("TAG-Report.pdf");
    } catch (err) {
      console.error("PDF download failed:", err);
    }
  };

  const topMatch = analysis.topRoleMatches[0];

  return (
    <div ref={dashboardRef} className="space-y-8">
      {/* ─── Quick Summary Banner ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 p-8"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-accent/20">
                <Quote className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm font-medium text-accent uppercase tracking-wider">
                Your Summary
              </span>
            </div>
            <p className="text-lg text-gray-200 leading-relaxed">
              {analysis.quickSummary}
            </p>
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

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{track.title}</p>
            <p className="text-xs text-gray-400 mt-1">Your Track</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {analysis.strengthDomains.dominantDomain}
            </p>
            <p className="text-xs text-gray-400 mt-1">Dominant Domain</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {topMatch ? topMatch.role : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">#1 Role Match</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {topMatch ? topMatch.fitScore : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Top Fit Score</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Strength Domains ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <StrengthDomainsCard domains={analysis.strengthDomains} />
      </motion.section>

      {/* ─── Top Role Matches ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          Your Top Role Matches
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Ranked by fit score against your strength profile within{" "}
          <span className="text-white font-medium">{track.title}</span>. Click
          a card to expand details.
        </p>
        <div className="space-y-3">
          {analysis.topRoleMatches.map((match, index) => (
            <RoleMatchCard key={match.role} match={match} index={index} />
          ))}
        </div>
      </motion.section>

      {/* ─── Outside Track Roles ─── */}
      {analysis.topRolesOutsideTrack &&
        analysis.topRolesOutsideTrack.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <OutsideTrackRoles roles={analysis.topRolesOutsideTrack} />
          </motion.section>
        )}

      {/* ─── Team Insights & Growth ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <TeamInsights team={analysis.teamComplementarity} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <GrowthAreas items={analysis.developmentPlan} />
        </motion.section>
      </div>

      {/* ─── Feedback ─── */}
      <FeedbackCard
        topRole={topMatch ? topMatch.role : "N/A"}
        trackTitle={track.title}
      />

      {/* ─── Bottom Actions ─── */}
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
