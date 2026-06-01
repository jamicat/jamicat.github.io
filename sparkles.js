function createSparkle(el) {
  const sparkle = document.createElement("div");

  const isBig = Math.random() > 0.7;
  sparkle.className = `sparkle-dot ${isBig ? "big" : "small"}`;

  const rect = el.getBoundingClientRect();

  const x = Math.random() * rect.width;
  const y = Math.random() * rect.height;

  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;

  sparkle.style.setProperty("--x", `${(Math.random() - 0.5) * 60}px`);
  sparkle.style.setProperty("--y", `${(Math.random() - 0.5) * 60}px`);

  el.appendChild(sparkle);

  setTimeout(() => sparkle.remove(), 3500);
}

function startSparkles(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  setInterval(() => {
    const count = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < count; i++) {
      createSparkle(el);
    }
  }, 200);
}

startSparkles("#typed3");