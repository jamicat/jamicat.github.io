const particles = [];

function createParticle(el) {
  const p = document.createElement("div");

  const isBig = Math.random() > 0.8;
  p.className = `sparkle-dot ${isBig ? "big" : "small"}`;

  el.appendChild(p);

  const range = document.createRange();
  range.selectNodeContents(el);
  const rect = range.getBoundingClientRect();

  const cx = rect.width / 2;
  const cy = rect.height / 2;

  const radius = 10 + Math.random() * 25; // orbit distance
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.01 + Math.random() * 0.02;

  particles.push({
    el: p,
    parent: el,
    angle,
    speed,
    radius,
    cx,
    cy
  });
}

function updateParticles() {
  for (const p of particles) {
    const range = document.createRange();
    range.selectNodeContents(p.parent);
    const rect = range.getBoundingClientRect();

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    p.angle += p.speed;

    const x = cx + Math.cos(p.angle) * p.radius;
    const y = cy + Math.sin(p.angle) * p.radius;

    p.el.style.left = `${x}px`;
    p.el.style.top = `${y}px`;
  }

  requestAnimationFrame(updateParticles);
}

function startSparkles(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  const MAX_PARTICLES = 25;

  setInterval(() => {
    if (particles.length < MAX_PARTICLES) {
      createParticle(el);
    }
  }, 120);

  updateParticles();
}

startSparkles("#typed3");
