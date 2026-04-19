/* ===== Weblaze — vanilla interactions ===== */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ===== Theme switch (azul / naranja) con fade sutil ===== */
  const THEME_KEY = 'weblaze-accent';
  const root = document.documentElement;
  let fadeTimer = 0;
  const applyAccent = (accent, withFade = false) => {
    if (withFade && !reduced) {
      root.classList.add('theme-fading');
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(() => root.classList.remove('theme-fading'), 700);
    }
    root.setAttribute('data-accent', accent);
    $$('.theme-switch__btn').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.accent === accent));
    });
  };
  const savedAccent = (() => {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  })();
  applyAccent(savedAccent === 'blue' ? 'blue' : 'orange', false);

  $$('.theme-switch__btn').forEach(b => {
    b.addEventListener('click', () => {
      const accent = b.dataset.accent;
      applyAccent(accent, true);
      try { localStorage.setItem(THEME_KEY, accent); } catch {}
    });
  });

  /* Year */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* Nav scroll + burger */
  const nav = $('#nav');
  const burger = $('#burger');
  const navMobile = $('#navMobile');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  burger?.addEventListener('click', () => {
    const open = navMobile.dataset.open === 'true';
    navMobile.dataset.open = open ? 'false' : 'true';
    navMobile.hidden = open;
    burger.setAttribute('aria-expanded', String(!open));
  });
  $$('#navMobile a').forEach(a => a.addEventListener('click', () => {
    navMobile.dataset.open = 'false'; navMobile.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* Reveal on scroll */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revealIO.observe(el));

  /* Counters */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target.querySelector('strong');
      const target = +el.dataset.count;
      const dur = 1400, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('es-ES');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  $$('.counter').forEach(c => counterIO.observe(c));

  /* Marquee duplicate for seamless loop */
  const mRow = $('#marqueeRow');
  if (mRow) {
    const clone = mRow.cloneNode(true); clone.removeAttribute('id');
    mRow.parentElement.appendChild(clone);
  }

  /* 3D tilt */
  if (!reduced) {
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', (ev) => {
        const r = el.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width;
        const y = (ev.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg)`;
        el.style.setProperty('--gx', `${x * 100}%`);
        el.style.setProperty('--gy', `${y * 100}%`);
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ===== Grid interactivo global: activo desde #servicios ===== */
  const bgGrid = $('#bgGrid');
  const servicios = $('#servicios');
  if (bgGrid && servicios) {
    const onScrollGrid = () => {
      const top = servicios.getBoundingClientRect().top;
      bgGrid.classList.toggle('is-on', top < window.innerHeight * 0.6);
    };
    onScrollGrid();
    window.addEventListener('scroll', onScrollGrid, { passive: true });
    window.addEventListener('mousemove', (e) => {
      bgGrid.style.setProperty('--mx', `${e.clientX}px`);
      bgGrid.style.setProperty('--my', `${e.clientY}px`);
    }, { passive: true });
  }

  /* Particles canvas (hero) — usa CSS vars para color */
  const canvas = $('#particles');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let particles = [], W = 0, H = 0, raf = 0, running = true;
    const mouse = { x: -9999, y: -9999 };

    const getRGB = () => {
      const v = getComputedStyle(root).getPropertyValue('--primary-rgb').trim();
      return v || '30,95,214';
    };
    const getRGBGlow = () => {
      const v = getComputedStyle(root).getPropertyValue('--primary-glow-rgb').trim();
      return v || '61,130,255';
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(80, Math.floor((W * H) / 16000));
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25
      }));
    };
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      const rgb = getRGB();
      const rgbG = getRGBGlow();
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      const max = 130;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < max) {
            const op = 1 - d / max;
            ctx.strokeStyle = `rgba(${rgb},${op * 0.18})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const mdx = a.x - mouse.x, mdy = a.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 160) {
          const op = 1 - md / 160;
          ctx.strokeStyle = `rgba(${rgbG},${op * 0.5})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          a.x += mdx * 0.0004 * op * 60;
          a.y += mdy * 0.0004 * op * 60;
        }
        ctx.fillStyle = `rgba(${rgb},0.7)`;
        ctx.beginPath(); ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) raf = requestAnimationFrame(draw); else cancelAnimationFrame(raf);
    });
    io.observe(canvas);

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(draw);
  }

  /* ===== Before / After slider — clip-path (sin redimensionar imágenes) ===== */
  const ba = $('#ba'), baBefore = $('#baBefore'), baHandle = $('#baHandle');
  if (ba && baBefore && baHandle) {
    let dragging = false;
    const setPct = (pct) => {
      pct = Math.max(0, Math.min(100, pct));
      baBefore.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      baHandle.style.left = pct + '%';
      ba.setAttribute('aria-valuenow', String(Math.round(pct)));
    };
    const setFromX = (px) => {
      const r = ba.getBoundingClientRect();
      setPct(((px - r.left) / r.width) * 100);
    };
    const start = () => dragging = true;
    const end = () => dragging = false;
    const move = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setFromX(x);
    };
    ba.addEventListener('mousedown', (e) => { start(); setFromX(e.clientX); });
    ba.addEventListener('touchstart', (e) => { start(); setFromX(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
    ba.addEventListener('keydown', (e) => {
      const cur = +ba.getAttribute('aria-valuenow') || 50;
      if (e.key === 'ArrowLeft') setPct(cur - 4);
      if (e.key === 'ArrowRight') setPct(cur + 4);
    });
    setPct(50);
  }

  /* Testimonials carousel */
  const track = $('#testiTrack');
  const dotsWrap = $('#testiDots');
  if (track && dotsWrap) {
    const cards = $$('.testi__card', track);
    let idx = 0, timer = 0;
    cards.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    });
    const dots = $$('button', dotsWrap);
    const go = (i) => {
      idx = (i + cards.length) % cards.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle('is-active', k === idx));
    };
    $$('.testi__btn').forEach(b => b.addEventListener('click', () => { go(idx + +b.dataset.dir); reset(); }));
    const tick = () => go(idx + 1);
    const reset = () => { clearInterval(timer); timer = setInterval(tick, 6000); };
    go(0); reset();
  }

  /* FAQ — single open at a time */
  $$('.faq__item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) $$('.faq__item').forEach(o => { if (o !== item) o.open = false; });
    });
  });

  /* Contact form (Formspree) */
  const form = $('#contactForm');
  if (form) {
    const status = $('#formStatus');
    const btn = $('#formSubmit');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form__status'; status.textContent = 'Enviando...';
      btn.disabled = true; btn.style.opacity = '.7';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          form.reset();
          status.classList.add('is-success');
          status.textContent = '✓ Mensaje enviado. Te respondemos en menos de 24h.';
        } else throw new Error();
      } catch {
        status.classList.add('is-error');
        status.textContent = '✗ Algo falló. Escríbenos directamente a hola@weblaze.com';
      } finally {
        btn.disabled = false; btn.style.opacity = '1';
      }
    });
  }
})();
