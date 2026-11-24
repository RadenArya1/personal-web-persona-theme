/**
 * UNIVERSAL ZOOM 80% LOCK · ARZ-WEB ECOSYSTEM
 * Enforces a strict 80% zoom ratio across all devices and monitors,
 * and completely prevents user-initiated browser zoom overrides:
 * - Disables Ctrl + Wheel / Touchpad pinch-to-zoom
 * - Disables Ctrl + '+' / '-' / '0' / '=' / Numpad zoom shortcuts
 * - Disables mobile multi-touch pinch gestures
 * - Locks CSS zoom ratio to 0.8 (80%)
 */
(function lockZoomRatio() {
  'use strict';

  function getTargetZoom() {
    if (document.documentElement && document.documentElement.hasAttribute('data-zoom')) {
      const val = parseFloat(document.documentElement.getAttribute('data-zoom'));
      if (!isNaN(val) && val > 0) return val;
    }
    const meta = document.querySelector('meta[name="target-zoom"]');
    if (meta && meta.content) {
      const val = parseFloat(meta.content);
      if (!isNaN(val) && val > 0) return val;
    }
    return 0.8;
  }

  function enforceZoom() {
    const zoom = getTargetZoom();
    if (document.documentElement) {
      document.documentElement.style.zoom = String(zoom);
    }
    if (document.body) {
      document.body.style.zoom = String(zoom);
    }
  }

  // Enforce immediately and on DOM load
  enforceZoom();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enforceZoom);
  }
  window.addEventListener('load', enforceZoom);

  // 1. Prevent Ctrl + MouseWheel / Touchpad Pinch Zoom
  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  }, { passive: false });

  // 2. Prevent Keyboard Zoom Shortcuts (Ctrl +, Ctrl -, Ctrl 0, Ctrl =)
  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key;
      const code = e.keyCode || e.which;
      // '+', '-', '=', '0', or numpad equivalents
      if (
        key === '+' || key === '-' || key === '=' || key === '_' || key === '0' ||
        code === 187 || code === 189 || code === 107 || code === 109 || code === 48 || code === 96
      ) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  // 3. Prevent Touch Gesture / Pinch-to-zoom on Mobile / Tablet
  document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('gesturechange', function (e) {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('gestureend', function (e) {
    e.preventDefault();
  }, { passive: false });

  // Prevent multi-touch scale
  document.addEventListener('touchstart', function (e) {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // 4. Ensure Viewport Meta is Locked
  function lockViewportMeta() {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
  }

  if (document.head) {
    lockViewportMeta();
  } else {
    document.addEventListener('DOMContentLoaded', lockViewportMeta);
  }

  window.ArzZoomLock = {
    get targetZoom() { return getTargetZoom(); },
    enforceZoom: enforceZoom
  };
})();

