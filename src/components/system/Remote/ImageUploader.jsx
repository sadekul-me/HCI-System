import React, { useState } from "react";
// ডিলিট করা uploadToHCI এর বদলে এখন আমরা সরাসরি Firestore এ পাঠাবো
import { uploadToFirestore } from "../../../features/upload/uploadToFirestore"; 

const ImageUploader = () => {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ৫ এমবি লিমিট ঠিক আছে, তবে Firestore এ পাঠাতে আমরা কমপ্রেস করে নেবো
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large! Keep it under 5MB.");
      return;
    }

    setStatus("beaming");
    setProgress(10);

    try {
      // 🔥 এখন সরাসরি Firestore এ কমপ্রেসড ডাটা বিম হবে
      await uploadToFirestore(file, (p) => setProgress(p)); 

      setStatus("success");
      setProgress(100);

      setTimeout(() => {
        setStatus("idle");
        setProgress(0);
      }, 3000);

    } catch (err) {
      console.error("❌ Beam Error:", err);
      alert(err.message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-4">
      <label className={`w-full h-56 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 bg-[#020617]/60 backdrop-blur-xl shadow-2xl relative overflow-hidden
        ${status === "beaming" ? "border-cyan-500 shadow-cyan-500/20" : "border-white/10 hover:border-cyan-500/40"}`}>

        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
          disabled={status === "beaming"} 
        />

        {/* Progress Bar Overlay */}
        {status === "beaming" && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        )}

        {status === "idle" && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-cyan-500/5 flex items-center justify-center text-cyan-500 mb-4 text-4xl group-hover:scale-110 transition-transform">
              📸
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">
              Tap to Beam
            </span>
          </div>
        )}

        {status === "beaming" && (
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-4 animate-pulse">📡</span>
            <span className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.3em]">
              Beaming {progress}%
            </span>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-3xl mb-3">✨</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">
              Beam Complete
            </span>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center text-red-500">
            <span className="text-3xl mb-3">⚠️</span>
            <span className="text-[10px] font-bold uppercase">
              System Error
            </span>
          </div>
        )}
      </label>

      {/* Footer Branding */}
      <p className="text-[8px] text-white/20 font-bold uppercase tracking-[0.5em]">
        Lì Ào Engine v3.0
      </p>
    </div>
  );
};

export default ImageUploader;