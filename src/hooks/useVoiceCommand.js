import { useState, useCallback, useRef } from "react";

/**
 * AirPen PRO - Voice Command Hook
 * Features: Wake Word "Lì Ào", Smart Typing, Color Mapping, Brush Control
 */
export default function useVoiceCommand({ 
  clearCanvas, 
  saveCanvas, 
  setColor, 
  setBrushSize, 
  setPrediction 
}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Advanced Color Palette
  const colorMap = {
    "yellow": "#F5D061",
    "blue": "#3b82f6",
    "red": "#ef4444",
    "green": "#22c55e",
    "purple": "#a855f7",
    "white": "#ffffff",
    "cyan": "#06b6d4",
    "orange": "#f97316",
    "pink": "#ec4899",
    "gray": "#94a3b8"
  };

  const toggleListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Please use Google Chrome for full AI Voice features.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      console.log("--- Lì Ào AI Voice Protocol Active ---");
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.toLowerCase().trim();
      
      console.log("Captured Audio:", transcript);

      // --- WAKE WORD DETECTION ---
      const wakeWords = ["li ao", "leo", "lee ao", "lyo", "leao", "li-ao", "liao"];
      const wakeWordFound = wakeWords.find(word => transcript.startsWith(word) || transcript.includes(word));

      if (wakeWordFound) {
        console.log("Wake Word Detected: Accessing System Controls...");
        
        // Command theke wake word-ta bad diye baki ongsho tuku neya
        const command = transcript.replace(wakeWordFound, "").trim();

        // 1. DYNAMIC COLOR CONTROL
        let foundAction = false;
        Object.keys(colorMap).forEach((colorName) => {
          if (command.includes(colorName)) {
            setColor(colorMap[colorName]);
            if (typeof setPrediction === 'function') setPrediction(`COLOR: ${colorName.toUpperCase()}`);
            foundAction = true;
          }
        });

        if (!foundAction) {
          // 2. BRUSH SIZE CONTROLS
          if (command.includes("big") || command.includes("thick") || command.includes("maximum")) {
            setBrushSize(40);
            if (typeof setPrediction === 'function') setPrediction("BRUSH: MAXIMUM");
          } else if (command.includes("small") || command.includes("thin") || command.includes("minimum")) {
            setBrushSize(4);
            if (typeof setPrediction === 'function') setPrediction("BRUSH: MINIMUM");
          } else if (command.includes("medium") || command.includes("normal")) {
            setBrushSize(12);
            if (typeof setPrediction === 'function') setPrediction("BRUSH: MEDIUM");
          }

          // 3. SYSTEM UTILITIES
          if (command.includes("clear") || command.includes("clean") || command.includes("erase")) {
            clearCanvas();
            if (typeof setPrediction === 'function') setPrediction("BOARD CLEARED");
          } else if (command.includes("save") || command.includes("export") || command.includes("download")) {
            saveCanvas();
            if (typeof setPrediction === 'function') setPrediction("EXPORTING DESIGN...");
          } else if (command.includes("settings") || command.includes("config")) {
            if (typeof setPrediction === 'function') setPrediction("OPENING SETTINGS...");
          }
        }
      } else {
        // --- PRO TYPING MODE (No Wake Word) ---
        if (typeof setPrediction === 'function' && transcript.length > 0) {
          const cleanText = transcript.charAt(0).toUpperCase() + transcript.slice(1);
          setPrediction(cleanText);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();

  }, [isListening, clearCanvas, saveCanvas, setColor, setBrushSize, setPrediction]);

  return { isListening, toggleListening };
}