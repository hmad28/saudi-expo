import React from "react";
import { Icon } from "./Icons";

const activities = [
  ["university", "Seminar Inspiratif", "Memahami peluang studi, proses persiapan, dan gambaran pendidikan di Arab Saudi dari narasumber yang relevan."],
  ["users", "Talkshow Alumni", "Mendengar pengalaman nyata tentang pendaftaran, perkuliahan, adaptasi, dan kehidupan pelajar Indonesia di Saudi."],
  ["scholarship", "Workshop Interaktif", "Mempelajari langkah praktis untuk menyiapkan pilihan studi dan kebutuhan pendaftaran dengan lebih terarah."],
  ["map", "Booth Kampus Saudi", "Mencari informasi program dan jalur studi dari institusi yang telah dikonfirmasi oleh penyelenggara."],
  ["ticket", "Bazar & Community Experience", "Mengenal komunitas, budaya, serta jaringan pendukung yang dekat dengan kehidupan pelajar di Arab Saudi."],
];

const audiences = [
  ["Pelajar SMA atau sederajat", "Mencari peluang studi jenjang sarjana di Arab Saudi."],
  ["Mahasiswa", "Mencari peluang pendidikan jenjang S2 atau S3."],
  ["Guru dan pendidik", "Memperluas referensi untuk mendampingi calon pelajar."],
  ["Masyarakat umum", "Tertarik memahami pilihan dan proses studi di Arab Saudi."],
];

const outcomes = [
  "Memahami jalur studi yang sesuai dengan tujuan pendidikan.",
  "Mengetahui sumber informasi kampus dan beasiswa yang relevan.",
  "Menyusun pertanyaan dan langkah persiapan pendaftaran.",
  "Mendapat gambaran kehidupan pelajar Indonesia di Arab Saudi.",
];

export function EventOverview({ onTicketClick }) {
  return (
    <>
      <section className="event-profile section-compact" id="tentang">
        <div className="shell">
          <div className="profile-card official-summary">
            <div className="profile-main">
              <span className="profile-badge">Agenda tahunan</span>
              <h2>Saudi Education Expo 2026</h2>
              <p>Agenda kolaboratif PPMI Saudi dan organisasi wilayahnya yang diselenggarakan melalui kepanitiaan independen untuk membantu masyarakat Indonesia mengakses informasi studi di Arab Saudi.</p>
            </div>
            <div className="profile-side">
              <div><Icon name="calendar" /><span><small>Tanggal</small><strong>31 Juli–2 Agustus 2026</strong></span></div>
              <div><Icon name="pin" /><span><small>Tempat</small><strong>SMESCO Indonesia, Jakarta</strong></span></div>
              <button className="btn btn-primary" onClick={onTicketClick}>Informasi Tiket</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block history-section" id="sejarah">
        <div className="shell history-grid">
          <div>
            <span className="section-label">Satu agenda, terus berkembang</span>
            <h2>Dari Saudi University Expo menuju Saudi Education Expo.</h2>
            <p>Saudi Expo bukan event baru yang berdiri sendiri. Ini adalah agenda tahunan yang berkembang dari inisiatif pengenalan universitas menjadi platform informasi pendidikan Saudi yang lebih luas.</p>
          </div>
          <div className="history-timeline">
            <article><span>2025</span><div><small>Identitas sebelumnya</small><h3>Saudi University Expo</h3><p>Berawal dari inisiatif untuk memperkenalkan universitas-universitas di Arab Saudi kepada masyarakat Indonesia.</p></div></article>
            <article className="is-current"><span>2026</span><div><small>Identitas saat ini</small><h3>Saudi Education Expo</h3><p>Ruang lingkup berkembang untuk menghadirkan informasi kampus, beasiswa, pendaftaran, dan kehidupan pelajar secara lebih menyeluruh.</p></div></article>
          </div>
        </div>
      </section>

      <section className="section-block about-official">
        <div className="shell editorial-pair">
          <article>
            <span className="section-label">Apa itu Saudi Education Expo?</span>
            <h2>Ruang informasi pendidikan Saudi untuk masyarakat Indonesia.</h2>
            <p>Saudi Education Expo adalah agenda kolaboratif PPMI Saudi dan organisasi wilayahnya, diselenggarakan melalui kepanitiaan independen. Event ini berkembang menjadi pameran yang menyediakan informasi valid dan komprehensif bagi masyarakat Indonesia yang berminat melanjutkan studi di Arab Saudi.</p>
          </article>
          <article>
            <span className="section-label">Mengapa event ini ada?</span>
            <h2>Membantu calon pelajar mengambil langkah yang lebih terarah.</h2>
            <p>Informasi studi sering tersebar dan sulit dipahami tanpa konteks. Saudi Education Expo mempertemukan publik dengan mahasiswa, alumni, pakar, dan institusi terkait agar proses mencari informasi menjadi lebih jelas dan relevan.</p>
          </article>
        </div>
      </section>

      <section className="section-block activity-section" id="aktivitas">
        <div className="shell">
          <div className="section-head">
            <div><span className="section-label">Aktivitas event</span><h2>Belajar, bertanya, dan membangun arah.</h2><p>Setiap format kegiatan dirancang untuk memberi nilai praktis, bukan sekadar menambah rangkaian acara.</p></div>
          </div>
          <div className="activity-grid">
            {activities.map(([icon, title, text], index) => (
              <article key={title}><span className="activity-number">{String(index + 1).padStart(2, "0")}</span><span className="quick-icon"><Icon name={icon} /></span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block audience-section">
        <div className="shell audience-layout">
          <div>
            <span className="section-label">Untuk siapa?</span>
            <h2>Untuk siapa pun yang ingin memahami peluang studi di Saudi.</h2>
            <p>Informasi disusun agar berguna bagi calon pelajar, pendamping pendidikan, dan masyarakat umum.</p>
          </div>
          <div className="audience-list">
            {audiences.map(([title, text], index) => <article key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className="section-block outcome-section">
        <div className="shell outcome-card">
          <div><span className="section-label">Hasil yang dibawa pulang</span><h2>Pulang dengan gambaran dan langkah berikutnya.</h2></div>
          <ul>{outcomes.map((item) => <li key={item}><Icon name="check" size={18} />{item}</li>)}</ul>
        </div>
      </section>
    </>
  );
}
