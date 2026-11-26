# Arz-WEB: Spesifikasi Sistem, Organisasi Folder Fitur & Dokumentasi Proyek

> [!IMPORTANT]
> ### 🎯 TUJUAN AKHIR & FILOSOFI DOKUMENTASI (`Arz-WEB.md`)
> 1. **Membimbing AI Agent Men-deploy Website**: Dokumen ini disusun khusus sebagai panduan arsitektur tunggal untuk membimbing AI Agent dalam merancang, membangun, mengaudit, dan **mendeploy website ke lingkungan server produksi (Nginx Home Server / CasaOS)**, **BUKAN untuk membuat aplikasi offline**.
> 2. **Offline Hanya Tahap Awal Pembuatan Fitur**: Lingkungan lokal/offline hanya berfungsi sebagai ruang kerja sementara (*staging environment*) pada tahapan paling awal saat kode dan fitur baru dirancang serta diuji sebelum siap dipublikasikan ke server web.
> 3. **Hanya Mencatat Fitur yang Telah Di-deploy & Diedit di Web**: Seluruh spesifikasi, arsitektur, selektor DOM, endpoint, dan logika yang tertuang di dalam dokumen ini **HANYA BERISI FITUR YANG TELAH BERHASIL DI-DEPLOY DAN DIEDIT DARI WEBSITENYA** secara live. Seluruh komponen yang tidak berada di server web produksi tidak boleh dicatat dalam dokumen ini.

Dokumen tunggal ini menggabungkan seluruh panduan arsitektur, konvensi organisasi folder fitur, protokol audit kebersihan proyek, serta spesifikasi teknis terkini dari ekosistem **Arz-WEB**, yang mencakup pilar aplikasi web aktif yang telah dibangun dan terpasang di server produksi:
1. **Personal Web & Operations Dashboard** (`index.html`) — Portal sentral web personal berestetika interaktif Persona 3 Reload / Cyber-Grimoire dengan navigasi multi-menu video otentik (Home, About, Projects, Skills, Contact), rasio skala presisi zoom-lock 80%, peluncur katalog proyek terintegrasi, pemantau telemetri sistem, konsol notifikasi live, dan jam presisi tinggi.
2. **Ethol Academic Notifier** (`ethol-notifier/`) — Modul automasi akademik cerdas berbasis headless Puppeteer & background daemon di CasaOS: Executive Presensi Deck terpadu dengan cincin countdown radial SVG, linimasa kehadiran interaktif real-time, lightbox bukti layar, tray konsol diagnostik server collapsible, pemantau tenggat tugas kuliah, serta metamorfosis tema Velvet Crimson Arcane dinamis saat mode loop.
3. **Universal Converter Studio** (`converter/`) — Studio konversi dokumen dan media universal berbasis 100% in-browser client-side execution (PDF.js, Mammoth.js, docx.js, jsPDF, Tesseract.js OCR, html2canvas, JSZip) berestetika Persona 3 Midnight Radial Dial dengan dukungan dual-layout: panggung dial melingkar 360° interaktif di desktop dan reflow daftar vertikal kartu sentuh 48px ergonomis di mobile.
*(Catatan: Purwarupa uji coba dan tester otonom QA TestSprite diisolasi secara eksklusif di `lab/` dan `testsprite_tests/` untuk lingkungan localhost, dilindungi dari deployment publik).*

---

## BAGIAN I: KONVENSI ORGANISASI FOLDER FITUR & ATURAN PROYEK BARU

### 1. Aturan Baku Pembuatan Projek Baru: Wajib Membuat Folder Khusus Terlebih Dahulu
> [!IMPORTANT]
> **ATURAN WAJIB PENGEMBANGAN PROYEK BARU (DEDICATED PROJECT FOLDER FIRST)**:
> Setiap kali menambahkan atau mengembangkan proyek baru, modul mandiri, atau aplikasi web dalam ekosistem **Arz-WEB**, pengembang/AI Agent **WAJIB SELALU MEMBUAT FOLDER BARU TERLEBIH DAHULU** di tingkat root repositori (contoh: `ethol-notifier/`, modul web baru berikutnya, dst.).
> 
> **Ketentuan Struktur Folder Proyek Mandiri:**
> 1. **Pusat Seluruh Berkas**: Seluruh berkas yang bersangkutan (halaman antarmuka `index.html`, lembar gaya `*.css`, logika script `*.js`, engine automasi/backend, cache data `*.json`, dan subfolder aset) **wajib dikumpulkan secara utuh di dalam folder proyek tersebut**.
> 2. **Dilarang Menyerakkan Berkas di Root**: File kerja proyek baru tidak boleh ditaruh tercecer di root direktori. Root repositori hanya diperuntukkan bagi portal utama (`index.html` Grimoire Dashboard), file konfigurasi (`package.json`), master server (`serve.js`), skrip deployment/otomasi global (`deploy.ps1`, `Buka_Website.bat`), dan berkas aturan/dokumentasi (`Arz-WEB.md`, `AGENTS.md`).
> 3. **Independensi & Portabilitas**: Setiap folder proyek mandiri harus dapat berfungsi mandiri, memiliki endpoint index sendiri, serta mudah dimigrasikan atau di-deploy tanpa ketergantungan silang yang membingungkan.

