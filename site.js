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
  const onScroll = () => top && top.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
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
