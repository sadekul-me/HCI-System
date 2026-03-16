import { FaTrash, FaSave } from "react-icons/fa";
import { motion } from "framer-motion";

const COLORS = [
  { name: "White", code: "#FFFFFF" },
  { name: "Red", code: "#FF3131" },
  { name: "Green", code: "#10B981" },
  { name: "Gold", code: "#F5D061" },
  { name: "Neon Green", code: "#39FF14" },
  { name: "Electric Blue", code: "#1F51FF" },
];

export default function Toolbar({
  clearCanvas,
  saveCanvas,
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize,
}) {
  return (
    <div className="flex flex-col h-full gap-8 p-4 bg-black/20 backdrop-blur-md">
      {/* COLOR SECTION */}
      <div className="flex flex-col gap-4">
        <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
          Color
        </label>
        <div className="grid grid-cols-3 gap-3">
          {COLORS.map((color) => {
            const active = currentColor === color.code;
            return (
              <motion.button
                key={color.code}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentColor(color.code)}
                className={`aspect-square rounded-full border-2 transition-all ${
                  active ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "border-transparent opacity-80"
                }`}
                style={{ backgroundColor: color.code }}
              />
            );
          })}
        </div>
      </div>

      {/* BRUSH SIZE SECTION */}
      <div className="flex flex-col gap-4">
        <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
          Size
        </label>
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min="2"
            max="25"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-white/20 font-mono">
            <span>2px</span>
            <span className="text-blue-400">{brushSize}px</span>
            <span>25px</span>
          </div>
        </div>
      </div>

      {/* TOOLS SECTION */}
      <div className="flex flex-col gap-3 mt-auto">
         <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
           Tools
        </label>
        <div className="grid grid-cols-1 gap-2">
            <button 
                onClick={clearCanvas}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center gap-3 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all"
            >
                <FaTrash size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">Clear</span>
            </button>
            
            <button 
                onClick={saveCanvas}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center gap-3 text-white/60 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
            >
                <FaSave size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">Save</span>
            </button>
        </div>
      </div>
    </div>
  );
}