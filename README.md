# Saudi Education Expo 2026

Campaign hub, jadwal, pemilihan tiket, guest checkout, pembayaran manual, dan digital ticket untuk **Saudi Education Expo 2026** oleh **PPMI Arab Saudi**.

Event berlangsung pada **31 Juli–2 Agustus 2026** di **SMESCO Exhibition & Convention Hall, Jakarta**.

## Pengalaman yang Dibangun

- Campaign-collage hero menggunakan logo resmi SEE 2026.
- Countdown berbasis zona waktu `Asia/Jakarta`.
- Sejarah Saudi University Expo 2025 → Saudi Education Expo 2026.
- Program, audiens, outcome, institutional trust, dan daftar 24 pembicara terkonfirmasi.
- Jadwal lengkap tiga hari dengan filter hari dan stage.
- Ticket selector berdasarkan kategori dengan state available, sold out, dan incomplete configuration.
- Guest checkout dengan buyer dan attendee terpisah.
- Voucher UI, donasi opsional, manual bank transfer, dan upload bukti pembayaran.
- Development admin untuk approve/reject pembayaran.
- Satu digital ticket dan QR terpisah untuk setiap attendee.
- Bundle check-in menggunakan satu QR dengan validasi harian.
- Syarat dan ketentuan serta age policy.
- Mobile sticky ticket CTA dan checkout CTA.
- Reduced motion, keyboard focus, semantic navigation, dan accessible FAQ.

## Menjalankan Project

```bash
npm install
npm run dev
```

Vite akan menampilkan alamat development server, biasanya `http://localhost:5173`.

Production build:

```bash
npm run build
npm run preview
```

## Event Data

Seluruh identitas, waktu, venue, highlight, speaker, jadwal, tiket, age policy, FAQ, dan unresolved organizer decisions berada di:

```text
src/data/eventConfig.js
```

Jangan menulis ulang tanggal, harga, atau venue langsung di komponen. Perbarui konfigurasi tersebut agar landing, checkout, pembayaran, admin, dan tiket memakai sumber yang sama.

Core browser-side ticketing adapter berada di:

```text
src/utils/storage.js
```

Adapter ini memakai `localStorage` untuk mendemonstrasikan lifecycle produk. Ia bukan pengganti backend produksi.

## Routes

| Route | Fungsi |
| --- | --- |
| `/` | Curated campaign overview |
| `/tentang` | Latar event, kontinuitas, konteks, dan trust |
| `/kegiatan` | Program dan outcome pengunjung |
| `/jadwal` | Jadwal lengkap tiga hari dan dua stage |
| `/pembicara` | Daftar pembicara terkonfirmasi |
| `/tiket` | Progressive ticket configurator |
| `/mitra` | Direktori partner berbasis metadata |
| `/lokasi` | Venue dan navigasi |
| `/dokumentasi` | Aftermovie dan galeri resmi |
| `/faq` | FAQ dan kebijakan event |
| `/syarat-ketentuan` | Syarat tiket |
| `/kebijakan-privasi` | Kebijakan privasi |
| `/checkout?ticket=regular-d1&qty=1` | Guest checkout |
| `/payment/:secureToken` | Instruksi dan konfirmasi pembayaran |
| `/payment/:secureToken/confirm` | Upload bukti pembayaran manual |
| `/order/:secureToken` | Secure order status |
| `/ticket/:secureToken` | Digital ticket |
| `/check-in/:checkInToken` | Validasi QR untuk sesi petugas |
| `/kemitraan` | Entry point kolaborasi |
| `/kemitraan/sponsorship` | Pengajuan sponsorship |
| `/kemitraan/booth` | Pengajuan booth dan exhibitor |
| `/lembaga` | Entry point lembaga |
| `/lembaga/daftar/ikhwan` | Pengajuan lembaga ikhwan |
| `/lembaga/daftar/akhwat` | Pengajuan lembaga akhwat |
| `/kemitraan/status/:secureToken` | Secure partnership status |
| `/lembaga/status/:secureToken` | Secure institution status |
| `/admin` | Development payment review |

SPA fallback untuk Vercel sudah dikonfigurasi melalui `vercel.json`. Seluruh deep link publik diarahkan ke `index.html`, sementara aset build tetap dilayani langsung oleh platform.

## Ticket Product Rules

Produk yang dapat dibeli pada konfigurasi saat ini:

