# 2026-11-18 — Background Dancing P3/P5 + Transisi Slash (Ethol Notifier)

Dokumen ini untuk Antigravity: cara memasang background dan transisi slash ke
project website Ethol Notifier yang sudah ada.

## 1. Aturan untuk Antigravity (wajib dibaca dulu)

- JANGAN mengubah mekanisme atau logika web yang sudah ada. Toggle loop,
  presensi, log, dan semua fungsi lain harus tetap bekerja persis seperti
  sebelumnya.
- Yang boleh diubah hanya TAMPILAN: background full-page dan transisi
  pergantian mode (slash). Jangan mengubah teks, isi data, susunan layout,
  atau nama class/ID yang dipakai logika.
- Kalau ada instruksi di dokumen ini yang tidak cocok dengan struktur project
  yang sebenarnya, sesuaikan dengan struktur yang ada dan catat penyesuaiannya
  di bawah (bagian 6). Jangan mengarang struktur baru.
- File gambar dipakai dengan path relatif seperti di daftar file (bagian 5).
  Jangan mengubah isi gambar.

## 2. Susunan web (yang sudah ada, jangan diubah)

Web punya DUA mode, dengan layout yang sengaja BERBEDA:

### Mode Normal — "MIDNIGHT DECK" (tema Persona 3)
- Layout horizontal atas-bawah: pita status lebar penuh (dengan bulan),
  profil + tombol aksi berdampingan, tiga kolom bawah: Linimasa | Tugas | Log.
- Warna kartu navy gelap (FINAL, jangan diubah):
  header `#14307e`, hero `#0d1b4c`, profil `#1e3a8a`, kolom bawah `#16266b`,
  tombol loop `#27408f`, background dasar `#0a0f26`.
- Judul: "Tenang di tengah malam, absen tetap jalan."

### Mode Loop Aktif — "PHANTOM DECK" (tema Persona 5)
- Layout kolom sempit + area lebar, panel miring, judul besar
  "SIAP ABSEN. SEKARANG."
- Warna merah/hitam, aksen merah `#e60012`.
- Saat loop aktif: chip "LOOP AKTIF", tombol berubah jadi
  "HENTIKAN LOOP / KLIK UNTUK BERHENTI", ada countdown, dan log mencatat
  "Loop otomatis AKTIF".

### Isi UI (tetap, jangan diubah)
- Header: "Ethol Notifier / OPS DECK / Server Online / jam live / Grimoire".
- Panel status, kartu profil (RA, CAS SSO Terhubung, Raden Davino Arya,
  radenarya@iet.student.pens.ac.id, PORTAL ethol.pens.ac.id,
  Presensi 24 Jam 0 sesi, Tugas Terdekat 1 Pending).
- Tombol: Presensi Instan (Ctrl+R) + Mulai Loop Otomatis.
- Linimasa Presensi Hari Ini; Tugas Akademik (Laporan sementara LDR,
  Workshop Embedded System, deadline Selasa 10 November 2026 – 21:00,
  Afifah Dwi Ramadhani, Belum Selesai); Log Diagnostik dengan filter.

### Perilaku toggle (tetap, jangan diubah)
- Klik "Mulai Loop Otomatis" → mode loop aktif.
- Klik "Hentikan Loop" → kembali ke mode normal.

## 3. Yang dipasang: background

Satu gambar yang sama dipakai di kedua mode, dengan pewarnaan berbeda.
Gambar sumber: key art resmi Persona 3: Dancing in Moonlight &
Persona 5: Dancing in Starlight (Makoto Yuki di kiri biru, Joker di kanan
merah), ukuran 1600×857.

- Mode normal → `assets/bg-normal-p3-color-dark.png`:
  Makoto (P3) BERWARNA, Joker (P5) hitam-putih (monokrom).
- Mode loop → `assets/bg-loop-p5-color-dark.png`:
  Joker (P5) BERWARNA, Makoto (P3) hitam-putih (monokrom).
- Gambar dipakai sebagai background full-page (`background-size: cover`,
  posisi tengah), di BELAKANG seluruh UI (lapis paling bawah).
- Di atas gambar, tambahkan scrim gelap tipis (lapisan gelap transparan)
  supaya teks kecil tetap terbaca di atas gambar.
- Kedua gambar harus dimuat sejak awal (gambar loop tetap di-render dengan
  opacity 0 saat mode normal) supaya pergantian mode tidak berkedip;
  pergantian background memakai crossfade ~0,6 detik.
