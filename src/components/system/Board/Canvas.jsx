import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import {
  getDistance,
  getCanvasCoords,
  smoothPoint,
  getVelocity,
  getBrushSize,
} from "../../../utlis/geometry";
import { modeHandler } from "../../../core/modeHandler";

/**
 * ⚡ NEURAL CANVAS (ULTRA-PRO)
 * - Fixed: Image import logic for remote/local data
 * - Fixed: Redraw sync on history change
 */
const Canvas = forwardRef(
  ({ landmarks, color = "#F5D061", size = 8 }, ref) => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const rectRef = useRef(null);
    const lastPosRef = useRef(null);
    const lastRawPosRef = useRef(null);
    const lastTimeRef = useRef(performance.now());
    const isDrawingRef = useRef(false);
    const latestLandmarks = useRef(landmarks);

    const brushRef = useRef({ size, color });
    const currentStrokePoints = useRef([]);

    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [currentMode, setCurrentMode] = useState(modeHandler.getMode());

    /* =========================
        MODE SUBSCRIPTION
    ========================= */
    useEffect(() => {
      const unsubscribe = modeHandler.subscribe((mode) => {
        setCurrentMode(mode);
      });
      return () => unsubscribe();
    }, []);

    /* =========================
        UPDATE BRUSH & COLOR
    ========================= */
    useEffect(() => {
      brushRef.current.size = size;
    }, [size]);

    useEffect(() => {
      brushRef.current.color = color;
    }, [color]);

    useEffect(() => {
      latestLandmarks.current = landmarks;
    }, [landmarks]);

    /* =========================
        CANVAS SETUP & RESIZE
    ========================= */
    useEffect(() => {
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      const dpr = window.devicePixelRatio || 1;

      const updateSize = () => {
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctxRef.current = ctx;
        rectRef.current = rect;

        redraw(history);
      };

      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }, [history]);

    /* =========================
        REDRAW FUNCTION (CORE)
    ========================= */
    const redraw = (stack) => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas || !rectRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stack.forEach((item) => {
        if (item.type === "stroke" && item.points.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = item.color;
          ctx.lineWidth = item.size;
          ctx.moveTo(item.points[0].x, item.points[0].y);
          for (let i = 1; i < item.points.length; i++) {
            ctx.lineTo(item.points[i].x, item.points[i].y);
          }
          ctx.stroke();
        } else if (item.type === "image" && item.img) {
          // ড্রয়িং এর নিচে ইমেজ রেন্ডার করার জন্য
          ctx.drawImage(
            item.img,
            0,
            0,
            rectRef.current.width,
            rectRef.current.height
          );
        }
      });
    };

    /* =========================
        DRAW LOOP
    ========================= */
    useEffect(() => {
      let rafId;

      const render = () => {
        const ctx = ctxRef.current;
        const lm = latestLandmarks.current;
        const rect = rectRef.current;
        
        if (!ctx || !lm || !rect) {
          rafId = requestAnimationFrame(render);
          return;
        }

        if (currentMode !== "draw") {
          isDrawingRef.current = false;
          lastPosRef.current = null;
          lastRawPosRef.current = null;
          rafId = requestAnimationFrame(render);
          return;
        }

        const pinch = getDistance(lm[4], lm[8]) < 0.05;
        const now = performance.now();
        let dt = now - lastTimeRef.current;
        if (dt > 32) dt = 16;

        if (pinch) {
          const raw = getCanvasCoords(lm[8], rect);
          const smooth = smoothPoint(lastPosRef.current, raw);
          const velocity = getVelocity(lastRawPosRef.current, raw, dt);
          const dynamicSize = getBrushSize(
            velocity,
            brushRef.current.size * 0.8,
            brushRef.current.size * 1.2
          );

          if (!isDrawingRef.current) {
            isDrawingRef.current = true;
            currentStrokePoints.current = [smooth];
          }

          if (lastPosRef.current) {
            ctx.beginPath();
            ctx.strokeStyle = brushRef.current.color;
            ctx.lineWidth = dynamicSize;
            ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
            ctx.lineTo(smooth.x, smooth.y);
            ctx.stroke();
            currentStrokePoints.current.push(smooth);
          }

          lastPosRef.current = smooth;
          lastRawPosRef.current = raw;
        } else if (isDrawingRef.current) {
          const newStroke = {
            type: "stroke",
            points: [...currentStrokePoints.current],
            color: brushRef.current.color,
            size: brushRef.current.size,
          };
          setHistory((prev) => [...prev, newStroke]);
          setRedoStack([]);
          isDrawingRef.current = false;
          lastPosRef.current = null;
          lastRawPosRef.current = null;
        }

        lastTimeRef.current = now;
        rafId = requestAnimationFrame(render);
      };

      rafId = requestAnimationFrame(render);
      return () => cancelAnimationFrame(rafId);
    }, [currentMode]);

    /* =========================
        IMPERATIVE HANDLE
    ========================= */
    useImperativeHandle(ref, () => ({
      undo: () => {
        setHistory((prev) => {
          if (!prev.length) return prev;
          const last = prev[prev.length - 1];
          setRedoStack((r) => [...r, last]);
          return prev.slice(0, -1);
        });
      },
      redo: () => {
        setRedoStack((prev) => {
          if (!prev.length) return prev;
          const last = prev[prev.length - 1];
          setHistory((h) => [...h, last]);
          return prev.slice(0, -1);
        });
      },
      clear: () => {
        setHistory([]);
        setRedoStack([]);
        if (ctxRef.current && canvasRef.current) {
          ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      },
      export: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = "neural_art.png";
        link.click();
      },
      // 🚀 FIXED IMPORT IMAGE FUNCTION
      importImage: (data) => {
        if (!data) return;

        const img = new Image();
        img.onload = () => {
          setHistory((prev) => {
            const updatedHistory = [...prev, { type: "image", img }];
            // ইমেজ লোড হওয়ার সাথে সাথে রি-ড্র কল করা হয়েছে
            setTimeout(() => redraw(updatedHistory), 10);
            return updatedHistory;
          });
        };

        // যদি ডাটা স্ট্রিং হয় (যা NeuralInterface থেকে আসছে) সরাসরি সোর্স সেট করো
        if (typeof data === "string") {
          img.src = data;
        } else if (data instanceof File || data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = (e) => { img.src = e.target.result; };
          reader.readAsDataURL(data);
        }
      },
      setBrushSize: (newSize) => {
        brushRef.current.size = newSize;
      },
      setColor: (newColor) => {
        brushRef.current.color = newColor;
      },
    }));

    return (
      <div className="absolute inset-0 w-full h-full bg-transparent">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {landmarks && (
            <g className="opacity-30">
              {HAND_CONNECTIONS.map(([s, e], i) => (
                <line
                  key={i}
                  x1={`${landmarks[s].x * 100}%`}
                  y1={`${landmarks[s].y * 100}%`}
                  x2={`${landmarks[e].x * 100}%`}
                  y2={`${landmarks[e].y * 100}%`}
                  stroke="rgba(0, 255, 255, 0.5)"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}
        </svg>
      </div>
    );
  }
);

export default Canvas;