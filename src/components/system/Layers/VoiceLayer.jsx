import { useEffect, useRef, useCallback } from "react";

export default function VoiceLayer({
  voiceText,
  brushColor = "#00E5FF",
  clearSignal = false,
  undoSignal = false,
  redoSignal = false
}) {
  const canvasRef = useRef(null);
  
  // Persistence Refs
  const linesRef = useRef([]); 
  const lineBufferRef = useRef(""); 
  const redoStackRef = useRef([]); 

  /**
   * ⚡ CORE RENDER ENGINE
   * Handles high-fidelity text rendering with neon glow
   */
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Styling Configuration
    ctx.font = "32px 'Patrick Hand', cursive";
    ctx.fillStyle = brushColor;
    ctx.shadowColor = brushColor;
    ctx.shadowBlur = 10;
    ctx.textBaseline = "top";

    const padding = 30;
    const lineHeight = 42;

    // Render Committed Lines
    linesRef.current.forEach((line, index) => {
      ctx.fillText(line, padding, padding + index * lineHeight);
    });

    // Render Active Buffer
    if (lineBufferRef.current) {
      ctx.fillText(
        lineBufferRef.current,
        padding,
        padding + linesRef.current.length * lineHeight
      );
    }

    ctx.restore();
  }, [brushColor]);

  /**
   * 🎙️ TEXT PROCESSING LOGIC
   * Calculates word-wrapping and commits lines to history
   */
  useEffect(() => {
    if (!voiceText) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.font = "32px 'Patrick Hand', cursive";

    const padding = 60;
    const maxWidth = (canvas.width / (window.devicePixelRatio || 1)) - padding;

    const words = voiceText.split(" ");
    words.forEach(word => {
      const testLine = lineBufferRef.current 
        ? lineBufferRef.current + " " + word 
        : word;
      
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth) {
        if (lineBufferRef.current) {
          linesRef.current.push(lineBufferRef.current);
        }
        lineBufferRef.current = word;
      } else {
        lineBufferRef.current = testLine;
      }
    });

    drawCanvas();
  }, [voiceText, drawCanvas]);

  /**
   * ⚡ SYSTEM ACTION DISPATCHER
   * Processes Undo, Redo, and Clear signals
   */
  useEffect(() => {
    // 1. CLEAR ACTION
    if (clearSignal) {
      linesRef.current = [];
      lineBufferRef.current = "";
      redoStackRef.current = [];
      drawCanvas();
    }
    
    // 2. UNDO ACTION
    if (undoSignal) {
      if (lineBufferRef.current) {
        redoStackRef.current.push({ type: 'buffer', text: lineBufferRef.current });
        lineBufferRef.current = "";
      } else if (linesRef.current.length > 0) {
        const lastLine = linesRef.current.pop();
        redoStackRef.current.push({ type: 'line', text: lastLine });
      }
      drawCanvas();
    }

    // 3. REDO ACTION
    if (redoSignal) {
      const recovery = redoStackRef.current.pop();
      if (recovery) {
        if (lineBufferRef.current) {
          linesRef.current.push(lineBufferRef.current);
        }
        lineBufferRef.current = recovery.text;
        drawCanvas();
      }
    }
  }, [clearSignal, undoSignal, redoSignal, drawCanvas]);

  /**
   * 📐 RESPONSIVE VIEWPORT ENGINE
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawCanvas();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawCanvas]);

  return (
    <canvas
      id="voice-canvas"
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50 transition-opacity duration-300"
      style={{ opacity: voiceText ? 1 : 0.8 }}
    />
  );
}