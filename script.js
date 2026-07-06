// Highlights the current section's nav link as the user scrolls.
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.navlinks a');

  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.style.color = isActive ? 'var(--paper)' : '';
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
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

  // Mouth angle oscillates between fully open and closed.
  const frameAngles = [36, 20, 4, 20]; // degrees of mouth opening, half-angle
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

    // eye
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
