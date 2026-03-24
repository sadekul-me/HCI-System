import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheckCircle, FiMap } from "react-icons/fi";
import LanguageSwitcher from "./LanguageSwitcher";
import { roadmapSteps } from "./steps";

const Roadmap = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState("en");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-[600px] max-w-full bg-[#020617] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.15)]"
          >
            {/* HEADER */}
            <div className="px-6 py-5 flex justify-between items-center border-b border-white/10">
              <div>
                <h2 className="text-xl font-black italic flex items-center gap-2 text-white">
                  <FiMap className="text-blue-500" size={20} />
                  Roadmap System
                </h2>
                <div className="mt-3">
                  <LanguageSwitcher currentLang={lang} setLang={setLang} />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.8 }}
                onClick={onClose}
                className="p-2 rounded-xl text-white/40 hover:text-white transition-all"
              >
                <FiX size={20} />
              </motion.button>
            </div>

            {/* ROADMAP STEPS */}
            <div className="px-6 pt-4 pb-6 h-[340px] overflow-y-auto custom-scrollbar relative">
              {/* Vertical Line */}
              <div className="absolute left-[20px] top-4 bottom-4 w-[2px] bg-white/5 rounded-full" />
              
              <div className="space-y-6 relative z-10">
                {roadmapSteps[lang].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative pl-12 group cursor-pointer"
                  >
                    {/* Status Icon */}
                    <div className="absolute left-0 top-1 z-10">
                      {step.status === "completed" ? (
                        <FiCheckCircle className="text-blue-500 bg-[#020617] rounded-full shadow-md" size={20} />
                      ) : (
                        <div className="w-[20px] h-[20px] rounded-full border border-white/10 bg-[#020617] flex items-center justify-center shadow-inner">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                        </div>
                      )}
                    </div>

                    {/* Content Box */}
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] group-hover:bg-white/[0.04] transition-all shadow-sm">
                      <h4
                        className={`text-xs font-bold uppercase tracking-wider ${
                          step.status === "completed" ? "text-white" : "text-white/40"
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-white/20 mt-1 font-medium leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center bg-black/20">
              <span className="text-[8px] text-white/10 font-bold tracking-[0.3em] uppercase">
                Status: Alpha 1.0
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-bold text-white transition-all shadow-sm"
                >
                  Back to Core
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Roadmap;