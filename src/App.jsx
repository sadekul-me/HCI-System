import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import NeuralInterface from "./components/NeuralInterface/NeuralInterface";
import RemotePortal from "./components/system/Remote/RemotePortal";
import "./styles/app.css";

function App() {
  /* =========================
      📱 DEVICE STATE
  ========================= */
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const [isBooting, setIsBooting] = useState(true);

  const resizeTimeoutRef = useRef(null);
  const bootTimeoutRef = useRef(null);

  /* =========================
      🧠 RESPONSIVE ENGINE
  ========================= */
  useEffect(() => {
    const checkView = () => {
      clearTimeout(resizeTimeoutRef.current);

      resizeTimeoutRef.current = setTimeout(() => {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
      }, 120); // smoother + faster
    };

    checkView();
    window.addEventListener("resize", checkView);

    /* 🔥 Boot system */
    bootTimeoutRef.current = setTimeout(() => {
      setIsBooting(false);
    }, 1000);

    /* 🔍 DEV LOG */
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 LI AO ENGINE: ${
          window.innerWidth < 1024 ? "MOBILE" : "DESKTOP"
        } MODE`
      );
    }

    return () => {
      window.removeEventListener("resize", checkView);
      clearTimeout(resizeTimeoutRef.current);
      clearTimeout(bootTimeoutRef.current);
    };
  }, []);

  /* =========================
      🧠 BOOT SCREEN
  ========================= */
  if (isBooting) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4"
        >
          <h1 className="text-lg sm:text-xl md:text-2xl tracking-[0.3em] sm:tracking-[0.4em] font-black text-white/80">
            LI AO SYSTEM
          </h1>

          <p className="text-[10px] sm:text-xs mt-2 text-white/30 tracking-widest">
            INITIALIZING NEURAL CORE...
          </p>

          {/* Loading Bar */}
          <div className="mt-6 w-32 sm:w-40 h-[2px] bg-white/10 overflow-hidden mx-auto">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  /* =========================
      🧩 MAIN APP
  ========================= */
  return (
    <div className="app-container bg-[#020617] w-screen h-screen overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        
        {isMobile ? (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full h-full"
          >
            <RemotePortal />
          </motion.div>
        ) : (
          <motion.div
            key="desktop"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full h-full"
          >
            <NeuralInterface />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default App;