### 2. Struktur Pohon Berkas Terkini
```
Arz-WEB/
├── index.html                           # Entry Point: Grimoire Dashboard Utama
├── serve.js                             # Local Dev HTTP & API Server (Node.js + Puppeteer runner + Crash Guards)
├── server.js                            # Alias Entrypoint (node server.js -> serve.js)
├── serve-watchdog.js                    # Self-Healing Supervisor (Auto-Restart jika Crash / Liveness Hang)
├── Buka_Website.bat                     # Launcher 1-Klik Buka Server & Browser Otomatis
├── Buka_Website_Latar_Belakang.vbs      # Launcher Senyap Tanpa Jendela Terminal
├── Pasang_Auto_Start.bat                # Skrip Otomasi Startup Windows (Menjalankan serve-watchdog.js)
├── Hapus_Auto_Start.bat                 # Skrip Pencopot Startup Windows
├── deploy.ps1                           # Skrip Automasi Migrasi ke Nginx Home Server
├── rotate-testsprite.ps1                # Launcher & Forwarder Auto-Rotasi Akun TestSprite (Local Dev)
├── logs_buffer.json                     # Buffer persisten log presensi sukses & tautan screenshot (retensi 24 jam)
├── Arz-WEB.md                           # Master Dokumen & Spesifikasi Sistem Terpadu
│
├── testsprite_tests/                    # FOLDER MANDIRI PENGUJIAN: TestSprite Automated Suite (Eksklusif Localhost)
│   ├── index.html                       # Antarmuka Web Visual: TestSprite Sentinel Hub (Localhost :8080)
│   ├── monitor.css                      # Styling Cyberpunk Dark Glassmorphism, KPI Grid, Split Button & Responsive HP
│   ├── monitor.js                       # Controller Antarmuka, Target Dropdown Selector, Live Terminal SSE & Token Manager
│   ├── backend_runner.js                # Suite Pengujian Backend Otonom (10 Skenario REST API, Gateway, Health Check)
│   ├── testsprite_vault.json            # Brankas Kredensial 15 Akun Token TestSprite
│   ├── rotate-testsprite.ps1            # Engine Rotasi & Auto-Switch Token saat Kuota Habis
│   ├── testsprite-runner.js             # Automation Runner TestSprite (Auto-Graceful Exit, Plan, Execution)
│   ├── code_summary.yaml                # Rangkuman Kode & Arsitektur Grimoire Dashboard
│   ├── standard_prd.json                # Standardized PRD Hasil Analisis TestSprite Cloud
│   ├── testsprite_frontend_test_plan.json # Rencana Pengujian Frontend 21 Kasus Uji (TC001 - TC021)
│   ├── DOKUMENTASI_PERBAIKAN_TESTSPRITE.md # Laporan Komparasi Sebelum vs Sesudah Perbaikan Uji
│   └── tmp/                             # Direktori Kerja Sementara, Test Scripts (.py), & Log Eksekusi
│
├── lab/                                 # FOLDER MANDIRI SANDBOX: Eksklusif Localhost & Modul Eksperimental
│   ├── index.html                       # Landing Hub Sandbox Laboratorium
│   └── proses-absen/                    # FITUR: Visual Absen Inspector (Step-by-Step Viewer Absensi Ethol)
│       ├── index.html                   # Halaman visualisasi kanvas ambient & timeline observasi
│       ├── proses-absen.css             # Styling cyber-arcane, mobile touch-friendly, dynamic viewport
│       └── proses-absen.js              # Controller canonical steps, step simulator, lightbox screenshot
│
├── ethol-notifier/                      # FOLDER MANDIRI: Ethol Academic Notifier (Auto Absen & Tugas)
│   ├── index.html                       # Entry Point Mandiri Ethol Notifier
│   ├── ethol.css                        # Styling dashboard Persona Dual-Deck (Midnight P3 × Phantom P5)
│   ├── mobile.css                       # Stylesheet responsif Android-Fit (≤ 768px & ≤ 480px) untuk kedua mode deck
│   ├── ethol.js                         # Controller antarmuka (Self-Healing Gateway, failover, status & widget tugas)
│   ├── ethol-agent.js                   # Automasi headless Puppeteer (SSO CAS PENS, auto presensi & scraper tugas)
│   ├── ethol-task-scraper.js            # Scraper mandiri penugasan perkuliahan portal ETHOL PENS
│   ├── api.php                          # Self-Healing Gateway Server (Node Health Cache, auto-failover <10ms)
│   ├── tasks.json                       # Cache data tugas kuliah mendekati deadline (≤ 5 hari)
│   ├── logs_buffer.json                 # Salinan buffer persisten log presensi subfolder ethol-notifier
│   └── screenshots/                     # Direktori tangkapan layar bukti presensi sementara (retensi 24 jam)
│
└── src/
    ├── proyek/                          # FITUR: Katalog & Peluncur Proyek Web
    │   ├── proyek.css                   # Styling glassmorphic tiles, filter status & modal popover
    │   └── proyek.js                    # Render dinamis daftar proyek dan peluncur tautan
    │
    ├── konsol/                          # FITUR: Konsol Notifikasi & Webhook
    │   ├── konsol.css                   # Antarmuka terminal log bernuansa arcane-translucent glass
    │   └── konsol.js                    # Webhook listener dan simulasi log aktivitas
    │
    ├── sampul/                          # FITUR: Sampul Buku Interaktif & Jam
    │   ├── sampul.css                   # Desain sampul grimoire transparan tanpa ornamen crest & jam
    │   ├── sampul.js                    # Interaktivitas buka buku dan live digital clock
    │   └── book_cover.png               # Aset grafis sampul depan buku Grimoire
    │
    ├── status/                          # FITUR: System Health Metrics & Telemetri
    │   ├── status.css                   # Panel metrik kesehatan sistem glassmorphic
    │   └── status.js                    # Kalkulasi live telemetri CPU, RAM, Latensi, Daemon
    │
    ├── tutup-buku/                      # FITUR: Tutup Buku & Clock Bar
    │   ├── tutup-buku.css               # Desain tombol tutup buku & bar jam digital terpusat
    │   └── tutup-buku.js                # Interaktivitas tombol tutup buku
    │
    └── shared/                          # SHARED: Khusus utilitas lintas ≥2 fitur
        ├── shared.css                   # Variabel warna (gold/emerald), glassmorphic styling, global layout
        ├── utils.js                     # Helper manipulasi DOM & formatting teks
        ├── audio.js                     # Web Audio API sintetis efek sihir / chime
        ├── book_open.png                # Aset bingkai buku terbuka layout dashboard (Desktop)
        ├── book_page_left.png           # Aset bingkai lembaran kiri Grimoire (Mobile UI Pertama)
        └── book_page_right.png          # Aset bingkai lembaran kanan Grimoire (Mobile UI Kedua)
```

### 2. Aturan Penamaan & Folder `shared/`
- **Penamaan Folder**: Gunakan kata benda fungsi yang deskriptif dan konsisten (misal: `proyek/`, `konsol/`, `sampul/`, `status/`, `tutup-buku/`). Dilarang menggunakan nama layer di root seperti `controllers/`, `views/`, atau `models/`.
- **Folder `shared/`**: Hanya digunakan jika kode/aset dipakai oleh **2 fitur atau lebih** (misal audio chime, background lembaran buku, variabel tema global). Jika hanya dipakai 1 fitur, wajib masuk ke folder fitur tersebut.

### 3. Protokol WAJIB: Pembersihan File Usang Pasca-Generate (Pruning Protocol)
> **ATURAN MUTLAK:**
> Setiap kali selesai melakukan generate kode, penambahan fitur, atau refactoring:
> **Jika ada file atau folder lama yang tidak digunakan lagi, tidak dimunculkan di website, atau sudah digantikan oleh fitur baru, file/folder tersebut WAJIB SEGERA DIHAPUS.**

#### Kriteria File yang Wajib Dihapus:
1. **Fitur yang Telah Diganti**: Berkas fitur lama yang UI-nya sudah tidak ditampilkan lagi.
2. **Tidak Dimuat di Entry Point**: Script (`.js`) atau style (`.css`) yang tidak lagi di-link pada `index.html` atau `ethol-notifier/index.html`.
3. **Duplikat Aset**: Gambar/media yang pernah tercecer di root atau folder acak setelah dipindahkan ke folder fitur.
4. **File Sampah / Eksperimen**: Berkas pengujian sementara (`test_*.txt`, scratchpad, file spec draft usang).

