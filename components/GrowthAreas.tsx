"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { DevelopmentItem } from "@/lib/types";

interface GrowthAreasProps {
  items: DevelopmentItem[];
}

export default function GrowthAreas({ items }: GrowthAreasProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-accent" />
        Development Plan
      </h3>

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.gap}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="rounded-xl border border-border bg-surface p-5 hover:border-border-light transition-all duration-300"
          >
            <h4 className="text-base font-semibold text-white mb-2">
              {item.gap}
            </h4>

            {item.risk && (
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-400/80">{item.risk}</p>
              </div>
            )}

            <p className="text-sm text-gray-300 leading-relaxed">
              {item.action}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
