"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSearch, Brain, Sparkles, Check } from "lucide-react";
import { LoadingPhase } from "@/lib/types";

const PHASES: {
  id: LoadingPhase;
  label: string;
  icon: React.ReactNode;
  duration: number;
}[] = [
  {
    id: "extracting",
    label: "Extracting strengths from your PDF...",
    icon: <FileSearch className="w-5 h-5" />,
    duration: 4000,
  },
  {
    id: "analyzing",
    label: "Matching against 27 Accenture roles...",
    icon: <Brain className="w-5 h-5" />,
    duration: 12000,
  },
  {
    id: "generating",
    label: "Ranking roles and generating insights...",
    icon: <Sparkles className="w-5 h-5" />,
    duration: 10000,
  },
];

export default function LoadingState() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [allPhasesComplete, setAllPhasesComplete] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    let elapsed = 0;

    PHASES.forEach((phase, index) => {
      if (index > 0) {
        elapsed += PHASES[index - 1].duration;
        timers.push(
          setTimeout(() => {
            setCurrentPhase(index);
          }, elapsed)
        );
      }
    });

    // After all phases finish, mark as complete
    const totalDuration = PHASES.reduce((sum, p) => sum + p.duration, 0);
    timers.push(
      setTimeout(() => {
        setAllPhasesComplete(true);
      }, totalDuration)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-16">
      {/* Animated orb */}
      <motion.div
        className="relative w-24 h-24 mb-12"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full gradient-accent opacity-20 blur-xl animate-pulse-slow" />
        <div className="absolute inset-2 rounded-full gradient-accent opacity-40 blur-md animate-pulse-slow" />
        <div className="absolute inset-4 rounded-full gradient-accent opacity-60 blur-sm" />
        <div className="absolute inset-6 rounded-full gradient-accent" />
      </motion.div>

      {/* Phase steps */}
      <div className="w-full max-w-md space-y-4">
        {PHASES.map((phase, index) => {
          const isActive = !allPhasesComplete && index === currentPhase;
          const isComplete = allPhasesComplete || index < currentPhase;

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`
                flex items-center gap-4 p-4 rounded-xl transition-all duration-500
                ${isActive ? "bg-accent/10 border border-accent/30" : ""}
                ${isComplete ? "opacity-60" : ""}
                ${!isActive && !isComplete ? "opacity-30" : ""}
              `}
            >
              <div
                className={`
                  flex-shrink-0 p-2 rounded-lg transition-colors duration-500
                  ${isActive ? "bg-accent/20 text-accent" : ""}
                  ${isComplete ? "bg-emerald-500/20 text-emerald-400" : ""}
                  ${!isActive && !isComplete ? "bg-surface-lighter text-gray-500" : ""}
                `}
              >
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="icon">{phase.icon}</motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                >
                  {phase.label}
                </p>
                {isActive && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: phase.duration / 1000,
                      ease: "linear",
                    }}
                    className="h-0.5 gradient-accent rounded-full mt-2"
                  />
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Finalizing message — shows after all phases complete while still waiting */}
        {allPhasesComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 pt-4"
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-sm text-accent font-medium"
            >
              Finalizing your results — almost there...
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
