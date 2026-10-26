// Small progressive enhancements. The page reads fine without this file.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  $$(".year").forEach(el => (el.textContent = new Date().getFullYear()));

  // Light / dark switch (light is the default, choice is remembered)
  const themeBtn = $(".theme-toggle");
  const syncTheme = () => {
    const dark = root.dataset.theme === "dark";
    themeBtn.setAttribute("aria-pressed", dark);
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  };
  if (themeBtn) {
    syncTheme();
    themeBtn.addEventListener("click", () => {
      const dark = root.dataset.theme !== "dark";
      if (dark) root.dataset.theme = "dark"; else delete root.dataset.theme;
      try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
      syncTheme();
    });
  }

  // Header links drop-down
  const tog = $(".links-toggle"), panel = $("#links-panel");
  if (tog && panel) {
    const set = open => { tog.setAttribute("aria-expanded", open); panel.hidden = !open; };
    tog.addEventListener("click", e => { e.stopPropagation(); set(panel.hidden); });
    document.addEventListener("click", e => { if (!panel.contains(e.target)) set(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
  }

  // Music players: one shared <audio>, so starting a track stops the others
  const audio = new Audio();
  audio.preload = "none";
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  let current = null;

  const setProgress = (pl, frac) => {
    const r = $("input", pl);
    r.value = Math.round(frac * 1000);
    r.style.setProperty("--p", frac * 100 + "%");
  };
  const stopUI = () => {
    if (!current) return;
    current.classList.remove("is-playing");
    $(".play", current).setAttribute("aria-label", "Play " + $("h3", current).textContent);
  };
  const load = pl => {
    if (current === pl) return;
    stopUI();
    if (current) { setProgress(current, 0); $(".cur", current).textContent = "0:00"; }
    current = pl;
    audio.src = pl.dataset.src;
  };

  $$(".player").forEach(pl => {
    $(".play", pl).addEventListener("click", () => {
      if (current === pl && !audio.paused) { audio.pause(); return; }
      load(pl);
      audio.play().catch(() => {});
    });
    $("input", pl).addEventListener("input", e => {
      const frac = e.target.value / 1000;
      setProgress(pl, frac);
      if (current !== pl) { load(pl); audio.addEventListener("loadedmetadata", () => (audio.currentTime = frac * audio.duration), { once: true }); audio.load(); return; }
      if (audio.duration) audio.currentTime = frac * audio.duration;
    });
  });

  // Volume rail: applies to all players, remembered between visits
  const vol = $(".volume");
  if (vol) {
    const range = $("input", vol), val = $(".v-val", vol), mute = $(".v-mute", vol);
    let level = 80;
    try { const v = parseInt(localStorage.getItem("volume"), 10); if (v >= 0 && v <= 100) level = v; } catch {}
    const apply = () => {
      audio.volume = level / 100;
      range.value = level;
      range.style.setProperty("--p", level + "%");
      val.textContent = level;
      vol.classList.toggle("is-muted", audio.muted || level === 0);
      mute.setAttribute("aria-pressed", audio.muted);
      mute.setAttribute("aria-label", audio.muted ? "Unmute" : "Mute");
    };
    range.addEventListener("input", () => {
      level = +range.value; audio.muted = false; apply();
      try { localStorage.setItem("volume", level); } catch {}
    });
    mute.addEventListener("click", () => { audio.muted = !audio.muted; apply(); });
    apply();
  }

  audio.addEventListener("play", () => {
    current.classList.add("is-playing");
    $(".play", current).setAttribute("aria-label", "Pause " + $("h3", current).textContent);
  });
  audio.addEventListener("pause", stopUI);
  audio.addEventListener("timeupdate", () => {
    if (!current || !audio.duration) return;
    setProgress(current, audio.currentTime / audio.duration);
    $(".cur", current).textContent = fmt(audio.currentTime);
  });
  audio.addEventListener("ended", () => {
    setProgress(current, 0);
    $(".cur", current).textContent = "0:00";
  });

  // Rotating stands (music + games): slow spin, pauses on hover, arrows step
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$(".stand-box").forEach(box => {
    const ring = $(".ring", box);
    const items = $$(".item", ring);
    const step = 360 / items.length;
    const nowName = $(".now-name", box), nowNote = $(".now-note", box);
    let angle = 0, target = null, paused = reduced, front = -1, last = performance.now(), visible = true;

    $$("img", ring).forEach(img => {
      const broken = () => img.classList.add("is-broken");
      img.addEventListener("error", broken);
      if (img.complete && !img.naturalWidth) broken();
    });

    const render = () => {
      ring.style.setProperty("--rot", angle + "deg");
      items.forEach((it, k) => it.style.setProperty("--d", ((Math.cos((k * step + angle) * Math.PI / 180) + 1) / 2).toFixed(3)));
      const i = ((Math.round(-angle / step) % items.length) + items.length) % items.length;
      if (i !== front) {
        items[front]?.classList.remove("is-front");
        items[i].classList.add("is-front");
        nowName.textContent = $(".name", items[i]).textContent;
        nowNote.textContent = items[i].dataset.note;
        front = i;
      }
    };
    const tick = now => {
      const dt = Math.min(now - last, 100); last = now;
      if (visible) {
        if (target !== null) {
          angle += (target - angle) * Math.min(1, dt / 120);
          if (Math.abs(target - angle) < .05) { angle = target; target = null; }
        } else if (!paused) angle -= dt * 0.010;   // ~10 deg per second
        render();
      }
      requestAnimationFrame(tick);
    };
    const go = dir => { target = (Math.round(-(target ?? angle) / step) + dir) * -step; };
    $(".next", box).addEventListener("click", () => go(1));
    $(".prev", box).addEventListener("click", () => go(-1));
    box.addEventListener("mouseenter", () => (paused = true));
    box.addEventListener("mouseleave", () => (paused = reduced));
    box.addEventListener("focusin", () => (paused = true));
    if ("IntersectionObserver" in window)
      new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(box);
    render();
    requestAnimationFrame(tick);
  });
})();
