/**
 * 🚀 HCI AI Service — Oracle Engine (Ultra-Pro Next-Level)
 * Handles shape prediction, gesture detection, and confidence analytics
 */
export const aiService = (() => {
  // Internal smoothing store for confidence values
  const lastConfidence = { shape: 0, gesture: 0 };

  /**
   * Predict Shape from drawing points
   * @param {Array<{x:number, y:number}>} points
   * @param {Object} options
   * @returns {Promise<{label:string, confidence:number} | null>}
   */
  const predictShape = async (points, options = {}) => {
    const { debug = false, smoothingAlpha = 0.2 } = options;
    if (!points || points.length < 10) return null;

    try {
      // 🔮 Placeholder for future TensorFlow.js / ONNX prediction
      let label = "Sketching...";
      let confidence = 0.75;

      const count = points.length;
      if (count > 50) {
        label = "Complex Pattern";
        confidence = 0.88;
      } else if (count > 20) {
        label = "Geometric Shape";
        confidence = 0.92;
      }

      // Smooth confidence to avoid jitter
      confidence = lastConfidence.shape * (1 - smoothingAlpha) + confidence * smoothingAlpha;
      lastConfidence.shape = confidence;

      if (debug) console.log("[AI] Shape Prediction:", label, confidence.toFixed(2));
      return { label, confidence };

    } catch (err) {
      console.error("[AI] Shape Prediction Error:", err);
      return null;
    }
  };

  /**
   * Detect Gesture from MediaPipe landmarks
   * @param {Array<{x:number, y:number, z:number}>} landmarks
   * @param {Object} options
   * @returns {{label:string, confidence:number} | null}
   */
  const detectGesture = (landmarks, options = {}) => {
    const { debug = false, smoothingAlpha = 0.3 } = options;
    if (!landmarks || landmarks.length < 21) return null;

    let label = "Hand Detected";
    let confidence = 0.6;

    const isIndexUp = landmarks[8].y < landmarks[6].y;
    const isMiddleUp = landmarks[12].y < landmarks[10].y;

    if (isIndexUp && isMiddleUp) {
      label = "Victory / Peace";
      confidence = 0.95;
    } else if (isIndexUp) {
      label = "Pointing";
      confidence = 0.90;
    } else if (landmarks.some((l) => l.x || l.y)) {
      label = "Open Hand";
      confidence = 0.80;
    }

    // Smooth confidence
    confidence = lastConfidence.gesture * (1 - smoothingAlpha) + confidence * smoothingAlpha;
    lastConfidence.gesture = confidence;

    if (debug) console.log("[AI] Gesture Detection:", label, confidence.toFixed(2));
    return { label, confidence };
  };

  /**
   * Generate color based on confidence
   * @param {number} confidence - 0.0 to 1.0
   * @returns {string} HEX color
   */
  const getConfidenceColor = (confidence) => {
    if (confidence > 0.9) return "#10b981"; // Emerald-500
    if (confidence > 0.75) return "#3b82f6"; // Blue-500
    if (confidence > 0.5) return "#facc15"; // Yellow-400
    return "#f87171"; // Red-400
  };

  /**
   * Utility to reset internal smoothing cache
   */
  const resetCache = () => {
    lastConfidence.shape = 0;
    lastConfidence.gesture = 0;
  };

  return {
    predictShape,
    detectGesture,
    getConfidenceColor,
    resetCache
  };
})();