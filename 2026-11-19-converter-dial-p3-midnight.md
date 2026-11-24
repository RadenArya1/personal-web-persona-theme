# 2026-11-19 — Layout Radial Dial Persona 3 Midnight (Universal Converter Studio)

Dokumen ini untuk Antigravity: cara mengubah tampilan Universal Converter
Studio menjadi layout Radial Dial Persona 3 Midnight, TANPA mengganggu sistem
di dalamnya.

## 1. Aturan utama (wajib dibaca dulu)

- Perubahan ini HANYA tampilan/UI. JANGAN mengganggu sistem di dalamnya:
  logika konversi file, alur pemrosesan client-side, privasi (semua dokumen
  diproses lokal di browser pengguna, tanpa upload server), dan semua fungsi
  yang sudah ada HARUS tetap bekerja persis seperti sebelumnya.
- Hanya file tampilan (view / style / asset) yang boleh disentuh. File
  logika (fungsi konversi, pemrosesan berkas, routing mode) JANGAN diubah.
- Jangan mengubah nama fungsi, ID, atau class yang dipakai logika.
- Jangan menghapus atau mengganti fitur apa pun.
- Kalau ada instruksi di dokumen ini yang tidak cocok dengan struktur project
  yang sebenarnya, sesuaikan dengan struktur yang ada dan catat penyesuaiannya
  di bagian 8. Jangan mengarang struktur baru.

## 2. Tujuan akhir

UI Universal Converter Studio memakai layout **Radial Dial Persona 3
Midnight** (lihat `reference/ui-dial-persona3-midnight.png`):

- Lima mode konversi tersusun melingkar seperti dial di sekeliling dropzone
  bundar di tengah layar.
- Judul + tombol aksi + chip format di kolom kiri.
- Bulan purnama besar di kanan atas, panel kaca translusen, nuansa tenang
  tengah malam.
- Font: **Marcellus** (judul serif elegan) + **Inter** (body).
- Warna: navy `#0d1b4c` / `#14307e`, panel aktif `#1e3a8a`,
  aksen `#27408f`.
- Gambar acuan layout dasar sebelum gaya Persona:
  `reference/ui-dial-original.png`.

## 3. Background

- File: `assets/bg-makoto-moon-hd.jpg` — close-up Makoto Yuki (Persona 3),
  mata tertutup, latar hitam bergrid, bulan gelap di kiri atas.
- Ukuran file: 1920×1080 (Full HD). CATATAN JUJUR: gambar ini dicari
  versi 4K-nya di beberapa sumber (image search + pencarian web, 19 Nov
  2026) dan TIDAK ditemukan versi yang lebih besar dari gambar yang sama
  — yang beredar lebih besar adalah gambar Makoto yang BERBEDA. File ini
  adalah versi asli 1920×1080, bukan hasil upscale. Untuk tampilan
  1600×1000 sudah cukup tajam; jangan mengklaimnya 4K.
- Sumber asli: wallpaperaccess.com (full/4350155.jpg).
- Pemasangan: background full-page di belakang seluruh UI
  (`background-size: cover`, posisi tengah).
- Di atas gambar, tambahkan **scrim navy gelap + blur ringan** supaya teks
  tetap terbaca di atas gambar.
- CATATAN PENTING: wajah Makoto ada di tengah-kanan, persis di zona dial —
  scrim di area itu harus cukup gelap/blur supaya dial dan teks tidak
  bertabrakan dengan wajah. Area kiri atas (bulan gelap + latar hitam)
  cocok untuk judul/teks karena paling tenang.

## 4. Isi UI yang harus tetap ada (jangan diubah teks/datanya)

- Bar atas: tombol kembali "← GRIMOIRE DASHBOARD" (kiri), badge
  "100% Client-Side Private" (kanan).
- Judul: "Universal Converter Studio" + subjudul: "Studio transformasi
  berkas multi-arah: PDF, Word (DOCX), PowerPoint (PPTX), dan semua tipe
  Gambar (JPG, PNG, WEBP, SVG, GIF). – diproses langsung di browser
  tanpa upload server."
- 5 mode: "Gambar ke PDF", "Gambar ke Word", "Word ke PDF",
  "PPT ke PDF/Word", "PDF ke Word/Gambar".
- Dropzone: "Seret & lepas berkas ke sini, atau klik untuk memilih" +
  "Mendukung PDF, Word (.docx), PowerPoint (.pptx), serta seluruh tipe
  gambar (JPG, PNG, WEBP, SVG, BMP, GIF)."
