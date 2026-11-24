/* =====================================================================
   MODEL — DATA AND STATE · ARZ-WEB PERSONA 3 RELOAD ENGINE
   Raden Arya Personal Operations Control Center & Web Architecture
   ===================================================================== */

const Model = {

  githubUser: "RadenArya1",

  // Where the contact form delivers
  contactEmail: "raidenarya070906@gmail.com",

  // App state
  state: {
    screen: "home",        // which screen is showing
    menuIndex: 0,          // selected item on the home menu
    reposLoaded: false,
    skillsBuilt: false,
  },

  // ---- Featured projects (hand-written, shown above the GitHub feed) ----
  featured: [
    {
      title: "ETHOL ACADEMIC NOTIFIER",
      tag: "Live App", color: "#00e5ff", live: true,
      url: "ethol-notifier/index.html", cta: "Open Notifier →",
      img: "assets/menus/ethol-notifier-hd.jpg",
      desc: "Executive Presensi Deck ETHOL PENS — automasi presensi cerdas, radial countdown ring, linimasa kehadiran real-time, audit bukti layar, dan metamorfosis warna tema.",
    },
    {
      title: "UNIVERSAL CONVERTER STUDIO",
      tag: "Client-Side App", color: "#3dc8ff", live: true,
      url: "converter/index.html", cta: "Open Converter →",
      img: "assets/menus/projects.jpg",
      desc: "Konversi berkas PDF, Word (.docx), PowerPoint (.pptx), dan Gambar (JPG, PNG, WEBP, SVG) 100% aman dan privat di browser tanpa server upload.",
    },
    {
      title: "STUDENT EXPENSE TRACKER",
      tag: "CasaOS Production", color: "#0064e6", live: true,
      url: "http://casaos.raidenarya.my.id", cta: "Visit CasaOS →",
      img: "assets/menus/skills.jpg",
      desc: "Platform manajemen tugas perkuliahan dan pencatatan pengeluaran harian dari foto nota via Tesseract OCR terdeploy live di Home Server.",
      isCasaOS: true,
    },
  ],

  // Determine if the current environment is local (localhost, 127.0.0.1, or file:)
  isLocalEnv() {
    const h = window.location.hostname;
    const p = window.location.protocol;
    return h === "localhost" || h === "127.0.0.1" || p === "file:";
  },

  // Filter featured cards based on environment (CasaOS visible on localhost, hidden on GitHub/domain)
  getVisibleFeatured() {
    const isLocal = this.isLocalEnv();

    return this.featured.filter(f => {
      if (f.isCasaOS && !isLocal) return false;
      return true;
    });
  },

  // Repos already shown in "featured" get hidden from the GitHub feed
  featuredRepoNames: [
    "ETHOL ACADEMIC NOTIFIER",
    "UNIVERSAL CONVERTER STUDIO",
    "STUDENT EXPENSE TRACKER",
  ],

  // Shown if the GitHub API can't be reached
  fallbackRepos: [
    {
      name: "Arz-WEB", language: "JavaScript", stargazers_count: 5,
      html_url: "https://github.com/RadenArya1/Arz-WEB",
      description: "Personal operations telemetry hub & production portfolio in Persona 3 Reload velvet aesthetic with 60% locked zoom.",
    },
    {
      name: "Ethol-Academic-Notifier", language: "JavaScript", stargazers_count: 3,
      html_url: "https://github.com/RadenArya1/Arz-WEB/tree/main/ethol-notifier",
      description: "Autonomous academic presence scheduler with Puppeteer background daemon and real-time SSE stream.",
    },
    {
      name: "Universal-Converter-Studio", language: "JavaScript", stargazers_count: 2,
      html_url: "https://github.com/RadenArya1/Arz-WEB/tree/main/converter",
      description: "In-browser WebAssembly document conversion engine with zero server transmission and maximum client privacy.",
    },
    {
      name: "Home-Server-CasaOS-Ops", language: "Shell", stargazers_count: 2,
      html_url: "https://github.com/RadenArya1",
      description: "Distributed home-server infrastructure scripts for Nginx reverse proxy, automated backups, and Tailscale routing.",
    },
  ],

  // Optional thumbnail overrides: repo name → image path.
  projectImages: {
    "Arz-WEB": "assets/menus/home.jpg",
    "Ethol-Academic-Notifier": "assets/menus/projects.jpg",
    "Universal-Converter-Studio": "assets/menus/skills.jpg",
    "Home-Server-CasaOS-Ops": "assets/menus/about.jpg",
  },

  langColors: {
    JavaScript: "#00e5ff", TypeScript: "#3178c6", Python: "#3572A5",
    PHP: "#4F5D95", CSS: "#663399", HTML: "#e34c26",
    Shell: "#89e051", PowerShell: "#012456", "C++": "#f34b7d",
  },

  // ---- Skills screen ----
  skills: [
    {
      group: "AI · AGENTS & AUTOMATION", items: [
        ["Autonomous AI Agents & Coding", 95],
        ["Puppeteer Web Scraping & Daemons", 92],
        ["TestSprite Automated Testing Gate", 88],
        ["Client-Side Web Audio Synthesizers", 86],
        ["Tesseract OCR & Computer Vision", 82],
      ]
    },
    {
      group: "FULL-STACK & SYSTEM ARCHITECTURE", items: [
        ["JavaScript (ESNext) & Node.js", 92],
        ["Python & System Automation", 86],
        ["Express & SSE Streaming Endpoints", 88],
        ["MySQL & Relational Data Design", 85],
        ["Nginx Web Server & Reverse Proxy", 88],
        ["CasaOS & Self-Hosted Infrastructure", 90],
      ]
    },
    {
      group: "DEV TOOLS & RUNTIMES", items: [
        ["Git & GitHub Version Control", 92],
        ["PowerShell & Bash Scripting", 88],
        ["Docker & Containerized Microservices", 82],
        ["Vite & Modern Client Tooling", 84],
      ]
    },
    {
      group: "SPOKEN LANGUAGES", items: [
        ["Indonesian (Bahasa Indonesia · Native)", 100],
        ["English (Professional Working Proficiency)", 85],
        ["Japanese (Basic JLPT Preparation)", 45],
      ]
    },
  ],

  // ---- Data fetching ----
  async fetchRepos() {
    const skip = new Set(this.featuredRepoNames);
    try {
      const res = await fetch(
        `https://api.github.com/users/${this.githubUser}/repos?per_page=30&sort=updated`
      );
      if (!res.ok) throw new Error(res.status);
      const repos = (await res.json()).filter(r => !r.fork && !skip.has(r.name));
      return { repos, live: true };
    } catch {
      return { repos: this.fallbackRepos.filter(r => !skip.has(r.name)), live: false };
    }
  },
};

