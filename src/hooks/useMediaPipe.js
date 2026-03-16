import { useEffect, useRef, useState, useCallback } from "react";
import { createHandTracker } from "../services/mediapipeService";
import { detectPinch } from "../utlis/gestures";

export default function useMediaPipe(color, brushSize) {
  const [points, setPoints] = useState([]);
  const [landmarks, setLandmarks] = useState(null);
  const trackerRef = useRef(null);
  const isInitializing = useRef(false);
  const lastState = useRef(false);
  
  // High-Precision Smoothing Refs
  const lastPos = useRef({ x: 0, y: 0 });

  const onResults = useCallback((results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setLandmarks(null);
      if (lastState.current) {
        setPoints((prev) => [...prev, { isDrawing: false }]);
        lastState.current = false;
      }
      return;
    }

    const currentLandmarks = results.multiHandLandmarks[0];
    setLandmarks(currentLandmarks); 

    const isDrawing = detectPinch(currentLandmarks);

    if (isDrawing) {
      const canvas = document.querySelector("canvas");
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      // 1. Mirroring logic
      const targetX = (1 - currentLandmarks[8].x) * rect.width;
      const targetY = currentLandmarks[8].y * rect.height;

      // 2. ULTRA-SMOOTHING (LERP 0.2)
      // Joto kom factor, toto beshi smooth kintu ektu 'weight' thakbe
      const smoothX = lastPos.current.x + (targetX - lastPos.current.x) * 0.25;
      const smoothY = lastPos.current.y + (targetY - lastPos.current.y) * 0.25;

      // 3. Movement Threshold (Kapa bondho korar mool montro)
      const dist = Math.hypot(smoothX - lastPos.current.x, smoothY - lastPos.current.y);

      if (dist > 0.5 || !lastState.current) {
        lastPos.current = { x: smoothX, y: smoothY };

        setPoints((prev) => {
          // Performance Buffer: 1200 points er beshi hole puran gulo delete
          const buffer = prev.length > 1200 ? prev.slice(-1200) : prev;
          return [
            ...buffer,
            {
              x: smoothX,
              y: smoothY,
              isDrawing: true,
              color: color,
              size: brushSize
            }
          ];
        });
      }
      lastState.current = true;
    } else if (lastState.current) {
      setPoints((prev) => [...prev, { isDrawing: false }]);
      lastState.current = false;
    }
  }, [color, brushSize]);

  const processFrame = useCallback(async (video) => {
    if (!video || video.readyState !== 4) return;

    if (!trackerRef.current && !isInitializing.current) {
      isInitializing.current = true;
      try {
        const tracker = await createHandTracker(onResults);
        if (tracker) trackerRef.current = tracker;
      } catch (err) {
        console.error("Tracker Init Error:", err);
      } finally {
        isInitializing.current = false;
      }
      return;
    }

    if (trackerRef.current) {
      // Proti frame e notun logic inject kora
      trackerRef.current.onResults(onResults);
      await trackerRef.current.send({ image: video });
    }
  }, [onResults]);

  useEffect(() => {
    return () => {
      if (trackerRef.current) {
        trackerRef.current.close();
        trackerRef.current = null;
      }
    };
  }, []);

  return { points, setPoints, processFrame, landmarks };
}