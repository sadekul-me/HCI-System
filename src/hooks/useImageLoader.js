import { useState, useEffect, useRef } from "react";

/**
 * 🚀 ULTRA-SPEED IMAGE PRE-LOADER (SAFE VERSION)
 */
export const useImageLoader = (imageUrl) => {
  const [imgElement, setImgElement] = useState(null);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    if (!imageUrl) return;

    let isMounted = true;

    // ✅ Cache hit
    if (cacheRef.current.has(imageUrl)) {
      setImgElement(cacheRef.current.get(imageUrl));
      return;
    }

    const img = new Image();
    // ❌ Removed crossOrigin (safer for Firebase)
    img.src = imageUrl;

    img.onload = () => {
      if (!isMounted) return;

      cacheRef.current.set(imageUrl, img);
      setImgElement(img);

      // 🔥 Cache limit
      if (cacheRef.current.size > 10) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }
    };

    img.onerror = () => {
      if (!isMounted) return;
      console.error("🔥 Image Load Failed:", imageUrl);
    };

    // ✅ Cleanup
    return () => {
      isMounted = false;
    };

  }, [imageUrl]);

  return imgElement;
};