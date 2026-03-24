// ModeOverlay.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPenTool,
  FiMove,
  FiType,
  FiBox,
  FiCpu,
} from "react-icons/fi";
import { modeHandler } from "../../../core/modeHandler";

/**
 * ULTRA-PRO MODE OVERLAY
 * - Full design fidelity
 * - Real-time mode updates
 * - Move Mode always enabled
 */
export default function ModeOverlay({ isOpen, onClose, settings }) {
  const [currentMode, setCurrentMode] = useState(modeHandler.getMode());

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = modeHandler.subscribe((newMode) => setCurrentMode(newMode));
    return () => unsubscribe();
  }, [isOpen]);

  const modes = [
    { id: "draw", icon: FiPenTool, label: "Draw System", desc: "Free hand drawing & sketching" },
    { id: "move", icon: FiMove, label: "Move System", desc: "Drag & control objects" },
    { id: "text", icon: FiType, label: "Text System", desc: "Type & render text" },
    { id: "galaxy", icon: FiBox, label: "Galaxy Mode", desc: "3D space interaction (future)" },
    { id: "engineering", icon: FiCpu, label: "Engineering Mode", desc: "Advanced tools & simulation" },
  ];

  // 🔹 FIX: Move Mode always enabled
  const isDisabled = (m) => {
    if (m.id === "move") return false; // Always enable Move
    if (!m.requires) return false;
    return !settings?.[m.requires];
  };

  const handleModeChange = (id) => {
    if (currentMode !== id) {
      modeHandler.setMode(id);
      setTimeout(onClose, 50);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-[600px] max-w-full bg-[#020617] border border-white/10 rounded-2xl p-6 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Mode System</h2>
              <button
                onClick={onClose}
                className="text-xs opacity-60 hover:opacity-100"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {modes.map((m) => {
                const Icon = m.icon;
                const active = currentMode === m.id;
                const disabled = isDisabled(m);

                return (
                  <button
                    key={m.id}
                    onClick={() => !disabled && handleModeChange(m.id)}
                    disabled={disabled}
                    className={`p-4 rounded-xl border text-left transition-all
                      ${active ? "border-white/40 bg-white/10" : "border-white/10"}
                      ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5"}
                    `}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={18} />
                      <span className="font-semibold text-white">{m.label}</span>
                    </div>
                    <p className="text-xs opacity-60">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}