import { motion, AnimatePresence } from "framer-motion";

export default function Prediction({ prediction, confidence }) {
  if (!prediction) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="fixed top-8 right-8 z-40"
      >
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
          
          {/* Label */}
          <p className="text-xs text-gray-400 mb-1">
            AI Prediction
          </p>

          {/* Result */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-white">
              {prediction}
            </span>

            {confidence && (
              <span className="text-sm text-emerald-400">
                {(confidence * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}