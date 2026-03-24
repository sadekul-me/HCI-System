import { db, storage } from "../../services/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

/**
 * 🚀 Upload with REAL progress tracking
 */
export const uploadToHCI = async (file, onProgress) => {
  if (!file) throw new Error("No file provided");

  return new Promise((resolve, reject) => {
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-z0-9.]/gi, "_");

      const storageRef = ref(storage, `uploads/${timestamp}_${safeName}`);

      // 🔥 resumable upload (gives progress)
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",

        // 🔥 PROGRESS TRACK
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );

          if (onProgress) onProgress(progress);
        },

        // ❌ ERROR
        (error) => {
          console.error("❌ Storage Upload Error:", error);
          reject(error);
        },

        // ✅ COMPLETE
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            const docRef = await addDoc(collection(db, "images"), {
              beamId: `beam_${timestamp}`,
              image: downloadURL,
              url: downloadURL,
              timestamp: serverTimestamp(),

              x: Math.random() * 300 + 200,
              y: Math.random() * 200 + 150,

              fileName: file.name,
              type: file.type,
              size: file.size,
            });

            console.log("✅ Firestore Save:", docRef.id);

            resolve(docRef);

          } catch (err) {
            reject(err);
          }
        }
      );

    } catch (err) {
      reject(err);
    }
  });
};