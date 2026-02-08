"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import UploadZone from "@/components/UploadZone";
import RoleSelector from "@/components/RoleSelector";
import LoadingState from "@/components/LoadingState";
import ResultsDashboard from "@/components/ResultsDashboard";
import {
  AnalysisResult,
  AppStep,
  ExtractedStrengths,
  TrackId,
} from "@/lib/types";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function AnalyzePage() {
  const [step, setStep] = useState<AppStep>("upload");
  const [candidateName, setCandidateName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<TrackId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [strengths, setStrengths] = useState<ExtractedStrengths | null>(null);

  const canAnalyze = candidateName.trim().length > 0 && file !== null && selectedTrack !== null;

  const handleAnalyze = useCallback(async () => {
    if (!file || !selectedTrack || !candidateName.trim()) return;

    setError(null);
    setStep("loading");

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("trackId", selectedTrack);
      formData.append("candidateName", candidateName.trim());

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("The analysis took too long or the server returned an invalid response. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      setStrengths(data.strengths);
      setAnalysis(data.analysis);
      setStep("results");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setStep("upload");
    }
  }, [file, selectedTrack, candidateName]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setAnalysis(null);
    setStrengths(null);
    // Keep the file so they don't have to re-upload
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border px-6 md:px-12 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <div className="flex items-center gap-2">
              <img src="/accenture-logo.png" alt="Accenture" className="w-8 h-8 rounded-lg object-cover" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-white">StrengthPath</span>
                <span className="text-[10px] text-gray-400 tracking-wide">Accenture Technology Analyst (TAG) — Internal team tool</span>
              </div>
            </div>
          </Link>

          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-2">
            {[
              { key: "upload", label: "Upload & Select" },
              { key: "loading", label: "Analyzing" },
              { key: "results", label: "Results" },
            ].map((s, i) => {
              const stepOrder = ["upload", "loading", "results"];
              const currentIndex = stepOrder.indexOf(step);
              const thisIndex = i;
              const isActive = step === s.key;
              const isComplete = thisIndex < currentIndex;

              return (
                <React.Fragment key={s.key}>
                  {i > 0 && (
                    <div
                      className={`w-8 h-px ${
                        isComplete ? "bg-accent" : "bg-border"
                      }`}
                    />
                  )}
                  <div
                    className={`
                      flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full
                      ${
                        isActive
                          ? "bg-accent/10 text-accent border border-accent/30"
                          : isComplete
                          ? "text-accent"
                          : "text-gray-500"
                      }
                    `}
                  >
                    <span
                      className={`
                        w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                        ${
                          isActive
                            ? "gradient-accent text-white"
                            : isComplete
                            ? "bg-accent text-white"
                            : "bg-surface-lighter text-gray-500"
                        }
                      `}
                    >
                      {isComplete ? "✓" : i + 1}
                    </span>
                    {s.label}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {/* ─── Upload & Select Step ─── */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Analysis Error</p>
                    <p className="text-sm mt-1 text-red-400/80">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Your Name */}
              <section>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    Your Name
                  </h2>
                  <p className="text-gray-400 mt-1">
                    This personalises your report.
                  </p>
                </div>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Michele Lodetti"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors"
                />
              </section>

              {/* Step 1: Upload */}
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Step 1: Upload your report
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Upload the PDF you received from the Gallup CliftonStrengths
                    assessment.
                  </p>
                </div>
                <UploadZone file={file} onFileSelect={setFile} />
              </section>

              {/* Step 2: Select Track */}
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Step 2: Which track were you hired into?
                  </h2>
                  <p className="text-gray-400 mt-1">
                    We&apos;ll analyze your strengths against all 27 roles, prioritising
                    those accessible from your track.
                  </p>
                </div>
                <RoleSelector
                  selectedTrack={selectedTrack}
                  onSelectTrack={setSelectedTrack}
                />
              </section>

              {/* Run Analysis button */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  disabled={!canAnalyze}
                  onClick={handleAnalyze}
                  className="text-base px-10 py-6"
                >
                  Find My Best Roles
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {!canAnalyze && (
                <p className="text-center text-sm text-gray-500">
                  {!candidateName.trim()
                    ? "Enter your name to get started"
                    : !file && !selectedTrack
                    ? "Upload your PDF and select your track to begin"
                    : !file
                    ? "Upload your CliftonStrengths PDF to continue"
                    : "Select your analyst track to continue"}
                </p>
              )}
            </motion.div>
          )}

          {/* ─── Loading Step ─── */}
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingState />
            </motion.div>
          )}

          {/* ─── Results Step ─── */}
          {step === "results" && analysis && selectedTrack && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResultsDashboard
                analysis={analysis}
                trackId={selectedTrack}
                candidateName={candidateName}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
