"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Upload,
  BarChart3,
  Users,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <img src="/accenture-logo.png" alt="Accenture" className="w-9 h-9 rounded-xl object-cover" />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-white">StrengthPath</span>
            <span className="text-[10px] text-gray-400 tracking-wide">Accenture Technology Analyst (TAG) — Internal team tool</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/team">
            <Button variant="ghost" size="sm">
              Team Map
            </Button>
          </Link>
          <Link href="/analyze">
            <Button variant="outline" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-24 md:pt-28 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
            Map your{" "}
            <span className="gradient-text">Gallup Strengths</span>
            <br />
            to your Accenture career
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Upload your CliftonStrengths report, select your analyst track, and
            discover which of Accenture&apos;s 27 technology roles are the best
            fit for your unique strength profile.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/analyze">
              <Button size="lg" className="text-base px-8 py-6">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500">
              Free to use &middot; No account needed
            </p>
          </motion.div>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto w-full"
        >
          {[
            {
              icon: <Upload className="w-6 h-6" />,
              title: "Upload PDF",
              desc: "Drop in your Gallup CliftonStrengths report — we extract your top strengths automatically.",
            },
            {
              icon: <BarChart3 className="w-6 h-6" />,
              title: "27-Role Matching",
              desc: "AI scores your strengths against all 27 Accenture technology roles and ranks your best fits.",
            },
            {
              icon: <Users className="w-6 h-6" />,
              title: "Team Insights",
              desc: "Discover complementary strengths and which teammates to seek for balanced delivery.",
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: "Private & Secure",
              desc: "Your PDF is processed in memory and never stored. Only your extracted strengths are sent to AI for analysis — no files are kept.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              className="rounded-2xl border border-border bg-surface/50 p-6 hover:border-border-light hover:bg-surface-light/50 transition-all duration-300 group"
            >
              <div className="p-3 rounded-xl bg-surface-lighter text-gray-400 group-hover:text-accent group-hover:bg-accent/10 transition-colors duration-300 inline-flex">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-white mt-4 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tracks preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-20 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Three tracks. 27 roles. Your perfect fit.
          </h2>
          <p className="text-gray-400 mb-10">
            Select your analyst track and discover which specific roles match
            your strengths — plus future growth paths across other tracks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Tech Transformation",
                desc: "Client-facing business transformation",
                color: "from-purple-500/20 to-purple-600/5",
              },
              {
                title: "Tech Delivery",
                desc: "End-to-end solution delivery",
                color: "from-blue-500/20 to-blue-600/5",
              },
              {
                title: "Modern Engineering",
                desc: "Hands-on software engineering",
                color: "from-emerald-500/20 to-emerald-600/5",
              },
            ].map((track) => (
              <div
                key={track.title}
                className={`rounded-xl border border-border p-5 bg-gradient-to-br ${track.color}`}
              >
                <h3 className="font-semibold text-white text-sm">
                  {track.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{track.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-border">
        <p className="text-sm text-gray-500">
          Internal team tool — not an official Accenture product
        </p>
      </footer>
    </div>
  );
}