#### Cara Audit Pembersihan:
1. Periksa entry point (`index.html`, `ethol-notifier/index.html`, `serve.js`). Catat seluruh berkas yang aktif dimuat.
2. Bandingkan dengan struktur direktori fisik proyek.
3. Hapus bersih file/folder yang tidak terpakai menggunakan perintah permanen (`Remove-Item -Force`).
4. Verifikasi bahwa server berjalan normal tanpa error 404 pada network tab.

### 4. Pelaporan Transparan Perubahan Berkas
Setiap asisten/pengembang wajib menyajikan laporan ringkasan berkas setelah melakukan modifikasi:
```markdown
### 📋 Ringkasan Pembaruan File:
#### ➕ File / Folder yang Ditambahkan:
- `path/file` — [Keterangan fungsi]
#### 🗑️ File / Folder yang Dihapus (Pembersihan File Usang):
- `path/file` — [Alasan penghapusan]
#### 🛡️ Status Integritas:
- [Pengecekan broken link / HTTP 200 status]
```

### 5. Checklist Cepat Sebelum Menyelesaikan Tugas
- [x] Semua file fitur baru berada dalam satu folder terisolasi (`src/<fitur>/`).
- [x] Fitur terhubung sempurna pada entry point (`index.html` / `ethol-notifier/index.html`).
- [x] **Audit pembersihan tuntas**: Berkas usang dan draft lama telah dihapus.
- [x] Tidak ada aset duplikat yang tercecer.
- [x] Laporan transparansi berkas telah disajikan.

---

### 6. Protokol Otomasi Migrasi ke Website (Keyword Trigger: "pw" / "pindahkan ke website")
> **STANDAR OPERASIONAL PROSEDUR (SOP MUTLAK):**
> Jika pengguna memberikan instruksi atau perintah dengan kata kunci **"pw"** (perintah pintas resmi) atau variasi serupa (*"pindahkan ke website"*, *"deploy ke server"*, *"sinkronkan ke web"*, *"upload ke website"*):
> 
> Asisten AI **WAJIB MENJALANKAN 4 PILAR UTAMA SECARA OTOMATIS** tanpa meminta konfirmasi berulang:
> 1. **Pilar 1: Pre-Deployment Testing Gate (TestSprite Automated Test Gate)**: Menjalankan verifikasi uji otomatis TestSprite terlebih dahulu terhadap web yang akan di-deploy sebelum mengizinkan proses transfer berkas.
> 2. **Pilar 2: Audit & Optimalisasi Tampilan HP (Mobile Fit)**: Memastikan UI bebas horizontal overflow dan ergonomis di smartphone (~360px - 480px).
> 3. **Pilar 3: Auto-Update File Dokumentasi (`Arz-WEB.md`) & Pengalihan Riwayat ke GitHub**: Wajib secara otomatis memperbarui file `.md` (`Arz-WEB.md`) mencakup header pilar ekosistem dan spesifikasi teknis modul. Riwayat pembaruan (changelog/history) dialihkan sepenuhnya ke Git Commit History di GitHub.
> 4. **Pilar 4: Eksekusi Deployment Otomatis ke Nginx**: Menyalin seluruh berkas aktif proyek ke Nginx Home Server via `deploy.ps1`.

#### 🧪 Pilar 1: Pre-Deployment Testing Gate (TestSprite Automated Test Gate)
Sebelum berkas disinkronkan ke server web produksi Nginx, sistem WAJIB melakukan verifikasi pengujian otomatis menggunakan TestSprite:
1. **Verifikasi Web Target**: Memastikan halaman web yang hendak di-deploy (Grimoire Dashboard `index.html` atau `ethol-notifier/`) telah divalidasi skenario ujinya (`testsprite_tests/`).
2. **Kondisi Penghentian (Abort Condition)**: Jika terjadi kegagalan fatal/kritis pada pengujian:
   - Proses deployment ke Nginx **DIBATALKAN SECARA OTOMATIS** (*deployment aborted*).
   - Status shortcut proyek terkait di `src/proyek/proyek.js` otomatis diubah menjadi **"Perbaikan"** (`wip`) disertai catatan kendala (`note: "Gagal lolos pengujian TestSprite: [alasan]"`).
3. **Syarat Kelolosan (Pass to Deploy)**: Hanya kode yang lolos pengujian tanpa error fungsional kritis yang diizinkan melangkah ke tahap deployment Nginx.

#### 📱 Pilar 2: Syarat Mutlak Pra-Migrasi — Optimalisasi Khusus Tampilan HP (Mobile Fit)
Sebelum berkas dipindahkan ke website publik, seluruh antarmuka yang diubah/ditambahkan WAJIB lolos audit tampilan smartphone (viewport ~360px - 480px / 390x844):
1. **Bebas Horizontal Overflow**: Lebar seluruh kontainer terkunci rapi di `100vw` (`max-width: 100vw; overflow-x: hidden;`). Tidak boleh ada elemen yang melebar keluar layar atau menyebabkan zoom-out otomatis di browser HP.
2. **Transformasi Grid Multi-Kolom**: Komponen berdampingan (seperti kartu komparasi dua kotak, kolom dashboard) wajib bertransformasi menjadi susunan vertikal (*stacking*) yang proporsional di layar HP (`@media (max-width: 860px)` dan `@media (max-width: 480px)`).
3. **Target Sentuh Ergonomis (*Touch-Friendly Targets*)**: Tombol navigasi (seperti panah `<` `>`, dropdown riwayat, toggle pill, tombol aksi, dan FAB) memiliki area sentuh yang nyaman dioperasikan dengan jempol (min 34px - 44px).
4. **Tabel Responsif**: Tabel data dibungkus dalam kontainer geser horizontal independen (`.table-scroll-container`) agar tidak merusak lebar keseluruhan halaman.
5. **Verifikasi Visual Layar HP**: Menguji tampilan pada resolusi smartphone sebelum dinyatakan siap dipindahkan.

#### 📝 Pilar 3: Auto-Update File Master Dokumentasi (`Arz-WEB.md`) & Pengalihan Riwayat ke GitHub
> **LOGIK BARU WAJIB:**
> Setiap kali kata kunci atau perintah *"pw"* / *"pindahkan ke website"* dipicu, Asisten AI **WAJIB secara otomatis menginspeksi dan memperbarui berkas `Arz-WEB.md`** sebelum atau bersamaan dengan eksekusi deployment:
1. **Pembaruan Ringkasan Fitur Ekosistem (Header & Overview)**: Memastikan daftar seluruh pilar aplikasi web yang telah dibangun pada pengantar dokumen (paragraf pembuka dan daftar pilar ekosistem) selalu mutakhir (Grimoire Dashboard, Ethol Academic Notifier, dan modul baru lainnya).
2. **Pembaruan Seksi Spesifikasi Teknis**: Menambahkan seksi/bab spesifikasi teknis baru atau memperbarui seksi spesifikasi modul terkait jika terdapat fitur, arsitektur, layout, selector, regex, atau konfigurasi sistem baru.
3. **Pengalihan Riwayat Pembaruan ke GitHub (Eliminasi Manual History Table)**: Fungsi tabel log riwayat di `Arz-WEB.md` ditiadakan/dihapus total. Seluruh riwayat perubahan, catatan commit, dan penambahan fitur dialihkan sepenuhnya ke Git Commit History di GitHub portofolio (`https://github.com/RadenArya1/Arz-WEB/commits/main`).
4. **Integritas Dokumentasi**: Menjamin dokumentasi selalu mencerminkan kondisi kode 1:1 yang aktif dan terpasang di server produksi.

