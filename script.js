// Highlights the current section's nav link as the user scrolls.
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.navlinks a');

  if (sections.length && navLinks.length) {
    const setActive = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    };

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  // ---------- Scroll progress bar ----------
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = `${pct}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ---------- Scroll reveal ----------
  const revealTargets = document.querySelectorAll(
    '.section-head, .role, .credential, .skill-group, .about-text'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));

  // ---------- Chip stagger-in ----------
  const chipGroups = document.querySelectorAll('.chip-row');
  const chipObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const chips = entry.target.querySelectorAll('.chip');
        chips.forEach((chip, i) => {
          chip.style.animationDelay = `${i * 45}ms`;
          chip.classList.add('chip-in');
        });
        chipObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );
  chipGroups.forEach((group) => chipObserver.observe(group));

  // ---------- Project card cursor spotlight ----------
  const projectCards = document.querySelectorAll('#projects .role');
  projectCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });
});

// Animated chomping Pac-Man favicon, drawn on a canvas and swapped in as
// the tab icon on an interval. No image assets needed for the animation.
(() => {
  const SIZE = 32;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  const frameAngles = [36, 20, 4, 20];
  let frame = 0;

  function drawFrame(mouthHalfAngle) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const r = SIZE / 2 - 1;

    ctx.fillStyle = '#f4e04d';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const startAngle = (mouthHalfAngle * Math.PI) / 180;
    const endAngle = (2 * Math.PI) - startAngle;
    ctx.arc(cx, cy, r, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#10141f';
    ctx.beginPath();
    ctx.arc(cx - 1, cy - r * 0.5, r * 0.09, 0, Math.PI * 2);
    ctx.fill();

    link.href = canvas.toDataURL('image/png');
  }

  drawFrame(frameAngles[0]);

  setInterval(() => {
    frame = (frame + 1) % frameAngles.length;
    drawFrame(frameAngles[frame]);
  }, 180);
})();

// ---------- Pac-Man Jump mini-game ----------
(() => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = H - 34;

  const overlay = document.getElementById('game-overlay');
  const overlayText = document.getElementById('game-overlay-text');
  const scoreEl = document.getElementById('game-score-val');
  const bestEl = document.getElementById('game-best-val');

  const COLORS = {
    yellow: '#f4e04d',
    coral: '#ff6b5e',
    mint: '#4ade80',
    blue: '#5ec8ff',
    paper: '#eef0f4',
    paperDim: '#b7bdcc',
    line: 'rgba(238,240,244,0.14)'
  };

  const GHOST_COLORS = ['#ff6b5e', '#5ec8ff', '#f4a4e0', '#ffb347'];
  const FRUIT_COLORS = ['#ff6b5e', '#f4e04d', '#4ade80'];

  const GRAVITY = 0.0022;
  const JUMP_VELOCITY = -0.62;
  const GROUND_SPEED_START = 0.28;
  const GROUND_SPEED_MAX = 0.55;

  let best = 0;
  try {
    best = parseInt(localStorage.getItem('pacjump_best') || '0', 10) || 0;
  } catch (e) {
    best = 0;
  }
  bestEl.textContent = best;

  let state = 'idle';
  let player, obstacles, speed, distance, lastTime, mouthPhase, rafId, bonusPoints;

  function resetState() {
    player = {
      x: 70,
      y: GROUND_Y - 26,
      w: 26,
      h: 26,
      vy: 0,
      onGround: true
    };
    obstacles = [];
    speed = GROUND_SPEED_START;
    distance = 0;
    mouthPhase = 0;
    spawnTimer = 0;
    bonusPoints = 0;
  }

  let spawnTimer = 0;

  function spawnObstacle() {
    const isFruit = Math.random() < 0.3;
    if (isFruit) {
      const fruitH = 40 + Math.random() * 30;
      obstacles.push({
        type: 'fruit',
        x: W + 20,
        y: GROUND_Y - fruitH,
        w: 16,
        h: 16,
        color: FRUIT_COLORS[Math.floor(Math.random() * FRUIT_COLORS.length)],
        caught: false
      });
    } else {
      const h = 20 + Math.random() * 10;
      obstacles.push({
        type: 'ghost',
        x: W + 20,
        y: GROUND_Y - h,
        w: 18,
        h,
        color: GHOST_COLORS[Math.floor(Math.random() * GHOST_COLORS.length)]
      });
    }
  }

  function jump() {
    if (state === 'idle') {
      startGame();
      return;
    }
    if (state === 'over') {
      startGame();
      return;
    }
    if (player.onGround) {
      player.vy = JUMP_VELOCITY;
      player.onGround = false;
    }
  }

  function startGame() {
    resetState();
    state = 'playing';
    overlay.classList.add('hidden');
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function endGame() {
    state = 'over';
    if (Math.floor(distance / 10) + bonusPoints > best) {
      best = Math.floor(distance / 10) + bonusPoints;
      bestEl.textContent = best;
      try { localStorage.setItem('pacjump_best', String(best)); } catch (e) {}
    }
    overlayText.textContent = 'Game over — tap to retry';
    overlay.classList.remove('hidden');
  }

  function drawGround() {
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();

    ctx.fillStyle = COLORS.line;
    for (let x = -20; x < W + 20; x += 24) {
      const dx = ((x - (distance % 24)) % (W + 40));
      ctx.fillRect(dx, GROUND_Y + 6, 10, 2);
    }
  }

  function drawPacman() {
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    const r = player.w / 2;

    const angle = 0.18 + Math.abs(Math.sin(mouthPhase)) * 0.25;
    ctx.fillStyle = COLORS.yellow;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle * Math.PI, (2 - angle) * Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#10141f';
    ctx.beginPath();
    ctx.arc(cx - 2, cy - r * 0.55, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGhost(o) {
    const x = o.x, y = o.y, w = o.w, h = o.h;
    ctx.fillStyle = o.color || COLORS.coral;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + h * 0.4);
    ctx.arc(x + w / 2, y + h * 0.4, w / 2, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    const scallops = 3;
    const sw = w / scallops;
    for (let i = scallops; i > 0; i--) {
      const sx = x + i * sw;
      ctx.quadraticCurveTo(sx - sw / 2, y + h - 6, sx - sw, y + h);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#10141f';
    ctx.beginPath();
    ctx.arc(x + w * 0.35, y + h * 0.42, w * 0.1, 0, Math.PI * 2);
    ctx.arc(x + w * 0.65, y + h * 0.42, w * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFruit(o) {
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2;
    const r = o.w / 2;

    ctx.fillStyle = o.color || COLORS.coral;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = COLORS.mint;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + 2, cy - r - 6);
    ctx.stroke();
  }

  function loop(now) {
    const dt = Math.min(now - lastTime, 40);
    lastTime = now;

    if (state !== 'playing') return;

    distance += dt * speed;
    speed = Math.min(GROUND_SPEED_MAX, speed + dt * 0.000006);
    mouthPhase += dt * 0.02;

    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    if (player.y >= GROUND_Y - player.h) {
      player.y = GROUND_Y - player.h;
      player.vy = 0;
      player.onGround = true;
    }

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnObstacle();
      spawnTimer = 900 + Math.random() * 900 - speed * 400;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.x -= speed * dt;
      if (o.x + o.w < 0) {
        obstacles.splice(i, 1);
        continue;
      }
      const px1 = player.x + 4, px2 = player.x + player.w - 4;
      const py1 = player.y + 4, py2 = player.y + player.h - 2;
      const ox1 = o.x, ox2 = o.x + o.w;
      const oy1 = o.y, oy2 = o.y + o.h;
      const overlaps = px2 > ox1 && px1 < ox2 && py2 > oy1 && py1 < oy2;

      if (o.type === 'fruit') {
        if (overlaps && !o.caught) {
          o.caught = true;
          bonusPoints += 25;
          obstacles.splice(i, 1);
        }
      } else if (overlaps) {
        endGame();
      }
    }

    ctx.clearRect(0, 0, W, H);
    drawGround();
    obstacles.forEach((o) => (o.type === 'fruit' ? drawFruit(o) : drawGhost(o)));
    drawPacman();

    scoreEl.textContent = Math.floor(distance / 10) + bonusPoints;

    if (state === 'playing') {
      rafId = requestAnimationFrame(loop);
    }
  }

  function drawIdle() {
    resetState();
    ctx.clearRect(0, 0, W, H);
    drawGround();
    drawPacman();
  }
  drawIdle();

  canvas.addEventListener('click', jump);
  overlay.addEventListener('click', jump);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      jump();
    }
  });
})();
