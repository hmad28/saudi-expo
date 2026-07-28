import React from "react";

export function Speakers() {
  const speakers = [
    {
      name: "Dr. Ahmad Al-Ghamdi",
      role: "Director of International Admissions",
      inst: "Ministry of Education KSA",
      topic: "Kebijakan Recrutment Beasiswa Internasional 2026 & Saudi Vision 2030",
      photo: "/speaker-1.jpg",
      time: "Hari 1 · 09.30 WIB",
    },
    {
      name: "Ustadz Akhmad Jakfar",
      role: "Narasumber Utama & Alumni UIM",
      inst: "PPMI Arab Saudi",
      topic: "Bedah Strategi Lolos Portal Study in Saudi & Pilihan Jurusan",
      photo: "/speaker-2.jpg",
      time: "Hari 1 · 13.30 WIB",
    },
    {
      name: "Dr. Sara Al-Hassan",
      role: "Senior Academic Coordinator",
      inst: "King Saud University",
      topic: "Peluang Riset Sains, Kedokteran & Rekayasa Teknik di Kampus Riyadh",
      photo: "/speaker-3.jpg",
      time: "Hari 2 · 10.30 WIB",
    },
    {
      name: "Azka Afif Zuhair",
      role: "Kadiv Marketing SEE26 & Alumni NBU",
      inst: "Northern Border University",
      topic: "Navigasi Kehidupan Kampus, Persiapan Bahasa Arab & Komunitas Santri",
      photo: "/speaker-4.jpg",
      time: "Hari 2 · 13.00 WIB",
    },
  ];

  return (
    <section className="speakers section dark-section" id="pembicara">
      <div className="wrap">
        <div className="section-heading reveal visible">
          <div>
            <div className="eyebrow gold">
              <span /> KEYNOTE SPEAKERS & ALUMNI
            </div>
            <h2>
              Belajar langsung dari<br />
              <em>pakar dan alumni terbaik.</em>
            </h2>
          </div>
          <p>
            Dapatkan insight otentik mengenai seleksi beasiswa, kehidupan kampus di Arab Saudi, dan peluang karir setelah lulus.
          </p>
        </div>

        <div className="speaker-grid">
          {speakers.map((sp) => (
            <article className="speaker-card reveal visible" key={sp.name}>
              <div className="speaker-arch-frame">
                <img src={sp.photo} alt={sp.name} className="speaker-photo" />
                <span className="speaker-time-badge">{sp.time}</span>
              </div>
              <div className="speaker-info">
                <h3>{sp.name}</h3>
                <span className="speaker-role">{sp.role}</span>
                <small className="speaker-inst">{sp.inst}</small>
                <div className="speaker-topic">
                  <strong>Topik Sesi:</strong>
                  <p>"{sp.topic}"</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
