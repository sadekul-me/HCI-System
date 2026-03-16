import { useState, useCallback, useRef } from "react";
import Tesseract from "tesseract.js";

export default function usePredictor() {
  const [prediction, setPrediction] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const lastProcessedPoints = useRef(0);

  const predictText = useCallback(async (canvasElement) => {
    if (!canvasElement || isProcessing) return;

    // Protibar processing na kore, jokhon drawing pause hoy tokhon kora bhalo
    setIsProcessing(true);

    try {
      // Tesseract.js use kore canvas theke text read kora
      const { data: { text } } = await Tesseract.recognize(
        canvasElement,
        'eng',
        { logger: m => {} } // Progress log off rakha holo speed-er jonno
      );

      if (text.trim()) {
        setPrediction(text.toUpperCase().trim());
      }
    } catch (error) {
      console.error("Prediction Error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  return { prediction, predictText, isProcessing };
}