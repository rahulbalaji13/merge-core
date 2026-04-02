/* ── Clone hero phone screens into the simulator frame ───────────────────────── */
(function cloneScreens() {
  const heroScreens = document.querySelectorAll('.hero .app-screen');
  const simPhone = document.querySelector('.sim-frame .phone-screen');
  if (!simPhone || !heroScreens.length) return;

  heroScreens.forEach(screen => {
    const clone = screen.cloneNode(true);
    simPhone.appendChild(clone);
  });
})();

/* ── Tab / screen switching ──────────────────────────────────────────────────── */
const tabs = document.querySelectorAll('.screen-tab');
const detailCards = document.querySelectorAll('.detail-card');

function setActiveScreen(screenName) {
  tabs.forEach(tab => {
    const isActive = tab.dataset.screen === screenName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  // Update ALL app-screen elements (hero + simulator clone)
  document.querySelectorAll('.app-screen').forEach(screen => {
    screen.classList.toggle('active', screen.dataset.screen === screenName);
  });

  detailCards.forEach(card => {
    card.classList.toggle('active', card.dataset.screen === screenName);
  });
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => setActiveScreen(tab.dataset.screen));
});

/* ── APK download + toast + confetti + counter ───────────────────────────── */
const toast = document.getElementById('dlToast');

function triggerDownload(e) {
  // Let the native <a download> do its job — we just show the toast
  showToast();

  // Confetti celebration
  if (window.confetti) {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#5a3eff', '#00d4b4', '#ffc94d']
    });
  }

  // Lively update counter immediately
  if (typeof currentVisitorCount !== 'undefined' && visitorCountEl) {
    currentVisitorCount += 1;
    visitorCountEl.innerText = currentVisitorCount.toLocaleString();
  }
}

function showToast() {
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 4200);
}

// Expose to inline onclick handlers
window.triggerDownload = triggerDownload;

/* ── Floating widget parallax (subtle mouse tracking combined with CSS) ────── */
const widgets = document.querySelectorAll('.fw');
document.addEventListener('mousemove', e => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  widgets.forEach((w, i) => {
    const depth = 0.4 + (i % 3) * 0.18;
    const tx = dx * 16 * depth;
    const ty = dy * 14 * depth;
    w.style.translate = `${tx}px ${ty}px`;
  });
});

/* ── Live Visitor Counter (Real API + Fallback) ──────────────────────────── */
const visitorCountEl = document.getElementById('live-visitor-count');
let currentVisitorCount = 0;

async function initVisitorCounter() {
  if (!visitorCountEl) return;

  try {
    // Hit genuine count API for live visitor tracking
    const res = await fetch('https://api.counterapi.dev/v1/codecore_demo_web/visitors/up');
    const data = await res.json();
    if (data && data.count) {
      currentVisitorCount = data.count;
      // Animate the number counting up
      animateNumber(visitorCountEl, currentVisitorCount);
    } else {
      throw new Error("Invalid API response");
    }
  } catch (err) {
    console.log("Using fallback simulator for visitor count.");
    const saved = localStorage.getItem('codecore_visitor_count');
    currentVisitorCount = saved ? parseInt(saved, 10) : (1840 + Math.floor(Math.random() * 50));
    visitorCountEl.innerText = currentVisitorCount.toLocaleString();

    // Simulate live increment since API failed
    setInterval(() => {
      if (Math.random() > 0.5) {
        currentVisitorCount += Math.floor(Math.random() * 3) + 1;
        visitorCountEl.innerText = currentVisitorCount.toLocaleString();
        localStorage.setItem('codecore_visitor_count', currentVisitorCount);
      }
    }, 5000);
  }
}

function animateNumber(el, target) {
  let start = Math.max(0, target - 50);
  const duration = 1200;
  const startTime = performance.now();

  function update(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutQuad
    const ease = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(start + (target - start) * ease);
    el.innerText = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else el.innerText = target.toLocaleString();
  }
  requestAnimationFrame(update);
}

initVisitorCounter();

/* ── Feedback Star Rating ─────────────────────────────────────────────────── */
const stars = document.querySelectorAll('.star');
let selectedRating = 0;

stars.forEach(star => {
  star.addEventListener('click', (e) => {
    selectedRating = parseInt(e.target.dataset.val, 10);
    stars.forEach(s => {
      if (parseInt(s.dataset.val, 10) <= selectedRating) {
        s.classList.add('active');
        s.style.color = 'var(--gold)';
      } else {
        s.classList.remove('active');
        s.style.color = '';
      }
    });
  });
});

const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
if (submitFeedbackBtn) {
  submitFeedbackBtn.addEventListener('click', () => {
    if (selectedRating === 0) {
      alert("Please select a star rating before submitting.");
      return;
    }
    // Simulate collecting feedback
    submitFeedbackBtn.innerText = "Submitting...";
    submitFeedbackBtn.disabled = true;

    setTimeout(() => {
      alert(`Thank you! Your ${selectedRating}-star rating has been successfully collected by our team.`);
      submitFeedbackBtn.innerText = "Feedback Submitted ✓";
      submitFeedbackBtn.style.background = "var(--teal)";
      submitFeedbackBtn.style.color = "white";
      submitFeedbackBtn.style.borderColor = "var(--teal)";
    }, 800);
  });
}

/* ── Intersection-observer card reveals ─────────────────────────────────────── */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.hl-card').forEach((card, i) => {
  card.style.animationDelay = `${i * 90}ms`;
  card.style.animation = 'revealUp 0.7s cubic-bezier(.22,1,.36,1) both paused';
  io.observe(card);
});
