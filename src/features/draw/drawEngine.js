/**
 * 🚀 HCI Drawing Engine — Ultra-Pro Next Level
 * Handles coordinate mapping, smoothing, velocity-based brush dynamics, and buffer optimization
 */

import { getCanvasCoords, lerp, getDistance, easeOutCubic } from '../../utils/geometry';

/**
 * Processes a single drawing point
 * - LERP smoothing
 * - Optional easing for ultra-smooth strokes
 * - Velocity-aware for dynamic brush sizing
 */
export const processDrawingPoint = (landmark, rect, lastPoint, options = {}) => {
  if (!landmark || !rect) return null;

  const target = getCanvasCoords(landmark, rect, true);

  if (!lastPoint) return { ...target, isDrawing: true, velocity: 0 };

  const dist = getDistance(lastPoint, target);
  const deltaTime = options.deltaTime || 16; // ms, default ~60fps
  const velocity = dist / (deltaTime / 16);

  if (dist < 1.5) return { ...lastPoint, velocity };

  const alpha = options.smoothing ?? 0.25;
  const easing = options.easing ?? easeOutCubic;

  return {
    x: lerp(lastPoint.x, target.x, alpha, easing),
    y: lerp(lastPoint.y, target.y, alpha, easing),
    isDrawing: true,
    velocity
  };
};

/**
 * Updates the drawing buffer
 * - Circular buffer logic for memory efficiency
 * - Keeps only the latest N points
 */
export const updatePointsBuffer = (buffer, newPoint, maxPoints = 3000) => {
  if (!newPoint) return buffer;
  const updatedBuffer = [...buffer, newPoint];
  if (updatedBuffer.length > maxPoints) {
    return updatedBuffer.slice(-maxPoints);
  }
  return updatedBuffer;
};

/**
 * Calculates brush size
 * - Based on finger distance
 * - Dynamically adjusted by movement velocity
 */
export const calculateBrushSize = (landmarks, lastPoint, baseSize = 6, options = {}) => {
  if (!landmarks) return baseSize;

  const thumb = landmarks[4];
  const indexFinger = landmarks[8];
  let dist = getDistance(thumb, indexFinger);

  const velocity = lastPoint?.velocity ?? 0;
  const velocityFactor = options.velocityFactor ?? 1.2;
  const size = Math.max(2, Math.min(20, dist * 100 * (1 + velocity * velocityFactor)));

  return size;
};

/**
 * Smooths an array of points for post-processing
 * - Applies LERP + easing over entire stroke
 */
export const smoothStrokeArray = (points, alpha = 0.2, easing = easeOutCubic) => {
  if (!points || points.length < 2) return points;
  const smoothed = [points[0]];
  for (let i = 1; i < points.length; i++) {
    smoothed.push({
      x: lerp(smoothed[i - 1].x, points[i].x, alpha, easing),
      y: lerp(smoothed[i - 1].y, points[i].y, alpha, easing),
      isDrawing: true,
      velocity: points[i].velocity ?? 0
    });
  }
  return smoothed;
};