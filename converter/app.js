/**
 * Universal Converter Studio - App Controller
 * Alur 2-Tahap: Unggah Berkas Dulu -> Pilih Format Target di Radial Dial -> Konversi
 * 100% In-Browser & Client-Side Execution
 */

import { ConverterEngine } from './converter-engine.js';

(function initConverterStudio() {
  // State
  let activeFile = null;
  let activeDetectedType = null;
  let activeTargetFormat = null;
  let isConverting = false;
  let selectedTargetIndex = 0;

  // DOM Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const dropzoneEmptyState = document.getElementById('dropzoneEmptyState');
  const dropzoneLoadedState = document.getElementById('dropzoneLoadedState');
  const loadedFileName = document.getElementById('loadedFileName');
  const loadedFileMeta = document.getElementById('loadedFileMeta');
  const loadedFileIconWrap = document.getElementById('loadedFileIconWrap');
  const btnConvertActive = document.getElementById('btnConvertActive');
  const btnResetFile = document.getElementById('btnResetFile');
  const loadedFileProgressWrap = document.getElementById('loadedFileProgressWrap');
  const loadedProgressFill = document.getElementById('loadedProgressFill');
  const loadedProgressText = document.getElementById('loadedProgressText');
  const dialNodesContainer = document.getElementById('dialNodesContainer');
  const toastContainer = document.getElementById('toastContainer');

  // Backend Bridge State
  let backendInfo = { available: false };

  async function checkBackendStatus() {
    try {
      const res = await fetch('/api/converter/status');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          backendInfo = { available: true, ...data };
          return;
        }
      }
    } catch (_) {}
    backendInfo = { available: false };
  }

  async function executeBackendConversion(file, targetFormat, updateProgress) {
    updateProgress(15, 'Mengirim ke backend lokal...');
    const b64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result;
        resolve(res.includes(',') ? res.split(',')[1] : res);
      };
      reader.onerror = (e) => reject(new Error('Gagal membaca berkas: ' + e.message));
      reader.readAsDataURL(file);
    });

    const upRes = await fetch('/api/converter/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, content: b64 })
    });
    if (!upRes.ok) throw new Error('Gagal mengunggah berkas ke backend.');
    const upData = await upRes.json();
    if (!upData.success) throw new Error(upData.error || 'Unggah berkas gagal');

    updateProgress(50, 'Memproses konversi...');

    const convRes = await fetch('/api/converter/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_path: upData.path,
        target_format: targetFormat.toLowerCase(),
        quality: 'high'
      })
    });
    if (!convRes.ok) throw new Error('Gagal menjalankan konversi backend.');
    const convData = await convRes.json();
    if (!convData.success) throw new Error(convData.error || 'Konversi gagal');

    updateProgress(85, 'Mengambil berkas hasil...');

    const dlRes = await fetch(`/api/converter/download/${convData.filename}`);
    if (!dlRes.ok) throw new Error('Gagal mengunduh berkas hasil.');
    const blob = await dlRes.blob();

    return { blob, filename: convData.filename, engine: convData.engine || 'python-bridge' };
  }

  // Format definition
  const FORMAT_MAP = {
    image: {
      label: 'Gambar',
      icon: 'fa-image',
      targets: ['PDF', 'DOCX', 'PNG', 'JPG', 'WEBP'],
      defaultTarget: 'PDF'
    },
    docx: {
      label: 'Word',
      icon: 'fa-file-word',
      targets: ['PDF'],
      defaultTarget: 'PDF'
    },
    pptx: {
      label: 'PowerPoint',
      icon: 'fa-file-powerpoint',
      targets: ['PDF', 'DOCX'],
      defaultTarget: 'PDF'
    },
    pdf: {
      label: 'PDF',
      icon: 'fa-file-pdf',
      targets: ['DOCX', 'PNG', 'JPG'],
      defaultTarget: 'DOCX'
    }
  };

  /**
   * Deteksi Tipe Berkas dari nama & MIME type
   */
  function detectFileType(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const mime = file.type.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'bmp', 'gif', 'avif'].includes(ext) || mime.startsWith('image/')) {
      return 'image';
    }
    if (['docx', 'doc'].includes(ext) || mime.includes('wordprocessingml') || mime.includes('msword')) {
      return 'docx';
    }
    if (['pptx', 'ppt'].includes(ext) || mime.includes('presentationml') || mime.includes('powerpoint')) {
      return 'pptx';
    }
    if (ext === 'pdf' || mime === 'application/pdf') {
      return 'pdf';
    }
    return 'image';
  }

  /**
   * Format bytes ke ukuran yang mudah dibaca (KB / MB)
   */
  function formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Menampilkan Toast Notifikasi
   */
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    while (toastContainer.children.length >= 2) {
      toastContainer.removeChild(toastContainer.firstElementChild);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconClass = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  /**
   * Helper unduh Blob ke disk
   */
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function getTargetIcon(target) {
    const t = target.toUpperCase();
    if (t === 'PDF') return 'fa-file-pdf';
    if (t === 'DOCX') return 'fa-file-word';
    if (t === 'PPTX') return 'fa-file-powerpoint';
    if (['PNG', 'JPG', 'WEBP', 'SVG', 'GIF'].includes(t)) return 'fa-image';
    return 'fa-file-export';
  }

  /**
   * Render Radial Target Nodes di sekeliling dropzone
   */
  function renderTargetNodes(targets) {
    dialNodesContainer.innerHTML = '';
    selectedTargetIndex = 0;

    let angles = [];
    if (targets.length === 5) angles = [-90, 0, 60, 120, 180];
    else if (targets.length === 4) angles = [-90, 0, 90, 180];
    else if (targets.length === 3) angles = [-90, 30, 150];
    else if (targets.length === 2) angles = [-90, 90];
    else angles = [-90];

    targets.forEach((tgt, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `preset-chip dial-node ${tgt === activeTargetFormat ? 'active' : ''}`;
      btn.dataset.target = tgt;
      btn.style.setProperty('--node-angle', `${angles[i]}deg`);
      btn.innerHTML = `
        <div class="node-icon"><i class="fa-solid ${getTargetIcon(tgt)}"></i></div>
        <div class="node-label">ke ${tgt}</div>
      `;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectTargetByIndex(i);
      });
      dialNodesContainer.appendChild(btn);
    });
  }

  /**
   * Pilih format target aktif berdasarkan index
   */
  function selectTargetByIndex(idx) {
    const nodes = dialNodesContainer.querySelectorAll('.preset-chip.dial-node');
    if (!nodes[idx]) return;
    nodes.forEach((n) => n.classList.remove('active'));
    nodes[idx].classList.add('active');
    selectedTargetIndex = idx;
    activeTargetFormat = nodes[idx].dataset.target;
    showToast(`Target dipilih: ke ${activeTargetFormat}`, 'info');
  }

  /**
   * Memuat berkas aktif (Tahap 1 -> Tahap 2)
   */
  function loadActiveFile(file) {
    if (!file) return;
    activeFile = file;
    activeDetectedType = detectFileType(file);
    const conf = FORMAT_MAP[activeDetectedType] || FORMAT_MAP.image;
    activeTargetFormat = conf.defaultTarget;

    // Tampilkan detail file di lingkaran tengah
    dropzoneEmptyState.classList.add('hidden');
    dropzoneLoadedState.classList.remove('hidden');
    loadedFileName.textContent = file.name;
    loadedFileName.title = file.name;
    loadedFileMeta.textContent = `${conf.label} · ${formatSize(file.size)}`;

    if (activeDetectedType === 'image') {
      const previewUrl = URL.createObjectURL(file);
      loadedFileIconWrap.innerHTML = `<img src="${previewUrl}" alt="preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    } else {
      loadedFileIconWrap.innerHTML = `<i class="fa-solid ${conf.icon}"></i>`;
    }

    loadedFileProgressWrap.classList.add('hidden');
    btnConvertActive.disabled = false;
    btnConvertActive.innerHTML = '<i class="fa-solid fa-bolt"></i> <span>Konversi</span>';

    // Munculkan opsi format target yang valid di radial dial
    renderTargetNodes(conf.targets);
    showToast(`Berkas dimasukkan! Pilih format target di dial lalu klik Konversi`, 'info');
  }

  /**
   * Reset kembali ke State Awal (Tahap 1)
   */
  function resetActiveFile() {
    activeFile = null;
    activeDetectedType = null;
    activeTargetFormat = null;
    fileInput.value = '';
    dropzoneLoadedState.classList.add('hidden');
    dropzoneEmptyState.classList.remove('hidden');
    dialNodesContainer.innerHTML = '';
    showToast('Silakan masukkan berkas baru', 'info');
  }

  /**
   * Eksekutor Engine Konversi
   */
  async function executeConversion(file, detectedType, targetFormat, updateProgress) {
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    // 0. Coba eksekusi melalui backend fidelitas tinggi jika tersedia
    if (backendInfo.available) {
      try {
        const result = await executeBackendConversion(file, targetFormat, updateProgress);
        return result;
      } catch (backendErr) {
        console.warn('[CONVERTER] Backend gagal/tidak mendukung format, beralih ke in-browser fallback:', backendErr);
        showToast('Memproses melalui engine in-browser...', 'info');
      }
    }

    // 1. Gambar
    if (detectedType === 'image') {
      if (targetFormat === 'PDF') {
        const blob = await ConverterEngine.imagesToPdf([file], {}, updateProgress);
        return { blob, filename: `${baseName}.pdf` };
      }
      if (targetFormat === 'DOCX') {
        const blob = await ConverterEngine.imagesToDocx([file], {}, updateProgress);
        return { blob, filename: `${baseName}.docx` };
      }
      const fmt = targetFormat.toLowerCase();
      const mime = fmt === 'jpg' || fmt === 'jpeg' ? 'image/jpeg' : `image/${fmt}`;
      const blob = await ConverterEngine.convertImageFormat(file, mime, 0.92, updateProgress);
      return { blob, filename: `${baseName}.${fmt}` };
    }

    // 2. Word (DOCX)
    if (detectedType === 'docx') {
      if (targetFormat === 'PDF') {
        const blob = await ConverterEngine.docxToPdf(file, {}, updateProgress);
        return { blob, filename: `${baseName}.pdf` };
      }
    }

    // 3. PowerPoint (PPTX)
    if (detectedType === 'pptx') {
      if (targetFormat === 'PDF') {
        const blob = await ConverterEngine.pptxToPdf(file, {}, updateProgress);
        return { blob, filename: `${baseName}.pdf` };
      }
      if (targetFormat === 'DOCX') {
        const blob = await ConverterEngine.pptxToDocx(file, {}, updateProgress);
        return { blob, filename: `${baseName}.docx` };
      }
    }

    // 4. PDF
    if (detectedType === 'pdf') {
      if (targetFormat === 'DOCX') {
        const blob = await ConverterEngine.pdfToDocx(file, {}, updateProgress);
        return { blob, filename: `${baseName}.docx` };
      }
      if (targetFormat === 'PNG' || targetFormat === 'JPG') {
        const fmt = targetFormat.toLowerCase();
        const mime = fmt === 'jpg' || fmt === 'jpeg' ? 'image/jpeg' : 'image/png';
        const blob = await ConverterEngine.pdfToImages(file, { format: mime }, updateProgress);
        return { blob, filename: `${baseName}_halaman.${blob.type.includes('zip') ? 'zip' : fmt}` };
      }
    }

    throw new Error(`Kombinasi ${detectedType} ke ${targetFormat} belum didukung.`);
  }

  /**
   * Jalankan Konversi Berkas Aktif
   */
  async function convertActiveFile() {
    if (!activeFile || isConverting) return;
    isConverting = true;
    btnConvertActive.disabled = true;
    btnConvertActive.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Memproses...</span>';
    loadedFileProgressWrap.classList.remove('hidden');
    loadedProgressFill.style.width = '10%';
    loadedProgressText.textContent = 'Menyiapkan konversi...';

    const updateProgress = (pct, msg) => {
      loadedProgressFill.style.width = `${pct}%`;
      loadedProgressText.textContent = `${msg} (${pct}%)`;
    };

    try {
      const result = await executeConversion(activeFile, activeDetectedType, activeTargetFormat, updateProgress);
      triggerDownload(result.blob, result.filename);
      showToast(`Konversi berhasil! Mengunduh ${result.filename}`, 'success');
      loadedProgressFill.style.width = '100%';
      loadedProgressText.textContent = 'Selesai diunduh!';
    } catch (err) {
      console.error(err);
      showToast(`Gagal konversi: ${err.message}`, 'error');
      loadedProgressText.textContent = `Gagal: ${err.message}`;
    } finally {
      isConverting = false;
      btnConvertActive.disabled = false;
      btnConvertActive.innerHTML = '<i class="fa-solid fa-bolt"></i> <span>Konversi Lagi</span>';
    }
  }

  // Event Listeners Dropzone
  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('#btnConvertActive') || e.target.closest('#btnResetFile')) {
      return;
    }
    if (!activeFile) {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      loadActiveFile(e.target.files[0]);
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  ['dragleave', 'dragend'].forEach((ev) => {
    dropzone.addEventListener(ev, () => dropzone.classList.remove('drag-over'));
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadActiveFile(e.dataTransfer.files[0]);
    }
  });

  btnConvertActive.addEventListener('click', (e) => {
    e.stopPropagation();
    convertActiveFile();
  });

  btnResetFile.addEventListener('click', (e) => {
    e.stopPropagation();
    resetActiveFile();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Persona HUD Keyboard Controls: SELECT (↑↓/WASD), CONFIRM (ENTER), BACK (ESC)
  // ═══════════════════════════════════════════════════════════════════════
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) && document.activeElement?.type !== 'checkbox') {
      return;
    }

    const key = e.key;
    const nodesCount = dialNodesContainer.children.length;

    if (nodesCount > 0 && (key === 'ArrowRight' || key === 'ArrowDown' || key.toLowerCase() === 'd' || key.toLowerCase() === 's')) {
      e.preventDefault();
      const nextIdx = (selectedTargetIndex + 1) % nodesCount;
      selectTargetByIndex(nextIdx);
    } else if (nodesCount > 0 && (key === 'ArrowLeft' || key === 'ArrowUp' || key.toLowerCase() === 'a' || key.toLowerCase() === 'w')) {
      e.preventDefault();
      const prevIdx = (selectedTargetIndex - 1 + nodesCount) % nodesCount;
      selectTargetByIndex(prevIdx);
    } else if (key === 'Enter') {
      e.preventDefault();
      if (!activeFile) {
        fileInput.click();
      } else {
        convertActiveFile();
      }
    } else if (key === 'Escape') {
      e.preventDefault();
      if (activeFile) {
        resetActiveFile();
      } else {
        const btnBack = document.getElementById('btnBackGrimoire');
        if (btnBack) btnBack.click();
        else window.location.href = '../index.html';
      }
    }
  });

  // Live WIB Clock (Format: HH.mm.ss · WIB)
  function updateHudClock() {
    const clockEl = document.getElementById('hudClock');
    if (!clockEl) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    // WIB = UTC+7
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wib = new Date(utc + (3600000 * 7));
    const h = pad(wib.getHours());
    const m = pad(wib.getMinutes());
    const s = pad(wib.getSeconds());
    clockEl.textContent = `${h}.${m}.${s} · WIB`;
  }
  updateHudClock();
  setInterval(updateHudClock, 1000);

  // Expose global helper untuk pengujian otomatis
  window.loadSampleForTest = function () {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(0, 0, 400, 300);
    canvas.toBlob((blob) => {
      const sample = new File([blob], 'Sampel_Persona_Dial.jpg', { type: 'image/jpeg' });
      loadActiveFile(sample);
    }, 'image/jpeg');
  };

  // Inisialisasi Deteksi Backend Engine
  checkBackendStatus();

  console.log('[CONVERTER STUDIO] Hybrid Conversion Studio Siap (Backend ⇄ In-Browser Fallback)');
})();
