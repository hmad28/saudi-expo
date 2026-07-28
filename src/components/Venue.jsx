import React from "react";

export function Venue() {
  return (
    <section className="venue section" id="venue">
      <div className="venue-art">
        <div className="pattern" />
        <span className="venue-word">JAKARTA</span>
      </div>

      <div className="wrap venue-grid">
        <div className="venue-copy reveal visible">
          <div className="eyebrow gold">
            <span /> LOKASI STRATEGIS VENUE
          </div>
          <h2>
            Di pusat kota<br />
            <em>Jakarta Selatan.</em>
          </h2>
          <p>
            SMESCO Exhibition & Convention Hall menawarkan ruang pameran seluas ribuan meter persegi, akses transportasi publik mudah (LRT, TransJakarta, Tol Gatot Subroto), serta fasilitas gedung modern.
          </p>
          <a
            className="button primary"
            href="https://maps.google.com/?q=SMESCO+Indonesia+Jakarta"
            target="_blank"
            rel="noreferrer"
          >
            Buka Navigasi Google Maps
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        <div className="venue-card reveal visible">
          <img src="/smesco-venue.jpg" alt="SMESCO Convention Hall" className="venue-image" />
          <span className="venue-label">EXHIBITION HALL</span>
          <h3>SMESCO Exhibition & Convention Hall</h3>
          <p>Jl. Jend. Gatot Subroto Kav. 94, Pancoran, Jakarta Selatan, DKI Jakarta 12780</p>

          <div className="venue-meta">
            <div>
              <small>TANGGAL EVENT</small>
              <b>31 Jul – 02 Agu 2026</b>
            </div>
            <div>
              <small>JAM OPERASIONAL</small>
              <b>09.00 – 18.00 WIB</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
