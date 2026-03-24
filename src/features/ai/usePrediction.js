/**
 * ⚡ usePrediction — Ultra-Pro Next-Level Hook
 * Handles gesture/shape prediction with adaptive throttling, confidence smoothing, and async cancellation.
 */
import { useState, useEffect, useRef, useCallback } from "react";

export const usePrediction = (points, landmarks, options = {}) => {
  const {
    throttleTime = 400,      // base throttle in ms
    smoothingAlpha = 0.2,    // confidence smoothing factor
    debug = false
  } = options;

  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const timeoutRef = useRef(null);
  const cancelToken = useRef({ canceled: false });
  const lastConfidence = useRef(0);

  const runPrediction = useCallback(async () => {
    setIsProcessing(true);
    cancelToken.current.canceled = false;

    try {
      // ✅ Replace this mock with your real AI model call:
      // Example: const result = await aiService.predict(points);
      let newPrediction = "";
      let newConfidence = 0;

      if (points && points.length > 5) {
        const labels = ["Circle", "Square", "Triangle", "Star", "Arrow", "Line", "Heart"];
        const index = Math.floor(Math.random() * labels.length);
        newPrediction = labels[index];
        newConfidence = 0.85 + Math.random() * 0.14;
      } else if (landmarks) {
        newPrediction = "Tracking Hand...";
        newConfidence = 0.99;
      } else {
        newPrediction = "";
        newConfidence = 0;
      }

      // ✅ Smooth confidence to avoid jitter
      newConfidence = lastConfidence.current * (1 - smoothingAlpha) + newConfidence * smoothingAlpha;
      lastConfidence.current = newConfidence;

      if (!cancelToken.current.canceled) {
        setPrediction(newPrediction);
        setConfidence(newConfidence);
      }

      if (debug) console.log("[usePrediction] Updated:", newPrediction, newConfidence.toFixed(2));

    } catch (err) {
      if (!cancelToken.current.canceled) console.error("[usePrediction] Error:", err);
    } finally {
      if (!cancelToken.current.canceled) setIsProcessing(false);
    }
  }, [points, landmarks, smoothingAlpha, debug]);

  useEffect(() => {
    if ((!points || points.length === 0) && !landmarks) {
      setPrediction("");
      setConfidence(0);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Adaptive throttling: less delay if more points are drawn
    const adaptiveDelay = throttleTime - Math.min(points?.length || 0, 20) * 10;

    timeoutRef.current = setTimeout(() => {
      runPrediction();
    }, adaptiveDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelToken.current.canceled = true;
    };
  }, [points, landmarks, runPrediction, throttleTime]);

  return { prediction, confidence, isProcessing };
};