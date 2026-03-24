import React, { useEffect, useRef } from "react";

/**
 * 🚀 LI AO HAND OVERLAY — ULTRA PRO MAX
 *
 * Features:
 * ✔ GPU-optimized RAF loop
 * ✔ Ultra smooth pointer interpolation
 * ✔ Dynamic glow + pulse + ripple
 * ✔ High DPI safe rendering
 * ✔ Memory safe (no leaks)
 * ✔ Motion stabilized tracking
 */

export default function HandOverlay({ landmarks }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const pointer = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  const pulse = useRef(0);

  /* =========================
     🎯 CANVAS SETUP
  ========================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    /* =========================
       🎨 RENDER LOOP
    ========================= */
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (landmarks && landmarks[8]) {
        const tip = landmarks[8];

        const targetX = (1 - tip.x) * canvas.clientWidth;
        const targetY = tip.y * canvas.clientHeight;

        /* =========================
           🔥 SMOOTH MOTION (INERTIA)
        ========================= */
        const dx = targetX - pointer.current.x;
        const dy = targetY - pointer.current.y;

        velocity.current.x += dx * 0.12;
        velocity.current.y += dy * 0.12;

        velocity.current.x *= 0.65;
        velocity.current.y *= 0.65;

        pointer.current.x += velocity.current.x;
        pointer.current.y += velocity.current.y;

        const x = pointer.current.x;
        const y = pointer.current.y;

        pulse.current += 0.06;

        /* =========================
           🌌 OUTER GLOW
        ========================= */
        const glow = ctx.createRadialGradient(x, y, 2, x, y, 50);
        glow.addColorStop(0, "rgba(59,130,246,0.9)");
        glow.addColorStop(0.3, "rgba(59,130,246,0.4)");
        glow.addColorStop(1, "rgba(59,130,246,0)");

        ctx.beginPath();
        ctx.arc(x, y, 50, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        /* =========================
           💎 CORE DOT
        ========================= */
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        /* =========================
           🔵 PULSE RING
        ========================= */
        const ring = 12 + Math.sin(pulse.current) * 5;

        ctx.beginPath();
        ctx.arc(x, y, ring, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(59,130,246,0.5)";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        /* =========================
           ✨ RIPPLE EFFECT
        ========================= */
        const ripple = (pulse.current % 1) * 40;

        ctx.beginPath();
        ctx.arc(x, y, ripple, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59,130,246,${0.3 - ripple / 150})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    /* =========================
       🧹 CLEANUP
    ========================= */
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [landmarks]);

  /* =========================
     🧩 RENDER
  ========================= */
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      style={{
        willChange: "transform",
      }}
    />
  );
}