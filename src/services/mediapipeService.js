/**
 * mediapipeService.js
 * - Creates a MediaPipe Hands tracker
 * - Fixed for no mirror (selfieMode: false)
 */
export async function createHandTracker(onResults) {
  const HandsClass = window.Hands;

  if (!HandsClass) {
    console.error("MediaPipe script not found in window object.");
    return null;
  }

  const hands = new HandsClass({
    locateFile: (file) => {
      // WASM assets properly fetched
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    },
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5, // stability
    minTrackingConfidence: 0.5,
    selfieMode: false, // ❌ NO mirror
  });

  // Callback for hand tracking results
  hands.onResults(onResults);

  // Initialize WASM runtime
  try {
    await hands.initialize();
    console.log("MediaPipe Hands Initialized Successfully (No Mirror)!");
  } catch (e) {
    console.error("Failed to initialize MediaPipe Hands:", e);
  }

  return hands;
}