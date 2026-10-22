// Indigo Home GmbH: gemeinsame Funktionen aller Seiten.
// Kontaktangaben an einer Stelle. Leere Angaben werden ausgeblendet.
window.KONTAKT = { telefon: "+41 44 593 76 15", email: "info@indigohome.ch" };

(function () {
  document.documentElement.classList.add("js");
  const all = s => [...document.querySelectorAll(s)];
  const K = window.KONTAKT, tel = (K.telefon || "").trim(), mail = (K.email || "").trim();
  const telHref = "tel:" + tel.replace(/[^\d+]/g, "");
  all("[data-phone]").forEach(a => { if (tel) { a.textContent = tel; a.href = telHref; } else a.closest("[data-need]") && (a.closest("[data-need]").hidden = true); });
  all("[data-phone-btn]").forEach(a => { if (tel) a.href = telHref; else a.hidden = true; });
  all("[data-email]").forEach(a => { if (mail) { a.textContent = mail; a.href = "mailto:" + mail; } });
  const y = document.getElementById("yr"); if (y) y.textContent = new Date().getFullYear();

  // Menü auf dem Handy
  const nav = document.getElementById("nav"), mb = document.getElementById("menuBtn");
  if (nav && mb) {
    const set = o => { nav.classList.toggle("open", o); mb.setAttribute("aria-expanded", String(o)); mb.setAttribute("aria-label", o ? "Menü schliessen" : "Menü öffnen"); };
    mb.addEventListener("click", () => set(!nav.classList.contains("open")));
    nav.addEventListener("click", e => { if (e.target.closest("a")) set(false); });
  }
  // Kopfzeile beim Scrollen
  const top = document.querySelector(".top");
  const bar = document.querySelector(".progress");
  const onScroll = () => {
    top && top.classList.toggle("scrolled", scrollY > 8);
    if (bar) { const h = document.documentElement.scrollHeight - innerHeight; bar.style.setProperty("--p", h > 0 ? Math.min(1, scrollY / h) : 0); }
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  // Karten in Rastern nacheinander einblenden
  all(".stagger").forEach(g => [...g.children].forEach((c, i) => c.style.setProperty("--rd", (i % 3) * 0.09 + Math.floor(i / 3) * 0.05 + "s")));
  // Hero: Elemente folgen leicht der Maus (Tiefe)
  const hart = document.querySelector(".hart");
  if (hart && fine && !calm) {
    const layers = [...hart.querySelectorAll("[data-depth]")];
    let raf = 0;
    hart.closest(".hero").addEventListener("pointermove", e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        layers.forEach(l => { const d = +l.dataset.depth; l.style.translate = `${-x * d}px ${-y * d}px`; });
      });
    });
  }
  // Karten kippen leicht zur Maus
  if (fine && !calm) all(".tilt").forEach(c => {
    c.addEventListener("pointermove", e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transition = "transform .1s"; c.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    });
    c.addEventListener("pointerleave", () => { c.style.transition = "transform .6s cubic-bezier(.34,1.56,.64,1)"; c.style.transform = ""; });
  });
  // Einblenden
  const els = all(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(e => io.observe(e));
  } else els.forEach(e => e.classList.add("in"));
  // Zahlen hochzählen (data-count)
  const cio = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), d = 1400;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = to; return; }
    (function f(t) { const k = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  }), { threshold: .5 }) : null;
  all("[data-count]").forEach(e => cio ? cio.observe(e) : (e.textContent = e.dataset.count));

  // Kaufvertrag: Verkäufer und Käufer unterschreiben, danach erscheint das Siegel
  const con = document.querySelector("svg.contract");
  if (con) {
    const s1 = con.querySelector("#sg1"), s2 = con.querySelector("#sg2"), seal = con.querySelector(".seal");
    const p1 = con.querySelector(".p1"), p2 = con.querySelector(".p2");
    const done = () => { [s1, s2].forEach(s => s.style.strokeDashoffset = 0); seal.setAttribute("opacity", 1); };
    if (calm) done();
    else {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const sign = (path, pen, dur) => new Promise(res => {
        const len = path.getTotalLength(), t0 = performance.now();
        pen.setAttribute("opacity", 1);
        (function f(now) {
          const k = Math.min(1, (now - t0) / dur), e = ease(k), pt = path.getPointAtLength(e * len);
          path.style.strokeDashoffset = 1 - e;
          pen.setAttribute("transform", `translate(${pt.x} ${pt.y - 1}) rotate(${Math.sin(now / 90) * 4})`);
          if (k < 1) requestAnimationFrame(f);
          else { pen.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: "forwards" }); setTimeout(() => pen.setAttribute("opacity", 0), 350); res(); }
        })(t0);
      });
      const popSeal = () => { seal.setAttribute("opacity", 1); seal.animate([{ transform: "translate(318px,222px) scale(.2) rotate(-40deg)", opacity: 0 }, { transform: "translate(318px,222px) scale(1.12) rotate(6deg)", opacity: 1, offset: .7 }, { transform: "translate(318px,222px) scale(1) rotate(0)", opacity: 1 }], { duration: 650, easing: "cubic-bezier(.34,1.56,.64,1)" }); };
      const fadeOut = () => Promise.all([s1, s2, seal].map(el => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, fill: "forwards" }).finished));
      const reset = () => { [s1, s2].forEach(s => { s.getAnimations().forEach(a => a.cancel()); s.style.strokeDashoffset = 1; }); seal.getAnimations().forEach(a => a.cancel()); seal.setAttribute("opacity", 0); };
      (async function loop() {
        await wait(900);
        while (true) {
          reset(); await wait(500);
          await sign(s1, p1, 1900); await wait(450);
          await sign(s2, p2, 1900); await wait(350);
          popSeal(); await wait(4200);
          await fadeOut();
        }
      })();
    }
  }

  // Häuser im blauen Band bewegen sich beim Scrollen ruhig etwas langsamer als die Seite (Tiefeneffekt)
  const par = document.querySelector(".visual .par");
  if (par && !calm) {
    const band = par.closest(".visual"); let tick = false;
    const upd = () => { tick = false; const r = band.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; par.style.transform = `translateY(${(k * 60).toFixed(1)}px)`; };
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  }

  // Schnellstart oben: Angaben ins Bewertungsformular übernehmen
  const q = document.querySelector("form[data-quick]");
  if (q) q.addEventListener("submit", e => {
    e.preventDefault();
    const target = document.querySelector('form[data-form="bewertung"]');
    if (!target) return;
    const art = q.elements["q-objekt"].value, ort = q.elements["q-ort"].value.trim();
    const r = [...target.querySelectorAll('input[name="objektart"]')].find(x => x.value === art || (art === "Haus" && x.value === "Einfamilienhaus"));
    if (r) r.checked = true;
    if (ort && target.elements["ort"]) target.elements["ort"].value = ort;
    document.getElementById("bewertung").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(() => target.elements["name"] && target.elements["name"].focus({ preventScroll: true }), 700);
  });

  // Formulare: senden an /api/anfrage, sonst E-Mail-Programm öffnen
  all("form[data-form]").forEach(f => f.addEventListener("submit", async e => {
    e.preventDefault();
    const err = f.querySelector(".err"), ok = f.querySelector(".ok"), btn = f.querySelector("button[type=submit]");
    err.hidden = ok.hidden = true;
    const fail = (t, el) => { err.textContent = t; err.hidden = false; if (el) el.focus(); };
    for (const el of f.querySelectorAll("[required]")) {
      if (el.type === "checkbox" ? !el.checked : !String(el.value).trim()) return fail(el.dataset.msg || "Bitte alle Pflichtfelder ausfüllen.", el);
    }
    const em = f.querySelector("input[type=email]");
    if (em && em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) return fail("Bitte eine gültige E-Mail-Adresse angeben.", em);
    const data = { formular: f.dataset.form };
    for (const [k, v] of new FormData(f).entries()) { if (k === "website") continue; data[k] = data[k] ? data[k] + ", " + v : v; }
    if (f.website && f.website.value) return; // Spam-Falle
    btn.disabled = true; const label = btn.textContent; btn.textContent = "Wird gesendet …";
    const text = Object.entries(data).filter(([k]) => k !== "formular").map(([k, v]) => `${k}: ${v}`).join("\n");
    try {
      const r = await fetch("/api/anfrage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (r.ok) { ok.textContent = f.dataset.ok || "Vielen Dank. Wir melden uns so rasch wie möglich bei Ihnen."; ok.hidden = false; f.reset(); }
      else throw new Error("http");
    } catch (_) {
      location.href = "mailto:" + mail + "?subject=" + encodeURIComponent(f.dataset.subject || "Anfrage über die Website") + "&body=" + encodeURIComponent(text);
      ok.textContent = "Ihr E-Mail-Programm öffnet sich mit Ihrer Anfrage. Bitte dort absenden."; ok.hidden = false;
    }
    btn.disabled = false; btn.textContent = label;
  }));
})();
