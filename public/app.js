(function () {
  const $ = (id) => document.getElementById(id);

  // Set current year in footer
  const yearEl = $('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Countdown to next Nov 25 at 00:00 local time
  function nextTargetDate() {
    const now = new Date();
    const year = now.getMonth() > 10 || (now.getMonth() === 10 && now.getDate() > 25) ? now.getFullYear() + 1 : now.getFullYear();
    return new Date(year, 10, 25, 0, 0, 0, 0); // month 10 => November
  }

  const daysEl = $('days');
  const hoursEl = $('hours');
  const minutesEl = $('minutes');
  const secondsEl = $('seconds');
  let target = nextTargetDate();

  const runningAnims = new WeakMap();
  function animateCount(element, toValue, durationMs) {
    const fromValue = parseInt(element.textContent || '0', 10);
    const start = performance.now();
    const duration = Math.max(120, durationMs || 600);

    // Cancel any existing animation on this element
    const prev = runningAnims.get(element);
    if (typeof prev === 'number') cancelAnimationFrame(prev);

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // EaseOutCubic
      const current = Math.round(fromValue + (toValue - fromValue) * eased);
      element.textContent = String(current).padStart(2, '0');
      if (t < 1) {
        const id = requestAnimationFrame(step);
        runningAnims.set(element, id);
      }
    }

    const id = requestAnimationFrame(step);
    runningAnims.set(element, id);
  }

  function updateCountdown() {
    const now = new Date();
    let diff = target - now;
    if (diff <= 0) {
      // Recompute for next year when reached
      target = nextTargetDate(new Date(now.getFullYear() + 1, 10, 25));
      diff = target - now;
    }

    const sec = Math.floor(diff / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);

    animateCount(daysEl, d, 500);
    animateCount(hoursEl, h, 500);
    animateCount(minutesEl, m, 500);
    animateCount(secondsEl, s, 500);
  }

  // Slow the animation to 0.2x (5x slower than before)
  const ANIM_MULTIPLIER = 5; // 0.2x speed

  // Keep original interval logic, but pass slower duration explicitly
  setInterval(() => {
    const now = new Date();
    let diff = target - now;
    if (diff <= 0) {
      target = nextTargetDate(new Date(now.getFullYear() + 1, 10, 25));
      diff = target - now;
    }
    const sec = Math.floor(diff / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    animateCount(daysEl, d, 500 * ANIM_MULTIPLIER);
    animateCount(hoursEl, h, 500 * ANIM_MULTIPLIER);
    animateCount(minutesEl, m, 500 * ANIM_MULTIPLIER);
    animateCount(secondsEl, s, 500 * ANIM_MULTIPLIER);
  }, 1000);

  // Subscribe form
  const form = document.getElementById('subscribe-form');
  const messageEl = document.getElementById('form-message');

  function isValidEmail(email) {
    return /^(?:[A-Z0-9_'^&+%`{}~!#$*\/=?|.-]+)@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i.test(email);
  }

  function setMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `form-message ${type || ''}`.trim();
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();

      if (!name) {
        setMessage('Please enter your name.', 'error');
        return;
      }
      if (!isValidEmail(email)) {
        setMessage('Please enter a valid email address.', 'error');
        return;
      }

      setMessage('Submitting…');
      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Request failed');
        setMessage('You’re in! Check your inbox on launch day.', 'success');
        form.reset();
      } catch (err) {
        setMessage(err.message || 'Something went wrong. Please try again.', 'error');
      }
    });
  }
  // TextPressure-like effect for the heading (vanilla JS port)
  (function initTextPressure() {
    const title = document.getElementById('pressure-title');
    if (!title) return;

    const originalText = title.textContent;
    title.textContent = '';
    const chars = Array.from(originalText);
    const spans = chars.map((ch) => {
      const span = document.createElement('span');
      span.textContent = ch;
      return span;
    });
    spans.forEach((s) => title.appendChild(s));
    // Insert a line break after the word "of"
    const ofIndex = originalText.indexOf('of');
    if (ofIndex !== -1 && spans[ofIndex + 1]) {
      const br = document.createElement('br');
      title.insertBefore(br, spans[ofIndex + 1].nextSibling);
    }

    const mouse = { x: 0, y: 0 };
    const cursor = { x: 0, y: 0 };

    function dist(a, b) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      return Math.hypot(dx, dy);
    }

    function handleMove(e) {
      const t = e.touches ? e.touches[0] : e;
      cursor.x = t.clientX;
      cursor.y = t.clientY;
    }
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });

    function setInitial() {
      const rect = title.getBoundingClientRect();
      mouse.x = rect.left + rect.width / 2;
      mouse.y = rect.top + rect.height / 2;
      cursor.x = mouse.x; cursor.y = mouse.y;
    }
    setInitial();
    window.addEventListener('resize', setInitial);

    let raf;
    (function animate() {
      mouse.x += (cursor.x - mouse.x) / 15;
      mouse.y += (cursor.y - mouse.y) / 15;

      const titleRect = title.getBoundingClientRect();
      const maxDist = Math.max(80, titleRect.width / 2);

      spans.forEach((span) => {
        const r = span.getBoundingClientRect();
        const center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        const d = dist(mouse, center);
        const getAttr = (distance, minVal, maxVal) => {
          const val = maxVal - Math.abs((maxVal * distance) / maxDist);
          return Math.max(minVal, val + minVal);
        };
        const wdth = 100; // width = false, keep fixed
        const wght = Math.floor(getAttr(d, 100, 900)); // weight = true, animate
        const ital = 0; // italic = false, keep fixed
        const alphaVal = getAttr(d, 0, 1).toFixed(2); // alpha = true, animate opacity
        span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${ital}`;
        span.style.opacity = alphaVal;
      });

      raf = requestAnimationFrame(animate);
    })();
  })();
})();


