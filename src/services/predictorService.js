import { useState, useCallback } from "react";
import Tesseract from "tesseract.js";

export default function usePredictor() {
  const [prediction, setPrediction] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const predictText = useCallback(async (canvasElement) => {
    if (!canvasElement || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // Step 1: Create a temporary canvas for better OCR
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = canvasElement.width;
      tempCanvas.height = canvasElement.height;

      // Step 2: Tesseract prefers black text on white background
      tempCtx.fillStyle = "white";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Step 3: Draw the neon content on top
      tempCtx.filter = "brightness(0) contrast(200%)"; // Convert colors to sharp black
      tempCtx.drawImage(canvasElement, 0, 0);

      // Step 4: Run OCR
      const { data: { text } } = await Tesseract.recognize(tempCanvas, 'eng');
      
      if (text && text.trim().length > 0) {
        setPrediction(text.trim().toUpperCase());
      }
    } catch (err) {
      console.error("OCR Prediction Error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  return { prediction, setPrediction, predictText, isProcessing };
}