- Varian terang (`assets/bg-normal-p3-color.png` dan
  `assets/bg-loop-p5-color.png`) hanya cadangan — JANGAN dipakai kecuali
  diminta. Yang dipakai adalah versi `-dark`.

## 4. Yang dipasang: transisi Slash Diagonal

Saat mode berganti, tampilkan panel sapuan diagonal yang menutup layar:

- Ke mode loop: panel MERAH `#e60012` bertuliskan "PHANTOM DECK",
  menyapu layar secara diagonal (~0,7–0,8 detik). Di balik panel,
  layout + background berganti ke mode loop, lalu panel membuka.
- Kembali ke mode normal: panel BIRU BISU `#27408f` bertuliskan
  "MIDNIGHT DECK", menyapu dengan arah dan durasi yang sama.
- Warna panel mengikuti deck TUJUAN (merah = ke loop, biru = ke normal).
- Video contoh hasil akhir yang diinginkan:
  `reference/video-slash-dancing-bg.mp4` (11 detik: normal → slash merah →
  loop → slash biru → normal). Video contoh animasi slash saja:
  `reference/slash-diagonal-final.mp4`.

## 5. Daftar file di dalam ZIP ini

```
ethol-notifier-assets.zip
├── 2026-11-18-background-dancing-dan-slash.md   (dokumen ini)
├── assets/
│   ├── bg-normal-p3-color-dark.png   (dipakai — background mode normal)
│   ├── bg-loop-p5-color-dark.png     (dipakai — background mode loop)
│   ├── bg-normal-p3-color.png        (cadangan, varian terang)
│   └── bg-loop-p5-color.png          (cadangan, varian terang)
└── reference/
    ├── ui-normal-midnight-deck.png   (tampilan akhir mode normal)
    ├── ui-loop-phantom-deck.png      (tampilan akhir mode loop)
    ├── video-slash-dancing-bg.mp4    (contoh video hasil akhir)
    └── slash-diagonal-final.mp4      (contoh video animasi slash saja)
```

## 6. Penyesuaian yang dilakukan Antigravity (diisi Antigravity)

- **Path Aset Relatif**: Menggunakan path relatif langsung `assets/bg-normal-p3-color-dark.png` dan `assets/bg-loop-p5-color-dark.png` pada `ethol-notifier/index.html` dan `ethol-notifier/ethol.css`.
- **Preload Aset**: Menambahkan tag `<link rel="preload" as="image" href="...">` di `<head>` untuk kedua key art agar tidak ada kedipan/flicker saat pergantian mode deck.
- **Wadah Background Dinamis**: Ditambahkan elemen `.dancing-bg-container` dengan layer `.bg-normal-p3`, `.bg-loop-p5`, dan `.dancing-bg-scrim` (overlay radial/linear gelap) agar kontras teks kartu UI tetap optimal dan lulus uji keterbacaan WCAG.
- **Animasi Sapuan Slash**: Ditambahkan elemen `#slashOverlay` (`.slash-curtain`, `.slash-inner-skew`, `.slash-banner-content`) dengan keyframes `slashSweep` sepanjang 0.78 detik (easing `cubic-bezier(0.77, 0, 0.175, 1)`).
- **Pergantian Tema Tersembunyi (Midpoint Sync)**: Fungsi `triggerSlashTransition()` di `ethol.js` memicu callback mutasi tema tepat pada midpoint 360ms saat tirai menutupi 100% viewport, sehingga pergantian class `.loop-active` dan warna komponen berlangsung di balik tirai sebelum tirai membuka.
- **Pembersihan Folder Ekstraksi**: Folder hasil ekstraksi ZIP sementara dibersihkan, dan berkas tersusun rapi langsung di bawah `ethol-notifier/assets/` dan `ethol-notifier/reference/`.

## 7. Checklist verifikasi (sebelum diserahkan)

- [x] Mode normal: background menampilkan Makoto berwarna + Joker
      hitam-putih; UI Midnight Deck tampil utuh; teks terbaca.
- [x] Klik "Mulai Loop Otomatis": panel slash merah "PHANTOM DECK"
      menyapu, lalu mode loop tampil dengan background Joker berwarna +
      Makoto hitam-putih.
- [x] Klik "Hentikan Loop": panel slash biru "MIDNIGHT DECK" menyapu,
      lalu kembali ke mode normal.
- [x] Tidak ada fungsi yang berubah: tombol Presensi Instan, log,
      dan semua interaksi lain bekerja seperti sebelum perubahan.
- [x] Tidak ada gambar yang berkedip atau terlambat muncul saat ganti mode.
