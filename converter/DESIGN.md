# Design System Specification: Universal Converter Studio (Persona 3 Midnight Dial)

## Design Direction & Philosophy

Universal Converter Studio mengadopsi tema **Persona 3 Midnight Radial Dial**. Antarmuka berpusat pada nuansa malam hari yang tenang dan mistis (Midnight Hour), memadukan estetika *Velvet Room & Dark Hour* dengan layout melingkar (Radial Dial) yang futuristik dan presisi.

- **Fokus Utama**: Kenyamanan visual di malam hari, estetika glassmorphism translusen di atas latar belakang Makoto Yuki & Bulan Purnama, serta pemrosesan dokumen lokal 100% tanpa upload server.
- **Dial Core**: 5 mode transformasi disusun secara melingkar mengitari zona peletakan berkas (Dropzone bundar).

## Colors

```yaml
colors:
  background: "#000814"
  midnight-navy: "#0d1b4c"
  deep-blue: "#14307e"
  surface-glass: "rgba(13, 27, 76, 0.65)"
  surface-active: "#1e3a8a"
  accent-blue: "#27408f"
  cyan-glow: "#buat 00e5ff"
  persona-red: "#ff1744"
  border-glass: "rgba(100, 160, 255, 0.22)"
  border-glow: "rgba(0, 229, 255, 0.45)"
  text-primary: "#ffffff"
  text-secondary: "#cbd5e1"
  text-muted: "#94a3b8"
  error: "#ff1744"
  warning: "#f59e0b"
  success: "#00e5ff"
```

## Typography

- **Heading & Judul Utama**: `Marcellus`, serif elegan klasik bertema mistis arkana.
- **Body, Tombol, Kontrol, & Chip**: `Inter`, sans-serif modern berdaya baca tinggi dan presisi metrik.
- **Label Format / Monospace**: `JetBrains Mono` untuk ukuran berkas dan ekstensi.

```yaml
typography:
  headline-title:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "34px"
    fontWeight: "400"
    letterSpacing: "0.03em"
  headline-dropzone:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "18px"
    fontWeight: "400"
  body-ui:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "1.6"
  label-code:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "12px"
```

## Layout & Radial Dial Anatomy

1. **Top Bar**: Tombol kembali ke Grimoire Dashboard dan badge privasi 100% Client-Side.
2. **Left Column**: Identitas studio, aksi utama ("Pilih Berkas" & "Coba Sampel Cepat"), dan 9 format chip yang didukung.
3. **Center Radial Dial**:
   - Orbit melingkar diameter 480px–520px di desktop.
   - Dropzone bundar di tengah diameter 260px–280px.
   - 5 Node Mode (`.preset-chip`) terdistribusi merata pada sudut orbit (misal -90°, -18°, 54°, 126°, 198°).
4. **Right Decor**: Bulan purnama bercahaya lembut dengan efek glow cyan-putih di kanan atas.
5. **Queue Card & Toast**: Antrean konversi modular berada di bawah dengan panel kaca gelap terisolasi.
6. **Mobile Adaptability (Android-Fit)**:
   - Dynamic viewport: `100dvh`.
   - Safe insets: `env(safe-area-inset-top)` & `env(safe-area-inset-bottom)`.
   - Pada layar <= 900px, kolom beralih menjadi tata letak vertikal responsif dengan ukuran dial yang menyesuaikan lebar layar tanpa horizontal scroll (`max-width: 100vw; overflow-x: hidden`).
