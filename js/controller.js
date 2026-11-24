/* =====================================================================
   CONTROLLER — INTERACTION & EVENT CONTROLLER · ARZ-WEB
   Keyboard, Mouse, Audio Toggle, Screen Transitions, Data Binding
   ===================================================================== */

const Controller = {

  transitioning: false,
  audioUnlocked: false,

  init() {
    View.init();
    this.checkCasaOSEnvironment();
    this.bindMenu();
    this.bindKeyboard();
    this.bindAudioUnlock();
    this.bindAudioButton();
    this.bindContactForm();
  },

  checkCasaOSEnvironment() {
    const isLocal = Model.isLocalEnv();
    if (!isLocal) {
      document.querySelectorAll('.casaos-chip').forEach(el => el.remove());
    }
  },

  /* ---------- Contact form ---------- */
  bindContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const status = document.getElementById("form-status");
    const btn = form.querySelector(".form-send");

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (data._honey) return; // honeypot caught a bot
      if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
        if (status) status.textContent = "LENGKAPI SELURUH BIDANG // FILL ALL THREE FIELDS.";
        return;
      }
      if (btn) btn.disabled = true;
      if (status) status.textContent = "MENGIRIM // SENDING...";

      try {
        const res = await fetch(`https://formsubmit.co/ajax/${Model.contactEmail}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            message: data.message,
            _subject: `Portfolio Message from ${data.name} via Arz-WEB`,
          }),
        });
        if (!res.ok) throw new Error(res.status);
        if (status) status.innerHTML = "<span style='color:#00a5e6;font-weight:800;'>✓ PESAN TERKIRIM // MESSAGE SENT. TERIMA KASIH!</span>";
        form.reset();
        this.play();
      } catch {
        if (status) status.textContent = "MEMBUKA APLIKASI EMAIL ANDA // OPENING EMAIL APP...";
        const subject = encodeURIComponent(`Portfolio Message from ${data.name}`);
        const body = encodeURIComponent(`${data.message}\n\nDari: ${data.name} (${data.email})`);
        window.location.href = `mailto:${Model.contactEmail}?subject=${subject}&body=${body}`;
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  },

  /* ---------- Navigation ---------- */
  goTo(screen) {
    if (this.transitioning || screen === Model.state.screen) return;
    this.transitioning = true;
    this.play();

    View.wipe(
      () => { // mid-wipe: swap screens while covered by diagonal panes
        Model.state.screen = screen;
        View.showScreen(screen);
        if (screen === "projects") {
          this.loadProjects();
        } else {
          document.querySelectorAll("#screen-projects .card.sel").forEach(c => c.classList.remove("sel"));
          Model.state.projectIndex = -1;
        }
        if (screen === "skills") this.loadSkills();
      },
      () => { this.transitioning = false; }
    );
  },

  select(index) {
    const n = View.els.menuItems.length;
    if (n === 0) return;
    const next = (index + n) % n;
    if (next !== Model.state.menuIndex) this.play();
    Model.state.menuIndex = next;
    View.setMenuSelection(next);
  },

  selectProjectCard(index) {
    const cards = Array.from(document.querySelectorAll("#screen-projects .card"));
    if (cards.length === 0) return;
    const n = cards.length;
    const next = (index + n) % n;
    if (next !== Model.state.projectIndex) this.play();
    Model.state.projectIndex = next;
    cards.forEach((c, i) => {
      if (i === next) {
        c.classList.add("sel");
        c.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        c.classList.remove("sel");
      }
    });
  },

  bindProjectCards() {
    const cards = document.querySelectorAll("#screen-projects .card");
    cards.forEach((card, i) => {
      if (card._boundProjectSelect) return;
      card._boundProjectSelect = true;
      card.addEventListener("mouseenter", () => {
        this.selectProjectCard(i);
      });
    });
  },

  /* ---------- Screen data loading ---------- */
  async loadProjects() {
    View.renderFeatured(Model.getVisibleFeatured());
    this.bindProjectCards();
    this.selectProjectCard(0);
    if (Model.state.reposLoaded) return;
    const { repos, live } = await Model.fetchRepos();
    const status = live
      ? `${repos.length} REPOSITORIES · LIVE FROM GITHUB`
      : "SHOWING PINNED REPOSITORIES · GITHUB FEED READY";
    View.renderRepos(repos, status, Model);
    this.bindProjectCards();
    Model.state.reposLoaded = true;
  },

  loadSkills() {
    if (!Model.state.skillsBuilt) {
      View.renderSkills(Model.skills);
      Model.state.skillsBuilt = true;
    }
    View.animateSkillBars();
  },

  /* ---------- Sound ---------- */
  play() {
    if (this.audioUnlocked) View.playSelect();
  },

  bindAudioUnlock() {
    const unlock = () => {
      this.audioUnlocked = true;
    };

    addEventListener("pointerdown", unlock, { once: true, capture: true });
    addEventListener("keydown", unlock, { once: true, capture: true });
  },

  bindAudioButton() {
    const button = document.getElementById("audio-toggle");
    if (!button) return;

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.audioUnlocked = true;
      const isMuted = button.textContent === "🔇";

      if (isMuted) {
        button.textContent = "🔊";
        button.setAttribute("aria-label", "Mute audio");
        if (View.els.sfx) View.els.sfx.muted = false;
        Object.values(View.els.videos || {}).forEach(v => { if (v) v.muted = false; });
        this.play();
      } else {
        button.textContent = "🔇";
        button.setAttribute("aria-label", "Turn audio on");
        if (View.els.sfx) View.els.sfx.muted = true;
        Object.values(View.els.videos || {}).forEach(v => { if (v) v.muted = true; });
      }
    });
  },

  /* ---------- Input bindings ---------- */
  bindMenu() {
    View.els.menuItems.forEach((item, i) => {
      item.addEventListener("mouseenter", () => this.select(i));
      item.addEventListener("click", () => this.goTo(item.dataset.target));
    });

    document.querySelectorAll("[data-back]").forEach(b =>
      b.addEventListener("click", () => this.goTo("home")));

    // Clicking the name always takes you home
    const bigName = document.getElementById("big-name");
    if (bigName) {
      bigName.addEventListener("click", () => {
        if (Model.state.screen !== "home") this.goTo("home");
        else this.play();
      });
    }
  },

  bindKeyboard() {
    addEventListener("keydown", e => {
      // Abaikan kontrol tombol jika pengguna sedang berinteraksi dengan form input
      if (e.target && (e.target.matches?.('input, textarea, select') || e.target.isContentEditable)) {
        return;
      }

      if (e.key === "Escape") {
        if (Model.state.screen !== "home") {
          this.goTo("home");
          e.preventDefault();
        }
        return;
      }

      const key = e.key;
      const keyLower = key.toLowerCase();

      if (Model.state.screen === "home") {
        if (key === "ArrowDown" || key === "ArrowRight" || keyLower === "s" || keyLower === "d") {
          this.select(Model.state.menuIndex + 1);
          e.preventDefault();
        } else if (key === "ArrowUp" || key === "ArrowLeft" || keyLower === "w" || keyLower === "a") {
          this.select(Model.state.menuIndex - 1);
          e.preventDefault();
        } else if (key === "Enter") {
          const target = View.els.menuItems[Model.state.menuIndex]?.dataset.target;
          if (target) this.goTo(target);
          e.preventDefault();
        }
      } else if (Model.state.screen === "projects") {
        if (key === "ArrowDown" || key === "ArrowRight" || keyLower === "s" || keyLower === "d") {
          const cur = (Model.state.projectIndex !== undefined && Model.state.projectIndex >= 0) ? Model.state.projectIndex : -1;
          this.selectProjectCard(cur + 1);
          e.preventDefault();
        } else if (key === "ArrowUp" || key === "ArrowLeft" || keyLower === "w" || keyLower === "a") {
          const cur = (Model.state.projectIndex !== undefined && Model.state.projectIndex >= 0) ? Model.state.projectIndex : 1;
          this.selectProjectCard(cur - 1);
          e.preventDefault();
        } else if (key === "Enter") {
          const cards = Array.from(document.querySelectorAll("#screen-projects .card"));
          const activeCard = cards[Model.state.projectIndex];
          if (activeCard) {
            this.play();
            activeCard.click();
          }
          e.preventDefault();
        }
      }
    });
  },
};

// Initialize after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => Controller.init());
} else {
  Controller.init();
}

