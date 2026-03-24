/**
 * 💎 HCI CORE ENGINE — ULTRA PRO MAX (STABLE & SYNCED)
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  addDoc, // 👈 নতুন ডেটা অ্যাড করার জন্য
  serverTimestamp 
} from "firebase/firestore";
import Tesseract from "tesseract.js";
import { Hands } from "@mediapipe/hands";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBg5NeafKOXNQx2lRYkRlkrPwYQ4evSGyg",
  authDomain: "hci-system-li-ao.firebaseapp.com",
  projectId: "hci-system-li-ao",
  storageBucket: "hci-system-li-ao.firebasestorage.app",
  messagingSenderId: "439192875748",
  appId: "1:439192875748:web:f4eb29ba636dbbd24732f1"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

/* ==========================================================
    📡 REALTIME ASSET SYSTEM (FIRESTORE)
========================================================== */

/**
 * 📤 ফাংশন ১: ফোন থেকে পিসিতে ছবি পাঠানো (Portal Side)
 */
export async function beamImageToPC(imageUrl) {
  if (!imageUrl) return;
  
  try {
    await addDoc(collection(db, "remote_uploads"), {
      url: imageUrl,
      createdAt: serverTimestamp(), // ফায়ারবেস সার্ভার টাইম ব্যবহার করা বেস্ট
    });
    console.log("🚀 HCI Engine: Image beamed successfully!");
  } catch (err) {
    console.error("❌ HCI Engine: Beam failed!", err);
  }
}

/**
 * 📥 ফাংশন ২: পিসি সাইডে ছবি রিসিভ করা (Canvas Side)
 */
export function onImageReceived(callback) {
  // কালেকশন নাম 'remote_uploads' - পিসি এখানে কান পেতে বসে থাকবে
  const q = query(
    collection(db, "remote_uploads"), 
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      // যখনই নতুন কোনো ডকুমেন্ট অ্যাড হবে
      if (change.type === "added") {
        const data = change.doc.data();
        if (data?.url) {
          console.log("📡 HCI Engine: New Asset Caught:", data.url);
          callback({
            id: change.doc.id,
            url: data.url,
            createdAt: data.createdAt,
          });
        }
      }
    });
  }, (error) => {
    console.error("❌ HCI Sync Error:", error);
  });

  return unsubscribe;
}

/* ==========================================================
    ✋ MEDIAPIPE HAND TRACKER
========================================================== */

export async function createHandTracker(onResults) {
  const hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
    selfieMode: true,
  });

  hands.onResults((results) => {
    onResults(results);
  });

  try {
    await hands.initialize();
    console.log("✅ HCI Hand Tracker Initialized");
  } catch (err) {
    console.error("❌ MediaPipe Init Failed:", err);
  }

  return hands;
}

/* ==========================================================
    🤖 OCR ENGINE (TESSERACT)
========================================================== */

export class OCRProcessor {
  constructor() {
    this.isProcessing = false;
  }

  async predict(canvasElement) {
    if (!canvasElement || this.isProcessing) return "";
    this.isProcessing = true;
    try {
      const { data: { text } } = await Tesseract.recognize(canvasElement, "eng");
      return text?.trim()?.toUpperCase() || "";
    } catch (err) {
      console.error("OCR Error:", err);
      return "";
    } finally {
      this.isProcessing = false;
    }
  }
}

/* ==========================================================
    🧩 EXPORT ENGINE
========================================================== */

export const HCIEngine = {
  beamImageToPC,   // 👈 ফোন সাইডের জন্য
  onImageReceived, // 👈 পিসি সাইডের জন্য
  createHandTracker,
  OCRProcessor,
};