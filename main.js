(() => {
  // ---------- Year ----------
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // ---------- Nav scroll state ----------
  const nav = document.getElementById('nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Mobile burger ----------
  const burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // ---------- Stagger groups ----------
  document.querySelectorAll('.cards, .process, .why-points').forEach((group) => {
    [...group.children].forEach((c, i) => {
      c.style.transitionDelay = (i * 60) + 'ms';
    });
  });

  // ---------- Magnetic buttons ----------
  if (matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      const strength = 14;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${(x / r.width) * strength}px, ${(y / r.height) * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // ---------- Tilt cards (subtle) ----------
  if (matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.tilt').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `translateY(-3px) perspective(900px) rotateX(${-y * 2.5}deg) rotateY(${x * 3}deg)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // ---------- i18n ----------
  const translations = {
    en: {
      "meta.title": "Weblaze — Digital presence, redefined",
      "meta.desc": "Weblaze designs, builds and tunes every layer of your digital presence. Six disciplines, one team.",
      "nav.studio": "Studio",
      "nav.services": "Services",
      "nav.process": "Process",
      "nav.contact": "Contact",
      "cta.start": "Start a project",
      "hero.chapter": "Chapter 01 / From idea to launch",
      "hero.word1": "DIGITAL",
      "hero.word2": "PRESENCE,",
      "hero.word3": "redefined",
      "hero.sub": "Six disciplines, one team. We design, build and tune every layer so growth has nowhere to leak.",
      "hero.scroll": "Scroll to explore",
      "manifesto.h": "We build websites with the patience of designers and the precision of engineers.",
      "manifesto.lead": "Every pixel earns its place. Every interaction is built to convert.",
      "manifesto.p1.t": "No templates.",
      "manifesto.p1.d": "Each site is designed for one brand. Nothing arrives by default.",
      "manifesto.p2.t": "Performance as craft.",
      "manifesto.p2.d": "Sub-second loads, accessible from the first commit, ready for SEO.",
      "manifesto.p3.t": "A small studio.",
      "manifesto.p3.d": "Direct line to the people designing and shipping. No middle layer.",
      "services.h": "Everything you need to ship and scale.",
      "services.lead": "Six disciplines, one team. We design, build and tune every layer so growth has nowhere to leak.",
      "svc.1.t": "Website Design",
      "svc.1.d": "Brand-driven UI, typography systems and motion principles tailored to your audience.",
      "svc.1.l1": "Custom design system",
      "svc.1.l2": "Conversion-tested layouts",
      "svc.1.l3": "Figma handoff",
      "svc.2.t": "Web Development",
      "svc.2.d": "Modern, type-safe codebases. Edge-rendered, observable, built to last past launch day.",
      "svc.2.l1": "Next.js · Astro · Webflow",
      "svc.2.l2": "Headless CMS",
      "svc.2.l3": "Core Web Vitals green",
      "svc.3.t": "SEO Growth",
      "svc.3.d": "Technical SEO, content architecture and link strategy that compounds month over month.",
      "svc.3.l1": "Audits & roadmaps",
      "svc.3.l2": "Programmatic SEO",
      "svc.3.l3": "Analytics & reporting",
      "svc.4.t": "AI Automation",
      "svc.4.d": "Custom agents, internal tools and workflow automations that remove the busywork.",
      "svc.4.l1": "Lead enrichment",
      "svc.4.l2": "Support copilots",
      "svc.4.l3": "RAG & integrations",
      "svc.5.t": "Branding",
      "svc.5.d": "Identity systems with the rigor of a studio and the speed of a startup.",
      "svc.5.l1": "Logo & marks",
      "svc.5.l2": "Voice & messaging",
      "svc.5.l3": "Brand guidelines",
      "svc.6.t": "Performance & Care",
      "svc.6.d": "Ongoing optimization, monitoring and iteration so your site keeps getting sharper.",
      "svc.6.l1": "Speed budgets",
      "svc.6.l2": "A/B testing",
      "svc.6.l3": "Monthly retainers",
      "process.h": "A four-phase orbit, repeated until the product clicks into place.",
      "proc.1.t": "Discover",
      "proc.1.d": "We listen, audit and pressure-test the brief. Days, not weeks.",
      "proc.2.t": "Define",
      "proc.2.d": "A single page of truth: scope, goals, success metrics.",
      "proc.3.t": "Design & Build",
      "proc.3.d": "High-fidelity from day one. Real type, real motion, real states.",
      "proc.4.t": "Launch & Grow",
      "proc.4.d": "Shipped to production. Measured. Iterated. Handed off cleanly.",
      "cta.h": "Ready to build something exceptional?",
      "cta.p": "Tell us where you are and where you want to go. We'll come back within one business day with a path to get there.",
      "cta.start_project": "Start your project",
      "cta.schedule": "Schedule a call",
      "foot.tagline": "Digital presence, redefined. A small studio for ambitious brands.",
      "foot.about": "About",
      "foot.contact": "Contact",
      "foot.language": "Language",
      "foot.built": "Built with care."
    },
    ca: {
      "meta.title": "Weblaze — Presència digital, redefinida",
      "meta.desc": "Weblaze dissenya, construeix i ajusta cada capa de la teva presència digital. Sis disciplines, un sol equip.",
      "nav.studio": "Estudi",
      "nav.services": "Serveis",
      "nav.process": "Procés",
      "nav.contact": "Contacte",
      "cta.start": "Comença un projecte",
      "hero.chapter": "Capítol 01 / De la idea al llançament",
      "hero.word1": "PRESÈNCIA",
      "hero.word2": "DIGITAL,",
      "hero.word3": "redefinida",
      "hero.sub": "Sis disciplines, un sol equip. Dissenyem, construïm i afinem cada capa perquè el creixement no tingui esquerdes.",
      "hero.scroll": "Desplaça per explorar",
      "manifesto.h": "Construïm webs amb la paciència dels dissenyadors i la precisió dels enginyers.",
      "manifesto.lead": "Cada píxel es guanya el seu lloc. Cada interacció està feta per convertir.",
      "manifesto.p1.t": "Sense plantilles.",
      "manifesto.p1.d": "Cada web es dissenya per a una sola marca. Res no arriba per defecte.",
      "manifesto.p2.t": "Rendiment com a ofici.",
      "manifesto.p2.d": "Càrregues per sota d'un segon, accessibles des del primer commit i preparades per al SEO.",
      "manifesto.p3.t": "Un estudi petit.",
      "manifesto.p3.d": "Línia directa amb qui dissenya i publica. Sense intermediaris.",
      "services.h": "Tot el que necessites per llançar i créixer.",
      "services.lead": "Sis disciplines, un sol equip. Dissenyem, construïm i afinem cada capa perquè el creixement no tingui esquerdes.",
      "svc.1.t": "Disseny Web",
      "svc.1.d": "UI alineada amb la marca, sistemes tipogràfics i principis de moviment fets a mida.",
      "svc.1.l1": "Sistema de disseny propi",
      "svc.1.l2": "Layouts validats per conversió",
      "svc.1.l3": "Entrega en Figma",
      "svc.2.t": "Desenvolupament Web",
      "svc.2.d": "Codi modern i tipat. Renderitzat a l'edge, observable, fet per durar més enllà del llançament.",
      "svc.2.l1": "Next.js · Astro · Webflow",
      "svc.2.l2": "CMS headless",
      "svc.2.l3": "Core Web Vitals en verd",
      "svc.3.t": "Creixement SEO",
      "svc.3.d": "SEO tècnic, arquitectura de continguts i estratègia d'enllaços que es composa mes rere mes.",
      "svc.3.l1": "Auditories i full de ruta",
      "svc.3.l2": "SEO programàtic",
      "svc.3.l3": "Analítica i informes",
      "svc.4.t": "Automatització amb IA",
      "svc.4.d": "Agents a mida, eines internes i automatitzacions que treuen la feina repetitiva.",
      "svc.4.l1": "Enriquiment de leads",
      "svc.4.l2": "Copilots de suport",
      "svc.4.l3": "RAG i integracions",
      "svc.5.t": "Branding",
      "svc.5.d": "Sistemes d'identitat amb el rigor d'un estudi i la velocitat d'una startup.",
      "svc.5.l1": "Logo i marques",
      "svc.5.l2": "Veu i missatge",
      "svc.5.l3": "Guies de marca",
      "svc.6.t": "Rendiment i Manteniment",
      "svc.6.d": "Optimització, monitoratge i iteració continus perquè la teva web no pari de millorar.",
      "svc.6.l1": "Pressupostos de velocitat",
      "svc.6.l2": "Tests A/B",
      "svc.6.l3": "Iguales mensuals",
      "process.h": "Una òrbita de quatre fases, repetida fins que el producte encaixa.",
      "proc.1.t": "Descobrir",
      "proc.1.d": "Escoltem, auditem i posem a prova el brief. Dies, no setmanes.",
      "proc.2.t": "Definir",
      "proc.2.d": "Una sola pàgina de veritat: abast, objectius i mètriques d'èxit.",
      "proc.3.t": "Dissenyar i Construir",
      "proc.3.d": "Alta fidelitat des del primer dia. Tipografia, moviment i estats reals.",
      "proc.4.t": "Llançar i Créixer",
      "proc.4.d": "Publicat a producció. Mesurat. Iterat. Entregat amb cura.",
      "cta.h": "Llest per construir alguna cosa excepcional?",
      "cta.p": "Explica'ns on ets i on vols arribar. Et responem en un dia laborable amb un camí per fer-ho.",
      "cta.start_project": "Comença el teu projecte",
      "cta.schedule": "Programa una trucada",
      "foot.tagline": "Presència digital, redefinida. Un estudi petit per a marques ambicioses.",
      "foot.about": "Sobre nosaltres",
      "foot.contact": "Contacte",
      "foot.language": "Idioma",
      "foot.built": "Fet amb cura."
    },
    es: {
      "meta.title": "Weblaze — Presencia digital, redefinida",
      "meta.desc": "Weblaze diseña, construye y afina cada capa de tu presencia digital. Seis disciplinas, un solo equipo.",
      "nav.studio": "Estudio",
      "nav.services": "Servicios",
      "nav.process": "Proceso",
      "nav.contact": "Contacto",
      "cta.start": "Empieza un proyecto",
      "hero.chapter": "Capítulo 01 / De la idea al lanzamiento",
      "hero.word1": "PRESENCIA",
      "hero.word2": "DIGITAL,",
      "hero.word3": "redefinida",
      "hero.sub": "Seis disciplinas, un solo equipo. Diseñamos, construimos y afinamos cada capa para que el crecimiento no se filtre por ningún lado.",
      "hero.scroll": "Desplázate para explorar",
      "manifesto.h": "Construimos webs con la paciencia de los diseñadores y la precisión de los ingenieros.",
      "manifesto.lead": "Cada píxel se gana su lugar. Cada interacción está hecha para convertir.",
      "manifesto.p1.t": "Sin plantillas.",
      "manifesto.p1.d": "Cada web se diseña para una sola marca. Nada llega por defecto.",
      "manifesto.p2.t": "Rendimiento como oficio.",
      "manifesto.p2.d": "Cargas por debajo del segundo, accesibles desde el primer commit y listas para SEO.",
      "manifesto.p3.t": "Un estudio pequeño.",
      "manifesto.p3.d": "Línea directa con quien diseña y publica. Sin intermediarios.",
      "services.h": "Todo lo que necesitas para lanzar y escalar.",
      "services.lead": "Seis disciplinas, un solo equipo. Diseñamos, construimos y afinamos cada capa para que el crecimiento no se filtre por ningún lado.",
      "svc.1.t": "Diseño Web",
      "svc.1.d": "UI alineada con la marca, sistemas tipográficos y principios de movimiento a medida.",
      "svc.1.l1": "Sistema de diseño propio",
      "svc.1.l2": "Layouts probados en conversión",
      "svc.1.l3": "Entrega en Figma",
      "svc.2.t": "Desarrollo Web",
      "svc.2.d": "Código moderno y tipado. Renderizado en el edge, observable, hecho para durar más allá del lanzamiento.",
      "svc.2.l1": "Next.js · Astro · Webflow",
      "svc.2.l2": "CMS headless",
      "svc.2.l3": "Core Web Vitals en verde",
      "svc.3.t": "Crecimiento SEO",
      "svc.3.d": "SEO técnico, arquitectura de contenidos y estrategia de enlaces que se acumula mes a mes.",
      "svc.3.l1": "Auditorías y hoja de ruta",
      "svc.3.l2": "SEO programático",
      "svc.3.l3": "Analítica e informes",
      "svc.4.t": "Automatización con IA",
      "svc.4.d": "Agentes a medida, herramientas internas y automatizaciones que eliminan el trabajo repetitivo.",
      "svc.4.l1": "Enriquecimiento de leads",
      "svc.4.l2": "Copilotos de soporte",
      "svc.4.l3": "RAG e integraciones",
      "svc.5.t": "Branding",
      "svc.5.d": "Sistemas de identidad con el rigor de un estudio y la velocidad de una startup.",
      "svc.5.l1": "Logo y marcas",
      "svc.5.l2": "Voz y mensaje",
      "svc.5.l3": "Guías de marca",
      "svc.6.t": "Rendimiento y Mantenimiento",
      "svc.6.d": "Optimización, monitorización e iteración continuas para que tu web no deje de mejorar.",
      "svc.6.l1": "Presupuestos de velocidad",
      "svc.6.l2": "Tests A/B",
      "svc.6.l3": "Igualas mensuales",
      "process.h": "Una órbita de cuatro fases, repetida hasta que el producto encaja.",
      "proc.1.t": "Descubrir",
      "proc.1.d": "Escuchamos, auditamos y ponemos a prueba el brief. Días, no semanas.",
      "proc.2.t": "Definir",
      "proc.2.d": "Una sola página de verdad: alcance, objetivos y métricas de éxito.",
      "proc.3.t": "Diseñar y Construir",
      "proc.3.d": "Alta fidelidad desde el primer día. Tipografía, movimiento y estados reales.",
      "proc.4.t": "Lanzar y Crecer",
      "proc.4.d": "Publicado en producción. Medido. Iterado. Entregado con cuidado.",
      "cta.h": "¿Listo para construir algo excepcional?",
      "cta.p": "Cuéntanos dónde estás y a dónde quieres llegar. Te respondemos en un día laborable con un camino para conseguirlo.",
      "cta.start_project": "Empieza tu proyecto",
      "cta.schedule": "Agenda una llamada",
      "foot.tagline": "Presencia digital, redefinida. Un estudio pequeño para marcas ambiciosas.",
      "foot.about": "Sobre nosotros",
      "foot.contact": "Contacto",
      "foot.language": "Idioma",
      "foot.built": "Hecho con cuidado."
    }
  };

  const STORAGE_KEY = 'weblaze.lang';
  const setLang = (lang) => {
    if (!translations[lang]) lang = 'en';
    const dict = translations[lang];
    document.documentElement.lang = lang;

    // textContent swap
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) {
        // If element also has data-i18n-attr, the swap goes to that attribute
        const attr = el.getAttribute('data-i18n-attr');
        if (attr) el.setAttribute(attr, dict[key]);
        else el.textContent = dict[key];
      }
    });

    // title
    if (dict['meta.title']) document.title = dict['meta.title'];

    // active state on switcher
    document.querySelectorAll('.lang').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
  };

  // wire chips
  document.querySelectorAll('.lang').forEach((b) => {
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });
  // footer language links
  document.querySelectorAll('[data-set-lang]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      setLang(a.getAttribute('data-set-lang'));
    });
  });

  // initial language
  let initial = 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) initial = stored;
  } catch (_) {}
  setLang(initial);
})();