- Dua tombol: "Pilih Berkas" (primer) + "Coba Sampel Cepat" (sekunder).
- Chip format: PDF, DOCX, PPTX, JPG / JPEG, PNG, WEBP, SVG, BMP, GIF.
- Footer: "Universal Converter Studio • Bagian dari Ekosistem Aiz-WEB"
  dan "Privasi Terjamin: Seluruh dokumen diproses secara lokal di memori
  browser pengguna • tanpa Penyimpanan Server".

## 5. Langkah implementasi (berurutan)

1. **Salin asset ke folder asset project.** Salin
   `assets/bg-makoto-moon-hd.jpg` ke folder asset gambar project
   (sesuaikan path-nya dengan struktur project, lalu pakai path relatif).
2. **Pasang background + scrim.** Jadikan gambar background full-page
   (cover, posisi tengah). Tambahkan scrim navy gelap di atas gambar
   (lapisan gelap transparan, lebih gelap di zona dial tengah-kanan) +
   blur ringan, sampai semua teks terbaca jelas.
3. **Susun ulang layout menjadi dial radial.** Ikuti
   `reference/ui-dial-persona3-midnight.png`: lima mode melingkar di
   sekeliling dropzone bundar di tengah; judul, tombol aksi, dan chip
   format di kolom kiri; footer di bawah. JANGAN ubah teks/isi — hanya
   susunannya yang berubah.
4. **Terapkan font Marcellus + Inter.** Marcellus untuk judul dan heading
   dropzone; Inter untuk body, label mode, tombol, dan chip. Sertakan
   file font lokal di project (folder font/asset project), jangan hanya
   mengandalkan CDN — supaya tampilan tetap sama saat offline.
5. **Terapkan warna + panel kaca + bulan.** Warna navy `#0d1b4c` /
   `#14307e`, panel aktif `#1e3a8a`, aksen `#27408f`. Panel node, tombol,
   dan chip memakai material kaca translusen (blur + border terang).
   Bulan purnama besar dengan glow di kanan atas (boleh digambar
   dengan CSS/SVG, bukan gambar tambahan).
6. **Uji.** Jalankan checklist di bagian 7 sampai semuanya lolos.

## 6. Yang TIDAK boleh dilakukan

- Mengubah logika konversi, alur pemrosesan file, atau cara file dibaca
  dan ditulis.
- Menghapus atau mengganti fitur (mode konversi, dropzone, tombol, chip,
  footer).
- Mengubah teks/isi data apa pun.
- Mengubah nama fungsi, ID, atau class yang dipakai logika.
- Mengganti background dengan gambar lain.
- Mengklaim background 1920×1080 ini sebagai 4K, atau meng-upscale-nya
  lalu menyebutnya HD asli.

## 7. Daftar file di dalam ZIP ini

```
converter-dial-p3.zip
├── 2026-11-19-converter-dial-p3-midnight.md   (dokumen ini)
├── assets/
│   └── bg-makoto-moon-hd.jpg                 (background, 1920×1080)
└── reference/
    ├── ui-dial-persona3-midnight.png         (layout target yang dipilih)
    └── ui-dial-original.png                 (layout dasar sebelum gaya Persona)
```

## 8. Checklist verifikasi (sebelum diserahkan)

- [ ] Kelima mode bisa diklik dan mengubah mode konversi yang aktif.
- [ ] Dropzone menerima file (drag & drop dan klik untuk memilih).
- [ ] Tombol "Pilih Berkas" dan "Coba Sampel Cepat" bekerja.
- [ ] Chip format tampil lengkap (9 chip).
- [ ] Konversi file tetap jalan dan hasilnya sama seperti sebelum
      perubahan (uji minimal satu file per mode).
- [ ] Semua teks terbaca di atas background (kontras cukup, scrim
      di zona dial cukup gelap).
- [ ] Tidak ada elemen yang terpotong atau bertumpuk di 1600×1000.
- [ ] Dial tampil utuh: 5 node mode + dropzone bundar di tengah.
- [ ] Font Marcellus + Inter tampil (bukan font fallback sistem).
- [ ] Tidak ada fungsi yang berubah perilakunya dibanding sebelum
      perubahan.

## 9. Penyesuaian yang dilakukan Antigravity (diisi Antigravity)

- (Tulis di sini kalau ada yang disesuaikan dari dokumen ini, mis. nama
  file, path, atau class yang berbeda di project.)
