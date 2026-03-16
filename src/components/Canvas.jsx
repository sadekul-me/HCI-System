import { useEffect, useRef } from "react";
import { drawConnectors } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

/**
 * AirPen PRO - High-Performance Canvas Engine
 * Optimized for: GPU efficiency, Smooth Stroke, and Real-time Voice Sync
 */
export default function Canvas({ points, landmarks }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      // Clear with transparency for better blending
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- 1. NEURAL HAND LANDMARKS (Mirrored & Glow) ---
      if (Array.isArray(landmarks) && landmarks.length > 0) {
        const mirrored = landmarks.map(p => ({ ...p, x: 1 - p.x }));
        const tip = mirrored[8]; // Index finger tip

        if (tip) {
          const x = tip.x * canvas.width;
          const y = tip.y * canvas.height;

          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = "#3b82f6";
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#3b82f6";
          ctx.fill();
          ctx.restore();
        }

        drawConnectors(ctx, mirrored, HAND_CONNECTIONS, {
          color: "rgba(59, 130, 246, 0.15)",
          lineWidth: 1.5,
        });
      }

      // --- 2. ADVANCED STROKE ENGINE (Bezier Smoothing) ---
      if (Array.isArray(points) && points.length > 2) {
        const drawLayer = (isGlow) => {
          let drawingActive = false;

          for (let i = 1; i < points.length; i++) {
            const p = points[i - 1];
            const nextP = points[i];
            
            if (!p || !nextP || !p.isDrawing || !nextP.isDrawing) {
              if (drawingActive) {
                ctx.stroke();
                drawingActive = false;
              }
              continue;
            }

            if (!drawingActive) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              drawingActive = true;
            }

            // Speed-based dynamic thickness logic
            const dx = nextP.x - p.x;
            const dy = nextP.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const baseSize = p.size || 8;
            const dynamicWidth = Math.max(2.5, baseSize * (1 / (dist / 8 + 0.5)));

            ctx.lineWidth = isGlow ? dynamicWidth : dynamicWidth * 0.3;
            ctx.strokeStyle = isGlow ? (p.color || "#F5D061") : "rgba(255, 255, 255, 0.9)";
            
            if (isGlow) {
              ctx.shadowBlur = Math.min(15, baseSize * 1.5);
              ctx.shadowColor = p.color || "#F5D061";
            } else {
              ctx.shadowBlur = 0;
            }

            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            
            const midX = (p.x + nextP.x) / 2;
            const midY = (p.y + nextP.y) / 2;
            ctx.quadraticCurveTo(p.x, p.y, midX, midY);
          }
          if (drawingActive) ctx.stroke();
        };

        drawLayer(true);  // Cinematic Glow Layer
        drawLayer(false); // Core Precision Layer
      }

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [points, landmarks]); // Optimized dependencies

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))' }}
    />
  );
}