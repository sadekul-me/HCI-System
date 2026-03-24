import { uploadToFirestore } from "../upload/uploadToFirestore";

export const beamImageAsset = async (file, onProgress) => {
  if (!file) throw new Error("No file");

  try {
    console.log(`🚀 Lì Ào Engine: Beaming ${file.name}...`);

    // আগের ফাংশন অনুযায়ী প্যারামিটার পাস
    const result = await uploadToFirestore(file, onProgress);

    console.log("✅ Engine Status: Asset Beamed Successfully!");
    return result;

  } catch (err) {
    console.error("❌ Engine Failure:", err);
    if (onProgress) onProgress(0); // রিসেট প্রগ্রেস বার
    throw err;
  }
};