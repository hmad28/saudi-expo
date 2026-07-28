import React, { useState } from "react";
import { Icon } from "./Icons";

const questions = [
  ["Apakah pembelian tiket memerlukan akun?", "Tidak. Kamu dapat membeli tiket sebagai tamu. Data pembeli dan peserta dicatat langsung pada pesanan."],
  ["Apakah satu tiket berlaku untuk seluruh event?", "Ya. Semua kategori tiket memberikan akses selama tiga hari sesuai benefit yang tertera pada masing-masing tiket."],
  ["Apakah QR tiket harus dicetak?", "Tidak. Tunjukkan digital pass dari ponsel saat check-in. Kamu tetap dapat mencetak tiket bila diperlukan."],
  ["Bagaimana jika email tiket tidak masuk?", "Periksa folder spam terlebih dahulu. Gunakan fitur Cek Tiket dengan nomor pesanan dan email pembelian untuk mengirim ulang akses tiket."],
  ["Apakah anak-anak memerlukan tiket?", "Anak di bawah 6 tahun gratis tanpa alokasi kursi. Usia 6 tahun ke atas memerlukan tiket, dan anak di bawah 12 tahun wajib didampingi orang dewasa."],
  ["Apakah tiket dapat di-refund?", "Transaksi yang berhasil bersifat final, kecuali event dibatalkan penyelenggara. Koreksi nama peserta dapat diajukan sebelum check-in."],
];

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section-block faq-section" id="faq">
      <div className="shell faq-layout">
        <div className="faq-intro">
          <span className="section-label">Pertanyaan umum</span>
          <h2>Yang perlu kamu tahu sebelum datang.</h2>
          <p>Belum menemukan jawaban? Hubungi tim SEE26 melalui kanal bantuan resmi.</p>
          <a className="btn btn-secondary" href="mailto:support@saudiexpo.id">Hubungi Panitia</a>
        </div>
        <div className="faq-list">
          {questions.map(([question, answer], index) => (
            <article className={open === index ? "is-open" : ""} key={question}>
              <button
                aria-expanded={open === index}
                onClick={() => setOpen(open === index ? -1 : index)}
              >
                <span>{question}</span>
                <Icon name={open === index ? "minus" : "plus"} size={20} />
              </button>
              <div className="faq-answer"><p>{answer}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
