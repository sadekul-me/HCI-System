import React, { useEffect, useRef } from "react";

export default function HandOverlay({ landmarks }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (landmarks) {
      // 1. Index Finger Tip (Landmark 8)
      const indexTip = landmarks[8];
      const x = (1 - indexTip.x) * canvas.width; // Mirroring handle kora
      const y = indexTip.y * canvas.height;

      // Draw Neon Pointer (Ager design-er sathe match kore)
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(59, 130, 246, 0.5)"; // Blue glow
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff"; // White core
      ctx.fill();

      // Outer Ring Animation Effect
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [landmarks]);

  return (
    <canvas
      ref={canvasRef}
      width={640} // Video width-er sathe match koro
      height={480} // Video height-er sathe match koro
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
    />
  );
}