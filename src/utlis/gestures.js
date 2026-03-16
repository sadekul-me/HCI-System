/**
 * Gestures Utility for AirPen Pro
 * Optimized for Lì Ào Edition
 */

// 1. Pinch Detection (Threshold ektu bariye optimized kora hoyeche)
export const detectPinch = (landmarks, threshold = 0.08) => { 
  if (!landmarks || !landmarks[4] || !landmarks[8]) return false;
  
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];

  // Euclidean distance calculation (z-axis ignore kora hoyeche drawing accuracy-r jonno)
  const distance = Math.hypot(
    indexTip.x - thumbTip.x, 
    indexTip.y - thumbTip.y
  );

  return distance < threshold;
};

// 2. Palm Open Detection (Clear Canvas logic)
export const isPalmOpen = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;
  
  const wrist = landmarks[0];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  // Shob angul jodi tader knuckle joint-er upore thake (Open Palm)
  return (
    indexTip.y < landmarks[6].y && 
    middleTip.y < landmarks[10].y && 
    ringTip.y < landmarks[14].y &&
    pinkyTip.y < landmarks[18].y
  );
};

// 3. Mapping Coordinates (Canvas coordinate mapping)
export const mapLandmarksToCanvas = (landmark, width, height) => {
  if (!landmark) return { x: 0, y: 0 };
  
  // Mirroring fix: Webcam frame mirror thakle (1 - x) dorkar hoy
  return {
    x: (1 - landmark.x) * width, 
    y: landmark.y * height
  };
};