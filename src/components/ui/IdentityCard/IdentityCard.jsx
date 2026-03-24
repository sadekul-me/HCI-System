import React from "react";
import { motion } from "framer-motion";

export default function IdentityCard({ videoRef, user, setUser, cameraEnabled = true }) {
  const safeUser = user || { name: "GHOST", profession: "CYBER OPERATIVE" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full rounded-2xl border border-white/10 bg-[#020617]/60 backdrop-blur-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)] group transition-all duration-700 hover:shadow-[0_0_80px_rgba(56,189,248,0.15)]"
    >
      {/* 🌌 TOP GLOW */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20" />

      {/* ================= VIDEO SECTION ================= */}
      {/* aspect-video ল্যাপটপে অনেক জায়গা খায়, তাই ছোট স্ক্রিনে একটু কমিয়েছি */}
      <div className="relative aspect-video w-full overflow-hidden bg-black/70 rounded-t-2xl">
        {/* VIDEO */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-all duration-700 scale-x-[-1]
            ${cameraEnabled ? "opacity-100 grayscale-[20%] contrast-[1.15] brightness-[0.9]" : "opacity-0"}`}
          autoPlay
          playsInline
          muted
        />

        {/* OFFLINE */}
        {!cameraEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white/20 text-[10px] sm:text-xs font-black tracking-[0.4em] uppercase">
            System Offline
          </div>
        )}

        {/* FRAME BORDER */}
        <div className="absolute inset-0 pointer-events-none border border-white/5 m-2 rounded-xl" />

        {/* LIVE STATUS */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-2 z-10">
          <div
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              cameraEnabled
                ? "bg-red-500 animate-pulse shadow-[0_0_12px_#ef4444]"
                : "bg-white/20"
            }`}
          />
          <span className="text-[8px] sm:text-[10px] font-black bg-black/40 backdrop-blur px-1.5 py-0.5 rounded tracking-[0.2em] text-white/70">
            {cameraEnabled ? "REC // ACTIVE" : "SIGNAL // LOST"}
          </span>
        </div>

        {/* SCAN LINE EFFECT */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-full h-[2px] bg-cyan-400/30 blur-[2px] animate-[scan_3s_linear_infinite]" />
        </div>

        {/* META */}
        <div className="absolute bottom-1 right-2 text-[7px] font-mono text-cyan-400/40">
          NODE: 192.168.1.0
        </div>
      </div>

      {/* ================= INFO SECTION ================= */}
      <div className="p-3 sm:p-5 flex gap-3 sm:gap-4">
        {/* NEON BAR */}
        <div
          className={`w-[2px] rounded-full ${
            cameraEnabled
              ? "bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.7)]"
              : "bg-white/10"
          }`}
        />

        <div className="flex flex-col flex-1 min-w-0">
          {/* NAME - Responsive Text Size */}
          <input
            placeholder="ACCESS_ID"
            value={safeUser.name}
            onChange={(e) =>
              setUser?.((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full bg-transparent text-white text-base sm:text-lg lg:text-xl font-black uppercase tracking-tight outline-none placeholder:text-white/20 truncate focus:text-cyan-400 transition-all duration-500"
          />

          {/* ROLE */}
          <input
            placeholder="SYSTEM_ROLE"
            value={safeUser.profession}
            onChange={(e) =>
              setUser?.((prev) => ({ ...prev, profession: e.target.value }))
            }
            className="w-full bg-transparent text-cyan-400 text-[9px] sm:text-[11px] font-black tracking-[0.25em] uppercase outline-none mt-0.5 placeholder:text-cyan-500/20 truncate focus:text-cyan-300 transition-all duration-500"
          />

          {/* STATUS GRID - Fixed Overlap with mt-3 and better gap */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-[8px] sm:text-[10px] mt-3 sm:mt-5 border-t border-white/5 pt-3 sm:pt-4 uppercase tracking-widest">
            <div className="min-w-0">
              <span className="text-white/30 block mb-0.5">Status</span>
              <span className="text-cyan-400 truncate block">
                {cameraEnabled ? "Auth" : "STBY"}
              </span>
            </div>

            <div className="min-w-0">
              <span className="text-white/30 block mb-0.5">Protocol</span>
              <span className="text-white/60 truncate block">NV3</span>
            </div>

            <div className="min-w-0">
              <span className="text-white/30 block mb-0.5">Bitrate</span>
              <span className="text-white/60 truncate block text-[7px] sm:text-[9px]">
                {cameraEnabled ? "4.8GB" : "0.0KB"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌌 BOTTOM GLOW */}
      <div className="absolute -bottom-10 left-0 w-full h-24 bg-gradient-to-t from-cyan-500/10 to-transparent blur-2xl pointer-events-none" />
    </motion.div>
  );
}