# Saudi Education Expo 2026

Public event hub dan demonstrasi sistem ticketing untuk **Saudi Education Expo 2026 (SEE26)**—event yang mempertemukan pelajar Indonesia dengan universitas, penyedia beasiswa, alumni, dan komunitas mahasiswa di Arab Saudi.

![Saudi Education Expo 2026](public/see26-cinematic-campus.png)

## Pengalaman Produk

Website dirancang sebagai event hub yang modern, ringkas, ramah, dan berorientasi konversi. Halaman dibuka dengan satu pengalaman sinematik yang terukur: kamera bergerak perlahan melewati gerbang kampus menuju informasi event. Setelah itu, antarmuka kembali menjadi halaman event konvensional yang cepat dipindai dan nyaman digunakan dari tautan Instagram atau WhatsApp.

- Hero langsung menampilkan nama event, tanggal, venue, dan CTA tiket.
- Cinematic opening berbasis scroll dengan satu scene 2.5D yang koheren.
- Afternovie dimuat hanya setelah pengguna menekan tombol play.
- Ringkasan event, quick actions, statistik, agenda, pembicara, dan venue.
- Ticket cards dengan harga, benefit, kuota, deadline, badge, dan CTA penuh.
- Guest checkout empat langkah dengan order summary responsif.
- Digital wallet pass dengan QR asli dan kode tiket.
- Pencarian tiket, FAQ, kebijakan pembelian, dan sticky CTA mobile.
- Dukungan `prefers-reduced-motion` dengan hero statis dan konten normal-flow.
- Dashboard admin tetap compact dan data-focused; tidak menjadi bagian navigasi publik.

> Implementasi transaksi saat ini masih berupa demonstrasi frontend berbasis penyimpanan browser. Payment gateway, webhook, email transaksional, database, autentikasi admin, dan validasi server belum terhubung ke layanan produksi.

## Design System

Seluruh UI menggunakan **Plus Jakarta Sans**. Green dipakai sebagai warna aksi dan aksen—bukan sebagai latar setiap section.

| Token | Nilai |
| --- | --- |
| Background | `#F6F7F5` |
| Surface | `#FFFFFF` |
| Surface soft | `#EEF4EF` |
| Primary | `#078B4F` |
| Primary dark | `#056B3D` |
| Primary soft | `#DDF3E6` |
| Text primary | `#121613` |
| Text secondary | `#626B65` |
| Border | `#DEE4DF` |
| Gold accent | `#F1B93B` |

Konten menggunakan container terpusat dengan lebar maksimum sekitar `1040px`. Cards memakai radius `16–24px`, border tipis, shadow lembut, dan padding yang efisien. Button memiliki tinggi sentuh minimum `48px`.

## Stack

- [React 18](https://react.dev/)
- [Vite 6](https://vite.dev/)
- [`qrcode.react`](https://github.com/zpao/qrcode.react)
- CSS custom properties
- Browser-native `IntersectionObserver`, `requestAnimationFrame`, dan media queries

Tidak ada GSAP, Lenis, Three.js, UI framework, atau component library besar.

## Menjalankan Lokal

```bash
git clone https://github.com/hmad28/saudi-expo.git
cd saudi-expo
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Scripts

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan Vite development server |
| `npm run build` | Membuat production build |
| `npm run preview` | Menjalankan preview production build |

## Struktur Utama

```text
saudi-expo/
├── public/
│   ├── favicon.svg
│   └── see26-cinematic-campus.png
├── src/
│   ├── components/
│   │   ├── CinematicHero.jsx
│   │   ├── EventOverview.jsx
│   │   ├── TicketSection.jsx
│   │   ├── CheckoutModal.jsx
│   │   ├── TicketPassModal.jsx
│   │   └── ...
│   ├── utils/
│   ├── main.jsx
│   └── styles.css
├── index.html
└── package.json
```

## Catatan Produksi

Sebelum digunakan untuk penjualan publik, sistem masih membutuhkan:

- validasi harga dan kuota di backend;
- reservasi stok dalam transaksi database;
- payment session dan webhook yang terverifikasi serta idempotent;
- token akses dan check-in yang dibuat secara kriptografis;
- pengiriman dan retry email transaksional;
- autentikasi admin dan role-based access control;
- rate limiting, audit log, monitoring, serta export data;
- konten pembicara, partner, harga, dan kebijakan yang sudah dikonfirmasi panitia.

---

**Saudi Education Expo 2026**  
31 Juli–2 Agustus 2026 · SMESCO Indonesia, Jakarta