#### 🚀 Pilar 4: Eksekusi Otomatis Penyalinan Berkas ke Server Nginx

##### Spesifikasi Jalur Target Server:
- **Jalur Akses Jaringan (File Explorer / SMB UNC Path)**:
  `\\100.73.128.8\Data\AppData\nginx\config\www`
- **Konfigurasi Web Server**: Nginx Alpine Container (`root /config/www`) pada CasaOS Home Server.
- **Tautan Akses Publik (Live HTTPS)**:
  - Grimoire Dashboard Utama: `https://dashboard.raidenarya.my.id/`
  - Ethol Notifier: `https://dashboard.raidenarya.my.id/ethol-notifier/`

##### Berkas yang Wajib Disinkronkan:
1. `index.html` (Grimoire Dashboard Utama)
2. `ethol-notifier/` (Modul Mandiri Ethol Notifier)
3. Seluruh folder `src/` (modul fitur, shared assets, CSS, JS)

##### Berkas yang DIKECUALIKAN dari Publikasi (Eksklusif Dev / Lokal):
> [!CAUTION]
> **KEBIJAKAN ISOLASI MUTLAK TESTSPRITE & BERKAS INTERNAL:**
> Seluruh berkas pengujian TestSprite, brankas token akun, skrip runner, dan konfigurasi agen bersifat **eksklusif di localhost (dev server port 8080)** dan **DILARANG KERAS DIPUBLIKASIKAN KE SERVER NGINX PUBLIK**:
- `testsprite_tests/` (seluruh berkas pengujian, PRD, test plan, dan runner)
- `testsprite_vault.json` & seluruh berkas token/kredensial
- `rotate-testsprite.ps1` (skrip rotasi token lokal)
- `testsprite-runner.js` (runner automasi pengujian)
- `mcp_config.json` & `.agents/` (konfigurasi AI agent)
- `serve.js`, `server.js`, `serve-watchdog.js` (dev server lokal Node.js)
- `Arz-WEB.md`, `AGENTS.md` (master dokumentasi internal pengembang)
- `deploy.ps1` (skrip automasi lokal)
- Folder scratch / temporary artifacts

##### Perintah Eksekusi Otomatis:
Asisten langsung menjalankan skrip otomatisasi di PowerShell:
```powershell
powershell.exe -ExecutionPolicy Bypass -File ".\deploy.ps1"
```
Setelah eksekusi berhasil, asisten wajib menyajikan laporan:
1. Hasil verifikasi Pre-Deployment Test Gate (TestSprite).
2. Ringkasan optimalisasi tampilan HP.
3. Bukti pembaruan dokumentasi `Arz-WEB.md`.
4. Jumlah berkas yang berhasil disinkronkan ke server Nginx.
5. Tautan live website yang siap diakses pengguna.

---

### 7. Aturan Baku Manajemen Shortcut Katalog Proyek & Siklus Status
> **STANDAR OPERASIONAL PROSEDUR (SOP KATALOG PROYEK):**
> Berlaku mutlak pada setiap pembuatan fitur/modul web baru serta setiap kali terjadi masalah (bug/error/offline) pada suatu website di repositori Arz-WEB:

#### A. Otomatis Membuat Shortcut saat Fitur Baru Dibuat
- Setiap kali pengembang atau asisten AI membuat halaman web, modul mandiri, atau aplikasi baru di repositori Arz-WEB, **WAJIB secara otomatis mendaftarkan shortcut proyek baru** ke dalam Katalog Proyek Grimoire Dashboard (`src/proyek/proyek.js`).
- Setiap entri shortcut wajib memiliki: `id`, `title`, `icon` (FontAwesome representatif), status awal (`active` / `wip`), `statusLabel`, deskripsi singkat, `target` host, `url` navigasi, dan `tags`.

#### B. Eliminasi Total Status "Ide" (Hanya Ada 2 Status Baku)
Katalog Proyek **hanya mengenal 2 status operasional**:
1. **Aktif** (`status: 'active'`, `statusLabel: 'Aktif'`, warna Zamrud / Emerald Green):
   - Menandakan fitur/web beroperasi normal, stabil, responsif, dan siap digunakan.
2. **Perbaikan** (`status: 'wip'`, `statusLabel: 'Perbaikan'`, warna Warm Amber):
   - Menandakan fitur/web sedang dalam pengerjaan, mengalami kendala teknis, bug, offline backend, atau sedang dalam masa pemeliharaan.
- **Status "Ide" telah dihapus secara permanen** dari antarmuka, tombol filter kategori, dan skrip data.

#### C. Deteksi Masalah & Auto-Update Status Shortcut
- **Saat Terjadi Masalah / Bug:** Apabila pada suatu website/fitur yang telah dibuat terjadi kendala, bug, error API, kegagalan render, atau layanan backend terputus, Asisten AI **WAJIB secara otomatis memperbarui status shortcut proyek terkait menjadi "Perbaikan"** (`wip`) di `src/proyek/proyek.js`, serta menyertakan rincian kendala pada properti `note` (yang akan tampil di popover kartu).
- **Saat Masalah Berhasil Diperbaiki:** Setelah kendala tuntas diperbaiki dan diverifikasi normal, Asisten AI **WAJIB secara otomatis mengembalikan status shortcut proyek menjadi "Aktif"** (`active`) dan menghapus catatan kendala (`note`).
- **Programmatic API:** Tersedia fungsi global `window.setProjectStatus(idOrUrl, status, note)` dan `window.registerProjectShortcut(projectData)` pada `src/proyek/proyek.js` untuk integrasi status real-time lintas modul.

