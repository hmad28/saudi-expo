import React, { useState } from "react";
import { Icon } from "./Icons";

export function EventOverview({ onBuyClick, onLookupClick }) {
  const [videoOpen, setVideoOpen] = useState(false);

  const actions = [
    { icon: "university", title: "Kampus & beasiswa", text: "Lihat peluang studi dan fasilitas beasiswa.", href: "#tentang" },
    { icon: "calendar", title: "Agenda 3 hari", text: "Atur sesi dan konsultasi yang ingin kamu ikuti.", href: "#agenda" },
    { icon: "ticket", title: "Pilih tiket", text: "Bandingkan akses, benefit, dan sisa kuota.", href: "#tiket" },
    { icon: "search", title: "Cek tiketmu", text: "Buka kembali tiket menggunakan detail pesanan.", action: onLookupClick },
  ];

  return (
    <>
      <section className="event-profile section-compact" id="tentang">
        <div className="shell">
          <div className="profile-card">
            <div className="profile-main">
              <span className="profile-badge">Festival pendidikan Arab Saudi</span>
              <h2>Semua informasi studi Saudi, dalam satu tempat.</h2>
              <p>
                Saudi Education Expo membantu pelajar, santri, mahasiswa, dan orang tua memahami pilihan kampus, beasiswa pemerintah, persiapan dokumen, dan kehidupan mahasiswa di Arab Saudi.
              </p>
            </div>
            <div className="profile-side">
              <div><Icon name="calendar" /><span><small>Tanggal</small><strong>31 Jul–2 Agu 2026</strong></span></div>
              <div><Icon name="pin" /><span><small>Lokasi</small><strong>SMESCO, Jakarta</strong></span></div>
              <button className="btn btn-primary" onClick={onBuyClick}>Beli Tiket</button>
            </div>
          </div>
        </div>
      </section>

      <section className="media-section section-compact">
        <div className="shell">
          <button className="aftermovie-card" onClick={() => setVideoOpen(true)}>
            <img src="/see26-cinematic-campus.png" alt="" loading="lazy" width="1820" height="1024" />
            <span className="aftermovie-overlay" />
            <span className="aftermovie-content">
              <span className="preview-play"><Icon name="play" size={22} /></span>
              <span><small>Aftermovie & event preview</small><strong>Lihat suasana Saudi Education Expo</strong></span>
            </span>
          </button>
        </div>
      </section>

      <section className="quick-actions section-compact" aria-label="Akses cepat">
        <div className="shell quick-grid">
          {actions.map((item) => item.action ? (
            <button className="quick-card" onClick={item.action} key={item.title}>
              <span className="quick-icon"><Icon name={item.icon} /></span>
              <span><strong>{item.title}</strong><small>{item.text}</small></span>
              <Icon name="chevron" className="quick-arrow" />
            </button>
          ) : (
            <a className="quick-card" href={item.href} key={item.title}>
              <span className="quick-icon"><Icon name={item.icon} /></span>
              <span><strong>{item.title}</strong><small>{item.text}</small></span>
              <Icon name="chevron" className="quick-arrow" />
            </a>
          ))}
        </div>
      </section>

      <section className="intro-section section-block">
        <div className="shell intro-grid">
          <div>
            <span className="section-label">Yang akan kamu dapatkan</span>
            <h2>Datang dengan pertanyaan. Pulang dengan rencana.</h2>
            <p>
              Bukan hanya mengumpulkan brosur. Kamu bisa membandingkan kampus, bertanya langsung, meninjau kesiapan dokumen, dan terhubung dengan komunitas yang sudah lebih dulu menjalani prosesnya.
            </p>
          </div>
          <div className="benefit-list">
            {[
              ["university", "Konsultasi kampus", "Diskusikan jurusan dan persyaratan dengan narasumber."],
              ["scholarship", "Bedah beasiswa", "Pahami fasilitas, dokumen, dan alur Study in Saudi."],
              ["users", "Cerita alumni", "Dapatkan gambaran nyata tentang studi dan kehidupan di Saudi."],
            ].map(([icon, title, text]) => (
              <article key={title}>
                <span><Icon name={icon} /></span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
        <div className="shell stat-strip">
          <div><strong>20+</strong><span>Institusi pendidikan</span></div>
          <div><strong>30+</strong><span>Pembicara & alumni</span></div>
          <div><strong>5.000</strong><span>Target peserta</span></div>
          <div><strong>3 hari</strong><span>Expo & konsultasi</span></div>
        </div>
      </section>

      {videoOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setVideoOpen(false)}>
          <div className="video-modal" role="dialog" aria-modal="true" aria-label="Video event sebelumnya" onMouseDown={(event) => event.stopPropagation()}>
            <button className="icon-button modal-close" onClick={() => setVideoOpen(false)} aria-label="Tutup video"><Icon name="close" /></button>
            <div className="video-frame">
              <iframe src="https://www.youtube.com/embed/cnDHi7xlipU?autoplay=1" title="Saudi Education Expo event video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
