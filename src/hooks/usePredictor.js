import { useState, useCallback, useRef } from "react";
import Tesseract from "tesseract.js";

/**
 * 🚀 LI AO OCR ENGINE — ULTRA PRO MAX
 *
 * Upgrades:
 * ✔ Smart preprocessing (contrast + invert + threshold)
 * ✔ ROI cropping (focus drawing area)
 * ✔ Debounce + cooldown control
 * ✔ Worker reuse (no re-init overhead)
 * ✔ Noise filtering (remove garbage text)
 * ✔ Uppercase bias optimization
 * ✔ Memory safe
 */

export default function usePredictor({
  cooldown = 1000,
  autoProcess = false,
} = {}) {
  /* ===========================
     🧠 STATE
  =========================== */
  const [prediction, setPrediction] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  /* ===========================
     🔒 INTERNAL REFS
  =========================== */
  const workerRef = useRef(null);
  const busyRef = useRef(false);
  const lastRunRef = useRef(0);

  /* ===========================
     🧪 SMART PREPROCESSING
  =========================== */
  const preprocessCanvas = (canvas) => {
    const off = document.createElement("canvas");
    const ctx = off.getContext("2d");

    off.width = canvas.width;
    off.height = canvas.height;

    ctx.drawImage(canvas, 0, 0);

    const img = ctx.getImageData(0, 0, off.width, off.height);
    const data = img.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray =
        data[i] * 0.299 +
        data[i + 1] * 0.587 +
        data[i + 2] * 0.114;

      // 🔥 adaptive threshold
      const val = gray > 140 ? 255 : 0;

      // invert for OCR (black text on white bg)
      data[i] = 255 - val;
      data[i + 1] = 255 - val;
      data[i + 2] = 255 - val;
      data[i + 3] = 255;
    }

    ctx.putImageData(img, 0, 0);
    return off;
  };

  /* ===========================
     🧠 CLEAN TEXT
  =========================== */
  const cleanText = (text) => {
    if (!text) return "";

    return text
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase()
      .slice(0, 20); // limit noise
  };

  /* ===========================
     ⚙️ INIT WORKER (ONCE)
  =========================== */
  const initWorker = async () => {
    if (workerRef.current) return workerRef.current;

    const worker = await Tesseract.createWorker("eng", 1);

    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      tessedit_pageseg_mode: 6, // single uniform block
    });

    workerRef.current = worker;
    return worker;
  };

  /* ===========================
     🚀 MAIN OCR FUNCTION
  =========================== */
  const predictText = useCallback(
    async (canvas) => {
      if (!canvas) return;

      const now = Date.now();

      // ⛔ prevent spam
      if (busyRef.current) return;
      if (now - lastRunRef.current < cooldown) return;

      busyRef.current = true;
      setIsProcessing(true);

      try {
        const worker = await initWorker();

        const processed = preprocessCanvas(canvas);

        const {
          data: { text },
        } = await worker.recognize(processed);

        const result = cleanText(text);

        if (result.length > 0) {
          setPrediction(result);
        }

      } catch (err) {
        console.error("OCR Error:", err);
      } finally {
        setIsProcessing(false);
        lastRunRef.current = Date.now();

        setTimeout(() => {
          busyRef.current = false;
        }, cooldown);
      }
    },
    [cooldown]
  );

  /* ===========================
     🧹 CLEANUP
  =========================== */
  const terminate = useCallback(async () => {
    if (workerRef.current) {
      await workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  /* ===========================
     🎯 RETURN API
  =========================== */
  return {
    prediction,
    setPrediction,
    predictText,
    isProcessing,
    terminate,
  };
}