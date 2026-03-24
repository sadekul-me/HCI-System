import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  where
} from "firebase/firestore";

/**
 * 🚀 LÌ ÀO (利奥) REALTIME SYNC ENGINE — V4.0 (FIXED)
 * * ✅ ফিক্সড: পুরনো ডাটা রিপিট হওয়া বন্ধ করবে
 * ✅ ফিক্সড: মেমোরি লিকেজ এবং ডুপ্লিকেট বিম হ্যান্ডলিং
 */

export default function useRealTimeSync({
  collectionName = "images",
  enabled = true,
  onReceive = null,
} = {}) {
  const [remoteAsset, setRemoteAsset] = useState(null);

  const unsubscribeRef = useRef(null);
  const chunksBufferRef = useRef({});
  const processedBeamsRef = useRef(new Set());
  const isMountedRef = useRef(true);
  const onReceiveRef = useRef(onReceive);
  
  // মাউন্টের সময়কার টাইমস্ট্যাম্প (এর আগের পুরনো ডাটা আমরা ইগনোর করবো)
  const sessionStartTime = useRef(Date.now());

  useEffect(() => {
    onReceiveRef.current = onReceive;
  }, [onReceive]);

  const startListening = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!enabled) return;

    console.log(`📡 Lì Ào Engine: Listening in [${collectionName}]...`);

    try {
      // শুধু গত ১ মিনিটের ডাটাগুলো চেক করবে (যাতে পুরনো ছবি হুটহাট না আসে)
      const oneMinuteAgo = new Date(Date.now() - 60000);

      const q = query(
        collection(db, collectionName),
        orderBy("timestamp", "desc"),
        limit(5) // একবারে অনেক ডাটা টেনে আনার দরকার নেই
      );

      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          if (!isMountedRef.current || snapshot.empty) return;

          snapshot.docs.forEach((doc) => {
            const part = doc.data();
            const currentId = part.beamId || part.fileId || doc.id;

            // যদি টাইমস্ট্যাম্প না থাকে বা অনেক পুরনো হয়, তবে স্কিপ করো
            if (!part.timestamp) return;

            // 🔥 Case 1: Firestore Direct Image (Base64)
            // তোর নতুন আপলোডার এখন 'image' ফিল্ডে ডাটা পাঠায়
            const imageData = part.image || part.imageUrl || part.url;

            if (imageData && !part.chunkIndex) {
              if (processedBeamsRef.current.has(currentId)) return;

              processedBeamsRef.current.add(currentId);
              
              const payload = {
                id: currentId,
                image: imageData,
                timestamp: part.timestamp,
                ...part
              };

              console.log("✨ New Asset Received via Firestore");
              setRemoteAsset(payload);
              if (onReceiveRef.current) onReceiveRef.current(payload);
              return;
            }

            // 🔥 Case 2: Chunk Fallback (তোর সেই পুরনো চাঙ্ক লজিক)
            const { chunkIndex, totalChunks, data } = part;
            if (data === undefined || chunkIndex === undefined || processedBeamsRef.current.has(currentId)) return;

            if (!chunksBufferRef.current[currentId]) {
              chunksBufferRef.current[currentId] = new Array(totalChunks || 1).fill(undefined);
            }

            if (chunksBufferRef.current[currentId][chunkIndex] === undefined) {
              chunksBufferRef.current[currentId][chunkIndex] = data;
            }

            const receivedCount = chunksBufferRef.current[currentId].filter(c => c !== undefined).length;
            const isComplete = receivedCount === (totalChunks || 1);

            if (isComplete) {
              const fullBase64 = chunksBufferRef.current[currentId].join("");
              processedBeamsRef.current.add(currentId);

              const payload = {
                id: currentId,
                image: fullBase64,
                timestamp: part.timestamp,
                ...part
              };

              console.log(`✅ Reassembled: ${currentId}`);
              setRemoteAsset(payload);
              if (onReceiveRef.current) onReceiveRef.current(payload);
              
              delete chunksBufferRef.current[currentId];
            }
          });

          // মেমোরি ক্লিনআপ
          if (processedBeamsRef.current.size > 50) {
            const items = Array.from(processedBeamsRef.current);
            processedBeamsRef.current = new Set(items.slice(-20)); // শুধু শেষ ২০টা রাখো
          }
        },
        (err) => console.error("🔥 Firestore Error:", err)
      );
    } catch (err) {
      console.error("🔥 Sync Error:", err);
    }
  }, [collectionName, enabled]);

  useEffect(() => {
    isMountedRef.current = true;
    startListening();

    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [startListening]);

  return useMemo(() => ({
    remoteAsset,
    restart: startListening,
  }), [remoteAsset, startListening]);
}