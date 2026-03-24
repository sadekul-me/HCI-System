import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";

/**
 * 🚀 LÌ ÀO NEURAL IMAGE WIDGET
 * Features: Drag, Zoom (Scroll), Delete (Corner), Initial Small Scale
 */
const ImageWidget = ({ asset }) => {
  const [scale, setScale] = useState(1);

  // Firestore থেকে ডিলিট করার লজিক
  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "images", asset.id));
      console.log("🗑️ Asset Removed");
    } catch (err) {
      console.error("❌ Delete Error:", err);
    }
  };

  // মাউস হুইল দিয়ে জুম লজিক
  const handleWheel = (e) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.1, 4)); // Max 4x
    } else {
      setScale((prev) => Math.max(prev - 0.1, 0.4)); // Min 0.4x
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      // 🎯 INITIAL SMALL START: ইমেজটা প্রথমবার ছোট হয়ে (scale: 0.3) আসবে
      initial={{ opacity: 0, scale: 0.3, x: asset.x || 100, y: asset.y || 100 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      onWheel={handleWheel}
      className="absolute pointer-events-auto cursor-grab active:cursor-grabbing group"
      style={{ zIndex: 100 }}
    >
      <div className="relative">
        {/* ❌ Delete Button (Top-Right) */}
        <button
          onClick={handleDelete}
          className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full 
                     flex items-center justify-center shadow-2xl border-2 border-white 
                     opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-[110] font-bold"
        >
          ✕
        </button>

        {/* 🖼️ Image Container with Zoom */}
        <motion.div
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative"
        >
          <img
            src={asset.image || asset.url}
            alt="neural-asset"
            className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10"
            style={{
              width: "200px", // ✅ ছোট সাইজে স্টার্ট
              height: "auto",
              display: "block",
              pointerEvents: "none" 
            }}
          />
          
          {/* Zoom Percentage Indicator */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2 py-0.5 
                          rounded text-[9px] text-cyan-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            ZOOM: {Math.round(scale * 100)}%
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ImageLayer = ({ images = [] }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {images.map((img) => (
          <ImageWidget key={img.id} asset={img} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ImageLayer;