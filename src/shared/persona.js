/* ==========================================================================
   PERSONA 3 RELOAD ENGINE CONTROLLER · ARZ-WEB
   Exact 1:1 Video Replica Interactivity, Keyboard Navigation,
   3-Pane Diagonal Wipe Transition, Web Audio SFX & Background Sync
   ========================================================================== */

(function initPersonaEngine() {
  'use strict';

  // ─── 1. Web Audio SFX Synthesizer (Zero External Asset Dependency) ────────
  let audioCtx = null;
  let isMuted = false;

  try {
    isMuted = localStorage.getItem('persona_sfx_muted') === 'true';
  } catch (_) {
    isMuted = false;
  }

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playHoverSfx() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1480, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (_) {}
  }

  function playConfirmSfx() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Chord Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(now + 0.15);

      // Chord Tone 2 (Persona Velvet Shimmer)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.03); // A5
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.14);
      gain2.gain.setValueAtTime(0.10, now + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.03);
      osc2.stop(now + 0.16);
    } catch (_) {}
  }

  function playBackSfx() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.09);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.1);
    } catch (_) {}
  }

  // ─── 2. Ransom Typography Generator (Exact match with video) ─────────────
  function renderRansomWords() {
    const ransomEls = document.querySelectorAll('.ransom-word[data-ransom]');
    const colorClasses = ['rc-cyan', 'rc-blue', 'rc-white', 'rc-black', 'rc-red'];

    ransomEls.forEach((el, wordIndex) => {
      const text = el.getAttribute('data-ransom') || '';
      el.innerHTML = '';

      [...text].forEach((char, charIndex) => {
        if (char === ' ') {
          const space = document.createElement('span');
          space.style.width = '12px';
          el.appendChild(space);
          return;
        }

        const span = document.createElement('span');
        span.className = 'ransom-char';
        span.textContent = char;

        // Atur rotasi & kemiringan cut-out bergaya Persona 3 Reload
        const rot = ((charIndex * 7 + wordIndex * 13) % 11) - 5; // -5deg s.d. +5deg
        const skew = ((charIndex * 5) % 9) - 4; // -4deg s.d. +4deg
        span.style.setProperty('--rot', `${rot}deg`);
        span.style.setProperty('--skew', `${skew}deg`);

        // Pilih warna secara variatif
        const colorClass = colorClasses[(charIndex + wordIndex * 2) % colorClasses.length];
        span.classList.add(colorClass);

        el.appendChild(span);
      });
    });
  }

  // ─── 3. Screen Transition 3-Pane Diagonal Wipe Engine & Background Sync ───
  let isTransitioning = false;

  function switchScreen(targetScreenName) {
    if (isTransitioning) return;
    const cleanName = targetScreenName.replace(/^screen-/, '');
    const currentScreen = document.querySelector('.screen.active');
    const targetScreen = document.getElementById(`screen-${cleanName}`);
    if (!targetScreen || currentScreen === targetScreen) return;

    isTransitioning = true;

    // SFX
    if (cleanName === 'home') {
      playBackSfx();
    } else {
      playConfirmSfx();
    }

    // Step 1: Trigger 3-Pane Diagonal Wipe In (sweeps into view from top)
    document.body.classList.remove('is-wiping-out');
    document.body.classList.add('is-wiping');

    setTimeout(() => {
      // Step 2: Swap Active Screen Container & Background Layer under cover
      if (currentScreen) currentScreen.classList.remove('active');
      targetScreen.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });

      document.querySelectorAll('.screen-bg').forEach(bg => bg.classList.remove('active'));
      const activeBg = document.getElementById(`bg-${cleanName}`);
      if (activeBg) {
        activeBg.classList.add('active');
      }

      document.body.setAttribute('data-screen', cleanName);

      // Step 3: Trigger Wipe Out (sweeps out towards bottom)
      document.body.classList.add('is-wiping-out');

      setTimeout(() => {
        // Step 4: Finish transition and reset wipe state
        document.body.classList.remove('is-wiping', 'is-wiping-out');
        isTransitioning = false;
      }, 280);
    }, 240);
  }

  // ─── 4. Initialization & Event Binding ───────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Render Ransom Typography
    renderRansomWords();

    // Setup Audio Toggle Button
    const audioToggleBtn = document.getElementById('audioToggleBtn');
    const audioIcon = document.getElementById('audioIcon');

    function updateAudioIcon() {
      if (!audioIcon) return;
      if (isMuted) {
        audioIcon.className = 'fa-solid fa-volume-xmark';
        audioToggleBtn?.setAttribute('aria-label', 'Sound Effects Muted (Click to Unmute)');
      } else {
        audioIcon.className = 'fa-solid fa-volume-high';
        audioToggleBtn?.setAttribute('aria-label', 'Sound Effects Active (Click to Mute)');
      }
    }
    updateAudioIcon();

    audioToggleBtn?.addEventListener('click', () => {
      isMuted = !isMuted;
      try {
        localStorage.setItem('persona_sfx_muted', String(isMuted));
      } catch (_) {}
      updateAudioIcon();
      if (!isMuted) playConfirmSfx();
    });

    // Vertical Menu Navigation Ribbons on HOME Screen
    const menuNavItems = Array.from(document.querySelectorAll('.home-menu-nav .menu-nav-item'));
    let selectedNavIndex = 0;

    function setNavIndex(newIndex, playSound = true) {
      if (newIndex < 0 || newIndex >= menuNavItems.length) return;
      selectedNavIndex = newIndex;

      menuNavItems.forEach((btn, idx) => {
        if (idx === selectedNavIndex) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      if (playSound) playHoverSfx();
    }

    menuNavItems.forEach((btn, idx) => {
      // Hover event
      btn.addEventListener('mouseenter', () => {
        setNavIndex(idx, true);
      });

      // Click event
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-target');
        if (target) switchScreen(target);
      });
    });

    // Screen Switchers with [data-target] attribute
    document.querySelectorAll('[data-target]').forEach(btn => {
      if (!btn.classList.contains('menu-nav-item')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const target = btn.getAttribute('data-target');
          if (target) switchScreen(target);
        });
      }
    });

    // Back Buttons ([data-back])
    document.querySelectorAll('[data-back]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        switchScreen('home');
      });
    });

    // Global Keyboard Navigation (↑↓ SELECT, ENTER CONFIRM, ESC BACK)
    window.addEventListener('keydown', (e) => {
      const currentScreen = document.body.getAttribute('data-screen') || 'home';

      if (currentScreen === 'home') {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const nextIdx = (selectedNavIndex - 1 + menuNavItems.length) % menuNavItems.length;
          setNavIndex(nextIdx, true);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIdx = (selectedNavIndex + 1) % menuNavItems.length;
          setNavIndex(nextIdx, true);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const target = menuNavItems[selectedNavIndex]?.getAttribute('data-target');
          if (target) switchScreen(target);
        }
      } else {
        if (e.key === 'Escape') {
          e.preventDefault();
          switchScreen('home');
        }
      }
    });

    // Contact Form Handler
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');

    contactForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      playConfirmSfx();

      if (formFeedback) {
        formFeedback.innerHTML = '<span style="color:#00e5ff; font-weight:800; letter-spacing:0.08em;">✓ PESAN TERKIRIM // MESSAGE SENT. TERIMA KASIH!</span>';
        setTimeout(() => {
          formFeedback.innerHTML = '';
        }, 4500);
      }
      contactForm.reset();
    });

    // Autoplay Background Video for Initial Active Screen
    const initialBg = document.querySelector('.screen-bg.active');
    if (initialBg) {
      const vid = initialBg.querySelector('video');
      if (vid) vid.play().catch(() => {});
    }
  });

  // Global API exposure for testing / programmatic transitions
  window.PersonaApp = {
    switchScreen,
    playHoverSfx,
    playConfirmSfx,
    playBackSfx
  };

})();
