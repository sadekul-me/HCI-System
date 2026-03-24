/**
 * 🚀 LÌ ÀO HCI DRAWING ENGINE - ULTRA++ PRECISION
 * Final Production Ready Version for Sadik
 */

export class DrawingManager {
  constructor(canvasRef) {
    this.canvasRef = canvasRef;
    this.canvas = canvasRef.current;
    
    // Optimization: desynchronized logic reduces input-to-screen lag
    this.ctx = this.canvas.getContext("2d", { desynchronized: true });

    // Performance Layer: Buffer for static strokes
    this.bufferCanvas = document.createElement("canvas");
    this.bufferCtx = this.bufferCanvas.getContext("2d");

    this.strokes = [];
    this.redoStack = [];
    this.currentStroke = [];

    this.isDrawing = false;
    this.lastPoint = null;
    this.smoothedPoint = null;
    this.lastTime = 0;
    this.lastSize = 6;

    this.animationFrame = null;
    this.resize();
  }

  /* ===============================
      🧠 DPI PERFECT RESIZE
  =============================== */
  resize() {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    this.bufferCanvas.width = rect.width * dpr;
    this.bufferCanvas.height = rect.height * dpr;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.bufferCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    this.rebuildBuffer(); // Resize hole purono strokes thik kora
  }

  /* ===============================
      ⚡ STROKE LIFECYCLE
  =============================== */
  startStroke(point) {
    this.isDrawing = true;
    this.currentStroke = [{ ...point, isDrawing: true }];
    this.lastPoint = point;
    this.smoothedPoint = point;
    this.lastTime = performance.now();
    this.lastSize = point.size || 6;
  }

  addPoint(point) {
    if (!this.isDrawing) return;

    const now = performance.now();
    const dx = point.x - this.lastPoint.x;
    const dy = point.y - this.lastPoint.y;
    const dist = Math.hypot(dx, dy);

    // Filter microscopic jitter for stability
    if (dist < 1.5) return;

    const dt = Math.max(1, now - this.lastTime);
    const speed = dist / dt;

    // 🔮 PREDICTIVE LERP: Hand movement-er sathe sync thik rakha
    const alpha = Math.min(0.8, Math.max(0.2, dist / 15));
    const smoothX = this.smoothedPoint.x + (point.x - this.smoothedPoint.x) * alpha;
    const smoothY = this.smoothedPoint.y + (point.y - this.smoothedPoint.y) * alpha;

    // 🎯 DYNAMIC BRUSH: Speed barle line halka chikol hobe (Realistic Ink)
    const targetSize = (point.size || 6) - Math.min(speed * 1.5, 3);
    const size = this.lastSize + (targetSize - this.lastSize) * 0.15;

    const smoothPoint = {
      ...point,
      x: smoothX,
      y: smoothY,
      size: Math.max(2, size),
      isDrawing: true
    };

    this.currentStroke.push(smoothPoint);
    this.lastPoint = point;
    this.smoothedPoint = smoothPoint;
    this.lastTime = now;
    this.lastSize = size;
  }

  endStroke() {
    if (!this.isDrawing) return;

    if (this.currentStroke.length > 1) {
      this.strokes.push([...this.currentStroke]);
      this.drawStrokeToBuffer(this.currentStroke);
    }

    this.currentStroke = [];
    this.isDrawing = false;
    this.redoStack = [];
    this.lastPoint = null;
    this.smoothedPoint = null;
  }

  /* ===============================
      🎨 RENDERING ENGINE
  =============================== */
  startLoop() {
    const loop = () => {
      this.render();
      this.animationFrame = requestAnimationFrame(loop);
    };
    this.animationFrame = requestAnimationFrame(loop);
  }

  stopLoop() {
    cancelAnimationFrame(this.animationFrame);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Static Layer: Purono strokes buffer theke eke deya (Lag-free)
    ctx.drawImage(this.bufferCanvas, 0, 0, this.canvas.width / (window.devicePixelRatio || 1), this.canvas.height / (window.devicePixelRatio || 1));

    // Active Layer: Bortoman stroke real-time draw kora
    if (this.currentStroke.length > 1) {
      this.drawStroke(ctx, this.currentStroke);
    }
  }

  drawStroke(ctx, stroke) {
    if (stroke.length < 2) return;
    
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 1; i < stroke.length - 1; i++) {
      const p1 = stroke[i];
      const p2 = stroke[i + 1];

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const color = p1.color || "#F5D061";
      const size = p1.size || 6;

      // 🌟 LAYER 1: CINEMATIC GLOW (Shadow optimization)
      ctx.beginPath();
      ctx.globalAlpha = 0.4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.moveTo(stroke[i-1].x, stroke[i-1].y);
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      ctx.stroke();

      // ✨ LAYER 2: SHARP CORE
      ctx.beginPath();
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = size * 0.3;
      ctx.moveTo(stroke[i-1].x, stroke[i-1].y);
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ===============================
      🧹 UTILITIES
  =============================== */
  rebuildBuffer() {
    this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    this.strokes.forEach(s => this.drawStroke(this.bufferCtx, s));
  }

  drawStrokeToBuffer(stroke) {
    this.drawStroke(this.bufferCtx, stroke);
  }

  undo() {
    if (this.strokes.length > 0) {
      this.redoStack.push(this.strokes.pop());
      this.rebuildBuffer();
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      this.strokes.push(this.redoStack.pop());
      this.rebuildBuffer();
    }
  }

  clear() {
    this.strokes = [];
    this.redoStack = [];
    this.rebuildBuffer();
  }
}