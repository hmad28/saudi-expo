import React from "react";

const speakers = [
  {
    name: "Dr. Ahmad Al-Ghamdi",
    role: "International Admissions",
    institution: "Ministry of Education KSA",
    topic: "Arah pendidikan Saudi & peluang mahasiswa internasional",
    photo: "/speaker-1.jpg",
  },
  {
    name: "Ustadz Akhmad Jakfar",
    role: "Narasumber & Alumni UIM",
    institution: "PPMI Arab Saudi",
    topic: "Strategi menyiapkan aplikasi Study in Saudi",
    photo: "/speaker-2.jpg",
  },
  {
    name: "Dr. Sara Al-Hassan",
    role: "Academic Coordinator",
    institution: "King Saud University",
    topic: "Peluang riset, sains, dan teknik di Riyadh",
    photo: "/speaker-3.jpg",
  },
  {
    name: "Azka Afif Zuhair",
    role: "Student Community",
    institution: "Northern Border University",
    topic: "Kehidupan kampus dan komunitas Indonesia",
    photo: "/speaker-4.jpg",
  },
];

export function Speakers() {
  return (
    <section className="section-block speakers-section" id="pembicara">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-label">Pembicara & alumni</span>
            <h2>Dengar langsung dari yang berpengalaman.</h2>
            <p>Kenali proses studi di Saudi dari perspektif institusi, alumni, dan komunitas pelajar.</p>
          </div>
        </div>
        <div className="speaker-grid">
          {speakers.map((speaker) => (
            <article className="speaker-card" key={speaker.name}>
              <img src={speaker.photo} alt={speaker.name} width="640" height="800" loading="lazy" />
              <div>
                <span>{speaker.institution}</span>
                <h3>{speaker.name}</h3>
                <p>{speaker.role}</p>
                <small>{speaker.topic}</small>
              </div>
            </article>
          ))}
        </div>
        <p className="content-note">Daftar pembicara dapat berubah. Jadwal final akan diumumkan melalui kanal resmi SEE26.</p>
      </div>
    </section>
  );
}
