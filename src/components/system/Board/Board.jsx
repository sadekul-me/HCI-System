import React, { forwardRef, useRef, useImperativeHandle, useEffect, useState } from "react";
import Canvas from "./Canvas";
import VoiceLayer from "../Layers/VoiceLayer";
import ImageLayer from "../Layers/ImageLayer"; 
import { modeHandler } from "../../../core/modeHandler";

const Board = forwardRef(
  (
    {
      landmarks,
      prediction,
      voiceText,
      color = "#6366f1",
      brushSize = 4,
      layers = [], 
      clearSignal,
      undoSignal,
      redoSignal,
      onBrushChange = () => {},
    },
    ref
  ) => {
    const canvasRef = useRef(null);
    const [currentColor, setCurrentColor] = useState(color);
    const [currentBrushSize, setCurrentBrushSize] = useState(brushSize);
    const [currentMode, setCurrentMode] = useState(modeHandler.getMode());

    useEffect(() => {
      const unsubscribe = modeHandler.subscribe((mode) => {
        setCurrentMode(mode);
      });
      return () => unsubscribe();
    }, []);

    useEffect(() => {
      setCurrentColor(color);
      canvasRef.current?.setColor?.(color);
    }, [color]);

    useEffect(() => {
      setCurrentBrushSize(brushSize);
      canvasRef.current?.setBrushSize?.(brushSize);
    }, [brushSize]);

    useImperativeHandle(ref, () => ({
      undo: () => canvasRef.current?.undo?.(),
      redo: () => canvasRef.current?.redo?.(),
      clear: () => canvasRef.current?.clear?.(),
      export: () => canvasRef.current?.export?.(),
      importImage: (file) => canvasRef.current?.importImage?.(file),
      setBrushSize: (size) => {
        setCurrentBrushSize(size);
        canvasRef.current?.setBrushSize?.(size);
        onBrushChange(size);
      },
      setColor: (newColor) => {
        setCurrentColor(newColor);
        canvasRef.current?.setColor?.(newColor);
      },
      getMode: () => currentMode,
    }));

    return (
      <div className="relative w-full h-full max-h-full overflow-hidden select-none bg-[#020617]">
        <div className="absolute inset-0 rounded-xl border border-[#4f46e5]/20 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] z-10">

          {/* GRID */}
          <div
            className="absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${currentColor} 0.8px, transparent 0.8px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* CANVAS */}
          <div className="absolute inset-0 z-10 pointer-events-auto">
            <Canvas
              ref={canvasRef}
              landmarks={landmarks}
              color={currentColor}
              size={currentBrushSize}
            />
          </div>

          {/* IMAGE */}
          <div className="absolute inset-0 z-50 pointer-events-none">
            <ImageLayer images={layers} />
          </div>

          {/* VOICE */}
          <div className="absolute inset-0 z-60 pointer-events-none">
            <VoiceLayer
              voiceText={voiceText}
              brushColor={currentColor}
              clearSignal={clearSignal}
              undoSignal={undoSignal}
              redoSignal={redoSignal}
            />
          </div>

          {/* GLOW */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-600/10 blur-[100px] pointer-events-none" />
        </div>
      </div>
    );
  }
);

export default Board;