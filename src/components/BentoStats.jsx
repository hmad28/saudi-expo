import React from "react";

export function BentoStats() {
  const stats = [
    { number: "30+", label: "Institusi & Universitas Saudi", desc: "UIM, KSU, Umm Al-Qura, IMSIU, NBU" },
    { number: "20+", label: "Pembicara & Expert Beasiswa", desc: "Alumni, Diplomat & Praktisi Portal" },
    { number: "03", label: "Hari Penuh Pengalaman", desc: "Seminar, Expo & Application Clinic" },
    { number: "5.000+", label: "Target Cohort Peserta", desc: "Pelajar SMA/MA, Santri & Mahasiswa" },
  ];

  return (
    <section className="signal-bar">
      <div className="wrap signal-grid reveal visible">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <strong>{s.number}</strong>
            <div>
              <span>{s.label}</span>
              <small className="stat-desc">{s.desc}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
