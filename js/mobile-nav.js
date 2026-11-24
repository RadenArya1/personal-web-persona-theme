/**
 * mobile-nav.js — Navigasi Sentuh HP & Mobile Drawer
 * Portfolio RADEN ARYA (dashboard.raidenarya.my.id)
 *
 * Integrasi murni dengan Persona MVC Controller & View:
 * - Hamburger membuka/menutup drawer di ponsel
 * - Pemilihan section menutup drawer & menjalankan Controller.goTo(target)
 * - Esc menutup drawer di ponsel
 * - Menangani tombol back di tiap sub-screen
 * - Menyelaraskan zoom 1:1 pada ponsel dan zoom 0.8 pada desktop
 * - Desktop (>= 769px) tetap 100% menggunakan kontrol desktop keyboard/mouse
 */
(function () {
  'use strict';

  var btn = document.getElementById('mobileMenuBtn');
  var menu = document.getElementById('menu') || document.getElementById('mainMenu');
  if (!btn || !menu) return;

  var homeScreen = document.getElementById('screen-home');
  var shell = document.getElementById('shell') || document.body;

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  // Sinkronisasi zoom: pada ponsel gunakan skala 1:1 natural agar target sentuh pas >= 44px
  // Pada desktop kembalikan ke skala 0.8 sesuai Persona 3 design
  function syncZoom() {
    if (isMobile()) {
      document.documentElement.setAttribute('data-zoom', '1');
      document.documentElement.style.zoom = '1';
      if (document.body) document.body.style.zoom = '1';
    } else {
      document.documentElement.removeAttribute('data-zoom');
      if (window.ArzZoomLock && typeof window.ArzZoomLock.enforceZoom === 'function') {
        window.ArzZoomLock.enforceZoom();
      }
    }
  }

  // Pada mobile, reparent menu ke #shell agar dapat dibuka dari sub-screen manapun
  // Pada desktop, kembalikan ke #screen-home agar struktur desktop utuh 1:1
  function syncMenuPlacement() {
    syncZoom();
    if (isMobile()) {
      if (menu.parentElement !== shell) {
        shell.appendChild(menu);
      }
    } else {
      if (homeScreen && menu.parentElement !== homeScreen) {
        homeScreen.appendChild(menu);
      }
      setOpen(false);
    }
  }

  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? '✕' : '☰';
    btn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    document.body.classList.toggle('menu-open', open);
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!menu.classList.contains('is-open'));
  });

  // Pilih item menu: navigasi ke section & tutup drawer
  menu.querySelectorAll('.menu-item, button, a').forEach(function (el) {
    el.addEventListener('click', function () {
      if (isMobile()) {
        setOpen(false);
        var target = el.dataset.target;
        if (target && typeof Controller !== 'undefined' && typeof Controller.goTo === 'function') {
          Controller.goTo(target);
        }
      }
    });
  });

  // Tombol Esc menutup drawer di ponsel
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      e.stopPropagation();
    }
  });

  // Klik di luar menu menutup drawer
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('is-open') && !menu.contains(e.target) && e.target !== btn) {
      setOpen(false);
    }
  });

  // Pasang listener resize & orientasi
  window.addEventListener('resize', syncMenuPlacement);
  window.addEventListener('orientationchange', syncMenuPlacement);
  syncMenuPlacement();

  // Pengendali tombol kembali di semua sub-screen
  document.querySelectorAll('[data-back]').forEach(function (backBtn) {
    backBtn.addEventListener('click', function () {
      if (typeof Controller !== 'undefined' && typeof Controller.goTo === 'function') {
        Controller.goTo('home');
      }
    });
  });
})();
