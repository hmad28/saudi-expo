import React, { useState } from "react";
import { Icon } from "./Icons";

const questions = [
  ["Apakah Saudi Education Expo merupakan event baru?", "Tidak. Saudi Expo adalah agenda tahunan. Pada 2025 agenda ini dikenal sebagai Saudi University Expo, kemudian berkembang menjadi Saudi Education Expo pada 2026."],
  ["Siapa yang menyelenggarakan Saudi Education Expo?", "Saudi Education Expo merupakan agenda kolaboratif PPMI Saudi dan organisasi wilayahnya, diselenggarakan melalui kepanitiaan independen."],
  ["Kegiatan apa saja yang akan dihadirkan?", "Kategori kegiatan yang telah dikonfirmasi meliputi Seminar Inspiratif, Talkshow Alumni, Workshop Interaktif, Booth Kampus Saudi, serta Bazar dan community experience."],
  ["Siapa yang dapat mengikuti event ini?", "Event ditujukan untuk pelajar SMA atau sederajat, mahasiswa yang mencari peluang S2 atau S3, guru dan pendidik, serta masyarakat umum yang tertarik studi di Arab Saudi."],
  ["Kapan agenda, pembicara, dan institusi peserta diumumkan?", "Informasi tersebut akan ditampilkan setelah dikonfirmasi dan diumumkan secara resmi oleh penyelenggara."],
  ["Kapan informasi tiket tersedia?", "Kategori, harga, benefit, periode penjualan, dan kuota tiket masih menunggu pengumuman resmi penyelenggara."],
];

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section-block faq-section" id="faq">
      <div className="shell faq-layout">
        <div className="faq-intro">
          <span className="section-label">Pertanyaan umum</span>
          <h2>Informasi yang sudah terkonfirmasi.</h2>
          <p>Bagian ini hanya memuat jawaban berdasarkan materi resmi yang tersedia.</p>
          <a className="btn btn-secondary" href="https://instagram.com/saudieduexpo.id" target="_blank" rel="noreferrer">Instagram Resmi</a>
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
