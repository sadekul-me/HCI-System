import { db } from "../../services/firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { detectPinch } from "../gesture/gestureEngine";

/**
 * 🚀 Throttle helper (limit writes)
 */
let lastUpdateTime = 0;
const THROTTLE_MS = 100; // 🔥 10 updates/sec max

/**
 * 🔥 Update Asset Position (Optimized)
 */
export const updateAssetPosition = async (id, x, y) => {
  if (!id) return;

  const now = Date.now();
  if (now - lastUpdateTime < THROTTLE_MS) return; // ✅ throttle
  lastUpdateTime = now;

  try {
    const assetRef = doc(db, "images", id);
    await updateDoc(assetRef, {
      x: Math.round(x),
      y: Math.round(y),
      lastUpdated: serverTimestamp(), // ✅ better sync
    });
  } catch (err) {
    console.error("Update Error:", err);
  }
};

/**
 * 🗑️ Delete Asset
 */
export const handleDeleteAsset = async (id) => {
  if (!id) return;

  try {
    await deleteDoc(doc(db, "images", id));
    console.log(`🗑️ Asset deleted: ${id}`);
  } catch (err) {
    console.error("Delete Error:", err);
  }
};

/**
 * 🤏 Move Logic (Gesture Controlled)
 */
export const handleMoveLogic = (landmarks, layers, x, y, draggingAssetId) => {
  if (!landmarks) return;

  const isPinching = detectPinch(landmarks);

  if (isPinching) {
    if (draggingAssetId.current) {
      updateAssetPosition(draggingAssetId.current, x, y);
    } else {
      const target = layers.find((l) => {
        const dist = Math.hypot((l.x || 0) - x, (l.y || 0) - y);
        return dist < 120;
      });

      if (target) {
        draggingAssetId.current = target.id;
        console.log("🎯 Target locked:", target.id);
      }
    }
  } else {
    if (draggingAssetId.current) {
      console.log("✋ Gesture released");
    }
    draggingAssetId.current = null;
  }
};