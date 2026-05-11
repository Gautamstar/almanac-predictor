/* ─── SCROLL REVEAL ─── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.card, .gate-card, .seq-step, .pipeline-stage, .stack-category, .arch-layer, .db-table, .content-block'
).forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

/* ─── NAV ACTIVE LINK ─── */
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${e.target.id}` ? '#e2e8f0' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

/* ─── CANDLESTICK CANVAS ─── */
(function () {
  const canvas = document.getElementById('candleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); draw(); });

  const GREEN = 'rgba(255,255,255,0.6)';
  const RED   = 'rgba(255,255,255,0.25)';
  const NUM   = 60;

  function generateCandles(n) {
    const candles = [];
    let price = 180;
    for (let i = 0; i < n; i++) {
      const move = (Math.random() - 0.48) * 6;
      const open  = price;
      const close = price + move;
      const high  = Math.max(open, close) + Math.random() * 3;
      const low   = Math.min(open, close) - Math.random() * 3;
      candles.push({ open, close, high, low });
      price = close;
    }
    return candles;
  }

  let candles = generateCandles(NUM);
  let offset = 0;

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const all = candles.slice(Math.floor(offset) % candles.length)
      .concat(candles)
      .slice(0, NUM + 2);

    const prices = all.flatMap(c => [c.high, c.low]);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;

    const candleW = w / (NUM + 2);
    const pad = h * 0.1;

    all.forEach((c, i) => {
      const x = i * candleW - (offset % 1) * candleW;
      const y  = p => pad + (1 - (p - minP) / range) * (h - pad * 2);

      const bull = c.close >= c.open;
      ctx.strokeStyle = bull ? GREEN : RED;
      ctx.fillStyle   = bull ? GREEN : RED;
      ctx.lineWidth   = 1;

      // Wick
      ctx.beginPath();
      ctx.moveTo(x + candleW / 2, y(c.high));
      ctx.lineTo(x + candleW / 2, y(c.low));
      ctx.stroke();

      // Body
      const bodyTop    = y(Math.max(c.open, c.close));
      const bodyBottom = y(Math.min(c.open, c.close));
      const bodyH = Math.max(bodyBottom - bodyTop, 1);
      ctx.fillRect(x + candleW * 0.2, bodyTop, candleW * 0.6, bodyH);
    });

    // Overlay gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0,56,101,0.2)');
    grad.addColorStop(1, 'rgba(0,36,63,0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  function animate() {
    offset += 0.012;
    if (offset >= candles.length) {
      offset = 0;
      candles = generateCandles(NUM);
    }
    draw();
    requestAnimationFrame(animate);
  }

  animate();
})();
