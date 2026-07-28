import React from "react";
import { Icon } from "./Icons";

export function Documentation() {
  return (
    <section className="section-block documentation-section" id="dokumentasi">
      <div className="shell documentation-grid">
        <div className="documentation-visual">
          <picture>
            <source srcSet="/see26-cinematic-campus.avif" type="image/avif" />
            <img src="/see26-cinematic-campus.webp" alt="" loading="lazy" width="1821" height="864" />
          </picture>
          <span><Icon name="play" size={22} />Dokumentasi resmi segera diumumkan</span>
        </div>
        <div>
          <span className="section-label">Aftermovie & dokumentasi 2025</span>
          <h2>Melanjutkan perjalanan yang dimulai sebagai Saudi University Expo.</h2>
          <p>Dokumentasi 2025 menegaskan kontinuitas Saudi Expo sebagai agenda tahunan. Pada 2026, identitasnya berkembang menjadi Saudi Education Expo dengan cakupan informasi pendidikan yang lebih luas.</p>
          <div className="documentation-state"><small>Aftermovie 2025</small><strong>Segera diumumkan</strong><p>Tautan dokumentasi akan ditampilkan setelah dikonfirmasi oleh penyelenggara.</p></div>
        </div>
      </div>
    </section>
  );
}
