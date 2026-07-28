import React, { useState } from "react";

export function Faq() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    [
      "Apakah pembelian tiket membutuhkan registrasi akun?",
      "Tidak. Sistem Saudi Expo menggunakan alur guest checkout tanpa akun. Identitas pembeli dan peserta disimpan langsung pada transaksi, dan tiket digital beserta QR unik dikirim ke email kamu.",
    ],
    [
      "Apakah satu tiket berlaku untuk seluruh 3 hari acara?",
      "Ya. Semua jenis tiket resmi (Student Pass, Early Access, Regular, VIP, Family) memberikan akses masuk selama 3 hari pameran (31 Juli – 2 Agustus 2026).",
    ],
    [
      "Apakah QR tiket harus dicetak fisik?",
      "Tidak wajib. Kamu dapat langsung menunjukkan QR tiket digital pada layar smartphone saat melalui check-in gate panitia. Tiket juga dapat dicetak dalam bentuk fisik jika diinginkan.",
    ],
    [
      "Bagaimana jika email tiket saya tidak masuk atau terhapus?",
      "Kamu dapat menggunakan fitur 'Cek Tiket Saya' di bagian navigasi atas website ini. Masukkan nomor pesanan (contoh: SE26-8F4K2P) dan alamat email pembelian untuk membuka kembali tiket atau mengirim ulang email.",
    ],
    [
      "Bagaimana kebijakan tiket untuk anak-anak?",
      "Anak di bawah usia 6 tahun gratis masuk tanpa alokasi kursi khusus. Anak usia 6 tahun ke atas memerlukan tiket resmi. Anak di bawah usia 12 tahun wajib didampingi oleh orang dewasa.",
    ],
    [
      "Apakah tiket dapat dipindahtangankan atau di-refund?",
      "Tiket yang sudah dibeli bersifat non-refundable (tidak dapat diuangkan kembali). Namun, kamu dapat melakukan koreksi nama peserta melalui layanan panitia atau dashboard admin sebelum waktu check-in.",
    ],
  ];

  return (
    <section className="faq section" id="faq">
      <div className="wrap faq-grid">
        <div className="faq-title reveal visible">
          <div className="eyebrow">
            <span /> INFORMASI & PERTANYAAN
          </div>
          <h2>
            Pertanyaan yang<br />
            <em>sering diajukan.</em>
          </h2>
          <p>
            Memiliki pertanyaan lain? Tim panitia SEE26 siap membantu melalui layanan bantuan resmi di lokasi maupun via email support@saudiexpo.id.
          </p>
        </div>

        <div className="accordion reveal visible">
          {faqs.map(([q, a], i) => (
            <article className={openFaq === i ? "open" : ""} key={q}>
              <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <span>{q}</span>
                <b>{openFaq === i ? "−" : "+"}</b>
              </button>
              <div className="answer">
                <p>{a}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
