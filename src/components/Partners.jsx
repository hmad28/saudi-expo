import React from "react";

export function Partners() {
  const partners = [
    { name: "PPMI Arab Saudi", tier: "Strategic Partner" },
    { name: "Study in Saudi", tier: "Official Portal" },
    { name: "Ministry of Education KSA", tier: "Governing Body" },
    { name: "SMESCO Indonesia", tier: "Venue Host" },
    { name: "Trisna Group Networks", tier: "Event Partner" },
    { name: "Islamic University of Madinah", tier: "Academic Partner" },
    { name: "King Saud University", tier: "Academic Partner" },
    { name: "Umm Al-Qura University", tier: "Academic Partner" },
  ];

  return (
    <section className="partners section">
      <div className="wrap">
        <div className="partner-heading reveal visible">
          <span>Didukung oleh Jaringan Pendidikan Bilateral</span>
          <p>
            Kerjasama strategis antara organisasi mahasiswa internasional, kementerian pendidikan, universitas negeri KSA, dan jaringan alumni Indonesia.
          </p>
        </div>

        <div className="logo-row reveal visible">
          {partners.map((p) => (
            <div key={p.name} className="partner-chip">
              <strong>{p.name}</strong>
              <small>{p.tier}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
