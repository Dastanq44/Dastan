// Small progressive enhancements. Every page works without this file.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  $$(".year").forEach(el => (el.textContent = new Date().getFullYear()));

  // Header links drop-down
  const tog = $(".links-toggle"), panel = $("#links-panel");
  if (tog && panel) {
    const set = open => { tog.setAttribute("aria-expanded", open); panel.hidden = !open; };
    tog.addEventListener("click", e => { e.stopPropagation(); set(panel.hidden); });
    document.addEventListener("click", e => { if (!panel.contains(e.target)) set(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
  }

  // Reveal on scroll
  const io = "IntersectionObserver" in window && new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => (io && !reduced ? io.observe(el) : el.classList.add("in")));

  // Sub-nav: highlight the section in view
  const subLinks = $$(".subnav a");
  if (subLinks.length && "IntersectionObserver" in window) {
    const map = new Map(subLinks.map(a => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        subLinks.forEach(a => a.classList.remove("is-active"));
        map.get(e.target.id)?.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); s && spy.observe(s); });
  }

  // Project filters
  $$(".filters button").forEach(btn => btn.addEventListener("click", () => {
    $$(".filters button").forEach(b => b.setAttribute("aria-pressed", b === btn));
    const f = btn.dataset.filter;
    $$(".project").forEach(p => p.classList.toggle("is-hidden", f !== "all" && p.dataset.type !== f));
  }));

  // Placeholder contribution grid (26 weeks x 7 days)
  const grid = $("#contrib");
  if (grid) {
    let seed = 44;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const cells = [];
    for (let d = 0; d < 7; d++) for (let w = 0; w < 26; w++) {
      const r = rnd();
      cells.push(`<i data-l="${r > .85 ? 3 : r > .6 ? 2 : r > .35 ? 1 : 0}"></i>`);
    }
    grid.innerHTML = cells.join("");
  }

  // Media shelf tabs
  const tabs = $$('.shelf-tabs [role="tab"]');
  tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }));

  // Music: one shared <audio>, tracks point at files via data-src
  const audio = new Audio();
  let current = null;
  const stop = () => {
    if (!current) return;
    current.classList.remove("is-playing");
    $("button", current).textContent = "▶";
  };
  $$(".track").forEach(tr => {
    const btn = $("button", tr);
    btn.addEventListener("click", () => {
      if (current === tr && tr.classList.contains("is-playing")) { audio.pause(); stop(); return; }
      if (current !== tr) {
        stop();
        current = tr;
        if (tr.dataset.src) audio.src = tr.dataset.src;
      }
      if (tr.dataset.src) audio.play().catch(() => {});
      tr.classList.add("is-playing");
      btn.textContent = "❚❚";
    });
  });
  audio.addEventListener("pause", stop);
  audio.addEventListener("ended", () => {
    const next = current?.nextElementSibling;
    next ? $("button", next).click() : null;
  });
})();
