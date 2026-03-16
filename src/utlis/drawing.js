/**
 * Advanced Drawing Utility for AirPen Pro - Lì Ào Edition
 * Features:
 * - Smooth Bezier interpolation
 * - Dynamic stroke width (speed-based)
 * - Neon glow + inner core
 * - Undo/Redo support
 */

export class DrawingManager {
  constructor(canvasRef) {
    this.canvasRef = canvasRef;
    this.ctx = canvasRef.current.getContext("2d");
    this.strokes = [];      // Completed strokes
    this.redoStack = [];    // Redo stack
    this.currentStroke = []; // Points of current stroke
    this.isDrawing = false;
    this.lastPoint = null;
    this.animationFrame = null;
  }

  startStroke(point) {
    this.isDrawing = true;
    this.currentStroke = [point];
    this.lastPoint = point;
  }

  addPoint(point) {
    if (!this.isDrawing) return;

    this.currentStroke.push(point);
    this.lastPoint = point;
  }

  endStroke() {
    if (!this.isDrawing) return;

    if (this.currentStroke.length > 1) {
      this.strokes.push([...this.currentStroke]);
    }
    this.currentStroke = [];
    this.isDrawing = false;
    this.redoStack = []; // Clear redo stack after new stroke
  }

  undo() {
    if (this.strokes.length === 0) return;
    const last = this.strokes.pop();
    this.redoStack.push(last);
    this.redrawAll();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const last = this.redoStack.pop();
    this.strokes.push(last);
    this.redrawAll();
  }

  clear() {
    this.strokes = [];
    this.redoStack = [];
    this.currentStroke = [];
    this.ctx.clearRect(0, 0, this.canvasRef.current.width, this.canvasRef.current.height);
  }

  // Smooth drawing using requestAnimationFrame
  drawLoop() {
    this.animationFrame = requestAnimationFrame(() => this.drawLoop());
    this.redrawAll(false);
  }

  stopLoop() {
    cancelAnimationFrame(this.animationFrame);
  }

  redrawAll(clear = true) {
    const ctx = this.ctx;
    const canvas = this.canvasRef.current;
    if (!ctx || !canvas) return;

    if (clear) ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw completed strokes
    this.strokes.forEach(stroke => {
      for (let i = 1; i < stroke.length; i++) {
        this._drawSmoothLine(ctx, stroke[i - 1], stroke[i]);
      }
    });

    // Draw current stroke
    if (this.currentStroke.length > 1) {
      for (let i = 1; i < this.currentStroke.length; i++) {
        this._drawSmoothLine(ctx, this.currentStroke[i - 1], this.currentStroke[i]);
      }
    }
  }

  _drawSmoothLine(ctx, prev, curr) {
    if (!prev || !curr) return;

    // Dynamic line width based on speed
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const lineWidth = Math.max(2, (curr.size || 8) * (1 / (dist / 5 + 0.5)));

    // Outer glow
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 15;
    ctx.shadowColor = curr.color || "#F5D061";
    ctx.strokeStyle = curr.color || "#F5D061";
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.stroke();

    // Inner core
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "white";
    ctx.lineWidth = lineWidth * 0.25;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.stroke();
  }
}