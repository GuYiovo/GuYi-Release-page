/* main.js */
'use strict';

const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

window.addEventListener('error', e => {
  console.error('[APP-ERR]', e.message, e.filename, e.lineno);
}, { passive: true });

(function buildWaterfall() {
  const allPossibleImages = [];
  for (let i = 1; i <= 699; i++) allPossibleImages.push(i);
  
  for (let i = allPossibleImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPossibleImages[i], allPossibleImages[j]] = [allPossibleImages[j], allPossibleImages[i]];
  }
  
  const allImages = allPossibleImages.slice(0, 22);
  const columnOrders = [
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
    [21,12,4,10,5,1,6,17,9,13,8,15,19,14,16,11,7,3,0,2,18,20],
    [1,11,9,19,18,15,12,14,21,7,10,16,5,17,2,8,20,13,4,3,0,6],
    [18,12,9,1,3,4,19,6,2,14,13,8,7,21,16,17,20,11,5,0,10,15]
  ];

  const imgUrl = idx => `https://www.loliapi.com/acg/pc/?id=${allImages[idx]}`;
  const makeImgTag = idx => `<img src="${imgUrl(idx)}" alt="" decoding="async" width="400" height="560" loading="lazy">`;
  const buildImageGroup = order => `<div class="image-group">${order.map(makeImgTag).join('')}</div>`;

  const buildColumn = colIndex => `
    <div class="waterfall-column" data-column="${colIndex + 1}">
      <div class="scroll-track">
        ${buildImageGroup(columnOrders[colIndex])}
        ${buildImageGroup(columnOrders[colIndex])}
      </div>
    </div>`;

  let waterfallHTML = '<div class="waterfall-bg" id="waterfall-bg">';
  for (let c = 0; c < 4; c++) waterfallHTML += buildColumn(c);
  waterfallHTML += '</div>';

  const container = document.getElementById('waterfall-container');
  if (container) container.innerHTML = waterfallHTML;
})();

(function setPoem() {
  const poems = [
    "海内存知己，天涯若比邻。 —— 王勃", "人生若只如初见，何事秋风悲画扇。 —— 纳兰性德",
    "长风破浪会有时，直挂云帆济沧海。 —— 李白", "星垂平野阔，月涌大江流。 —— 杜甫",
    "落霞与孤鹜齐飞，秋水共长天一色。 —— 王勃", "大漠孤烟直，长河落日圆。 —— 王维",
    "但愿人长久，千里共婵娟。 —— 苏轼", "疏影横斜水清浅，暗香浮动月黄昏。 —— 林逋",
    "身无彩凤双飞翼，心有灵犀一点通。 —— 李商隐", "曾经沧海难为水，除却巫山不是云。 —— 元稹"
  ];
  const poemEl = document.getElementById('poem-container');
  if(poemEl) poemEl.textContent = poems[Math.floor(Math.random() * poems.length)];
})();

(function waterfallParallax() {
  if (window.matchMedia('(max-width: 768px)').matches || prefersReduced) return;
  let rafId = 0, lastTime = 0;
  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - lastTime < 50 || rafId) return;
    rafId = requestAnimationFrame(() => {
      const bg = document.getElementById('waterfall-bg');
      if (bg) {
        bg.style.setProperty('--mouse-x', `${(e.clientX - window.innerWidth / 2) * 0.03}px`);
        bg.style.setProperty('--mouse-y', `${(e.clientY - window.innerHeight / 2) * 0.03}px`);
      }
      lastTime = now;
      rafId = 0;
    });
  }, { passive: true });
})();

(function cardTilt() {
  const card = document.querySelector('.card.tilt');
  if (!card || prefersReduced || window.innerWidth <= 768) return;
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    card.style.transform = `rotateX(${clamp(-dy * 4, -6, 6)}deg) rotateY(${clamp(dx * 6, -8, 8)}deg)`;
  }, { passive: true });
  card.addEventListener('pointerleave', () => card.style.transform = 'rotateX(0) rotateY(0)', { passive: true });
})();

(function initButtons() {
  const stack = document.getElementById('stack');
  if (stack) requestAnimationFrame(() => stack.classList.add('ready'));

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (prefersReduced) return;
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      r.style.left = `${e.clientX - rect.left}px`;
      r.style.top  = `${e.clientY - rect.top}px`;
      btn.appendChild(r);
      r.addEventListener('animationend', () => r.remove(), { once: true });
    }, { passive: true });
  });
})();

(function snowEffect() {
  const canvas = document.getElementById('Snow');
  if (!canvas || prefersReduced) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const maxFlakes = window.innerWidth <= 600 ? 25 : 55;
  const flakes = [];
  let W, H, animFrameId, isRunning = false;

  class Flake {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : -5;
      this.r = Math.random() * 2.5 + 1;
      this.vy = Math.random() * 0.3 + 0.05;
      this.vx = Math.random() * 0.4 - 0.2;
      this.o = Math.random() * 0.5 + 0.3;
      this.wind = Math.random() * 0.02;
    }
    update() {
      this.y += this.vy;
      this.x += this.vx + Math.sin(this.y * this.wind / (H || 1) * 10) * 0.5;
      if (this.y > H + this.r) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.o})`;
      ctx.fill();
    }
  }

  function init() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    if (!flakes.length) for (let i = 0; i < maxFlakes; i++) flakes.push(new Flake());
    if (!isRunning) { isRunning = true; animate(); }
  }

  function animate() {
    if (document.hidden) { isRunning = false; return; }
    ctx.clearRect(0, 0, W, H);
    flakes.forEach(f => { f.update(); f.draw(); });
    animFrameId = requestAnimationFrame(animate);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isRunning) { isRunning = true; animate(); }
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animFrameId);
      isRunning = false;
      init();
    }, 200);
  }, { passive: true });

  init();
})();

(function updatePings() {
  const getPingClass = ms => ms <= 30 ? 'good' : ms <= 70 ? 'warn' : 'bad';
  const renderPing = (id, ms) => {
    const el = document.getElementById(id);
    if (el) { el.className = `chip ${getPingClass(ms)}`; el.textContent = `${ms} ms`; }
  };
  
  ['ping-global', 'ping-overseas', 'ping-tools'].forEach(id => 
    renderPing(id, Math.floor(Math.random() * 25) + 10)
  );
  ['ping-download', 'ping-qq'].forEach(id => 
    renderPing(id, Math.floor(Math.random() * 15) + 12)
  );
})();

(function logoFallback() {
  const logoImg = document.getElementById('site-logo');
  if (logoImg) {
    logoImg.onerror = () => {
      const p = logoImg.parentElement;
      logoImg.remove();
      if (p) p.textContent = 'GY';
    };
  }
})();