- Regular — Day 1, `Rp49.000`
- Regular — Day 3, `Rp49.000`

Produk sold out:

- Bundle Regular — 3 Hari
- Regular — Day 2
- Rombongan — Day 2

Produk berikut sengaja dinonaktifkan karena mekaniknya belum lengkap:

- Rombongan — Day 1 dan Day 3
- Couple Promo — Day 1
- Beli 2 Gratis 1 — Day 1

Status tersebut tidak boleh diaktifkan sampai field konfigurasi yang terkait dikonfirmasi organizer.

## Missing Official Assets

Sistem tidak menghasilkan foto orang atau dokumentasi event menggunakan AI. Asset slot netral dipakai sampai organizer memberikan:

- dokumentasi Saudi University Expo 2025;
- thumbnail dan URL aftermovie 2025;
- foto resmi 24 pembicara, metadata, dan izin publikasi;
- foto seminar, booth, audience, dan committee;
- poster kampanye resmi untuk collage hero;
- foto SMESCO yang telah diverifikasi;
- logo partner dan sponsor.

Logo yang saat ini digunakan:

```text
public/SEE26-logo.png
public/SEE26-logo-2.jpg
```

## Organizer Decisions Required

- Final gate-opening time.
- Final public event hours.
- Final Campus & Scholarship Expo hours.
- Status publikasi klaim 25+ booth.
- Minimum dan maksimum tiket rombongan.
- Data yang wajib diisi peserta rombongan.
- Makna harga, jumlah QR, dan souvenir Couple Promo.
- Jumlah QR dan souvenir Beli 2 Gratis 1.
- Ticket transfer dan on-site sales policy.
- Kapasitas seminar dan workshop.
- Metadata, foto, dan izin publikasi pembicara.
- Partner dan sponsor.

Konfigurasi menyimpan waktu `08:30`, `09:00`, dan `18:00` sebagai nilai provisional yang diberi TODO eksplisit.

## QA

Automated browser checks:

```bash
python C:\Users\Pongo\.agents\skills\webapp-testing\scripts\with_server.py \
  --server "npm run dev -- --host 127.0.0.1" \
  --port 5173 \
  -- python scripts/qa_public.py

python C:\Users\Pongo\.agents\skills\webapp-testing\scripts\with_server.py \
  --server "npm run dev -- --host 127.0.0.1" \
  --port 5173 \
  -- python scripts/qa_ticketing.py

python C:\Users\Pongo\.agents\skills\webapp-testing\scripts\with_server.py \
  --server "npm run dev -- --host 127.0.0.1" \
  --port 5173 \
  -- python scripts/qa_navigation.py

python C:\Users\Pongo\.agents\skills\webapp-testing\scripts\with_server.py \
  --server "npm run dev -- --host 127.0.0.1" \
  --port 5173 \
  -- python scripts/qa_applications.py
```

`qa_public.py` memeriksa 18 public routes dan:

- 1440×900
- 1280×720
- 1024×768
- 768×1024
- 390×844
- 430×932
- horizontal overflow
- console errors
- schedule tabs dan stage filter
- sold-out behavior
- reduced motion
- mobile checkout

`qa_ticketing.py` menjalankan:

```text
checkout
→ order
→ manual payment proof
→ admin approval
→ digital ticket
→ QR generation
```

## Production Boundaries

Implementasi checkout saat ini adalah development-grade product prototype. Sebelum penjualan publik, ganti browser storage dengan backend/serverless implementation yang menyediakan:

- PostgreSQL dan transaction-safe inventory reservation;
- server-side schema validation dan immutable pricing snapshot;
- secure token hash storage;
- admin authentication, RBAC, MFA, dan audit identity;
- payment gateway session dan verified idempotent webhook;
- private object storage untuk bukti pembayaran;
- virus/MIME/metadata inspection untuk upload;
- transactional email provider dan retry queue;
- order expiry worker;
- rate limiting dan CSRF protection;
- production QR validation endpoint;
- privacy, refund, dan data-retention review;
- server-generated invoice/PDF;
- monitoring, error tracking, dan database backups.

Automatic gateway sengaja dinonaktifkan karena repository tidak memiliki provider credentials atau backend webhook.

## Stack

- React 18
- Vite 6
- Vanilla CSS
- `qrcode`
- Bricolage Grotesque
- Plus Jakarta Sans
- Barlow Condensed
- Python Playwright untuk QA
