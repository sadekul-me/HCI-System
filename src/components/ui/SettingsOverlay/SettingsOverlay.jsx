import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiCheck,
  FiCpu,
  FiEye,
  FiZap,
  FiMic,
  FiPenTool,
  FiRefreshCw
} from "react-icons/fi";

/* ================= 🔘 TOGGLE ================= */
const Toggle = ({ value, onChange }) => (
  <motion.button
    whileTap={{ scale: 0.85 }}
    whileHover={{ scale: 1.1 }}
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
      value
        ? "bg-white/40 shadow-[0_0_12px_rgba(255,255,255,0.3)]"
        : "bg-white/10"
    }`}
  >
    <span
      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
        value ? "translate-x-[24px]" : ""
      }`}
    />
  </motion.button>
);

/* ================= ⚙️ SETTINGS OVERLAY ================= */
const SettingsOverlay = ({
  isOpen,
  onClose,
  settings = {},
  setSettings = () => {}
}) => {
  const [tab, setTab] = useState("visual");

  const {
    cameraEnabled = true,
    gridVisible = false,
    mirrorCamera = true,
    showSkeleton = false,
    modeLock = false,
    brushSize = 4,
    smoothing = 0.6,
    voiceControl = true,
    trackingMode = "balanced",
    aiConfidence = 0.75
  } = settings || {};

  const playClick = () => {
    try {
      const audio = new Audio("/click.mp3");
      audio.volume = 0.2;
      audio.play();
    } catch {}
  };

  const updateSetting = (key, value) => {
    playClick();
    const updated = { ...settings, [key]: value };
    setSettings(updated);
  };

  const resetSettings = () => {
    playClick();
    setSettings({
      cameraEnabled: true,
      gridVisible: false,
      mirrorCamera: true,
      showSkeleton: false,
      brushSize: 4,
      smoothing: 0.6,
      voiceControl: true,
      aiConfidence: 0.75,
      trackingMode: "balanced",
      modeLock: false
    });
  };

  /* ================= 🔹 UI HELPERS ================= */
  const TabButton = ({ id, icon: Icon, label }) => (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all ${
        tab === id
          ? "bg-white/10 border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          : "text-white/40 hover:text-white"
      }`}
    >
      <Icon size={12} />
      {label}
    </motion.button>
  );

  const Row = ({ label, children, status }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-white/60">{label}</span>
        {status && <span className="text-[9px] text-white/40">● LIVE</span>}
      </div>
      {children}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-[600px] max-w-[90%] bg-[#020617] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold italic flex items-center gap-2">
                  <FiCpu className="text-white/70" />
                  SYSTEM CONFIG
                </h2>
                <p className="text-[9px] text-white/30 tracking-[0.3em] mt-1 font-bold">
                  LI AO NEURAL SYSTEM
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.8 }}
                onClick={onClose}
                className="p-2 text-white/40 hover:text-white"
              >
                <FiX size={20} />
              </motion.button>
            </div>

            {/* TABS */}
            <div className="flex gap-2 px-6 pt-4">
              <TabButton id="visual" icon={FiEye} label="Visual" />
              <TabButton id="drawing" icon={FiPenTool} label="Drawing" />
              <TabButton id="ai" icon={FiZap} label="Neural" />
              <TabButton id="voice" icon={FiMic} label="Voice" />
            </div>

            {/* CONTENT */}
            <div className="px-6 py-4 h-[300px] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                >
                  {/* VISUAL TAB */}
                  {tab === "visual" && (
                    <div className="space-y-1">
                      <Row label="Camera Feed" status={cameraEnabled}>
                        <Toggle
                          value={cameraEnabled}
                          onChange={() => updateSetting("cameraEnabled", !cameraEnabled)}
                        />
                      </Row>
                      <Row label="Grid Overlay">
                        <Toggle
                          value={gridVisible}
                          onChange={() => updateSetting("gridVisible", !gridVisible)}
                        />
                      </Row>
                      <Row label="Mirror Camera">
                        <Toggle
                          value={mirrorCamera}
                          onChange={() => updateSetting("mirrorCamera", !mirrorCamera)}
                        />
                      </Row>
                      <Row label="Neural Skeleton">
                        <Toggle
                          value={showSkeleton}
                          onChange={() => updateSetting("showSkeleton", !showSkeleton)}
                        />
                      </Row>
                      <Row label="Mode Lock 🔒">
                        <Toggle
                          value={modeLock}
                          onChange={() => updateSetting("modeLock", !modeLock)}
                        />
                      </Row>
                    </div>
                  )}

                  {/* DRAWING TAB */}
                  {tab === "drawing" && (
                    <div className="space-y-6 pt-2">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-white/40 uppercase mb-3">
                          Brush Size <span className="text-white/80">{brushSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={brushSize}
                          onChange={(e) => updateSetting("brushSize", parseInt(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/60"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-white/40 uppercase mb-3">
                          Smoothing <span className="text-white/80">{Math.round(smoothing * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={smoothing}
                          onChange={(e) => updateSetting("smoothing", parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/60"
                        />
                      </div>
                    </div>
                  )}

                  {/* AI TAB */}
                  {tab === "ai" && (
                    <div className="space-y-4">
                      <Row label="Detection Confidence">
                        <input
                          type="range"
                          min="0.5"
                          max="0.95"
                          step="0.01"
                          value={aiConfidence}
                          onChange={(e) => updateSetting("aiConfidence", parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/60"
                        />
                        <span className="text-[9px] text-white/60 ml-2">{Math.round(aiConfidence*100)}%</span>
                      </Row>
                    </div>
                  )}

                  {/* VOICE TAB */}
                  {tab === "voice" && (
                    <Row label="Neural Voice Control">
                      <Toggle
                        value={voiceControl}
                        onChange={() => updateSetting("voiceControl", !voiceControl)}
                      />
                    </Row>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-5 border-t border-white/10 flex justify-between items-center bg-white/[0.02]">
              <button
                onClick={resetSettings}
                className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/40 hover:text-white transition-all uppercase"
              >
                <FiRefreshCw />
                Reset Defaults
              </button>
              <button
                onClick={onClose}
                className="px-8 py-2 bg-white/10 border border-white/20 rounded-full text-[10px] font-black tracking-[0.2em] text-white hover:bg-white/20 transition-all flex items-center gap-2 uppercase shadow-lg shadow-white/5"
              >
                <FiCheck />
                Apply changes
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsOverlay;