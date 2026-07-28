import React from "react";

const partners = [
  ["PPMI Arab Saudi", "Strategic partner"],
  ["Study in Saudi", "Official portal"],
  ["Ministry of Education KSA", "Education network"],
  ["SMESCO Indonesia", "Venue partner"],
  ["Islamic University of Madinah", "Academic network"],
  ["King Saud University", "Academic network"],
  ["Umm Al-Qura University", "Academic network"],
  ["Alumni Saudi Indonesia", "Community network"],
];

export function Partners() {
  return (
    <section className="section-block partner-section">
      <div className="shell">
        <div className="section-head compact-head">
          <div>
            <span className="section-label">Jaringan event</span>
            <h2>Terhubung dengan ekosistem pendidikan Saudi.</h2>
          </div>
        </div>
        <div className="partner-grid">
          {partners.map(([name, type]) => (
            <div className="partner-logo" key={name}>
              <strong>{name}</strong>
              <small>{type}</small>
            </div>
          ))}
        </div>
        <p className="content-note">Daftar partner dan institusi akan diperbarui setelah konfirmasi resmi penyelenggara.</p>
      </div>
    </section>
  );
}
