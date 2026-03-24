import React, { useState, useRef, useEffect } from "react";
import { beamImageAsset } from "../../../features/remote/remoteService";
import { Hands } from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 💎 HCI Remote Portal — ULTRA PRO STABLE FINAL
 */

export default function RemotePortal() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("AWAITING ASSET");
  const [progress, setProgress] = useState(0);
  const [isSensorActive, setIsSensorActive] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null); // 🔥 important

  /* =========================
      🧹 CLEANUP (SAFE)
  ========================= */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (cameraRef.current) {
        cameraRef.current.stop();
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [preview]);

  /* =========================
      📸 FILE SELECT
  ========================= */
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setStatus("READY TO GRAB ✊");
  };

  /* =========================
      🤏 HANDLE GRAB (UPLOAD)
  ========================= */
  const handleGrab = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setStatus("PACKAGING...");
    setProgress(0);

    try {
      // 🔥 smooth fake progress (controlled)
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 150);

      // 🔥 REAL upload
      await beamImageAsset(selectedFile, selectedFile.name, (pct) => {
        setProgress(pct);
        setStatus(`BEAMING: ${pct}%`);
      });

      // 🔥 ensure stop interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      setProgress(100);
      setIsCaptured(true);
      setStatus("SUCCESS! ✅");

      // 🔥 stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (cameraRef.current) {
        cameraRef.current.stop();
      }

      // 🔥 reset cleanly
      setTimeout(() => {
        setSelectedFile(null);
        setPreview(null);
        setIsCaptured(false);
        setIsUploading(false);
        setIsSensorActive(false);
        setProgress(0);
        setStatus("AWAITING ASSET");
      }, 2500);

    } catch (err) {
      console.error("[Beam Error]:", err);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      setStatus("BEAM ERROR ❌");
      setIsUploading(false);
    }
  };

  /* =========================
      📷 START CAMERA
  ========================= */
  const startCamera = async () => {
    setIsSensorActive(true);
    setStatus("WAKING SENSOR...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 480, height: 480 },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        const hands = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
        });

        hands.onResults((results) => {
          if (results.multiHandLandmarks?.length > 0) {
            const lm = results.multiHandLandmarks[0];

            const isGrabbing =
              lm[8].y > lm[6].y &&
              lm[12].y > lm[10].y;

            if (isGrabbing && !isCaptured && !isUploading) {
              handleGrab();
            }
          }
        });

        const camera = new cam.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 480,
          height: 480,
        });

        camera.start();
        cameraRef.current = camera;

        setStatus("SCANNER LIVE ✊");
      }
    } catch (err) {
      console.error("[Sensor Error]:", err);
      setStatus("SENSOR ERROR ❌");
    }
  };

  /* =========================
      🎨 UI (UNCHANGED)
  ========================= */
  return (
    <div className="fixed inset-0 bg-[#020617] text-white p-6 flex flex-col items-center justify-center font-sans overflow-hidden z-[100]">

      <AnimatePresence>
        {isSensorActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-10 right-6 z-50"
          >
            <div className="w-28 h-28 rounded-full border-2 border-cyan-400/70 overflow-hidden bg-black shadow-[0_0_25px_rgba(6,182,212,0.7)]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                playsInline
                muted
                autoPlay
              />
            </div>
            <div className="mt-2 text-center text-[8px] font-black text-cyan-400 tracking-widest animate-pulse">
              LIVE FEED
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative w-80 h-80 border-2 rounded-[3rem] flex items-center justify-center transition-all duration-500 
        ${isCaptured ? "border-green-500 bg-green-500/10" : "border-white/10 bg-white/5"}`}>

        {preview ? (
          <motion.img
            src={preview}
            className={`w-full h-full object-cover p-4 rounded-[3rem] ${
              isCaptured ? "opacity-20 blur-sm scale-90" : ""
            }`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            alt="preview"
          />
        ) : (
          <label className="cursor-pointer flex flex-col items-center">
            <input type="file" hidden onChange={onFileChange} accept="image/*" />
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <span className="text-4xl">📸</span>
            </div>
            <p className="mt-4 text-[10px] opacity-30 uppercase">
              Stage Asset
            </p>
          </label>
        )}

        <AnimatePresence>
          {isUploading && !isCaptured && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-[3rem]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-16 h-16 border-t-2 border-cyan-400 rounded-full mb-4"
                />
                <span className="text-3xl font-black text-cyan-400">
                  {progress}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 text-center flex flex-col items-center gap-6">
        <motion.h2
          className={`text-[10px] uppercase ${
            isCaptured ? "text-green-500" : "text-cyan-500"
          }`}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {status}
        </motion.h2>

        {selectedFile && !isSensorActive && (
          <button
            onClick={startCamera}
            className="mt-8 px-10 py-4 bg-cyan-600 rounded-2xl text-[10px] uppercase"
          >
            Wake Sensor ✊
          </button>
        )}
      </div>
    </div>
  );
}