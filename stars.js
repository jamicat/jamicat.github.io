(() => {
  const canvas = document.getElementById("jamiStarfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const glow = document.createElement("canvas");
  glow.width = 48;
  glow.height = 48;
  const glowCtx = glow.getContext("2d");
  const gradient = glowCtx.createRadialGradient(24, 24, 0, 24, 24, 24);
  gradient.addColorStop(0, "rgba(205,220,255,0.31)");
  gradient.addColorStop(0.35, "rgba(225,220,245,0.12)");
  gradient.addColorStop(1, "rgba(205,220,255,0)");
  glowCtx.fillStyle = gradient;
  glowCtx.fillRect(0, 0, 48, 48);
  let stars = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frame = 0;
  let lastFrame = 0;
  let resizeFrame = 0;
  const targetInterval = 1000 / 24;
  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const count = Math.max(45, Math.min(220, Math.round(width * height / 10300)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.35 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.00028 + Math.random() * 0.00065,
      color: Math.random() < 0.26 ? "#d4e3ff" : "#fff0da"
    }));
    paint(performance.now());
  }
  function paint(now) {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      const alpha = motionQuery.matches ? 0.42 : 0.38 + 0.25 * Math.sin(now * star.speed + star.phase);
      ctx.globalAlpha = alpha * 0.52;
      ctx.drawImage(glow, star.x - 24, star.y - 24);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function tick(now) {
    frame = 0;
    if (document.hidden || motionQuery.matches) return;
    if (now - lastFrame >= targetInterval) {
      lastFrame = now;
      paint(now);
    }
    frame = requestAnimationFrame(tick);
  }
  function syncMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (document.hidden || motionQuery.matches) {
      if (!document.hidden) paint(performance.now());
      return;
    }
    lastFrame = 0;
    frame = requestAnimationFrame(tick);
  }
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resize();
      syncMotion();
    });
  }, { passive: true });
  document.addEventListener("visibilitychange", syncMotion);
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", syncMotion);
  else motionQuery.addListener(syncMotion);
  resize();
  syncMotion();
})();
