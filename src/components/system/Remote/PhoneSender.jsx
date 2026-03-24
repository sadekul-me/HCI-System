import React from "react";
import ImageUploader from "./components/ui/ImageUploader/ImageUploader"; 

export default function PhoneSender() {
  return (
    <div className="min-h-screen w-full bg-[#020617] text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-cyan-500/30">
      
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header Section */}
      <div className="text-center mb-12 relative z-10">
        <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4 backdrop-blur-md">
          <span className="text-[9px] font-black tracking-[0.3em] text-cyan-400 uppercase">
            HCI Remote Portal
          </span>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter">
          NEURAL<span className="text-cyan-500">LINK</span>
        </h1>
        <p className="text-white/30 text-[10px] mt-2 uppercase tracking-[0.4em] font-medium">
          Asset Beaming System v2.0
        </p>
      </div>

      {/* The Magic Component */}
      <div className="w-full max-w-sm relative z-10">
        <div className="p-1 rounded-[32px] bg-gradient-to-b from-cyan-500/20 to-transparent">
          <ImageUploader />
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-16 grid grid-cols-3 gap-8 text-center opacity-20 relative z-10">
        <div className="flex flex-col items-center">
          <p className="text-xl">📸</p>
          <p className="text-[7px] font-black uppercase mt-2 tracking-widest">Capture</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xl">📡</p>
          <p className="text-[7px] font-black uppercase mt-2 tracking-widest">Beam</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xl">🎨</p>
          <p className="text-[7px] font-black uppercase mt-2 tracking-widest">Render</p>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="absolute bottom-8 text-[9px] font-bold text-white/10 tracking-[0.3em] uppercase">
        Designed by Sadik Pro & Lì Ào
      </footer>
    </div>
  );
}