import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

/* =========================
    📦 UI COMPONENTS
========================= */
import Header from "../ui/Header/Header";
import IdentityCard from "../ui/IdentityCard/IdentityCard";
import Toolbar from "../ui/Toolbar/Toolbar";
import FooterControls from "../ui/FooterControls/FooterControls";
import SettingsOverlay from "../ui/SettingsOverlay/SettingsOverlay";
import ModeControls from "../ui/ModeControls/ModeControls";
import Roadmap from "../ui/Roadmap/Roadmap";

/* =========================
    🧠 SYSTEM COMPONENTS
========================= */
import Board from "../system/Board/Board";
import TrackingStatus from "../system/Media/TrackingStatus";
import PredictionBar from "../system/AI/PredictionBar";

/* =========================
    ⚙️ HOOKS
========================= */
import { useTracking } from "../../hooks/useTracking";
import useVoiceCommand from "../../hooks/useVoiceCommand";
import useRealTimeSync from "../../hooks/useRealTimeSync";
import usePredictor from "../../hooks/usePredictor";

const NeuralInterface = () => {
  /* =========================
      🎛️ UI STATE
  ========================= */
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  const [user, setUser] = useState({
    name: "Sadekul Islam",
    profession: "Software Engineer",
  });

  const [activeColor, setActiveColor] = useState("#6366f1");
  const [voiceText, setVoiceText] = useState("");
  const [prediction, setPrediction] = useState("scanning");

  const [settings, setSettings] = useState({
    cameraEnabled: true,
    handTracking: true,
    gridVisible: false,
    mirrorCamera: true,
    showSkeleton: false,
    aiConfidence: 0.75,
    brushSize: 8,
    smoothing: 0.6,
    voiceControl: true,
  });

  const { videoRef, mode, landmarks } = useTracking(settings);
  const boardRef = useRef(null);

  /* =========================
      🧠 AI PREDICTION
  ========================= */
  const { prediction: ocrResult } = usePredictor({ cooldown: 1000 });

  useEffect(() => {
    if (ocrResult) setPrediction(ocrResult);
  }, [ocrResult]);

  /* =========================
      🎮 ACTIONS
  ========================= */
  const handleUndo = useCallback(() => boardRef.current?.undo?.(), []);
  const handleRedo = useCallback(() => boardRef.current?.redo?.(), []);
  const handleClear = useCallback(() => boardRef.current?.clear?.(), []);
  const handleExport = useCallback(() => boardRef.current?.export?.(), []);

  const handleImport = useCallback((source) => {
    if (!source) return;

    const importImage = (data) => boardRef.current?.importImage?.(data);

    if (source instanceof File || source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => importImage(e.target.result);
      reader.readAsDataURL(source);
    } else if (typeof source === "string") {
      importImage(source);
    }
  }, []);

  /* =========================
      🌐 REALTIME SYNC
  ========================= */
  useRealTimeSync({
    collectionName: "images",
    enabled: true,
    onReceive: (payload) => {
      if (payload?.image) handleImport(payload.image);
    },
  });

  /* =========================
      🎙️ VOICE COMMANDS
  ========================= */
  const { isListening, toggleListening } = useVoiceCommand({
    clearCanvas: handleClear,
    saveCanvas: handleExport,
    setColor: setActiveColor,
    setBrushSize: (size) =>
      setSettings((prev) => ({ ...prev, brushSize: size })),
    setVoiceText: (text) => {
      setVoiceText(text);
      if (text) setTimeout(() => setVoiceText(""), 3000);
    },
  });

  useEffect(() => {
    if (!voiceText) return;
    const text = voiceText.toLowerCase();

    if (text.includes("undo")) handleUndo();
    if (text.includes("redo")) handleRedo();
    if (text.includes("clear") || text.includes("erase")) handleClear();
    if (text.includes("save") || text.includes("export")) handleExport();
  }, [voiceText, handleUndo, handleRedo, handleClear, handleExport]);

  /* =========================
      🧩 UI RENDER
  ========================= */
  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col p-2 sm:p-4 lg:p-5 relative overflow-hidden">

      {/* 🌌 BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 blur-[200px] rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-600/20 blur-[200px] rounded-full"
        />
      </div>

      {/* HEADER */}
      <Header
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenMode={() => setModeOpen(true)}
        onOpenRoadmap={() => setRoadmapOpen(true)}
      />

      {/* MAIN CONTENT AREA */}
      {/* 🔥 FIX: added min-h-0 and overflow-hidden to prevent layout crash */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 relative z-10 mt-4 min-h-0 overflow-hidden">

        {/* LEFT SIDEBAR: Identity & Tracking */}
        <motion.aside
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full lg:w-[320px] flex flex-col gap-4 shrink-0 overflow-y-auto no-scrollbar pb-4"
        >
          <IdentityCard
            videoRef={videoRef}
            user={user}
            setUser={setUser}
            cameraEnabled={settings.cameraEnabled}
          />

          <TrackingStatus
            mode={mode}
            landmarks={landmarks}
            isListening={isListening}
          />
        </motion.aside>

        {/* CENTER SECTION: The Interaction Board */}
        <motion.section
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 relative min-h-0 flex flex-col min-w-0"
        >
          <div className="flex-1 w-full rounded-2xl overflow-hidden 
          border border-[#4f46e5]/20 shadow-[0_0_80px_rgba(0,0,0,0.8)] 
          backdrop-blur-xl bg-[#020617]/60 
          hover:border-[#6366f1]/40 transition-all duration-700">

            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />

            <Board
              ref={boardRef}
              landmarks={landmarks}
              prediction={prediction}
              color={activeColor}
              brushSize={settings.brushSize}
              voiceText={voiceText}
              settings={settings}
            />
          </div>

          <div className="shrink-0 mt-2 mb-1">
            <PredictionBar prediction={prediction} />
          </div>
        </motion.section>

        {/* RIGHT SIDEBAR: Toolbar Controls */}
        <motion.aside
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full lg:w-[280px] shrink-0 overflow-y-auto no-scrollbar pb-4"
        >
          <div className="min-h-fit rounded-2xl p-5 flex flex-col 
          shadow-[0_0_60px_rgba(0,0,0,0.6)] border border-[#4f46e5]/10 
          backdrop-blur-xl bg-[#020617]/60">

            <Toolbar
              currentColor={activeColor}
              setCurrentColor={setActiveColor}
              brushSize={settings.brushSize}
              setBrushSize={(size) =>
                setSettings((prev) => ({ ...prev, brushSize: size }))
              }
              settings={settings}
              setSettings={setSettings}
            />
          </div>
        </motion.aside>
      </main>

      {/* FOOTER CONTROLS */}
      <motion.footer
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 pt-2 flex justify-center shrink-0 safe-layout-padding"
      >
        <div className="w-full max-w-4xl px-2">
          <FooterControls
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            clearAll={handleClear}
            saveCanvas={handleExport}
            handleImport={handleImport}
            toggleListening={toggleListening}
            isListening={isListening}
          />
        </div>
      </motion.footer>

      {/* MODALS & OVERLAYS */}
      <SettingsOverlay
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />

      <ModeControls isOpen={modeOpen} onClose={() => setModeOpen(false)} />
      <Roadmap isOpen={roadmapOpen} onClose={() => setRoadmapOpen(false)} />

      {/* 🔥 FIX: Standard React style implementation to solve 'jsx' attribute error */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default NeuralInterface;