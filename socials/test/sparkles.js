const particles = [];

function getCenter(el) {
  return {
    x: el.offsetWidth / 2,
    y: el.offsetHeight / 2
  };
}

function createParticle(el) {
  const p = document.createElement("div");

  const isBig = Math.random() > 0.8;
  p.className = `sparkle-dot ${isBig ? "big" : "small"}`;

  el.appendChild(p);

  const radius = 8 + Math.random() * 20;
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.008 + Math.random() * 0.015;

  particles.push({
    el: p,
    parent: el,
    angle,
    speed,
    radius
  });
}

function updateParticles() {
  for (const p of particles) {
    const center = getCenter(p.parent);

    p.angle += p.speed;

    const x = center.x + Math.cos(p.angle) * p.radius;
    const y = center.y + Math.sin(p.angle) * p.radius;

    p.el.style.left = `${x}px`;
    p.el.style.top = `${y}px`;
  }

  requestAnimationFrame(updateParticles);
}

function startSparkles(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  const MAX = 18; // lower = tighter, cleaner

  setInterval(() => {
    if (particles.length < MAX) {
      createParticle(el);
    }
  }, 120);

  updateParticles();
}

startSparkles("#typed3");
