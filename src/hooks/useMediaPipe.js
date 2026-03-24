import { useEffect, useRef, useState, useCallback } from "react";
import { createHandTracker } from "../services/hciEngine";
import { detectPinch } from "../features/gesture/gestureEngine";

/**
 * 🚀 LÌ ÀO (利奥) MEDIAPIPE ENGINE — ULTRA PRO MAX v2.5
 * * Upgrades:
 * ✔ Memory-Safe Gate (Prevents BindingError)
 * ✔ Fast Cleanup (Stable Tracker Shutdown)
 * ✔ Async Frame Locking (Zero-Ghosting)
 */

export default function useMediaPipe({
  color,
  brushSize,
  mirror = false,
  enabled = true,
  canvasRef = null,
}) {
  /* ===========================
      🧠 STATE
  =========================== */
  const [points, setPoints] = useState([]);
  const [landmarks, setLandmarks] = useState(null);

  /* ===========================
      🔒 INTERNAL REFS
  =========================== */
  const trackerRef = useRef(null);
  const initializingRef = useRef(false);
  const isProcessingRef = useRef(false); // 🔥 নতুন: এরর আটকানোর মূল চাবিকাঠি

  const rafRef = useRef(null);
  const lastFrameTime = useRef(0);

  const bufferRef = useRef([]);

  const lastPointRef = useRef({ x: 0, y: 0 });
  const lastDrawRef = useRef(false);

  const colorRef = useRef(color);
  const sizeRef = useRef(brushSize);

  /* ===========================
      🎨 SYNC PROPS
  =========================== */
  useEffect(() => {
    colorRef.current = color;
    sizeRef.current = brushSize;
  }, [color, brushSize]);

  /* ===========================
      🧠 SMART SMOOTHING ENGINE
  =========================== */
  const smoothPoint = useCallback((tx, ty) => {
    const prev = lastPointRef.current;

    const dx = tx - prev.x;
    const dy = ty - prev.y;
    const dist = Math.hypot(dx, dy);

    // 🚫 JITTER FILTER
    if (dist < 0.5) return null;

    // 🎯 Velocity adaptive smoothing
    let alpha = 0.2;
    if (dist > 25) alpha = 0.5;
    else if (dist > 12) alpha = 0.35;

    const x = prev.x + dx * alpha;
    const y = prev.y + dy * alpha;

    lastPointRef.current = { x, y };

    return { x, y, dist };
  }, []);

  /* ===========================
      🎯 RESULT HANDLER
  =========================== */
  const onResults = useCallback(
    (results) => {
      // 🔥 ফ্রেম প্রসেস শেষ, এখন গেট খুলে দাও
      isProcessingRef.current = false;

      if (!enabled) return;

      const hands = results.multiHandLandmarks;

      /* ❌ NO HAND */
      if (!hands || hands.length === 0) {
        setLandmarks(null);

        if (lastDrawRef.current) {
          bufferRef.current.push({ isDrawing: false });
          lastDrawRef.current = false;
        }

        return;
      }

      const hand = hands[0];
      setLandmarks(hand);

      if (!canvasRef?.current) return;

      const rect = canvasRef.current.getBoundingClientRect();

      const rawX = hand[8].x;
      const rawY = hand[8].y;

      const tx = mirror
        ? (1 - rawX) * rect.width
        : rawX * rect.width;

      const ty = rawY * rect.height;

      const smoothed = smoothPoint(tx, ty);
      if (!smoothed) return;

      const { x, y, dist } = smoothed;

      const pinching = detectPinch(hand);

      /* ✍️ DRAW STATE MACHINE */
      if (pinching) {
        if (dist > 0.3 || !lastDrawRef.current) {
          bufferRef.current.push({
            x,
            y,
            isDrawing: true,
            color: colorRef.current,
            size: sizeRef.current,
          });

          // 🔒 MEMORY CONTROL
          if (bufferRef.current.length > 4000) {
            bufferRef.current =
              bufferRef.current.slice(-2500);
          }
        }

        lastDrawRef.current = true;
      } else if (lastDrawRef.current) {
        bufferRef.current.push({ isDrawing: false });
        lastDrawRef.current = false;
      }

      /* ⚡ RAF UPDATE (60FPS LOCK) */
      const now = performance.now();

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (now - lastFrameTime.current > 16) {
          setPoints([...bufferRef.current]);
          lastFrameTime.current = now;
        }
      });
    },
    [enabled, mirror, smoothPoint, canvasRef]
  );

  /* ===========================
      🎥 FRAME PROCESSOR
  =========================== */
  const processFrame = useCallback(
    async (video) => {
      if (!enabled) return;
      if (!video || video.readyState !== 4) return;

      // 🔥 ১. যদি আগের ফ্রেম এখনো প্রসেস হতে থাকে, তবে এই ফ্রেম স্কিপ করো
      if (isProcessingRef.current) return;

      /* 🔄 INIT TRACKER (SAFE) */
      if (!trackerRef.current && !initializingRef.current) {
        initializingRef.current = true;

        try {
          const tracker = await createHandTracker(onResults);
          if (tracker) trackerRef.current = tracker;
        } catch (err) {
          console.error("❌ Tracker Init Failed:", err);
        } finally {
          initializingRef.current = false;
        }

        return;
      }

      /* 🚀 PROCESS FRAME */
      if (trackerRef.current) {
        try {
          // 🔥 গেট বন্ধ করো
          isProcessingRef.current = true;
          await trackerRef.current.send({ image: video });
        } catch (err) {
          console.warn("⚠️ MediaPipe Drop Frame:", err.message);
          isProcessingRef.current = false; // এরর হলেও গেট খুলে দাও
        }
      }
    },
    [onResults, enabled]
  );

  /* ===========================
      🧹 CLEANUP
  =========================== */
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      
      // গেট রিসেট
      isProcessingRef.current = false;

      if (trackerRef.current) {
        try {
          trackerRef.current.close();
        } catch {}
        trackerRef.current = null;
      }
    };
  }, []);

  /* ===========================
      🎯 RETURN API
  =========================== */
  return {
    points,
    setPoints,
    processFrame,
    landmarks,
  };
}