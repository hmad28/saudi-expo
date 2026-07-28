import React, { useState } from "react";
import { Icon } from "./Icons";

const agenda = [
  {
    label: "Hari 1",
    date: "Jumat, 31 Juli",
    items: [
      ["08.00", "Registrasi & check-in peserta", "Main Gate"],
      ["09.30", "Opening ceremony & keynote", "Main Stage"],
      ["11.00", "Peluang studi dan beasiswa Saudi", "Education Stage"],
      ["13.30", "Mengenal portal Study in Saudi", "Scholarship Hub"],
      ["15.30", "Cerita alumni Indonesia di Saudi", "Main Stage"],
    ],
  },
  {
    label: "Hari 2",
    date: "Sabtu, 1 Agustus",
    items: [
      ["09.00", "Bedah beasiswa fully funded", "Scholarship Hub"],
      ["10.30", "Meet the Saudi universities", "Main Stage"],
      ["13.00", "Application clinic & document review", "Education Stage"],
      ["15.00", "Konsultasi jurusan dan kampus", "Consultation Area"],
      ["16.30", "Saudi cultural experience", "Main Stage"],
    ],
  },
  {
    label: "Hari 3",
    date: "Minggu, 2 Agustus",
    items: [
      ["09.00", "Campus & career pathways", "Education Stage"],
      ["10.30", "Sesi orang tua: studi aman di Saudi", "Main Stage"],
      ["13.30", "Final application checklist", "Scholarship Hub"],
      ["15.00", "Networking bersama alumni", "Community Area"],
      ["16.30", "Closing ceremony", "Main Stage"],
    ],
  },
];

export function Schedule() {
  const [activeDay, setActiveDay] = useState(0);
  const current = agenda[activeDay];

  return (
    <section className="section-block agenda-section" id="agenda">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-label">Agenda event</span>
            <h2>Rencanakan kunjunganmu.</h2>
            <p>Pilih hari dan simpan sesi yang paling relevan untuk tujuan studimu.</p>
          </div>
          <a className="text-link" href="#tiket">Lihat tiket <Icon name="arrow" size={18} /></a>
        </div>

        <div className="agenda-card">
          <div className="agenda-tabs" role="tablist" aria-label="Pilih hari agenda">
            {agenda.map((day, index) => (
              <button
                key={day.label}
                role="tab"
                aria-selected={activeDay === index}
                className={activeDay === index ? "is-active" : ""}
                onClick={() => setActiveDay(index)}
              >
                <span>{day.label}</span>
                <small>{day.date}</small>
              </button>
            ))}
          </div>
          <div className="agenda-list" role="tabpanel">
            {current.items.map(([time, title, place]) => (
              <article className="agenda-row" key={title}>
                <time>{time}<small>WIB</small></time>
                <div><h3>{title}</h3><span><Icon name="pin" size={15} />{place}</span></div>
                <button className="icon-button agenda-add" aria-label={`Tambahkan ${title} ke agenda`}>
                  <Icon name="plus" size={18} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
