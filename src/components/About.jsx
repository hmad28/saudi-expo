import React from "react";

export function Pattern() {
  return (
    <svg className="pattern" viewBox="0 0 180 180" aria-hidden="true">
      <path d="M90 2 113 28 146 24 142 57 170 77 147 101 154 134 121 136 102 165 76 143 44 154 36 122 5 109 23 81 6 53 38 42 47 10 78 21Z" />
      <circle cx="90" cy="90" r="45" />
      <path d="m90 45 18 27 32 8-22 24 2 33-30-14-30 14 2-33-22-24 32-8Z" />
    </svg>
  );
}

export function About() {
  return (
    <section className="about section" id="tentang">
      <Pattern />
      <div className="wrap about-grid">
        <div className="section-intro reveal visible">
          <div className="eyebrow">
            <span /> TENTANG SAUDI EXPO 2026
          </div>
          <h2>
            Bukan sekadar expo.<br />
            Ini <em>titik awal masa depanmu.</em>
          </h2>
        </div>

        <div className="about-copy reveal visible">
          <p className="large-copy">
            Saudi Education Expo 2026 (SEE26) mempertemukan pelajar Indonesia, santri, dan mahasiswa dengan akses langsung ke program beasiswa pemerintah Arab Saudi.
          </p>
          <p>
            Berawal dari Saudi University Expo 2025 di Jakarta Selatan, pameran tahun 2026 hadir lebih besar dan komprehensif. Dikelola bersama Perhimpunan Pelajar dan Mahasiswa Indonesia (PPMI) Arab Saudi, expo ini menjadi jembatan resmi menuju sistem pendaftaran terpusat <strong>Study in Saudi</strong>.
          </p>
          <a className="text-link" href="#beasiswa">
            Pelajari Komponen Beasiswa Penuh
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        <div className="editorial-note reveal visible">
          <span>INDONESIA</span>
          <i />
          <b>
            Bilateral Human Capital Corridor<br />
            Saudi Vision 2030 & Expo 2030 Riyadh
          </b>
          <i />
          <span>SAUDI ARABIA</span>
        </div>
      </div>
    </section>
  );
}