#### D. Keunikan Ikon Shortcut Wajib (Anti-Duplikasi Ikon & Registri Resmi)
- Setiap shortcut ubin di dalam Katalog Proyek **WAJIB memiliki ikon FontAwesome yang unik dan berbeda** satu sama lain.
- **Dilarang keras memakai ikon yang sama atau bermakna/siluet kembar** untuk dua atau lebih proyek web yang berbeda.
- Asisten AI wajib mengecek daftar ikon yang telah aktif (`window.getUsedIcons()`) sebelum menetapkan ikon bagi fitur baru, guna memastikan setiap proyek memiliki identitas visual yang khas dan mudah dibedakan oleh pengguna.
- **Tabel Registri Ikon Resmi Proyek Arz-WEB:**
  | ID Proyek | Nama Proyek Web | Ikon FontAwesome | Makna Visual Simbolik |
  | :--- | :--- | :--- | :--- |
  | `proj_ethol_sync` | Ethol Academic Notifier | `fa-calendar-check` | Kalender jadwal kuliah & presensi terverifikasi |
  | `proj_student_web` | Student Website & Tracker | `fa-building-columns` | Pilar gedung kampus universitas & portal akademik |
  | `proj_grimoire_ui` | Grimoire Dashboard - Arz | `fa-book-skull` | Buku sihir interaktif / Arcane Tome |
  | `proj_testsprite_sentinel` | TestSprite Sentinel Hub | `fa-vial-circle-check` | Tabung reaksi terverifikasi & QA pengujian otonom |
  | `proj_alchemist_wiki` | Alchemist Study Notes | `fa-feather-pointed` | Pena bulu alkemis & dokumentasi riset |
  | `proj_task_bot` | AutoTask Telegram Bot | `fa-robot` | Automasi cerdas & push alert bot |
- **Aturan Penegakan di Kode (`src/proyek/proyek.js`):**
  1. `DEFAULT_PROJECTS` adalah acuan kebenaran tunggal (*single source of truth*) untuk ikon resmi.
  2. Fungsi `getProjects()` wajib meng-override ikon usang dari cache browser / `localStorage` dengan ikon resmi dari `DEFAULT_PROJECTS` saat memuat data.
  3. Sistem audit otomatis berjalan setiap kali memuat: jika ada ikon ganda yang terdeteksi, ikon duplikat otomatis dialihkan ke ikon unik dari pool cadangan.

---

## BAGIAN II: SPESIFIKASI DASHBOARD UTAMA (GRIMOIRE DASHBOARD - `index.html`)

Dashboard utama mengusung tema **Arcane Tome / Cyber-Grimoire** bergaya buku sihir interaktif kuno dengan teknologi modern dan antarmuka **Transparan Penuh (Borderless Translucent Glassmorphism)**:

### 1. Desain Antarmuka Transparan Borderless (Glassmorphism & Parchment Feel)
- **Eliminasi Panel Pekat**: Bingkai kotak `.book-panel` dihilangkan total (`background: transparent; border: none; box-shadow: none; backdrop-filter: none;`). Seluruh konten katalog proyek, konsol log, jam digital, dan status telemetri menempel langsung di atas tekstur kertas perkamen kuno, serat lembaran buku terbuka, dan bayangan alami dedaunan.
- **Cache-Buster Query Versioning**: Seluruh tag stylesheet di-link dengan query versioning `?v=20260913_transparan` guna memastikan browser memuat gaya transparan terbaru tanpa terkena cache lawas.

### 2. Sampul Depan Bersih ("Portal Pribadi" 1:1 Precision Coordinate Lock)
- **Pembersihan Total Ornamen & Hint**: Elemen ornamen garis simbol atas (`grimoire-crest`) dan petunjuk teks klik (`hint-text`) dihapus secara permanen dari DOM.
- **Penguncian Koordinat Presisi Vertikal**: Posisi elemen di dalam `.book-overlay-center` dikunci menggunakan persentase vertikal tetap:
  - Judul sapaan pengguna (`.user-greeting-box`): `top: 17.53%;`
  - Jam digital dan tanggal (`.time-widget-box`): `top: 37.40%;`
  - Tombol masuk emas (`.btn-enter-grimoire`): `top: 71.43%;`
  Hal ini mengunci layout secara presisi 1:1 sehingga sapaan "Halo, Arz", jam digital, dan tombol "MASUK" tetap stabil di koordinat yang sama tanpa pergeseran layout sedikit pun.

### 3. Lembaran Kiri: Katalog Proyek Web (`src/proyek/`)
- **Ubin Squircle Kaca (*Glassmorphic Tiles*)**: Ubin peluncur proyek menggunakan gradien transparan berkilau lembut sesuai 2 status resmi:
  - **Aktif (Badge Zamrud)**: `linear-gradient(135deg, rgba(220, 248, 226, 0.45), rgba(187, 238, 198, 0.28))` berborder hijau menyala lembut dengan denyut hijau (`pulseGreen`).
  - **Perbaikan (Badge Amber)**: `linear-gradient(135deg, rgba(254, 243, 199, 0.45), rgba(253, 230, 138, 0.28))` berborder oranye amber dengan denyut amber (`pulseAmber`).
- **Bilah Pencarian & Filter Kategori**:
  - Toolbar pencarian transparan `rgba(245, 235, 215, 0.22)` dengan `backdrop-filter: blur(8px)`.
  - Input field semi-transparan `rgba(255, 255, 255, 0.38)`.
  - Tab filter kategori instan pill: `[Semua] [● Aktif] [● Perbaikan]` berlatar kaca lembut dengan aksen amber pekat saat aktif (status 'Ide' telah dihapus).
- **Tooltip Popover & Catatan Kendala**: Popover info proyek berlatar kaca lembut dengan blur tinggi (`12px`). Jika shortcut berada dalam status *Perbaikan*, popover secara otomatis menampilkan lencana catatan kendala (`popover-note-badge`) berisi keterangan masalah teknis yang sedang ditangani.
- **Auto-Sync Shortcut**: Terintegrasi langsung dengan `window.GrimoireCatalog` untuk penambahan shortcut otomatis saat fitur baru dibangun dan pembaruan status dinamis saat error terdeteksi.

### 4. Lembaran Kanan Atas: Konsol Notifikasi & Webhook (`src/konsol/`)
- **Layar Terminal Log Arcane Transparan**: Diubah dari warna hijau-hitam pekat padat menjadi kaca terminal transparan `rgba(12, 22, 15, 0.48)` dengan `backdrop-filter: blur(10px)`.
- **Status Telemetri & Filter**: Menjaga denyut hijau telemetri (*Daemon Listening Aktif*) di atas ubin transparan ber-border lembut. Tab filter log (`Semua`, `Info`, `Sukses`, `Peringatan`, `Event`) mendukung *horizontal touch swipe*.
- **Interactive Input Bar**: Bar prompt teks transparan kaca `rgba(255, 255, 255, 0.35)` dengan aksen emas. Pengguna dapat mengetik perintah seperti `help` atau pesan kustom untuk dicatat langsung ke konsol.

### 5. Lembaran Kanan Bawah: Tutup Buku & Status Sistem (`src/tutup-buku/` & `src/status/`)
- **Widget Metrik Telemetri Sistem**: Berlatar kaca transparan `rgba(255, 250, 240, 0.22)` dengan 4 ubin metrik telemetri (Core Engine, RAM, Latensi, Modul) menggunakan ubin kaca transparan `rgba(255, 255, 255, 0.32)` berbingkai border emas halus.
- **Kotak Sesi & Jam Digital**: Bar horizontal ramping berisi jam digital terpusat berlatar kaca transparan `rgba(255, 255, 255, 0.3)` dengan tanggal di bawahnya, serta tombol **"TUTUP BUKU"** merah-emas berefek shimmer.
- **Navigasi Layar Smartphone (Mobile FAB)**: Tombol melayang elegan di sudut kanan bawah untuk berpindah mulus antara Lembaran Kiri (Katalog Proyek) dan Lembaran Kanan (Konsol & Status) dengan background anime Grimoire tunggal (`book_page_left.png` vs `book_page_right.png`).

