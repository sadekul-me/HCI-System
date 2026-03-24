import React, { useRef, useCallback } from "react";
import {
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
  FiMic,
  FiDownload,
  FiUpload,
} from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

/**
 * 🚀 LI AO FOOTER CONTROLS — ULTRA PRO
 *
 * ✔ Fully safe handlers (no crash)
 * ✔ Smart toast system
 * ✔ Import validation
 * ✔ Async-safe clear
 * ✔ Scalable (controller ready)
 */

export default function FooterControls({
  handleUndo,
  handleRedo,
  clearAll,
  toggleListening,
  isListening = false,
  saveCanvas,
  handleImport,
}) {
  const fileInputRef = useRef(null);

  /* ===========================
     📂 IMPORT HANDLER
  =========================== */
  const onImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Only images allowed ❌");
        return;
      }

      try {
        handleImport?.(file);
        toast.success("Image Imported 🚀");
      } catch (err) {
        console.error(err);
        toast.error("Import Failed ❌");
      }

      e.target.value = ""; // 🔥 reset input
    },
    [handleImport]
  );

  /* ===========================
     🧹 CLEAR SYSTEM
  =========================== */
  const handleClear = useCallback(async () => {
    if (!clearAll) return;

    const confirmClear = window.confirm("Clear everything? ⚠️");
    if (!confirmClear) return;

    try {
      await clearAll();
      toast.success("System Cleared ⚡");
    } catch (err) {
      console.error(err);
      toast.error("Clear Failed ❌");
    }
  }, [clearAll]);

  /* ===========================
     🔄 UNDO / REDO SAFE
  =========================== */
  const safeUndo = useCallback(() => {
    if (!handleUndo) return;
    handleUndo();
    toast("Undo 🔄");
  }, [handleUndo]);

  const safeRedo = useCallback(() => {
    if (!handleRedo) return;
    handleRedo();
    toast("Redo 🔁");
  }, [handleRedo]);

  /* ===========================
     🎤 VOICE
  =========================== */
  const handleVoice = useCallback(() => {
    if (!toggleListening) return;

    toggleListening();
    toast(isListening ? "Voice Off 🎤" : "Voice On 🎙️");
  }, [toggleListening, isListening]);

  /* ===========================
     💾 EXPORT
  =========================== */
  const handleExport = useCallback(() => {
    if (!saveCanvas) return;

    try {
      saveCanvas();
      toast.success("Exported Successfully 📁");
    } catch (err) {
      console.error(err);
      toast.error("Export Failed ❌");
    }
  }, [saveCanvas]);

  /* ===========================
     🎨 UI BUTTON BASE
  =========================== */
  const baseBtn =
    "group w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all";

  return (
    <footer className="w-full flex justify-center mt-6 pb-4 relative z-30">
      {/* 🔒 Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={onFileChange}
      />

      <div
        className="
        flex items-center gap-6 md:gap-10
        px-6 md:px-12 py-3
        rounded-full
        bg-[#050b18]/80 backdrop-blur-xl
        border border-white/10
        shadow-[0_10px_40px_rgba(0,0,0,0.7)]
      "
      >
        {/* 🔄 UNDO */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={safeUndo}
          className={`${baseBtn} hover:bg-blue-500/20`}
        >
          <FiRotateCcw className="text-white text-lg opacity-70 group-hover:text-blue-400 group-hover:opacity-100" />
        </motion.button>

        {/* 🔁 REDO */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={safeRedo}
          className={`${baseBtn} hover:bg-blue-500/20`}
        >
          <FiRotateCw className="text-white text-lg opacity-70 group-hover:text-blue-400 group-hover:opacity-100" />
        </motion.button>

        {/* 🧹 CLEAR */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleClear}
          className={`${baseBtn} hover:bg-red-500/20`}
        >
          <FiTrash2 className="text-white text-lg opacity-70 group-hover:text-red-400 group-hover:opacity-100" />
        </motion.button>

        {/* 🎤 VOICE */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleVoice}
          className={`
            ${baseBtn}
            ${
              isListening
                ? "bg-red-500/20 animate-pulse"
                : "hover:bg-emerald-500/20"
            }
          `}
        >
          <FiMic
            className={`text-lg ${
              isListening
                ? "text-red-400"
                : "text-white opacity-70 group-hover:text-emerald-400"
            }`}
          />
        </motion.button>

        {/* DIVIDER */}
        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        {/* 📂 IMPORT */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onImportClick}
          className={`${baseBtn} hover:bg-white/10`}
        >
          <FiUpload className="text-white text-lg opacity-70 group-hover:opacity-100" />
        </motion.button>

        {/* 💾 EXPORT */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleExport}
          className="
            flex items-center gap-2
            px-5 py-2 rounded-xl
            bg-gradient-to-r from-blue-600 to-indigo-600
            text-xs font-semibold uppercase tracking-widest
            shadow-[0_10px_25px_rgba(59,130,246,0.4)]
            hover:scale-105 hover:shadow-[0_15px_35px_rgba(59,130,246,0.6)]
            active:scale-95
            transition-all
          "
        >
          <FiDownload className="text-sm" />
          Export
        </motion.button>
      </div>
    </footer>
  );
}