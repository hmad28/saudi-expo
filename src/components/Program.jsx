import React from "react";

export function Program() {
  const programs = [
    {
      num: "01",
      title: "University Expo & Consultation",
      desc: "Konsultasi tatap muka langsung dengan perwakilan universitas ternama Arab Saudi. Pahami persyaratan jurusan Syariah, Teknik, Kedokteran, hingga Sains.",
      tag: "MAIN EXHIBITION",
    },
    {
      num: "02",
      title: "Scholarship Breakdown Sessions",
      desc: "Bedah tuntas komponen Saudi Government Scholarship, trik lolos seleksi berkas, pembuatan CV akademis, serta pembuatan surat rekomendasi.",
      tag: "STAGE SEMINAR",
    },
    {
      num: "03",
      title: "Application Clinic & Portal Prep",
      desc: "Bawa berkas ijazah, transkrip, dan paspormu. Tim relawan PPMI membantu verifikasi format pendaftaran pada portal resmi Study in Saudi.",
      tag: "HANDS-ON WORKSHOP",
    },
    {
      num: "04",
      title: "Alumni Stories & Cultural Experience",
      desc: "Pelajari kehidupan nyata mahasiswa Indonesia di Madinah, Makkah, Riyadh, dan Dhahran. Pengalaman budaya, biaya hidup, hingga persiapan bahasa Arab.",
      tag: "NETWORKING & CULTURE",
    },
  ];

  return (
    <section className="program section dark-section" id="program">
      <div className="wrap">
        <div className="section-heading reveal visible">
          <div>
            <div className="eyebrow gold">
              <span /> HYBRID EVENT PROGRAM
            </div>
            <h2>
              Tiga hari untuk menentukan<br />
              <em>langkah studi masa depanmu.</em>
            </h2>
          </div>
          <p>
            Setiap sesi dirancang khusus untuk membawa calon pendaftar dari tahap informasi awal hingga kesiapan berkas pendaftaran portal resmi.
          </p>
        </div>

        <div className="program-list">
          {programs.map((p) => (
            <article className="program-row reveal visible" key={p.num}>
              <span className="program-number">{p.num}</span>
              <div>
                <small className="program-tag">{p.tag}</small>
                <h3>{p.title}</h3>
              </div>
              <p>{p.desc}</p>
              <span className="round-arrow">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
