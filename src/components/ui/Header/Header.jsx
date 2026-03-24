import React, { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { modeHandler } from "../../../core/modeHandler"; // fallback support

function Header({
  onOpenSettings,
  onOpenMode,
  onOpenRoadmap,
}) {
  /* =========================
     🧠 SAFE EXECUTOR (ANTI-DEAD BUTTON)
  ========================= */
  const safeRun = useCallback((fn, fallback, label) => {
    try {
      if (typeof fn === "function") {
        fn();
      } else if (typeof fallback === "function") {
        console.warn(`⚠️ ${label} fallback triggered`);
        fallback();
      } else {
        console.error(`❌ ${label} handler missing`);
      }
    } catch (err) {
      console.error(`🔥 ${label} crash:`, err);
    }
  }, []);

  /* =========================
     🔗 HANDLERS (SELF-HEALING)
  ========================= */
  const handleSettings = useCallback(() => {
    safeRun(onOpenSettings, null, "Settings");
  }, [onOpenSettings, safeRun]);

  const handleMode = useCallback(() => {
    safeRun(
      onOpenMode,
      () => modeHandler.setMode("draw"), // fallback action
      "Mode"
    );
  }, [onOpenMode, safeRun]);

  const handleRoadmap = useCallback(() => {
    safeRun(onOpenRoadmap, null, "Roadmap");
  }, [onOpenRoadmap, safeRun]);

  /* =========================
     🎛 CONFIG
  ========================= */
  const actions = [
    { label: "Roadmap", action: handleRoadmap },
    { label: "Mode", action: handleMode },
    { label: "Settings", action: handleSettings },
  ];

  /* =========================
     🎨 UI
  ========================= */
  return (
    <header className="relative z-50 flex justify-between items-center mb-6 px-2">
      
      {/* 🔥 LOGO */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-3 cursor-pointer select-none"
      >
        <div className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(14,165,233,0.25)]">
          <div className="absolute inset-0 rounded-2xl border border-blue-400/20 animate-pulse" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            H
          </span>
        </div>

        <div className="leading-tight">
          <h1 className="text-xl font-bold tracking-wide">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              HCI
            </span>{" "}
            <span className="text-white/40">System</span>
          </h1>

          <p className="text-[10px] tracking-[3px] text-white/40">
            HUMAN INTERFACE
          </p>
        </div>
      </motion.div>

      {/* ⚡ ACTIONS */}
      <div className="flex items-center gap-8">
        {actions.map((btn) => (
          <motion.button
            key={btn.label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              console.log(`🔥 ${btn.label} clicked`);
              btn.action();
            }}
            aria-label={btn.label}
            className="relative group text-sm font-medium text-white/60 hover:text-white transition duration-300"
          >
            {btn.label}

            {/* UNDERLINE */}
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 group-hover:w-full" />
          </motion.button>
        ))}
      </div>
    </header>
  );
}

export default memo(Header);