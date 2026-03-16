import React, { useState, useEffect, useCallback } from "react";
import Canvas from "./components/Canvas";
import VideoFeed from "./components/VideoFeed";
import Toolbar from "./components/Toolbar";
import useMediaPipe from "./hooks/useMediaPipe";
import usePredictor from "./hooks/usePredictor";
import useVoiceCommand from "./hooks/useVoiceCommand";
import './styles/App.css';

function App() {
  const [color, setColor] = useState("#F5D061");
  const [brushSize, setBrushSize] = useState(8);

  const [userName, setUserName] = useState("Sadekul Islam");
  const [userProfession, setUserProfession] = useState("Software Engineer");

  const { points, setPoints, processFrame, landmarks } = useMediaPipe(color, brushSize);
  const { prediction, setPrediction, predictText } = usePredictor();

  // --- Canvas Control Functions ---
  const clearCanvas = useCallback(() => {
    setPoints([]);
    setPrediction("");
  }, [setPoints, setPrediction]);

  const saveCanvas = useCallback(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `air-pen-${userName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [userName]);

  // --- Voice Command Hook ---
  const { isListening, toggleListening } = useVoiceCommand({
    clearCanvas,
    saveCanvas,
    setColor,
    setBrushSize,
    setPrediction
  });

  // --- Predict Text on Canvas changes ---
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas || points.length === 0) return;
    const timeoutId = setTimeout(() => predictText(canvas), 800);
    return () => clearTimeout(timeoutId);
  }, [points, predictText]);

  return (
    <div className="w-screen h-screen bg-[#020617] flex items-center justify-center p-4 font-sans selection:bg-blue-500/30 relative overflow-hidden">

      {/* Background Cinematic Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-blue-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-purple-600/15 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Glass Container */}
      <div className="w-full h-full bg-white/[0.01] backdrop-blur-[40px] rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden z-10">

        {/* Header */}
        <header className="flex justify-between items-center p-8 pb-4">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-transform group-hover:scale-105" />
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter italic">AirPen <span className="font-thin opacity-50 not-italic text-2xl">PRO</span></h1>
              <p className="text-[10px] text-blue-400 font-black tracking-[0.4em] uppercase">LÌ Ào EDITION</p>
            </div>
          </div>
          <nav className="flex gap-12 text-[11px] uppercase tracking-[0.2em] text-white/40 font-black">
            <button className="text-blue-400 border-b-2 border-blue-400 pb-1">Air Draw</button>
            <button className="hover:text-white transition-all">Handwriting</button>
            <button className="hover:text-white transition-all">Settings</button>
          </nav>
          <div className={`flex items-center gap-3 px-5 py-2 rounded-full border backdrop-blur-md transition-all ${isListening ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-blue-500/5 border-blue-400/20'}`}>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isListening ? 'text-red-400' : 'text-blue-400'}`}>
              {isListening ? "Listening..." : "Neural Link"}
            </span>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isListening ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-blue-400 shadow-[0_0_12px_#3b82f6]'}`} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex gap-8 p-6 pt-2 overflow-hidden">

          {/* Left Panel */}
          <div className="w-80 flex flex-col gap-6 h-full">
            <div className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 relative bg-black/60 shadow-2xl group transition-all hover:border-blue-400/30">
              <VideoFeed onFrame={processFrame} />
              <div className="absolute top-4 right-4 text-[8px] font-black bg-blue-500/80 text-white px-2 py-0.5 rounded-sm uppercase tracking-widest">Live</div>
              
              {/* Professional Identity Overlay */}
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/95 via-black/50 to-transparent">
                <div className="flex gap-4 items-start">
                  <div className="w-[2px] h-12 bg-gradient-to-b from-red-600 via-red-500 to-transparent shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
                  <div className="flex flex-col flex-1">
                    <input 
                      type="text" 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-transparent text-white text-xl font-black uppercase tracking-tighter outline-none border-none focus:ring-0 p-0 w-full mb-1 leading-none hover:text-red-400 transition-colors cursor-text"
                      placeholder="ENTER YOUR NAME"
                    />
                    <input 
                      type="text" 
                      value={userProfession} 
                      onChange={(e) => setUserProfession(e.target.value)}
                      className="bg-transparent text-red-500/80 text-[10px] font-black uppercase tracking-[0.3em] outline-none border-none focus:ring-0 p-0 w-full mb-4 leading-none cursor-text"
                      placeholder="YOUR PROFESSION"
                    />

                    {/* Status Stats */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 opacity-70">
                      <div className="flex flex-col">
                        <span className="text-[7px] text-white/40 uppercase font-black tracking-widest leading-none">Status</span>
                        <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider leading-none mt-1">SECURED</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] text-white/40 uppercase font-black tracking-widest leading-none">Protocol</span>
                        <span className="text-[9px] text-white font-bold uppercase tracking-wider leading-none italic mt-1">V1.0.8-X</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] text-white/40 uppercase font-black tracking-widest leading-none">Latency</span>
                        <span className="text-[9px] text-white font-bold uppercase tracking-wider leading-none mt-1">14MS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Sync */}
            <div className="flex-1 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center bg-white/[0.02] backdrop-blur-md relative overflow-hidden group hover:border-blue-400/20 transition-all">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-150 opacity-20" />
                <div className="w-20 h-20 rounded-full border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.1)] bg-blue-500/10 relative z-10 group-hover:scale-110 transition-transform">
                  <span className="text-4xl filter drop-shadow-2xl">🖐️</span>
                </div>
              </div>
              <p className="text-[10px] text-blue-400 uppercase tracking-[0.3em] font-black relative z-10">Tracking Sync</p>
              <div className="mt-6 flex items-end gap-1.5 h-6 relative z-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 bg-blue-500/60 rounded-full animate-wave" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-[8px] text-white/20 mt-4 font-bold tracking-[0.2em]">PROCESSING DATA...</p>
            </div>
          </div>

          {/* Middle Canvas */}
          <div className="flex-1 relative group">
            <div className="absolute inset-[-1px] bg-blue-500/20 rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative w-full h-full rounded-[2.5rem] bg-[#050b18] border border-white/10 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, white 0.8px, transparent 0.8px)', backgroundSize: '30px 30px' }} />
              <div className="absolute inset-0 z-10">
                <Canvas points={points} landmarks={landmarks} />
              </div>

              {/* --- LIVE AI Prediction --- */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-3xl px-8 py-3.5 rounded-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-20">
                <div className="w-2.5 h-2.5 bg-blue-500 rotate-45 animate-pulse" />
                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">
                  AI Prediction: 
                  <span className="text-[#F5D061] font-black tracking-normal ml-4 uppercase text-lg italic drop-shadow-[0_0_10px_rgba(245,208,97,0.3)]">
                    {prediction || "Scanning..."}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel Toolbar */}
          <div className="w-84 rounded-[2.5rem] bg-white/[0.03] border border-white/10 p-8 flex flex-col backdrop-blur-2xl shadow-2xl">
            <Toolbar
              clearCanvas={clearCanvas}
              saveCanvas={saveCanvas}
              currentColor={color}
              setCurrentColor={setColor}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
            />
          </div>

        </main>

        {/* Footer */}
        <footer className="mb-8 flex justify-center h-20">
          <div className="bg-[#0a1221]/60 backdrop-blur-3xl px-14 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_15px_35px_rgba(0,0,0,0.3)]">
            <button className="flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-widest hover:text-blue-400 transition-all">
              <span className="text-xl">🖋️</span> Draw
            </button>
            <button onClick={clearCanvas} className="flex items-center gap-3 text-white/30 font-black uppercase text-[10px] tracking-widest hover:text-red-400 transition-all">
              <span className="text-xl">🧽</span> Erase
            </button>

            <button 
              onClick={toggleListening} 
              className={`flex items-center gap-3 font-black uppercase text-[10px] tracking-widest transition-all ${isListening ? 'text-red-500 animate-pulse scale-105' : 'text-white/30 hover:text-emerald-400'}`}
            >
              <span className="text-xl">{isListening ? '🔊' : '🎤'}</span> Voice
            </button>

            <div className="h-8 w-px bg-white/10" />
            <button onClick={saveCanvas} className="flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-widest bg-blue-600/20 px-6 py-2 rounded-lg border border-blue-500/30 hover:bg-blue-600/40 transition-all">
              Export <span className="text-[8px] opacity-40 ml-1">v1.0</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default App;