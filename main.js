/* =========================================================================
   Weblaze — main.js
   Vanilla JS · no dependencies · respects prefers-reduced-motion
   ======================================================================= */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760;

  /* ---------- year in footer ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- mobile menu ---------- */
  const burger = document.querySelector(".nav__burger");
  const mobile = document.getElementById("mobile-menu");
  if (burger && mobile) {
    const toggle = (open) => {
      const isOpen = open ?? mobile.hasAttribute("hidden");
      if (isOpen) {
        mobile.removeAttribute("hidden");
        burger.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
      } else {
        mobile.setAttribute("hidden", "");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    };
    burger.addEventListener("click", () => toggle());
    mobile.addEventListener("click", (e) => {
      if (e.target.tagName === "A") toggle(false);
    });
  }

  /* ---------- reveal on scroll ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(
      ".manifesto__cols, .caps__head, .cap, .process__head, .step, " +
      ".plans__head, .plans__group, .contact__copy, .contact__form"
    );
    targets.forEach((el) => el.classList.add("reveal"));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in__view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
    targets.forEach((el) => io.observe(el));

    const mTitle = document.querySelector(".manifesto__title");
    if (mTitle) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add("in__view"); io2.unobserve(entry.target); }
        });
      }, { threshold: 0.2 });
      io2.observe(mTitle);
    }

    setTimeout(() => {
      document.querySelectorAll(".reveal, .manifesto__title").forEach((el) => el.classList.add("in__view"));
    }, 1400);
  } else {
    document.querySelectorAll(".manifesto__title").forEach((el) => el.classList.add("in__view"));
  }

  /* ---------- contact form (mailto fallback) ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = form.querySelector(".form__status");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const data = new FormData(form);
      const subject = encodeURIComponent(`[Weblaze] ${data.get("subject") || "Nuevo proyecto"}`);
      const body = encodeURIComponent(
        `Nombre: ${data.get("name")}\n` +
        `Email: ${data.get("email")}\n\n` +
        `${data.get("message")}`
      );
      window.location.href = `mailto:hola@weblaze.com?subject=${subject}&body=${body}`;
      if (status) status.textContent = "Abriendo tu cliente de correo…";
      setTimeout(() => { if (status) status.textContent = ""; }, 6000);
    });
  }

  /* =====================================================================
     HERO — pixel-grid reveal (canvas)
     Each cell holds an alpha that lerps toward 0 inside cursor radius
     and back to 1 outside, producing a smooth pixel dissolve.
     ===================================================================== */
  const hero = document.querySelector(".hero");
  const canvas = hero && hero.querySelector(".hero__pixels");
  if (!hero || !canvas) return;

  if (isCoarse || reduceMotion) {
    hero.classList.add("hero--static");
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  const CELL = 16;       // px on screen
  const GAP  = 1;        // pixel gap inside each cell
  const R    = 220;      // reveal radius (px)
  const R2   = R * R;
  const SMOOTH = 0.18;   // lerp factor

  let cols = 0, rows = 0, cw = 0, ch = 0;
  let alphas;
  let mx = -9999, my = -9999;
  let needsRedraw = true;
  let lastFrame = 0;

  function resize() {
    const r = hero.getBoundingClientRect();
    cw = Math.ceil(r.width);
    ch = Math.ceil(r.height);
    canvas.width  = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width  = cw + "px";
    canvas.style.height = ch + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(cw / CELL);
    rows = Math.ceil(ch / CELL);
    alphas = new Float32Array(cols * rows).fill(1);
    needsRedraw = true;
  }
  resize();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
    needsRedraw = true;
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    mx = -9999; my = -9999;
    needsRedraw = true;
  });

  function draw(now) {
    // throttle to ~60fps
    if (now - lastFrame < 14) { requestAnimationFrame(draw); return; }
    lastFrame = now;

    // skip when nothing is animating to save battery
    let anyChange = false;

    ctx.clearRect(0, 0, cw, ch);

    for (let y = 0; y < rows; y++) {
      const cy = y * CELL + CELL / 2;
      const dy = cy - my;
      const dy2 = dy * dy;

      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const cx = x * CELL + CELL / 2;
        const dx = cx - mx;
        const d2 = dx * dx + dy2;

        let target = 1;
        if (d2 < R2) {
          const t = Math.sqrt(d2) / R;     // 0 at center → 1 at edge
          target = t * t;                  // ease, sharper hole
        }

        const a = alphas[i];
        const next = a + (target - a) * SMOOTH;
        if (Math.abs(next - a) > 0.002) anyChange = true;
        alphas[i] = next;

        if (next > 0.01) {
          ctx.fillStyle = next > 0.999
            ? "#0A0A0A"
            : "rgba(10,10,10," + next.toFixed(3) + ")";
          ctx.fillRect(x * CELL, y * CELL, CELL - GAP, CELL - GAP);
        }
      }
    }

    if (anyChange || needsRedraw) {
      needsRedraw = false;
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
