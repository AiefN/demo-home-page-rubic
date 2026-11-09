# Rubicweb &mdash; Premium Digital Agency &amp; Engineering Website Redesign

**Tipe Proyek:** Redesign Website Website Demo  
**Versi:** 3.0 (Master Prompt Implementation &mdash; Creative Agency Edition)  
**Teknologi:** HTML5 + CSS3 + Vanilla JavaScript (**0% Framework / Zero External Dependencies**)  
**Konsep Desain:** Premium Editorial / Digital Engineering (*Room & Pillar*, *Jesper Westlund*, *PDA Architecture*)  
**Referensi Domain Resmi:** [https://rubicweb.co.id/](https://rubicweb.co.id/)  

---

## 1. Ikhtisar & Transformasi Proyek

Proyek ini merupakan perancangan ulang (redesign) komprehensif multi-halaman untuk **Rubicweb**, agensi rekayasa website dan transformasi digital profesional di Jakarta yang terdaftar resmi sebagai Penyelenggara Sistem Elektronik (PSE) di Kementerian Komunikasi dan Digital RI (KOMDIGI).

Pada **Versi 3.0**, website berevolusi dari struktur semantik murni menjadi **ekosistem digital agency kelas dunia** yang memadukan keunggulan estetika editorial modern, interaktivitas fluida, dan standar rekayasa frontend mutakhir dengan tetap mempertahankan prinsip **Zero Framework**:

- **HTML5 Semantik:** Struktur halaman yang bersih, hirarkis, dan terstruktur sesuai standar W3C & WCAG 2.1 AA.
- **CSS3 Modern:** Sistem desain modular tanpa bootstrap/tailwind; memanfaatkan CSS Custom Properties (Variables), Flexbox, CSS Grid, Media Queries multi-breakpoint, serta animasi GPU-accelerated.
- **Vanilla JavaScript:** Modul mandiri untuk interaksi navigasi (mobile drawer & floating pill), typewriter terminal dengan syntax highlighter, portfolio cross-fade switcher, dan validasi formulir terpadu.

---

## 2. Struktur Direktori Proyek

```text
rubicweb/
│
├── index.html                  # Beranda Utama (Hero Editorial, Typewriter Terminal, Capabilities, Stats, Services, Interactive Portfolio, FAQ, Form, Floating Nav)
│
├── css/
│   ├── style.css               # Desain Sistem Global, Variabel Warna/Tipografi, Layout, Floating Bottom Nav, Cards, Forms, Footer
│   ├── animations.css          # Animasi Halus: Typewriter Cursor, Ambient Glow, Floating Badges, Scroll Reveals, Reduced Motion
│   └── responsive.css          # Breakpoints Komprehensif (1440px, 1024px, 768px, 480px, 390px, 375px) dengan Zero Horizontal Overflow
│
├── js/
│   ├── main.js                 # Inisialisasi IntersectionObserver Scroll Reveal, Back-to-Top Button, Smooth Anchors
│   ├── navigation.js           # Mobile Navigation Drawer, Backdrop, Trap Focus, Escape Listener, Active Nav Tracker
│   ├── terminal.js             # Typewriter Effect Real-Time, Syntax Tokenizer (const, properties, strings), Reduced Motion Fallback
│   ├── portfolio.js            # Category Switcher Interaktif Gaya PDA Architecture dengan Cross-Fade Gambar & Metadata
│   └── form.js                 # Validasi Formulir Klien (Nama, Email Regex, Kategori, Pesan, Checkbox Kebijakan) & Feedback Banner
│
├── pages/
│   ├── about.html              # Profil Perusahaan, Visi, Filosofi Zero-Bloat, Kapabilitas, 7 Siklus Rekayasa Digital
│   ├── services.html           # Direktori 5 Layanan Lengkap, Detail Deliverables Teknis, Estimasi Waktu, FAQ Layanan
│   ├── portfolio.html          # Katalog Karya Unggulan (Grid Interaktif Fintech, E-Commerce, Korporat Tbk)
│   ├── pinjamin.html           # Studi Kasus Detail 01: Pinjamin (Fintech P2P Lending, SLA 99.98%, Keamanan Berlapis)
│   ├── karalia.html            # Studi Kasus Detail 02: Karalia (E-Commerce Emas & Retail, Core Web Vitals 99/100, 2-Step Checkout)
│   ├── wilmar.html             # Studi Kasus Detail 03: Wilmar (Portal Korporat Tbk & Hubungan Investor, Skalabilitas Tinggi)
│   ├── contact.html            # Halaman Kontak Resmi, Informasi Terverifikasi, Lokasi Kantor, Formulir Inquiry Proyek
│   └── faq.html                # Direktori FAQ Terkategorisasi (15 Pertanyaan dalam 5 Kategori dengan Native Accordion)
│
├── assets/
│   ├── logos/
│   │   ├── rubicweb-logo.png   # Logo Resmi Rubicweb (Unduhan Langsung dari Server Rubicweb)
│   │   ├── rubicweb-logo.svg   # Vektor Ribbon Rubicweb Kuning-Oranye
│   │   └── komdigi.png         # Badge Resmi Sertifikasi PSE KOMDIGI
│   │
│   ├── images/
│   │   ├── hero-image.jpg      # Banner Hero Editorial Rubicweb
│   │   ├── company-image.jpg   # Banner Editorial Profil Korporat Rubicweb
│   │   ├── contact-image.jpg   # Banner Konsultasi Proyek Rubicweb
│   │   └── digital-architecture-diagram.svg # Diagram 3 Lapis Kerangka Arsitektur Digital Rubicweb
│   │
│   └── portfolio/
│       ├── pinjamin/
│       │   ├── pinjamin-main.png         # Tangkapan Layar Asli Portofolio Pinjamin
│       │   └── pinjamin-client-logo.png  # Logo Resmi Klien Pinjamin
│       ├── karalia/
│       │   ├── karalia-main.png          # Tangkapan Layar Asli Portofolio Karalia
│       │   └── karalia-client-logo.png   # Logo Resmi Klien Karalia
│       └── wilmar/
│           ├── wilmar-main.png           # Tangkapan Layar Asli Portofolio Wilmar
│           └── wilmar-client-logo.png    # Logo Resmi Klien Wilmar
│
├── RESEARCH-NOTES.md           # Dokumentasi Riset Data Resmi, Alamat Terverifikasi & Perbedaan Data Dummy
└── README.md                   # Dokumentasi Arsitektur, Panduan Pengujian & Fitur Versi 3.0
```

---

## 3. Fitur Utama & Inspirasi Desain

### A. Room & Pillar &mdash; Floating Bottom Navigation Bar
- Bar navigasi melayang (*pill geometry*) di bagian bawah layar: `position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);`
- Efek *frosted glass* modern dengan `backdrop-filter: blur(20px)` dan latar semi-transparan `rgba(17, 17, 19, 0.85)`.
- Mengarahkan navigasi instan ke halaman utama (*Home, About, Services, Portfolio, Contact, FAQ*) dengan penanda tautan aktif dan tombol aksi konsultasi (*Let's Talk*).
- Responsif: Beradaptasi otomatis pada layar mobile kecil menjadi drawer navigasi layar sentuh lengkap dengan overlay backdrop gelap.

### B. Jesper Westlund &mdash; Typewriter Terminal Card
- Kartu terminal bergaya IDE modern di hero section dengan kontrol jendela macOS (*red, yellow, green buttons*).
- Mengetikkan representasi kode arsitektur bisnis karakter demi karakter:
  ```javascript
  const yourBusiness = {
    speed: 'Pretty Good ⚡',
    seoRanking: '#1 Google Page',
    conversion: 'Maximum 🔥'
  };
  ```
- Dilengkapi *syntax highlighting* dinamis warna-warni (`const` oranye, properti emas, string hijau emerald) dan kursor berkedip (`blinkCursor`).
- Otomatis menghormati preferensi pengguna: Jika `prefers-reduced-motion` aktif, teks langsung dirender penuh tanpa animasi berulang.

### C. PDA Architecture &mdash; Two-Column Category Portfolio Switcher
- Bagian karya terpilih menampilkan daftar kategori di kolom kiri (*Pinjamin*, *Karalia*, *Wilmar*).
- Ketika pengunjung mengarahkan kursor atau mengklik salah satu kategori:
  - Kartu pratinjau di kolom kanan melakukan transisi *cross-fade* gambar dengan mulus.
  - Judul, tag layanan, deskripsi dampak, dan tombol studi kasus diperbarui secara instan tanpa reload halaman.
- Tersedia fallback native HTML lengkap bagi pengguna dengan JavaScript non-aktif.

### D. Sistem Validasi Formulir Klien
- Validasi instan di halaman `contact.html` dan beranda:
  - Validasi panjang nama lengkap.
  - Validasi format email menggunakan ekspresi reguler (Regex).
  - Validasi pilihan kategori layanan.
  - Validasi panjang minimal deskripsi proyek (minimal 10 karakter).
  - Validasi centang persetujuan kebijakan privasi.
- Memberikan feedback visual berwarna merah untuk input bermasalah dan pesan sukses berlatar hijau emerald yang langsung terhubung ke saluran WhatsApp resmi Rubicweb untuk pengiriman instan.

---

## 4. Sistem Palet Warna & Tipografi

| Token CSS | Nilai Hex / RGBA | Peruntukan |
| :--- | :--- | :--- |
| `--bg-main` | `#0B0B0C` | Latar belakang kanvas utama (ultra-dark deep black) |
| `--bg-secondary` | `#111113` | Latar belakang section sekunder dan cards |
| `--bg-card` | `#161618` | Latar kartu komponen dan preview container |
| `--accent-gold` | `#FFB800` | Aksen emas Rubicweb (brand primary) |
| `--accent-orange` | `#FF7A00` | Aksen oranye ribbon Rubicweb (brand secondary) |
| `--text-main` | `#F5F5F5` | Warna tipografi heading dan teks utama |
| `--text-muted` | `#A1A1AA` | Tipografi deskripsi sekunder |
| `--text-subtle` | `#71717A` | Metadata, caption, dan teks pendukung |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Garis batas tipis minimalis |

**Font Stack:**
- Body & UI: `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
- Editorial Headings: `'Playfair Display', Georgia, serif`
- Terminal & Code: `'JetBrains Mono', 'Fira Code', monospace`

---

## 5. Ringkasan Data Resmi Terverifikasi ([RESEARCH-NOTES.md](RESEARCH-NOTES.md))

- **Entitas Bisnis:** Rubicweb &mdash; Digital Agency &amp; Web Engineering.
- **Alamat Kantor Resmi:** Bellezza BSA (Bellezza Shopping Arcade), Lantai 1 Unit 106, Permata Hijau, Kebayoran Lama, Jakarta Selatan 12210.
- **Saluran Resmi:** Email: `hello@rubicweb.com` | WhatsApp: `+62 822-9900-9615` | Portal: `https://rubicweb.co.id`.
- **Sertifikasi Pemerintah:** Terdaftar resmi sebagai Penyelenggara Sistem Elektronik (PSE) di Kementerian Komunikasi dan Digital RI (KOMDIGI).
- **Portofolio Terverifikasi:**
  1. **Pinjamin:** Platform P2P Lending UMKM berlisensi resmi.
  2. **Karalia:** Toko online retail emas & perhiasan modern berkecepatan tinggi.
  3. **Wilmar:** Portal korporat konglomerasi agribisnis multinasional (Tbk).

---

## 6. Panduan Menjalankan & Menguji Proyek

### Opsi A &mdash; Membuka Langsung di Peramban (File Explorer)
1. Buka folder `c:\sekul\rubicweb\` (atau `c:\sekul\PKL\rubicweb\`).
2. Klik ganda file `index.html`.
3. Website akan langsung terbuka di peramban favorit Anda (*Google Chrome*, *Microsoft Edge*, atau *Mozilla Firefox*).

### Opsi B &mdash; Menggunakan VS Code Live Server
1. Buka folder `c:\sekul\rubicweb` di VS Code.
2. Klik kanan file `index.html` lalu pilih **"Open with Live Server"**.
3. Akses otomatis dibuka di `http://127.0.0.1:5500/index.html`.

### Opsi C &mdash; Akses dari Direktori PKL
- Anda juga dapat membuka langsung file `c:\sekul\PKL\homepagerubic.html` atau `c:\sekul\PKL\index.html` yang telah disinkronisasikan 100% dengan aset dan skrip Versi 3.0.

---

&copy; 2026 Rubicweb &mdash; Digital Agency &amp; Engineering.  
*Disusun sebagai Proyek Redesign Website Website Demo.*