### 6. Arsitektur Responsif Android-Fit (`css/mobile.css` & `js/mobile-nav.js`)
- **Reflow Vertikal Layar Penuh (100dvh)**: Mengubah sistem fixed screen desktop menjadi layout satu kolom vertikal yang dapat di-scroll (`overflow-y: auto; -webkit-overflow-scrolling: touch; min-height: 100dvh;`).
- **Navigasi Drawer Persona 3 Mobile**: Tombol hamburger (`#mobileMenuBtn`, 44px × 44px) di pojok kanan atas yang mengaktifkan drawer navigasi atas dengan latar gelap ber-blur kaca, dukungan penutupan dengan tombol `Escape`, klik di luar drawer, serta reparenting DOM otomatis (`#menu` dipindah ke `#shell` saat mobile agar dapat diakses dari sub-screen manapun).
- **Target Sentuh Standar Android (≥ 44px–48px)**: Seluruh tombol aksi (`.card .meta .go`, `.cv-btn`, `.form-send`, `.back-hint`, dan `#audio-toggle`) mengadopsi ukuran target sentuh minimal 44px–48px.
- **Form Kontak Anti-Zoom & Ergonomis**: Input teks dan email berukuran font 16px (mencegah auto-zoom Safari iOS), tinggi minimum 48px, textarea minimum 120px, dan tombol transmisi berukuran penuh selebar kontainer.
- **Sinkronisasi Skala Layar Adaptif (`syncZoom`)**: Mengaktifkan skala natural 1:1 (`data-zoom="1"`) di ponsel (< 768px) dan secara otomatis memulihkan skala zoom-lock 80% (0.8) pada layar desktop (≥ 769px).
- **Proteksi Isolasi Desktop (≥ 769px)**: Seluruh aturan mobile terisolasi dalam media query, menjamin tampilan desktop, estetika video latar, serta navigasi keyboard (↑, ↓, Enter, Esc) tetap beroperasi 100% utuh tanpa regresi.

---

## BAGIAN III: SPESIFIKASI ETHOL ACADEMIC NOTIFIER (`ethol-notifier/`)

Modul automasi akademik mandiri (**Ethol Academic Notifier**) beroperasi sebagai pengawas perkuliahan otomatis dan asisten presensi cerdas:

### 1. Arsitektur Mandiri, Direct REST API Daemon & Backend 24/7
- **Folder Khusus Mandiri (`ethol-notifier/`)**: Seluruh komponen frontend (`index.html`, `ethol.css`, `ethol.js`) dan backend agent (`ethol-agent.js`, `tasks.json`, `attended_keys.json`) tersimpan terisolasi di dalam satu folder root.
- **Direct CAS SSO & REST API Engine (Zero-Headless Browser)**: Terinspirasi dari arsitektur daemon Go (`repinger/ethold`), otomasi presensi tidak lagi menggunakan peramban headless Puppeteer yang berat. Sebagai gantinya, engine mengeksekusi autentikasi SSO CAS (`login.pens.ac.id`) via HTTP Form POST langsung dengan CookieJar in-memory, dilanjutkan pemanggilan REST API internal `/api/presensi/aktif-kuliah` dan `/api/presensi/mahasiswa`. Konsumsi RAM terpangkas dari ~350MB menjadi < 30MB dan waktu eksekusi memuncak dari ~30 detik menjadi hanya ~2.3 detik.
- **Atomic State Persistence (`attended_keys.json`)**: Mencegah pengiriman token presensi ganda melalui berkas state JSON dengan mekanisme atomic lock dan auto-pruning berkala (retensi 90 hari / setara 1 semester akademik).
- **Nginx Reverse Proxy API**: Seluruh panggilan frontend ke backend diarahkan melalui reverse proxy Nginx (`/api/absen/` -> `172.20.0.1:8080`) dengan `API_BASE` dinamis guna mencegah kendala *Mixed Content* di domain HTTPS publik `https://dashboard.raidenarya.my.id/`.

### 2. Mekanisme Presensi Perkuliahan Berkecepatan Tinggi (Direct API)
- **Autentikasi SSO CAS PENS**: Login aman menggunakan kredensial terkonfigurasi, ekstraksi token formulir `fm1`, perolehan tiket service CAS, dan validasi profil token mahasiswa (`/api/auth/validasi-token`).
- **Concurrent Scanning (Paralel via `Promise.all`)**: Memindai seluruh mata kuliah aktif secara bersamaan, mendeteksi ketersediaan sesi kehadiran, dan langsung mengirimkan token presensi mahasiswa secara instan.
- **Anti-Duplikasi & Deduplikasi Lokal**: Apabila sesi kuliah sudah pernah dihadiri hari ini atau tercatat dalam `attended_keys.json`, engine secara otomatis melewati submission dan melaporkan status hadir ke konsol.

### 3. Integrasi Konsol Output, Persistensi Buffer & Retensi Sementara 24 Jam
- **Pencatatan Presensi Terverifikasi**: Hasil presensi yang sukses diformat ke standar konsol `[SUKSES] ✓ Presensi Berhasil Tercatat — {Matakuliah} | Dosen: {Dosen} | Waktu: {Waktu}` sehingga otomatis dikenali oleh `serve.js` `isPresensiSuccess()`.
- **Tampilan Konsol & Timeline Interaktif**: Presensi disajikan dalam kartu interaktif di linimasa visual lengkap dengan lencana terverifikasi (`PRESENSI BERHASIL`), rincian nama dosen, dan countdown waktu aktif.
- **Persistensi Buffer & Auto-Pruning 24 Jam**: Buffer log presensi tersimpan persisten ke berkas `logs_buffer.json` di server agar tidak hilang saat server/container restart, disaring secara ketat dalam jangka waktu 24 jam terakhir.

### 4. Konsol Notifikasi Khusus Presensi Berhasil/Tercatat & SSE Live Stream
- **Filter Ketat Presensi Berhasil & Batas Waktu Maksimal 1 Hari (24 Jam)**: Konsol output frontend (`ethol-notifier/ethol.js`) dan konsol Grimoire Dashboard (`src/konsol/konsol.js`) secara ketat hanya menampilkan catatan presensi kuliah yang sukses dan tercatat hadir (`isPresensiSuccess()`) **yang terjadi dalam kurun waktu 1 hari (24 jam) terakhir**. Seluruh catatan presensi yang telah berumur lebih dari satu hari secara mutlak tidak ditampilkan ke DOM konsol, otomatis disaring dari feed SSE/REST (`api.php`, `serve.js`), serta dibersihkan secara real-time melalui auto-pruning interval 30 detik tanpa perlu merefresh halaman.
- **SSE Real-Time Stream**: Antarmuka terhubung ke endpoint `/api/absen/log-stream` untuk menerima telemetri log langsung dari server secara live tanpa polling blocking.
- **Sintesis Audio Magic Chime**: Membunyikan nada instrumen sihir Web Audio API saat notifikasi sukses presensi diterima.

