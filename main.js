(() => {
  // ===== Frame list =====
  const FRAME_COUNT = 45; // 0013..0057
  const FRAMES = [];
  for (let i = 13; i <= 57; i++) FRAMES.push(`frames/frame_${String(i).padStart(4, "0")}.webp`);

  const PHASE_END = [8, 17, 26, 35, 44]; // indices in FRAMES
  const PHASE_DURATION = 1400;
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // ===== i18n =====
  const STORAGE = "weblaze.lang";
  let lang = (() => {
    try { const s = localStorage.getItem(STORAGE); if (s && DICTS[s]) return s; } catch {}
    return "en";
  })();

  const tGet = (path) => {
    const parts = path.split(".");
    let v = DICTS[lang];
    for (const p of parts) v = v?.[p];
    return v;
  };

  function applyTranslations() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = tGet(el.getAttribute("data-i18n"));
      if (typeof v === "string") el.textContent = v;
    });
    renderDynamic();
    updateBeat(beatIdx);
  }

  function renderDynamic() {
    const t = DICTS[lang];
    // manifesto items
    const mi = document.getElementById("manifesto-items");
    mi.innerHTML = t.manifesto.items.map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${p}</p></div>`).join("");
    // capabilities
    const ci = document.getElementById("capabilities-items");
    ci.innerHTML = t.capabilities.items.map((it) => `<div class="card"><div class="k">${it.k}</div><p>${it.d}</p></div>`).join("");
    // process
    const pi = document.getElementById("process-items");
    pi.innerHTML = t.process.steps.map(([n, d], idx) =>
      `<li><span class="ph">${t.process.phase} 0${idx + 1}</span><span class="name">${n}</span><span class="desc">${d}</span></li>`
    ).join("");
    // plans
    const pl = document.getElementById("plans-items");
    pl.innerHTML = t.plans.items.map((it) => `
      <div class="card ${it.featured ? "featured" : ""}">
        ${it.featured ? `<span class="badge">${t.plans.recommended}</span>` : ""}
        <div class="tag">${it.tag}</div>
        <div class="price">${it.price}<span class="per">${t.plans.perProject}</span></div>
        <div class="subtitle">${it.subtitle}</div>
        <ul>${it.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
        <a href="#contact" class="plan-cta">${t.plans.cta} →</a>
      </div>
    `).join("");
  }

  function updateBeat(i) {
    const t = DICTS[lang];
    const beat = t.hero.beats[Math.max(0, i)];
    const root = document.getElementById("hero-beat");
    document.getElementById("hero-eyebrow").textContent = beat.eyebrow;
    document.getElementById("hero-title").textContent = beat.title;
    document.getElementById("hero-body").textContent = beat.body;
    document.getElementById("hero-counter-num").textContent = String(Math.max(0, i) + 1).padStart(2, "0");
    // retrigger animation
    root.classList.remove("beat-in-replay"); void root.offsetWidth;
    root.querySelectorAll("*").forEach((el) => { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });
    // dots
    document.querySelectorAll(".hero-dots .dot").forEach((d, idx) => {
      d.classList.toggle("active", idx === Math.max(0, i));
    });
  }

  // Language switcher
  document.querySelectorAll(".lang-switch button").forEach((b) => {
    b.addEventListener("click", () => {
      lang = b.dataset.lang;
      try { localStorage.setItem(STORAGE, lang); } catch {}
      document.querySelectorAll(".lang-switch button").forEach((x) => x.classList.toggle("active", x === b));
      applyTranslations();
    });
    if (b.dataset.lang === lang) b.classList.add("active"); else b.classList.remove("active");
  });

  // ===== Preloader =====
  const preEl = document.getElementById("preloader");
  const preFill = document.getElementById("preloader-fill");
  const prePct = document.getElementById("preloader-pct");
  const images = [];
  let loaded = 0;
  const start = performance.now();

  function preloadAll() {
    return new Promise((resolve) => {
      FRAMES.forEach((src, i) => {
        const img = new Image();
        img.decoding = "async";
        const done = () => {
          loaded++;
          const pct = Math.round((loaded / FRAMES.length) * 100);
          preFill.style.width = pct + "%";
          prePct.textContent = pct + "%";
          if (loaded === FRAMES.length) resolve();
        };
        img.onload = () => { (img.decode ? img.decode().then(done, done) : done()); };
        img.onerror = done;
        img.src = src;
        images[i] = img;
      });
    });
  }

  // ===== Hero canvas =====
  const canvas = document.getElementById("hero-canvas");
  const ctx = canvas.getContext("2d");
  let currentFrame = 0;
  let lastDrawn = -1;

  function draw(idx) {
    const img = images[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr; canvas.height = ch * dpr;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = canvas.width / canvas.height;
    let dw = canvas.width, dh = canvas.height;
    if (ir > cr) { dh = canvas.height; dw = dh * ir; }
    else { dw = canvas.width; dh = dw / ir; }
    ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
  }

  // ===== Phase state =====
  let phase = -1; // -1 nothing, 0..4 end of phase N
  let animating = false;
  let animRaf = 0;
  let beatIdx = 0;
  const heroSection = document.querySelector(".hero");

  function animateTo(target, onDone) {
    if (animRaf) cancelAnimationFrame(animRaf);
    const startFrame = currentFrame;
    const distance = Math.abs(target - startFrame);
    const duration = Math.max(400, (distance / 9) * PHASE_DURATION);
    const t0 = performance.now();
    animating = true;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const e = easeInOut(p);
      const f = startFrame + (target - startFrame) * e;
      currentFrame = f;
      const idx = Math.round(f);
      if (idx !== lastDrawn) { lastDrawn = idx; draw(idx); }
      if (p < 1) animRaf = requestAnimationFrame(step);
      else { animating = false; if (onDone) onDone(); }
    };
    animRaf = requestAnimationFrame(step);
  }

  function inHero() {
    const r = heroSection.getBoundingClientRect();
    return r.top <= 0 && r.bottom >= window.innerHeight - 4;
  }

  function tryAdvance(dir) {
    if (animating) return true;
    if (dir === 1 && phase >= 4) return false;
    if (dir === -1 && phase <= -1) return false;
    const next = phase + dir;
    const targetFrame = next < 0 ? 0 : PHASE_END[next];
    beatIdx = Math.max(0, next);
    updateBeat(beatIdx);
    animateTo(targetFrame, () => { phase = next; });
    return true;
  }

  function bindHero() {
    window.addEventListener("wheel", (e) => {
      if (!inHero()) return;
      if (Math.abs(e.deltaY) < 4) return;
      if (animating) { e.preventDefault(); return; }
      const dir = e.deltaY > 0 ? 1 : -1;
      if (tryAdvance(dir)) e.preventDefault();
    }, { passive: false });

    let touchY = 0, touchActive = false;
    window.addEventListener("touchstart", (e) => {
      touchY = e.touches[0].clientY; touchActive = true;
    }, { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (!inHero() || !touchActive) return;
      if (animating) { e.preventDefault(); return; }
      const dy = touchY - e.touches[0].clientY;
      if (Math.abs(dy) < 40) return;
      const dir = dy > 0 ? 1 : -1;
      if (tryAdvance(dir)) { e.preventDefault(); touchActive = false; }
    }, { passive: false });
    window.addEventListener("touchend", () => { touchActive = false; });

    window.addEventListener("keydown", (e) => {
      if (!inHero()) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        if (tryAdvance(1)) e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (tryAdvance(-1)) e.preventDefault();
      }
    });

    window.addEventListener("resize", () => { lastDrawn = -1; draw(Math.round(currentFrame)); });
  }

  // ===== Reveal-on-scroll =====
  function setupReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  // ===== Contact form (no backend) =====
  document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = e.currentTarget.querySelector("button");
    const orig = btn.textContent;
    btn.textContent = "✓ " + orig;
    setTimeout(() => { btn.textContent = orig; e.currentTarget.reset(); }, 1800);
  });

  // ===== Boot =====
  document.getElementById("year").textContent = new Date().getFullYear();
  applyTranslations();
  canvas.classList.add(); // noop just to keep
  setupReveal();
  bindHero();

  preloadAll().then(() => {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, 450 - elapsed);
    setTimeout(() => {
      preEl.classList.add("hidden");
      canvas.classList.add("ready");
      lastDrawn = 0;
      draw(0);
    }, wait);
  });
})();
