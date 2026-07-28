# Saudi Education Expo 2026

Landing page resmi dan fondasi pengalaman digital untuk **Saudi Education Expo 2026 (SEE26)**—festival pendidikan yang menghubungkan pelajar Indonesia dengan universitas, beasiswa, alumni, dan peluang studi di Arab Saudi.

![Saudi Education Expo 2026](public/see26-hero.png)

## Tentang Proyek

Website ini menerjemahkan identitas visual SEE26 menjadi pengalaman web yang premium, editorial, dan berorientasi konversi. Arah desainnya memadukan nuansa Saudi yang elegan dengan antarmuka event pendidikan yang tetap muda, mudah dibaca, dan nyaman digunakan melalui perangkat seluler.

Implementasi saat ini berfokus pada **landing page frontend**. Sistem transaksi, payment gateway, penerbitan QR, pengiriman email, dan dashboard internal merupakan tahap pengembangan berikutnya.

## Fitur Saat Ini

- Hero editorial dengan informasi tanggal dan venue.
- Countdown acara secara real-time.
- Ringkasan event dan statistik utama.
- Informasi program dan manfaat beasiswa.
- Rundown interaktif untuk tiga hari acara.
- Pilihan kategori tiket dan modal awal checkout.
- Informasi venue dengan tautan Google Maps.
- Partner dan jaringan pendidikan.
- FAQ interaktif.
- Navigasi responsif untuk desktop dan mobile.
- Animasi masuk berbasis scroll dan micro-interactions.
- Dukungan `prefers-reduced-motion`.
- Layout mobile tanpa horizontal overflow.

## Arah Visual

Identitas antarmuka dibangun dari empat prinsip:

- **Premium Saudi Event** — emerald, cream, gold, dan arsitektur berbentuk arch.
- **Modern Editorial** — tipografi display, komposisi lapang, dan hierarchy yang kuat.
- **Educational & Trustworthy** — informasi penting tetap cepat dipindai dan tidak tertutup dekorasi.
- **Conversion-focused** — CTA tiket, harga, benefit, kuota, dan informasi pembayaran dibuat jelas.

Palet utama:

| Token | Warna |
| --- | --- |
| Deep emerald | `#0F3D2E` |
| Forest green | `#174F3A` |
| Dark green | `#082A20` |
| Cream | `#F7F2E7` |
| Warm white | `#FCFAF5` |
| Gold | `#D5A347` |

## Tech Stack

- [React 18](https://react.dev/)
- [Vite 6](https://vite.dev/)
- CSS custom properties dan responsive layout
- Browser-native `IntersectionObserver`

Tidak ada UI framework atau component library. Sistem visual, komponen, dan interaksi dibangun khusus untuk SEE26.

## Menjalankan Secara Lokal

### Prasyarat

- Node.js
- npm

### Instalasi

```bash
git clone https://github.com/hmad28/saudi-expo.git
cd saudi-expo
npm install
```

### Development

```bash
npm run dev
```

Vite akan menampilkan alamat development server pada terminal.

### Production Build

```bash
npm run build
```

Hasil build tersedia di direktori `dist/`.

### Preview Production Build

```bash
npm run preview
```

## Scripts

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan Vite development server |
| `npm run build` | Membuat optimized production build |
| `npm run preview` | Menjalankan preview dari production build |

## Struktur Proyek

```text
saudi-expo/
├── public/
│   └── see26-hero.png     # Visual utama hero
├── src/
│   ├── main.jsx          # Konten, komponen, data, dan interaksi
│   └── styles.css        # Design system dan responsive styling
├── index.html            # HTML entry point dan metadata
├── package.json          # Dependencies dan scripts
└── README.md
```

## Interaksi yang Tersedia

- Pilih tab **Hari 1–3** untuk mengganti rundown.
- Pilih kategori tiket untuk membuka modal checkout.
- Buka/tutup pertanyaan pada bagian FAQ.
- Gunakan navigation anchor untuk berpindah section.
- Gunakan menu layar penuh pada viewport mobile.

Modal checkout saat ini merupakan demonstrasi frontend dan belum membuat order atau memproses pembayaran.

## Roadmap Produk

Tahap berikutnya direncanakan mencakup:

- Guest checkout dan data peserta.
- Validasi harga serta reservasi kuota di backend.
- Integrasi payment gateway dan webhook idempotent.
- Tiket digital dengan QR unik.
- Secure ticket link tanpa akun pembeli.
- Email konfirmasi dan resend ticket.
- Dashboard admin dan role petugas check-in.
- QR scanner serta check-in manual.
- Export transaksi dan peserta.
- Audit log dan laporan operasional.

Arsitektur target menggunakan Next.js, serverless PostgreSQL, autentikasi khusus admin, transactional email provider, dan deployment serverless.

## Validasi

Implementasi telah diverifikasi melalui:

- Vite production build.
- Pengujian navigasi dan layout desktop.
- Pengujian viewport mobile `390 × 844`.
- Pengujian tab rundown, accordion FAQ, modal tiket, dan mobile menu.
- Pemeriksaan horizontal overflow.

---

**Saudi Education Expo 2026**  
31 Juli–2 Agustus 2026 · SMESCO, Jakarta
