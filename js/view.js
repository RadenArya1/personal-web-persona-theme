/* =====================================================================
   VIEW — RENDERING ENGINE · ARZ-WEB PERSONA 3 RELOAD REPLICA
   Ransom Lettering, Polaroid Cards, 3-Pane Wipe, Sprite Cursor, Sound
   ===================================================================== */

const View = {

  reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,

  els: {
    screens: {},   // filled in init()
    menuItems: [],
    wipe: null,
    featGrid: null,
    repoGrid: null,
    repoStatus: null,
    skillsBody: null,
    sfx: null,
    cursor: null,
    clock: null,
    videos: {},
  },

  init() {
    this.els.wipe = document.getElementById("wipe");
    this.els.featGrid = document.getElementById("feat-grid");
    this.els.repoGrid = document.getElementById("repo-grid");
    this.els.repoStatus = document.getElementById("repo-status");
    this.els.skillsBody = document.getElementById("skills-body");
    this.els.sfx = document.getElementById("sfx-select");
    this.els.cursor = document.getElementById("cursor");
    this.els.clock = document.getElementById("clock");
    this.els.videos = {
      home: document.getElementById("video-home"),
      projects: document.getElementById("video-projects"),
      skills: document.getElementById("video-skills"),
      about: document.getElementById("video-about"),
      contact: document.getElementById("video-contact"),
    };

    document.querySelectorAll(".screen").forEach(s => {
      this.els.screens[s.id.replace("screen-", "")] = s;
    });

    this.els.menuItems = [...document.querySelectorAll(".menu-item")];
    document.querySelectorAll("[data-ransom]").forEach(el => this.ransomize(el));

    if (this.els.sfx) {
      this.els.sfx.volume = 0.5;
    }

    this.startClock();
    this.startParallax();
    this.startCursor();

    document.body.classList.add("loaded");
  },

  // Deterministic pseudo-random hash
  hash(str) {
    let h = 9;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 387420489);
    }
    return (h ^ (h >>> 9)) >>> 0;
  },

  /* ---------- Ransom-note lettering ---------- */
  ransomize(el) {
    const text = el.dataset.ransom || el.textContent;
    el.textContent = "";
    [...text].forEach((c, i) => {
      const span = document.createElement("span");
      span.className = "ch display";
      span.textContent = c;
      const h = this.hash(text + i);
      const rot = (h % 17) - 8;                     // -8..8 degrees
      const scale = 0.86 + ((h >> 3) % 30) / 100;   // 0.86..1.15
      const dy = ((h >> 5) % 9) - 4;                // -4..4 px
      const t = `rotate(${rot}deg) scale(${scale}) translateY(${dy}px)`;
      span.style.setProperty("--t", t);
      span.style.transform = t;
      const variant = (h >> 7) % 10;

      // Force specific characters to have distinctive Persona cutout boxes
      if (
        (text === "RADEN" && (c === "R" || c === "D")) ||
        (text === "ARYA" && (c === "A" || c === "R")) ||
        (text === "PROJECTS" && c === "P") ||
        (text === "SKILLS" && c === "K") ||
        (text === "ABOUT" && c === "B") ||
        (text === "CONTACT" && c === "T")
      ) {
        span.classList.add("box");
      } else if (variant === 0) {
        span.classList.add("box");
      } else if (variant === 1) {
        span.classList.add("boxw");
      } else if (variant === 2) {
        span.classList.add("red");
      }

      el.appendChild(span);
    });
  },

  /* ---------- Screens & menu ---------- */
  showScreen(name) {
    const s = this.els.screens;
    Object.values(s).forEach(sc => sc.classList.remove("active"));
    if (s[name]) {
      s[name].classList.add("active");
      s[name].scrollTop = 0;
    }
    document.body.dataset.screen = name;

    // Play active screen video and pause non-active videos for peak performance
    if (this.els.videos) {
      Object.entries(this.els.videos).forEach(([key, vid]) => {
        if (!vid) return;
        if (key === name) {
          const p = vid.play();
          if (p && p.catch) p.catch(() => { });
        } else {
          vid.pause();
        }
      });
    }
  },

  setMenuSelection(index) {
    this.els.menuItems.forEach((m, j) => m.classList.toggle("sel", j === index));
  },

  // Diagonal wipe; calls swap() mid-way while the screen is covered
  wipe(swap, done) {
    if (this.reducedMotion) { swap(); done(); return; }
    const w = this.els.wipe;
    if (!w) { swap(); done(); return; }
    w.classList.remove("go"); void w.offsetWidth;  // restart animation
    w.classList.add("go");
    setTimeout(swap, 340);
    setTimeout(done, 720);
  },

  /* ---------- Sound ---------- */
  playSelect() {
    try {
      if (this.els.sfx) {
        this.els.sfx.currentTime = 0;
        const p = this.els.sfx.play();
        if (p && p.catch) p.catch(() => { });
      }
    } catch (_) { }
  },

  /* ---------- Project cards ---------- */
  cardThumb(src) {
    return `<div class="thumb"><img src="${src}" alt="" loading="lazy"
      onerror="this.closest('.thumb').remove()"></div>`;
  },

  // Split "Ethol Academic…" so the first word renders red
  splitTitle(title) {
    const first = title.split(" ")[0];
    return `<em>${first}</em>${title.slice(first.length)}`;
  },

  renderFeatured(list) {
    if (!this.els.featGrid) return;
    this.els.featGrid.innerHTML = "";
    list.forEach((f, i) => {
      const a = document.createElement("a");
      a.className = "card feat";
      a.href = f.url;
      if (f.url && (f.url.startsWith("http") || f.url.includes("casaos"))) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      a.style.setProperty("--tilt", ((this.hash(f.title) % 5) - 2) * 0.8 + "deg");
      a.style.setProperty("--d", i * 70 + "ms");
      a.innerHTML = `
        ${this.cardThumb(f.img)}
        <span class="lang" style="--lc:${f.color}">${f.tag}</span>
        <h3>${f.live ? '<span class="live-dot"></span>' : ""}${this.splitTitle(f.title)}</h3>
        <p>${f.desc}</p>
        <div class="meta"><span>${f.live ? "LIVE NOW" : "HIGHLIGHT"}</span><span class="go">${f.cta}</span></div>`;
      this.els.featGrid.appendChild(a);
    });
  },

  renderRepos(repos, statusText, model) {
    if (!this.els.repoGrid || !this.els.repoStatus) return;
    this.els.repoStatus.textContent = statusText;
    this.els.repoGrid.innerHTML = "";
    repos.forEach((r, i) => {
      const a = document.createElement("a");
      a.className = "card";
      a.href = r.html_url; a.target = "_blank"; a.rel = "noopener";
      a.style.setProperty("--tilt", ((this.hash(r.name) % 5) - 2) * 0.8 + "deg");
      a.style.setProperty("--d", i * 70 + "ms");
      a.style.setProperty("--lc", model.langColors[r.language] || "#00e5ff");
      const pretty = r.name.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const img = model.projectImages[r.name] || `assets/menus/projects.jpg`;
      a.innerHTML = `
        ${this.cardThumb(img)}
        <span class="lang">${r.language || "Repo"}</span>
        <h3>${this.splitTitle(pretty)}</h3>
        <p>${r.description || "No description yet, but the code speaks for itself."}</p>
        <div class="meta">
          <span>★ ${r.stargazers_count || 0}</span>
          <span class="go">View on GitHub →</span>
        </div>`;
      this.els.repoGrid.appendChild(a);
    });
  },

  /* ---------- Skills ---------- */
  renderSkills(groups) {
    if (!this.els.skillsBody) return;
    this.els.skillsBody.innerHTML = "";
    groups.forEach(g => {
      const div = document.createElement("div");
      div.className = "skill-group";
      div.innerHTML = `<h3>${g.group}</h3>`;
      g.items.forEach(([name, value]) => {
        const row = document.createElement("div");
        row.className = "skill-row";
        row.innerHTML = `
          <span class="name">${name}</span>
          <div class="skill-bar"><div class="fill" data-v="${value}"></div></div>
          <span class="lv">${value}%</span>`;
        div.appendChild(row);
      });
      this.els.skillsBody.appendChild(div);
    });
  },

  animateSkillBars() {
    if (!this.els.skillsBody) return;
    const fills = this.els.skillsBody.querySelectorAll(".fill");
    fills.forEach(f => { f.style.width = "0"; });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fills.forEach((f, i) => setTimeout(() => { f.style.width = f.dataset.v + "%"; }, i * 60));
    }));
  },

  /* ---------- Ambient: clock, parallax, animated cursor ---------- */
  startClock() {
    if (!this.els.clock) return;
    const updateTime = () => {
      this.els.clock.textContent =
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " · WIB";
    };
    updateTime();
    setInterval(updateTime, 1000);
  },

  startParallax() {
    if (this.reducedMotion) return;
    const stripes = document.getElementById("bg-stripes");
    const halftone = document.getElementById("bg-halftone");
    const arts = [...document.querySelectorAll(".menu-art")];
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener("mousemove", e => {
      tx = e.clientX / innerWidth - 0.5;
      ty = e.clientY / innerHeight - 0.5;
    }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      if (stripes) stripes.style.transform = `translate(${cx * 22}px, ${cy * 14}px)`;
      if (halftone) halftone.style.transform = `translate(${cx * -34}px, ${cy * -22}px)`;
      arts.forEach(a => {
        if (a && a.isConnected)
          a.style.transform = `translate(${cx * 14}px, ${cy * 9}px) scale(1.04)`;
      });
      requestAnimationFrame(loop);
    };
    loop();
  },

  // 30-frame sprite-strip cursor extracted from authentic .ani files
  // Auto-calibrates for zoom: 0.8 so the sprite tracks cursor exactly 1:1
  startCursor() {
    if (!matchMedia("(pointer:fine)").matches || this.reducedMotion) return;
    const cur = this.els.cursor;
    if (!cur) return;
    document.body.classList.add("cursor-on");
    let x = -100, y = -100, frame = 0, last = 0, visible = false;

    // Detect zoom factor (defaults to 0.8 if locked)
    function getZoomFactor() {
      const z = parseFloat(window.getComputedStyle(document.body).zoom);
      return (z && !isNaN(z)) ? z : 0.8;
    }

    addEventListener("mousemove", e => {
      const z = getZoomFactor();
      x = e.clientX / z;
      y = e.clientY / z;

      if (!visible) { cur.style.display = "block"; visible = true; }
      const t = e.target;
      const overLink = t && t.closest &&
        t.closest("a,button,.card,.menu-item,.back-hint,.contact-chip,#big-name");
      cur.classList.toggle("link", !!overLink);
    }, { passive: true });

    document.documentElement.addEventListener("mouseleave", () => {
      cur.style.display = "none"; visible = false;
    });

    const tick = ts => {
      if (ts - last >= 50) { // 50ms = original .ani frame rate
        frame = (frame + 1) % 30; last = ts;
        cur.style.backgroundPosition = -frame * 48 + "px 0";
      }
      cur.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
};

