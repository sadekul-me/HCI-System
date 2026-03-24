import { useState, useEffect, useRef, useCallback } from "react";
import { Hands } from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";

/**
 * 🚀 HCI_SYSTEM: TRACKING ENGINE (STABLE VERSION)
 * Fixes: Infinite loop, Camera oscillation, and Frame rate lag.
 */

export const useTracking = (settings = {}) => {
  const [mode, setMode] = useState("tracking");
  const [landmarks, setLandmarks] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const videoElementRef = useRef(null);
  const isStartingRef = useRef(false);
  
  // পারফরম্যান্স এবং লুপ কন্ট্রোলের জন্য রেফারেন্স
  const lastLandmarkUpdateRef = useRef(0);
  const lastDataRef = useRef(null);

  const {
    cameraEnabled = true,
    handTracking = true,
    aiConfidence = 0.75,
    mirrorCamera = true,
  } = settings;

  /* =========================
      🧠 ON RESULTS HANDLER
  ========================= */
  const onResults = useCallback((results) => {
    const hasHands = !!(results.multiHandLandmarks && results.multiHandLandmarks.length > 0);
    
    if (handTracking && hasHands) {
      const now = Date.now();
      // 🔥 ৩০ms থ্রোটলিং (FPS limiting to ~30fps for stability)
      if (now - lastLandmarkUpdateRef.current > 30) {
        const newData = results.multiHandLandmarks[0];
        setLandmarks(newData);
        lastLandmarkUpdateRef.current = now;
        lastDataRef.current = newData;
      }
    } else {
      // 🛑 ফিক্স: যদি ডাটা অলরেডি নাল থাকে, তবে নতুন করে নাল সেট করে রেন্ডার লুপ করবে না
      if (lastDataRef.current !== null) {
        setLandmarks(null);
        lastDataRef.current = null;
      }
    }
  }, [handTracking]);

  /* =========================
      🛠️ INITIALIZE HANDS
  ========================= */
  const initHands = useCallback(() => {
    if (handsRef.current) return;

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: aiConfidence,
      minTrackingConfidence: aiConfidence,
      selfieMode: mirrorCamera,
    });

    hands.onResults(onResults);
    handsRef.current = hands;
    console.log("HCI_SYSTEM: Hands model loaded ✅");
  }, [aiConfidence, mirrorCamera, onResults]);

  /* =========================
      📸 START CAMERA
  ========================= */
  const startCamera = useCallback(async (videoElement) => {
    // যদি অলরেডি স্টার্ট হয়ে থাকে বা প্রসেসিংয়ে থাকে তবে রিটার্ন
    if (!videoElement || isStartingRef.current || cameraRef.current) return;

    try {
      isStartingRef.current = true;
      console.log("HCI_SYSTEM: Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      videoElement.srcObject = stream;

      // ভিডিও প্লে হওয়া পর্যন্ত অপেক্ষা
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play().then(resolve);
        };
      });

      cameraRef.current = new cam.Camera(videoElement, {
        onFrame: async () => {
          if (handsRef.current && videoElement.readyState === 4) {
            await handsRef.current.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480,
      });

      await cameraRef.current.start();
      setCameraReady(true);
      console.log("HCI_SYSTEM: Camera active 🟢");
    } catch (err) {
      console.error("Camera start failed:", err);
      setCameraReady(false);
    } finally {
      isStartingRef.current = false;
    }
  }, []); 

  /* =========================
      🛑 STOP CAMERA
  ========================= */
  const stopCamera = useCallback(async () => {
    if (cameraRef.current) {
      await cameraRef.current.stop();
      cameraRef.current = null;
    }

    if (videoElementRef.current?.srcObject) {
      const tracks = videoElementRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoElementRef.current.srcObject = null;
    }

    setCameraReady(false);
    setLandmarks(null);
    lastDataRef.current = null;
    console.log("HCI_SYSTEM: Camera stopped 🔴");
  }, []);

  /* =========================
      📽️ VIDEO REF ASSIGNMENT
  ========================= */
  const videoRef = useCallback(
    (node) => {
      if (node !== null) {
        videoElementRef.current = node;
        initHands();
      }
    },
    [initHands]
  );

  /* =========================
      ⚙️ SYNC SETTINGS
  ========================= */
  useEffect(() => {
    if (handsRef.current) {
      handsRef.current.setOptions({
        minDetectionConfidence: aiConfidence,
        minTrackingConfidence: aiConfidence,
        selfieMode: mirrorCamera,
      });
    }
  }, [aiConfidence, mirrorCamera]);

  /* =========================
      🔄 CAMERA TOGGLE LOGIC
  ========================= */
  useEffect(() => {
    const videoElement = videoElementRef.current;
    if (cameraEnabled && videoElement && !cameraReady && !isStartingRef.current) {
      startCamera(videoElement);
    } else if (!cameraEnabled && cameraReady) {
      stopCamera();
    }
  }, [cameraEnabled, cameraReady, startCamera, stopCamera]);

  /* =========================
      🧹 CLEANUP
  ========================= */
  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []);

  return {
    mode,
    setMode,
    landmarks,
    isListening,
    toggleListening: () => setIsListening((prev) => !prev),
    videoRef,
    cameraReady,
  };
};