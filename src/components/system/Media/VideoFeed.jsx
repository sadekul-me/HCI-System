import React, { useMemo } from "react";
import { motion } from "framer-motion";

export default function VideoFeed({ videoRef, settings }) {

  /* =========================
      🧠 SMART FILTER ENGINE
  ========================= */
  const filterClass = useMemo(() => {
    const lowLightBoost = settings?.lowLight ? "brightness-[1.15]" : "brightness-[1.05]";
    const contrastBoost = settings?.highContrast ? "contrast-[1.35]" : "contrast-[1.2]";
    const saturation = "saturate-[1.05]";

    return `${lowLightBoost} ${contrastBoost} ${saturation}`;
  }, [settings]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full rounded-2xl overflow-hidden border border-cyan-500/20 bg-black/50 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.8)] group"
    >

      {/* 🌌 AMBIENT GLOW */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-40" />

      {/* 🎥 VIDEO */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover scale-x-[-1] 
          ${filterClass}
          transition-all duration-500
        `}
        style={{
          transform: "scaleX(-1) translateZ(0)",
          WebkitTransform: "scaleX(-1) translateZ(0)",
          backfaceVisibility: "hidden",
        }}
        autoPlay
        playsInline
        muted
      />

      {/* 🌫️ NOISE LAYER (REALISTIC CAMERA GRAIN) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay">
        <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* 🧠 SCAN LINE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-[2px] bg-cyan-400/30 blur-[2px] animate-[scan_3s_linear_infinite]" />
      </div>

      {/* 🎯 HUD BORDER */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 m-2 rounded-xl" />

      {/* 🔴 LIVE STATUS */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_#ef4444]" />
        <span className="text-[10px] font-black bg-black/50 backdrop-blur px-2 py-1 rounded tracking-[0.3em] text-white/80 border border-white/10">
          LIVE // NEURAL_LINK
        </span>
      </div>

      {/* 📡 SIGNAL BARS */}
      <div className="absolute top-3 right-3 flex items-end gap-[2px] h-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-[3px] bg-cyan-400/70 rounded-sm animate-pulse"
            style={{
              height: `${20 + Math.random() * 80}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* 📍 META DATA */}
      <div className="absolute bottom-2 left-3 text-[8px] font-mono text-white/40 tracking-widest uppercase">
        MODE: TRACKING
      </div>

      <div className="absolute bottom-2 right-3 text-[8px] font-mono text-cyan-400/40 tracking-widest uppercase">
        X_AXIS: REVERSED
      </div>

      {/* 🌌 DEPTH GLOW */}
      <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute -top-16 -left-16 w-40 h-40 bg-purple-500/10 blur-[100px] pointer-events-none" />
    </motion.div>
  );
}