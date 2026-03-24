import React from "react";
import { motion } from "framer-motion";

const COLORS = [
  { name: "White", code: "#FFFFFF" },
  { name: "Red", code: "#FF3131" },
  { name: "Green", code: "#10B981" },
  { name: "Gold", code: "#F5D061" },
  { name: "Neon", code: "#39FF14" },
  { name: "Electric", code: "#1F51FF" },
];

export default function Toolbar({
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize,
}) {
  return (
    <div className="flex flex-col h-full gap-8 p-5 relative">

      {/* 🌌 BACKGROUND FX */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-20 pointer-events-none" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* ================= COLOR SECTION ================= */}
      <div className="flex flex-col gap-5">
        <label className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">
          Spectrum
        </label>

        <div className="grid grid-cols-3 gap-4">
          {COLORS.map((color, i) => {
            const active = currentColor === color.code;

            return (
              <motion.button
                key={color.code}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentColor(color.code)}
                className={`relative aspect-square rounded-full transition-all duration-300 ${
                  active
                    ? "ring-2 ring-white scale-110"
                    : "opacity-80 hover:opacity-100"
                }`}
                style={{ backgroundColor: color.code }}
              >
                {/* 🔥 Glow Effect */}
                {active && (
                  <div
                    className="absolute inset-0 rounded-full blur-xl opacity-60"
                    style={{ backgroundColor: color.code }}
                  />
                )}

                {/* ✨ Pulse */}
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full border border-white/40"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ================= BRUSH SIZE ================= */}
      <div className="flex flex-col gap-5">
        <label className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">
          Brush
        </label>

        <div className="flex flex-col gap-3">

          {/* 🎚️ SLIDER */}
          <input
            type="range"
            min="2"
            max="25"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full cursor-pointer"
          />

          {/* 📊 VALUE BAR */}
          <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500"
              animate={{ width: `${(brushSize / 25) * 100}%` }}
              transition={{ type: "spring", stiffness: 120 }}
            />
          </div>

          {/* 📏 LABEL */}
          <div className="flex justify-between text-[10px] font-mono text-white/20">
            <span>2px</span>
            <span className="text-blue-400 text-xs tracking-wider">
              {brushSize}px
            </span>
            <span>25px</span>
          </div>

          {/* 🧠 LIVE PREVIEW DOT */}
          <div className="flex justify-center pt-2">
            <motion.div
              className="rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              animate={{
                width: brushSize,
                height: brushSize,
              }}
              transition={{ type: "spring", stiffness: 200 }}
            />
          </div>
        </div>
      </div>

      {/* ================= SYSTEM FOOT ================= */}
      <div className="mt-auto relative">
        <div className="border-t border-white/10 pt-4 flex justify-between items-center text-[8px] uppercase tracking-widest text-white/20">
          <span>Neural Core</span>

          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-green-400"
          >
            ACTIVE
          </motion.span>
        </div>
      </div>

    </div>
  );
}