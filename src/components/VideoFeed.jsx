import { useEffect, useRef, useState } from "react";

/**
 * VideoFeed component
 * - Handles camera feed from laptop front camera
 * - Mirrors video for selfie view
 * - Throttles frames for MediaPipe processing
 */
export default function VideoFeed({ onFrame, fps = 30 }) {
  const videoRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);
  const isProcessing = useRef(false);

  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    let lastFrameTime = 0;
    const frameInterval = 1000 / fps;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user", // front camera
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Play video when metadata is loaded
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }

        // Frame processing loop
        const processFrame = async (time) => {
          if (
            videoRef.current &&
            videoRef.current.readyState === 4 &&
            time - lastFrameTime >= frameInterval
          ) {
            if (!isProcessing.current) {
              isProcessing.current = true;
              lastFrameTime = time;

              if (onFrame) {
                await onFrame(videoRef.current);
              }

              isProcessing.current = false;
            }
          }

          animationRef.current = requestAnimationFrame(processFrame);
        };

        animationRef.current = requestAnimationFrame(processFrame);
      } catch (error) {
        console.error("Camera access error:", error);
        setCameraError("Camera access denied.");
      }
    };

    startCamera();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [fps, onFrame]);

  // Display error if camera access denied
  if (cameraError) {
    return (
      <div className="absolute top-10 left-1/2 -translate-x-1/2 p-4 bg-red-500/20 text-red-400 rounded-xl border border-red-400 z-50">
        {cameraError}
      </div>
    );
  }

  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-56 h-36 rounded-2xl overflow-hidden border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.6)] backdrop-blur-md z-20">
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1]" // mirror video
        muted
        playsInline
      />
    </div>
  );
}