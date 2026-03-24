import { useState, useCallback, useRef } from "react";

export default function useVoiceCommand({
  clearCanvas,
  saveCanvas,
  undoCanvas,   // ✅ NEW
  redoCanvas,   // ✅ NEW
  setColor,
  setBrushSize,
  setPrediction,
  setVoiceText,
}) {
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const lastCommandRef = useRef("");
  const cooldownRef = useRef(false);

  /* ===========================
     🎨 COLOR MAP
  =========================== */
  const colorMap = {
    yellow: "#F5D061",
    blue: "#3b82f6",
    red: "#ef4444",
    green: "#22c55e",
    purple: "#a855f7",
    white: "#ffffff",
    cyan: "#06b6d4",
    orange: "#f97316",
    pink: "#ec4899",
    gray: "#94a3b8",
  };

  /* ===========================
     🧠 COMMAND PROCESSOR
  =========================== */
  const processCommand = useCallback(
    (text) => {
      if (!text) return;

      if (cooldownRef.current || lastCommandRef.current === text) return;

      cooldownRef.current = true;
      lastCommandRef.current = text;

      let handled = false;

      /* 🧠 ACTION COMMAND (PRIORITY FIRST) */
      if (text.includes("undo")) {
        undoCanvas?.();
        setPrediction?.("UNDO");
        handled = true;
      } else if (text.includes("redo")) {
        redoCanvas?.();
        setPrediction?.("REDO");
        handled = true;
      } else if (text.includes("clear") || text.includes("erase")) {
        clearCanvas?.();
        setPrediction?.("BOARD CLEARED");
        handled = true;
      } else if (
        text.includes("save") ||
        text.includes("download") ||
        text.includes("export")
      ) {
        saveCanvas?.();
        setPrediction?.("SAVED");
        handled = true;
      }

      /* 🎨 COLOR COMMAND */
      if (!handled) {
        for (const name in colorMap) {
          if (text.includes(name)) {
            setColor(colorMap[name]);
            setPrediction?.(`COLOR: ${name.toUpperCase()}`);
            handled = true;
            break;
          }
        }
      }

      /* ✍️ BRUSH SIZE */
      if (!handled) {
        if (text.includes("big") || text.includes("thick")) {
          setBrushSize(40);
          setPrediction?.("BRUSH: MAX");
          handled = true;
        } else if (text.includes("small") || text.includes("thin")) {
          setBrushSize(4);
          setPrediction?.("BRUSH: MIN");
          handled = true;
        } else if (text.includes("medium")) {
          setBrushSize(12);
          setPrediction?.("BRUSH: MEDIUM");
          handled = true;
        }
      }

      /* 🧠 FALLBACK */
      if (!handled) {
        setPrediction?.(
          text.charAt(0).toUpperCase() + text.slice(1)
        );
      }

      setTimeout(() => {
        cooldownRef.current = false;
      }, 600);
    },
    [
      clearCanvas,
      saveCanvas,
      undoCanvas,
      redoCanvas,
      setColor,
      setBrushSize,
      setPrediction,
    ]
  );

  /* ===========================
     🎙️ START LISTENING
  =========================== */
  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Use Chrome for Voice AI 🚀");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      console.log("🎙️ Voice AI Activated");
    };

    recognition.onend = () => {
      if (isListening) recognition.start();
      else setIsListening(false);
    };

    recognition.onerror = (e) => {
      console.error("Speech Error:", e.error);
    };

    recognition.onresult = (event) => {
      const result =
        event.results[event.results.length - 1][0].transcript
          .toLowerCase()
          .trim();

      setVoiceText?.(result);

      /* 🔥 WAKE WORD SYSTEM */
      const wakeWords = ["li ao", "leo", "liao", "lee ao", "leao"];

      const hasWakeWord = wakeWords.some((w) =>
        result.includes(w)
      );

      if (hasWakeWord) {
        const cleaned = wakeWords.reduce(
          (txt, w) => txt.replace(w, ""),
          result
        ).trim();

        processCommand(cleaned);
      } else {
        processCommand(result);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, processCommand, setVoiceText]);

  /* ===========================
     ⛔ STOP LISTENING
  =========================== */
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  /* ===========================
     🔄 TOGGLE
  =========================== */
  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    toggleListening,
    startListening,
    stopListening,
  };
}