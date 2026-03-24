// modeHandler.js
class ModeHandler {
  constructor(defaultMode = "draw") {
    this.mode = defaultMode;

    /* =========================
       📡 SUBSCRIBERS (SELECTIVE)
    ========================= */
    this.listeners = new Set();

    /* =========================
       🧠 HISTORY (LIMITED)
    ========================= */
    this.history = [defaultMode];
    this.maxHistory = 50;

    /* =========================
       🔌 MIDDLEWARE (ASYNC SAFE)
    ========================= */
    this.middlewares = [];

    /* =========================
       ⚡ SCHEDULER
    ========================= */
    this.framePending = false;

    /* =========================
       🔒 MODE CONTROL
    ========================= */
    this.allowedModes = new Set([
      "draw",
      "erase",
      "ai",
      "gesture",
      "move", // ✅ Added Move mode
      "import", // ✅ Optional: for image import
    ]);

    this.transitionMap = {
      draw: ["erase", "ai", "gesture", "move", "import"],
      erase: ["draw", "move", "import"],
      ai: ["draw", "move", "import"],
      gesture: ["draw", "erase", "move", "import"],
      move: ["draw", "erase", "ai", "gesture", "import"],
      import: ["draw", "erase", "ai", "gesture", "move"], // import can transition to any
    };

    /* =========================
       🧪 DEV MODE
    ========================= */
    this.isDev =
      typeof process !== "undefined"
        ? process.env.NODE_ENV === "development"
        : true;

    this.log("🟢 Engine Initialized:", defaultMode);
  }

  log(...args) {
    if (this.isDev) console.log("[ModeHandler]", ...args);
  }

  /* =========================================
     🛡️ VALIDATION
  ========================================= */
  isValidMode(mode) {
    return this.allowedModes.has(mode);
  }

  canTransition(from, to) {
    return this.transitionMap[from]?.includes(to);
  }

  /* =========================================
     🚀 SET MODE (ASYNC + SAFE)
  ========================================= */
  async setMode(newMode, meta = {}) {
    if (!this.isValidMode(newMode)) {
      this.log("❌ Invalid mode:", newMode);
      return;
    }

    if (this.mode === newMode) return;

    if (!this.canTransition(this.mode, newMode)) {
      this.log(`⛔ Blocked transition: ${this.mode} → ${newMode}`);
      return;
    }

    const prevMode = this.mode;

    let context = {
      from: prevMode,
      to: newMode,
      meta,
      cancel: false,
    };

    /* 🔌 ASYNC MIDDLEWARE PIPELINE */
    for (const mw of this.middlewares) {
      try {
        await mw(context);
      } catch (err) {
        console.error("Middleware error:", err);
      }

      if (context.cancel) {
        this.log("⛔ Cancelled by middleware");
        return;
      }
    }

    /* 🔄 APPLY MODE */
    this.mode = context.to;

    /* 🧠 HISTORY (COLD PATH) */
    setTimeout(() => {
      this.history.push(this.mode);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }, 0);

    this.log(`🚀 ${prevMode} → ${this.mode}`, context.meta);

    this.scheduleNotify(prevMode);
  }

  /* =========================================
     ⚡ FRAME-BASED NOTIFY (NO LAG)
  ========================================= */
  scheduleNotify(prevMode) {
    if (this.framePending) return;

    this.framePending = true;

    requestAnimationFrame(() => {
      this.framePending = false;

      this.listeners.forEach(({ cb, filter }) => {
        try {
          if (!filter || filter(this.mode, prevMode)) {
            cb(this.mode, prevMode);
          }
        } catch (err) {
          console.error("Subscriber error:", err);
        }
      });
    });
  }

  /* =========================================
     📡 SUBSCRIBE (SELECTIVE)
  ========================================= */
  subscribe(cb, filter = null) {
    const entry = { cb, filter };
    this.listeners.add(entry);

    try {
      cb(this.mode, null);
    } catch (err) {
      console.error("Initial callback error:", err);
    }

    return () => {
      this.listeners.delete(entry);
    };
  }

  /* =========================================
     🔙 UNDO (SAFE)
  ========================================= */
  undo() {
    if (this.history.length < 2) return;

    const current = this.history.pop();
    const previous = this.history[this.history.length - 1];

    this.mode = previous;

    this.log(`↩️ Undo: ${current} → ${previous}`);

    this.scheduleNotify(current);
  }

  /* =========================================
     🔌 MIDDLEWARE
  ========================================= */
  use(fn) {
    if (typeof fn === "function") {
      this.middlewares.push(fn);
    }
  }

  clearMiddleware() {
    this.middlewares = [];
  }

  /* =========================================
     📥 GETTERS
  ========================================= */
  getMode() {
    return this.mode;
  }

  getHistory() {
    return Object.freeze([...this.history]);
  }

  /* =========================================
     🧹 DESTROY
  ========================================= */
  destroy() {
    this.listeners.clear();
    this.middlewares = [];
    this.history = [];
    this.mode = null;

    this.log("💀 Destroyed");
  }
}

/* =========================================
   🌍 SINGLETON EXPORT
========================================= */
let instance;

export const modeHandler = (() => {
  if (!instance) {
    instance = new ModeHandler("draw");

    /* 🔥 DEFAULT SAFETY MIDDLEWARE */
    instance.use(async (ctx) => {
      if (ctx.to === "invalid") {
        ctx.cancel = true;
      }
    });
  }

  return instance;
})();