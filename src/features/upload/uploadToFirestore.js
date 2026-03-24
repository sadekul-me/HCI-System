import { db } from "../../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * 🚀 LÌ ÀO ENGINE: Firestore Asset Uploader
 * ✅ ফিক্সড: ফাংশন স্কোপিং এরর এবং 'onProgress is not a function' এরর
 */
export const uploadToFirestore = async (file, onProgress) => {
  if (!file) throw new Error("No file selected");

  // 🔥 সেফটি চেক: onProgress যদি ফাংশন না হয় তবে একটি খালি ফাংশন সেট করো
  const progress = typeof onProgress === 'function' ? onProgress : () => {};

  try {
    progress(10); // এখন আর ক্রাশ করবে না

    console.log("📸 Processing image:", file.name);

    // 🔥 STEP 1: Resize and Compress
    const compressedBase64 = await compressImage(file);
    
    progress(60); 

    // ❗ Firestore Limit Check (Safe side: 800KB)
    if (compressedBase64.length > 800000) {
      throw new Error("Image is still too large. Try a different photo.");
    }

    // 📡 Uploading to Firestore 'images' collection
    console.log("📡 Beaming to Firestore...");
    const docRef = await addDoc(collection(db, "images"), {
      image: compressedBase64,
      timestamp: serverTimestamp(),
      // পিসির স্ক্রিনের মাঝখানের কাছাকাছি র‍্যান্ডম পজিশন
      x: Math.random() * (window.innerWidth * 0.5) + 100,
      y: Math.random() * (window.innerHeight * 0.5) + 100,
      fileName: file.name,
      type: "beamed_asset"
    });

    progress(100);
    console.log("✅ Beam Successful! Doc ID:", docRef.id);

    return docRef;

  } catch (err) {
    console.error("❌ Firestore Upload Error:", err.message);
    throw err;
  }
};

/* ============================================
   🧠 IMAGE COMPRESSOR (STABLE & FAST)
============================================ */
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; 
        
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        ctx.drawImage(img, 0, 0, width, height);

        // 🔥 JPEG ফরম্যাটে ০.৫ কোয়ালিটি
        const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        resolve(dataUrl);
      };

      img.onerror = (err) => {
        console.error("Image Load Error:", err);
        reject(new Error("Failed to process image."));
      };
    };

    reader.onerror = (err) => {
      console.error("FileReader Error:", err);
      reject(new Error("Failed to read file."));
    };
  });
};