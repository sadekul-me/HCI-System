import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiMic, FiEdit3, FiCpu } from "react-icons/fi";

export default function TrackingStatus({ mode, landmarks, isListening }) {

  const state = useMemo(() => {
    switch (mode) {
      case "tracking":
        return {
          icon: <FiCpu />,
          title: "Tracking Sync",
          subtitle: landmarks ? "Hand Detected" : "Awaiting Input",
          color: "from-cyan-400 via-blue-500 to-indigo-600",
        };
      case "draw":
        return {
          icon: <FiEdit3 />,
          title: "Draw Engine",
          subtitle: "Gesture Active",
          color: "from-indigo-400 via-purple-500 to-fuchsia-600",
        };
      case "voice":
        return {
          icon: <FiMic />,
          title: "Voice Interface",
          subtitle: isListening ? "Listening..." : "Standby",
          color: "from-pink-500 via-purple-500 to-indigo-500",
        };
      default:
        return {
          icon: <FiCpu />,
          title: "System Idle",
          subtitle: "No Active Input",
          color: "from-gray-500 to-gray-400",
        };
    }
  }, [mode, landmarks, isListening]);

  const [signal, setSignal] = useState(Array(12).fill(20));

  useEffect(() => {
    let raf;
    const updateSignal = () => {
      setSignal((prev) =>
        prev.map((_, i) => {
          if (mode === "tracking") {
            return landmarks
              ? 70 + Math.sin(Date.now() / 200 + i) * 30
              : 20 + Math.sin(Date.now() / 300 + i) * 20;
          }
          if (mode === "voice") {
            return isListening
              ? 50 + Math.sin(Date.now() / 100 + i) * 40
              : 20;
          }
          return 40 + Math.sin(Date.now() / 250 + i) * 20;
        })
      );
      raf = requestAnimationFrame(updateSignal);
    };
    updateSignal();
    return () => cancelAnimationFrame(raf);
  }, [mode, landmarks, isListening]);

  const systemLevel = useMemo(() => {
    if (mode === "voice" && isListening) return "HIGH";
    if (mode === "tracking" && landmarks) return "ACTIVE";
    if (mode === "draw") return "PROCESSING";
    return "IDLE";
  }, [mode, landmarks, isListening]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-2xl border border-white/10 bg-[#020617]/70 backdrop-blur-3xl 
      p-5 sm:p-6 flex flex-col items-center justify-center
      shadow-[0_0_80px_rgba(0,0,0,0.7)] overflow-hidden"
    >
      {/* BACKGROUND DECOR */}
      <div className={`absolute inset-0 opacity-20 blur-[100px] bg-gradient-to-br ${state.color} -z-10`} />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[size:24px_24px] -z-10" />

      {/* CORE CIRCLE ENGINE */}
      <div className="relative mb-4 sm:mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 rounded-full blur-xl opacity-30 bg-gradient-to-r ${state.color}`}
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border border-white/10"
        />
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full 
        flex items-center justify-center text-xl sm:text-2xl lg:text-3xl
        bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner">
          {state.icon}
        </div>
      </div>

      {/* TITLE & SIGNAL GRID */}
      <div className="w-full flex flex-col items-center space-y-3">
        <h3 className="text-[10px] sm:text-xs text-white/80 uppercase tracking-[0.4em] font-black text-center">
          {state.title}
        </h3>

        {/* DYNAMIC SIGNAL BARS */}
        <div className="flex items-end gap-[3px] h-8 sm:h-10">
          {signal.map((h, i) => (
            <motion.div
              key={i}
              className={`w-[3px] sm:w-[4px] rounded-full bg-gradient-to-t ${state.color}`}
              animate={{
                height: `${Math.max(15, h)}%`,
                opacity: h > 50 ? 1 : 0.3,
              }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>

        {/* FOOTER STATUS INFO */}
        <div className="flex flex-col items-center pt-2">
          <p className="text-[9px] sm:text-[10px] text-white/40 font-mono tracking-wider">
            {state.subtitle}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-1 h-1 rounded-full animate-pulse ${systemLevel === 'IDLE' ? 'bg-gray-400' : 'bg-cyan-400'}`} />
            <p className="text-[8px] sm:text-[9px] text-cyan-400/70 font-bold tracking-[0.1em]">
              SYSTEM_{systemLevel}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}