import React, { useEffect, useState } from "react";

export function Hero({ onBuyClick }) {
  const [time, setTime] = useState({});

  useEffect(() => {
    const target = new Date("2026-07-31T09:00:00+07:00");
    const tick = () => {
      const diff = Math.max(0, target - new Date());
      setTime({
        hari: Math.floor(diff / 86400000),
        jam: Math.floor((diff / 3600000) % 24),
        menit: Math.floor((diff / 60000) % 60),
        detik: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero">
      <img
        src="/see26-hero.png"
        className="hero-image"
        alt="Pelajar Indonesia menatap kampus modern di Arab Saudi"
      />
      <div className="hero-overlay" />
      <div className="hero-lines" />
      
      <div className="hero-content wrap">
        <div className="eyebrow hero-eyebrow">
          <span /> SAUDI EDUCATION EXPO 2026
        </div>

        <h1>
          Temukan jalanmu<br />
          menuju <em>Saudi Arabia.</em>
        </h1>

        <p className="hero-lead">
          Pintu gerbang utama menuju beasiswa pemerintah Arab Saudi (Study in Saudi), universitas negeri kelas dunia, dan jaringan alumni Indonesia.
        </p>

        <div className="hero-actions">
          <button className="button primary large" onClick={onBuyClick}>
            Beli Tiket Sekarang
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <a className="text-link light-link" href="#rundown">
            Lihat Detail Acara
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      <div className="hero-bottom wrap">
        <div className="event-facts">
          <div>
            <small>WAKTU & TANGGAL</small>
            <b>31 Jul — 02 Agu 2026</b>
          </div>
          <div>
            <small>LOKASI VENUE</small>
            <b>SMESCO Hall, Jakarta</b>
          </div>
        </div>

        <div className="countdown" aria-label="Hitung mundur menuju event">
          {Object.entries(time).map(([label, value]) => (
            <div key={label}>
              <strong>{String(value || 0).padStart(2, "0")}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
