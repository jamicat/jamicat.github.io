(() => {
  const canvas = document.getElementById("jamiStarfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const glow = document.createElement("canvas");
  glow.width = 64;
  glow.height = 64;
  const glowCtx = glow.getContext("2d");
  const gradient = glowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,240,214,0.3)");
  gradient.addColorStop(1, "rgba(255,240,214,0)");
  glowCtx.fillStyle = gradient;
  glowCtx.fillRect(0, 0, 64, 64);
  let stars = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frame = 0;
  let lastFrame = 0;
  let resizeFrame = 0;
  let videoPlaying = document.body.classList.contains("video-backdrop-active");
  const targetInterval = 1000 / 30;
  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const count = Math.max(50, Math.round(200 * width * height / (1920 * 1080)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.015
    }));
    lastFrame = 0;
    if (!videoPlaying) paint(0);
  }
  function paint(delta) {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      star.twinkle += star.speed * delta / (1000 / 60);
      const alpha = Math.max(0, Math.min(1, 0.3 + Math.sin(star.twinkle) * 0.5));
      ctx.globalAlpha = alpha;
      ctx.drawImage(glow, star.x - 32, star.y - 32);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#fff0d6";
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function tick(now) {
    frame = 0;
    if (document.hidden || motionQuery.matches || videoPlaying) return;
    if (!lastFrame || now - lastFrame >= targetInterval) {
      const delta = lastFrame ? Math.min(100, now - lastFrame) : 0;
      lastFrame = now;
      paint(delta);
    }
    frame = requestAnimationFrame(tick);
  }
  function syncMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (document.hidden || motionQuery.matches || videoPlaying) {
      if (!document.hidden && !videoPlaying) paint(0);
      return;
    }
    lastFrame = 0;
    frame = requestAnimationFrame(tick);
  }
  window.addEventListener("site-video-backdrop-state", event => {
    videoPlaying = event.detail?.playing === true;
    syncMotion();
  });
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