### 5. Pengingat Tugas Kuliah (Jendela Waktu -7 s/d +30 Hari, Flag Eksekusi Modular & Filter Selesai Ketat)
- **Scraper & REST API Tugas Akademik**: Memantau penugasan kuliah dari portal ETHOL dengan interval berkala saat sesi login aktif.
- **Filter Status Selesai Ketat**: Mengeliminasi seluruh tugas yang telah selesai dikumpulkan (`submission_time` terisi, berkas pengumpulan terunggah `submission_file`, nomor tugas mahasiswa, status selesai, atau tugas yang telah ditutup dosen `tutup === 1`).
- **Jendela Waktu Tenggat Dinamis (-7 Hari s/d +30 Hari)**: Menampilkan tugas aktif belum selesai yang memiliki sisa waktu hingga **30 hari ke depan (1 bulan mendatang)** dengan batasan ketat **1 minggu sebelum (maksimal terlambat 7 hari ke belakang)**. Tugas kadaluwarsa masa lampau (> 7 hari lalu) otomatis dieliminasi dari `tasks.json`.
- **Mode Eksekusi CLI Modular (`--tasks-only` & `--absen-only`)**: Engine `ethol-agent.js` mendukung pemanggilan tersegmentasi melalui argumen CLI: flag `--tasks-only` memfokuskan siklus pemindaian hanya pada katalog tugas perkuliahan tanpa memicu presensi kelas, sedangkan `--absen-only` mengeksekusi sesi kehadiran aktif tanpa memindai tugas.
- **Integrasi Server Daemon Runner (`serve.js`)**: Pemindaian berkala penugasan latar belakang di `serve.js` (`runTaskAgent()`) memanfaatkan `ethol-agent.js --tasks-only` sebagai runner utama berkecepatan tinggi dengan fallback otomatis ke `ethol-task-scraper.js`.
- **Label Tag Urgensi Cerdas (`calculateHTag`)**: Lencana urgensi disempurnakan menampilkan feedback dinamis yang akurat: `Hari Ini` (saat tenggat jatuh pada hari pemindaian), `H-${diffDays}` (untuk tugas masa depan), serta rincian durasi keterlambatan `Terlambat (${diffDays}h lalu)`.
- **Widget Kartu Tugas & Indikator Status**: Menampilkan nama mata kuliah, dosen pengampu, dan judul tugas dengan feedback visual status aman jika seluruh tugas aktif telah diselesaikan.

### 6. Mode Loop Otomatis di Latar Belakang & Crimson Red Theme
- **Backend Daemon Loop & Auto-Reschedule Resilience**: Mode loop berjalan persisten di server Node.js (`/api/absen/loop/start`). Penutupan tab atau browser tidak menghentikan putaran pengecekan berkala (interval acak 3 - 5 menit). Daemon `serve.js` dilengkapi auto-reschedule pada seluruh event kegagalan (`proc.on('error')` dan non-zero exit code), serta menyiarkan rincian status error `lastRunError` ke endpoint status dan klien SSE.
- **Penyelarasan Kredensial CasaOS Terisolasi**: Berkas kredensial SSO `ethol-config.json` disinkronkan khusus ke folder privat backend CasaOS (`/DATA/AppData/ethol-backend/`), menjamin eksekusi loop mandiri 24/7 di server tanpa ketergantungan pada laptop, sekaligus menjaga folder web publik Nginx (`nginx/config/www/`) tetap 100% bersih dan aman dari kebocoran berkas konfigurasi.
- **Transisi Tema Crimson Red & UI Truthfulness**: Antarmuka beralih secara dinamis dari obsidian cyan ke merah velvet crimson saat mode loop aktif. Dilengkapi live countdown ticker, auto-trigger polling status saat countdown selesai (`diffMs <= 0`), serta feedback visual jujur jika backend mengalami kegagalan (badge `ERROR` merah dan deskripsi peringatan transparan).

### 7. Optimalisasi Tampilan HP & Eliminasi Scroll Trap (Mobile-First Architecture)
- **Eliminasi Total Scroll Trap**: Menerapkan `overflow-x: clip !important`, `overscroll-behavior-y: auto !important`, dan `-webkit-overflow-scrolling: touch` pada `html`, `body.ethol-body`, dan `.deck-wrapper`, mencegah isolasi gestur sentuh browser Android Chrome dan memastikan navigasi gulir atas/bawah bebas hambatan tanpa locking.
- **Dynamic Bottom Clearance**: Menambahkan `padding-bottom: calc(130px + env(safe-area-inset-bottom, 20px))` pada `.deck-wrapper` sehingga bilah aksi jempol mengambang (`.mobile-action-bar`) tidak menutupi kartu profil, tombol kontrol, maupun linimasa presensi.
- **Header Adaptif Anti-Truncate**: Menyembunyikan badge `Ops Deck` pada breakpoint mobile (≤ 768px & ≤ 640px) serta mengoptimalkan lebar tombol `← Grimoire` (`white-space: nowrap; flex-shrink: 0;`), menjamin tombol tidak terpotong pada viewport sempit (≤ 480px / 384px Android).
- **Hero Operational Status Hub Grid 3-Zona**: Mengadopsi CSS Grid 3 zona (`header`, `ring & desc`, `metrics`) pada `.status-radial-hub` mobile, memastikan countdown ring dan teks deskripsi tersusun simetris serta dua metrik (*Eksekusi Terakhir* & *Hasil Terakhir*) tertata seimbang dalam 2 kolom sejajar tanpa dead-space.
### 8. Arsitektur Pemulihan Mandiri (Self-Healing Architecture) & Watchdog Supervisor
- **Frontend GatewayManager Adaptif (`ethol.js`)**: Mengeliminasi ketergantungan pada satu rute statis dengan mekanisme failover multi-kandidat otomatis: (1) `/ethol-notifier/api.php?path=` (FastCGI PHP Gateway), (2) `/api/absen/` (Nginx reverse proxy), (3) direct Tailscale IP (`http://100.73.128.8:8080`), dan (4) localhost. Setiap pemanggilan `fetchJson()` secara cerdas memvalidasi `content-type: application/json` untuk mendeteksi respons keliru (seperti HTML fallback Nginx) dan langsung mengalihkan rute secara transparan tanpa memunculkan galat toast ke pengguna.
- **Node Health Cache Gateway Server (`api.php`)**: Memanfaatkan berkas `node_health.json` untuk mencatat metrik latensi dan riwayat kegagalan setiap node secara real-time. Jika laptop sedang offline/tidur, gateway tidak membuang waktu menunggu timeout cURL, melainkan langsung meneruskan permintaan ke container Docker CasaOS (`http://172.20.0.1:8080`) dalam waktu < 10 milidetik.
- **Node.js Self-Healing Watchdog (`serve-watchdog.js`)**: Supervisor mandiri yang membungkus eksekusi `serve.js`. Mengawasi status hidup proses, melakukan *liveness ping* HTTP setiap 25 detik, dan otomatis merestart instance server jika terjadi crash, hang, atau memori jenuh. Diintegrasikan langsung pada `Pasang_Auto_Start.bat`.
- **Global Crash Guards (`serve.js`)**: Mencegah proses Node.js mati tiba-tiba dengan memasang penanganan terpusat `process.on('uncaughtException')` dan `process.on('unhandledRejection')` serta menambahkan endpoint pemantauan kesehatan `/api/absen/health`.
### 9. Filter Anti-Duplikasi Konsol Output (Deduplikasi Data Masuk)
- **Registry Tanda Tangan Entri (`renderedLogSignatures` & `getPresensiSignature()`)**: Setiap entri presensi dihitung tanda tangan uniknya berdasarkan nama berkas screenshot spesifik dan normalisasi teks matakuliah/toleransi waktu. Data yang tanda tangannya sudah tercatat di registry konsol output maupun elemen DOM secara mutlak ditolak dan tidak akan pernah disisipkan ulang.
- **Pencegahan Redundansi Notifikasi & Chime**: Sinkronisasi berkala (`syncLogs()`) setiap 1.5 detik dan rekoneksi SSE stream tidak lagi membunyikan *magic chime* atau memicu notifikasi push ganda pada data presensi yang sudah tertampil di layar.
- **Deduplikasi Server Buffer & FastCGI Gateway**: Buffer `logs_buffer.json` saat start server dan pemanggilan `pushLog()` pada `serve.js`, serta gateway `api.php`, secara proaktif menyaring catatan presensi duplikat sebelum disiarkan ke client.

