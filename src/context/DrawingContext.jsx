import React, { createContext, useContext, useRef, useState } from "react";

const DrawingContext = createContext();

export const DrawingProvider = ({ children }) => {
  // 1. Live Points (useRef use kora hoy jate rendering smooth hoy)
  const pointsRef = useRef([]); 
  
  // 2. Brush and UI States
  const [color, setColor] = useState("#F5D061");
  const [brushSize, setBrushSize] = useState(6);
  const [isErasing, setIsErasing] = useState(false);

  // Function to clear canvas
  const clearCanvas = () => {
    pointsRef.current = [];
  };

  return (
    <DrawingContext.Provider
      value={{
        pointsRef,
        color,
        setColor,
        brushSize,
        setBrushSize,
        isErasing,
        setIsErasing,
        clearCanvas,
      }}
    >
      {children}
    </DrawingContext.Provider>
  );
};

// Custom Hook: Sahaje Context access korar jonno
export const useDrawing = () => {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error("useDrawing must be used within a DrawingProvider");
  }
  return context;
};