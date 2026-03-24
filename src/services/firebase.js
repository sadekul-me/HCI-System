// src/services/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * 🚀 LÌ ÀO (利奥) FIREBASE ENGINE — OPTIMIZED FOR FIRESTORE BEAMING
 * ✔ No Storage Dependencies (Avoiding Billing/CORS issues)
 * ✔ Production ready for HCI System
 */

const firebaseConfig = {
  apiKey: "AIzaSyBg5NeafKOXNQx2lRYkRlkrPwYQ4evSGyg",
  authDomain: "hci-system-li-ao.firebaseapp.com",
  projectId: "hci-system-li-ao",
  // storageBucket আপাতত লাগছে না, তাই এটা নিয়ে মাথা ঘামানোর দরকার নেই
  messagingSenderId: "439192875748",
  appId: "1:439192875748:web:f4eb29ba636dbbd24732f1"
};

// 🔥 Prevent multiple initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 🔹 Firestore Service (শুধুমাত্র এটাই আমাদের বিমিংয়ের জন্য যথেষ্ট)
export const db = getFirestore(app);

// (optional debug)
console.log("🔥 Lì Ào Engine: Firebase Connected (Firestore Only Mode)");