### 10. Modul Visual Absen Inspector (`lab/proses-absen/`) & Scraper Tugas Mandiri
- **Platform Observasi Visual Step-by-Step**: Lingkungan laboratorium interaktif di `lab/proses-absen/` untuk memantau alur automasi presensi Ethol secara komprehensif mulai dari gateway CAS login, pengisian kredensial, handshake sesi, navigasi lonceng, filter presensi 24 jam, klik tombol presensi, hingga histori tangkapan layar.
- **Spesifikasi Teknis per Langkah**: Menyajikan informasi aksi Puppeteer, selektor target, estimasi latensi/delay, checklist verifikasi, dan mockup referensi URL pada setiap tahap proses.
- **Simulator Langkah & Modal Lightbox**: Memungkinkan pengujian simulasi alur absensi langkah demi langkah, inspeksi gambar bukti layar penuh, dan kanvas ambient dynamic background.
- **Scraper Tugas Akademik Mandiri (`ethol-task-scraper.js`)**: Engine mandiri yang bertugas mengumpulkan penugasan kuliah dari portal ETHOL PENS dengan batas filter jendela tenggat -7 hari s/d +7 hari, terisolasi dan sinkron dengan `tasks.json`.
- **Integrasi Katalog Proyek**: Shortcut ubin `Visual Absen Inspector` didaftarkan secara resmi di Grimoire Dashboard (`src/proyek/proyek.js`) dengan ikon unik `fa-binoculars`, status `active`, dan bump storage key katalog ke `v13`.

### 11. Universal Converter Studio (`converter/`) & Android-Fit Mobile Ergonomics
- **Arsitektur Konversi In-Browser 100% Client-Side**: Mengintegrasikan engine client-side mandiri (PDF.js, jsPDF, Mammoth.js, docx.js, html2canvas, JSZip, Tesseract.js OCR) yang menjamin privasi berkas pengguna tanpa pengiriman data ke server eksternal, dilengkapi fallback hybrid Python bridge jika backend lokal tersedia.
- **Radial Dial P3 Midnight (Desktop ≥ 769px)**: Mengadopsi visual Persona 3 Midnight dengan cincin orbit dinamis berputar (`.dial-orbit-ring`, `.dial-orbit-pulse`), dropzone lingkaran berdiameter 270px di pusat stage 520px, dan penempatan matematis polar node target 360° menggunakan sudut CSS `--node-angle`.
- **Transformasi Responsif Android-Fit (Mobile ≤ 768px via `css/mobile.css`)**:
  - Reflow single-column: Dial melingkar secara cerdas bertransformasi menjadi susunan daftar tombol vertikal (`order: 2`) dengan dropzone persegi sudut melengkung 16px (`order: 1`).
  - Target sentuh standar Google Material Design 3 (≥ 48px × 48px) pada seluruh node mode konversi dan tombol aksi (`#btnConvertActive`, `#btnResetFile`).
  - Scrim pelindung kontras teks di atas visual background Makoto Yuki.
  - Skala proporsional bulan purnama P3 (64px–76px) di pojok kanan atas layar tanpa menutupi panggung aksi.
  - Zero horizontal overflow (`max-width: 100vw; overflow-x: hidden;`) pada viewport 360px, 390px, dan 430px.

---


## BAGIAN IV: RIWAYAT PEMBARUAN & VERSION CONTROL (DIALIHKAN KE GITHUB)

> [!NOTE]
> ### 🐙 PENGALIHAN FUNGSI RIWAYAT (HISTORY) KE GITHUB
> Fungsi pencatatan manual riwayat pembaruan (*history table*) di dalam berkas `Arz-WEB.md` telah **ditiadakan dan dialihkan sepenuhnya ke GitHub Version Control System (VCS)**. Hal ini bertujuan untuk mencegah redundansi pencatatan, menghindari pembengkakan ukuran berkas dokumentasi, serta menjaga agar `Arz-WEB.md` tetap ramping dan murni berfokus pada spesifikasi sistem & arsitektur aktif.
> 
> Seluruh rekam jejak pembaruan, penambahan fitur baru, perbaikan bug, refactoring kode, dan log rilis terdokumentasi secara otomatis dan terperinci pada commit Git repositori:
> 
> 🔗 **Tautan Resmi Riwayat Pembaruan & Log Komit:**  
> 👉 [**GitHub Commits — RadenArya1/Arz-WEB (Branch: main)**](https://github.com/RadenArya1/Arz-WEB/commits/main)
> 
> **Keuntungan Pengalihan ke GitHub:**
> 1. **Atomic & Terverifikasi**: Setiap perubahan tercatat secara otomatis dengan hash commit, timestamp presisi, author, dan konvensi pesan commit terstandarisasi (`feat:`, `fix:`, `chore:`).
> 2. **Code Diff Transparan**: Pengguna dan AI Agent dapat menginspeksi perbedaan kode (*code diff*) baris demi baris secara visual langsung di antarmuka GitHub.
> 3. **Single Source of Truth**: Menghilangkan inkonsistensi antara riwayat Git yang nyata dan tabel manual di berkas markdown.
