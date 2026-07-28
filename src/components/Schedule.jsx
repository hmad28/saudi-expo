import React, { useState } from "react";

const scheduleData = {
  "Hari 1": [
    ["08.00 - 09.30", "Registrasi Peserta & Check-in QR", "Main Gate & Hall A", "Proses check-in cepat menggunakan QR scanner dan pengambilan event kit."],
    ["09.30 - 11.00", "Grand Opening Ceremony & Keynote Address", "Main Stage", "Dr. Ahmad Al-Ghamdi & Perwakilan Diplomatik Indonesia-Saudi."],
    ["11.00 - 12.30", "Peluang Studi & Beasiswa Pemerintah KSA 2026", "Education Stage", "Gambaran umum sistem Study in Saudi dan kuota rekrutmen."],
    ["13.30 - 15.00", "Banyak Jalur Menuju Kampus Madinah & Makkah", "Scholarship Hub", "Ustadz Akhmad Jakfar — Bedah persyaratan UIM & Umm Al-Qura."],
    ["15.30 - 17.00", "Alumni Stories: Kehidupan Santri & Mahasiswa di KSA", "Main Stage", "Pengalaman adaptasi budaya, tempat tinggal, dan biaya hidup."],
  ],
  "Hari 2": [
    ["09.00 - 10.30", "Bedah Beasiswa Fully Funded & Strategi Berkas", "Scholarship Hub", "Persiapan CV akademik, surat rekomendasi, dan penerjemahan dokumen."],
    ["10.30 - 12.00", "Meet the Saudi Universities: Riset & Sains Riyadh", "Main Stage", "Dr. Sara Al-Hassan — Penjelasan program unggulan King Saud & IMSIU."],
    ["13.00 - 14.30", "Application Clinic: Hands-on Portal Study in Saudi", "Education Stage", "Simulasi pendaftaran langsung didampingi relawan PPMI."],
    ["14.30 - 16.00", "Konsultasi Jurusan Non-Keagamaan (Teknik & Kedokteran)", "Consultation Area", "Penjelasan program sains terapan untuk mahasiswa Indonesia."],
    ["16.00 - 17.30", "Saudi Cultural & Arabic Language Workshop", "Main Stage", "Pengenalan dasar bahasa Arab kampus dan pameran budaya."],
  ],
  "Hari 3": [
    ["09.00 - 10.30", "Campus & Career Pathways Vision 2030", "Education Stage", "Peluang karir dan jaringan alumni setelah menyelesaikan studi."],
    ["10.30 - 12.00", "Parents Information Session: Keamanan & Kesejahteraan", "Main Stage", "Sesi khusus orang tua mengenai keamanan, asrama, dan fasilitas kesehatan."],
    ["13.30 - 15.00", "Final Application Checklist & Review Dokumen", "Scholarship Hub", "Pemeriksaan akhir dokumen sebelum pembukaan pendaftaran resmi."],
    ["15.00 - 16.30", "Exclusive Networking & Alumni Gathering", "Community Lounge", "Sesi berjejaring antara calon mahasiswa, alumni, dan pembicara."],
    ["16.30 - 17.30", "Grand Closing Ceremony & Door Prize", "Main Stage", "Penutupan acara resmi Saudi Education Expo 2026."],
  ],
};

export function Schedule() {
  const [activeDay, setActiveDay] = useState("Hari 1");

  return (
    <section className="schedule section" id="rundown">
      <div className="wrap">
        <div className="section-heading light-heading reveal visible">
          <div>
            <div className="eyebrow">
              <span /> AGENDA & RUNDOWN
            </div>
            <h2>
              Susun agendamu.<br />
              <em>Jangan lewatkan momen penting.</em>
            </h2>
          </div>
          <p>
            Rundown lengkap 3 hari pameran. Pilih hari untuk melihat detail sesi dan lokasi panggung.
          </p>
        </div>

        <div className="day-tabs reveal visible" role="tablist">
          {Object.keys(scheduleData).map((dayKey, idx) => (
            <button
              key={dayKey}
              className={activeDay === dayKey ? "active" : ""}
              onClick={() => setActiveDay(dayKey)}
            >
              <span>0{idx + 1}</span>
              <div>
                <strong>{dayKey}</strong>
                <small>{["Jum, 31 Jul 2026", "Sab, 01 Agu 2026", "Min, 02 Agu 2026"][idx]}</small>
              </div>
            </button>
          ))}
        </div>

        <div className="timeline reveal visible">
          {scheduleData[activeDay].map(([time, title, stage, desc]) => (
            <div className="timeline-row" key={title}>
              <time>
                {time.split(" - ")[0]}
                <small>WIB</small>
              </time>
              <div>
                <h3>{title}</h3>
                <p className="timeline-desc">{desc}</p>
              </div>
              <span className="stage-badge">{stage}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
