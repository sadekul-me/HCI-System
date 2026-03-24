import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 🚀 ULTRA-PRO PredictionBar (Updated with Voice Integration)
 * - Mini, professional glass design
 * - Subtle animated background glow
 * - Neon AI vibe indicators
 * - Fully responsive
 */
export default function PredictionBar({ prediction, voiceText }) {
  const displayText = prediction?.trim() || "Scanning...";

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm px-4">
      
      {/* 🌌 Subtle Background Glow (Ultra-Pro) */}
      <motion.div
        animate={{ opacity: [0.05, 0.2, 0.05], scale: [1, 1.02, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 blur-[30px] -z-10"
      />

      {/* 🚀 Glass Container */}
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center gap-1 px-5 py-2.5 rounded-3xl
                   bg-black/25 backdrop-blur-[25px] border border-white/10
                   shadow-[0_8px_25px_rgba(0,0,0,0.4),inset_0_0_8px_rgba(255,255,255,0.05)]
                   transition-all duration-500 w-full"
      >
        <div className="flex items-center justify-between w-full gap-3">
          {/* 🌟 Left Neon Dot */}
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-2 h-2 bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)] rounded-full"
          />

          {/* 🎯 Prediction Text */}
          <AnimatePresence mode="wait">
            <motion.span
              key={displayText}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="text-sm md:text-base font-semibold tracking-wide uppercase
                         bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500
                         drop-shadow-[0_0_6px_rgba(245,208,97,0.3)] text-center whitespace-nowrap"
            >
              {displayText}
            </motion.span>
          </AnimatePresence>

          {/* ⚡ Right Glow Dots */}
          <div className="flex gap-1 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-75" />
          </div>
        </div>

        {/* 🎤 Voice Feedback Layer (Only shows when speaking) */}
        <AnimatePresence>
          {voiceText && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden w-full flex justify-center border-t border-white/5 mt-1 pt-1"
            >
              <p className="text-[10px] font-mono text-cyan-300/80 uppercase tracking-[0.2em] animate-pulse">
                {voiceText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}