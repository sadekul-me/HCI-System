import { db, storage } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateRandomPos } from '../../ultis/geometry';

/**
 * 🚀 ULTRA PRO IMAGE UPLOAD ENGINE (STORAGE BASED)
 */
export const uploadToHCI = async (
  file,
  options = { containerWidth: 800, containerHeight: 600, margin: 50, snapGrid: 0, maxRetries: 2 }
) => {
  if (!file) {
    console.warn('[HCI Upload] No file provided');
    return null;
  }

  const { containerWidth, containerHeight, margin, snapGrid, maxRetries } = options;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      // 🔹 Generate position
      const pos = generateRandomPos(containerWidth, containerHeight, { margin, snapGrid });

      // 🔹 Upload to Firebase Storage
      const timestampId = Date.now();
      const safeFileName = file.name.replace(/[^a-z0-9.]/gi, '_');

      const storageRef = ref(storage, `uploads/${timestampId}_${safeFileName}`);

      const uploadSnapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadSnapshot.ref);

      console.log('📤 Uploaded:', downloadURL);

      // 🔹 Save to Firestore (CLEAN)
      const docRef = await addDoc(collection(db, "images"), {
        beamId: `beam_${timestampId}`,
        imageUrl: downloadURL, // 🔥 IMPORTANT (sync hook er jonno)
        timestamp: serverTimestamp(),
        x: pos.x || 150,
        y: pos.y || 150,
        name: file.name,
        type: file.type,
        size: file.size
      });

      console.log('✅ Firestore Entry:', docRef.id);
      return docRef;

    } catch (err) {
      console.error(`❌ Attempt ${attempt + 1} failed:`, err.message);

      attempt++;
      if (attempt > maxRetries) throw err;

      await new Promise(res => setTimeout(res, 1000 * attempt));
    }
  }
};