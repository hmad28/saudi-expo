import React from "react";

export function ScholarshipSpotlight() {
  const benefits = [
    { title: "100% Tuition Waiver", desc: "Bebas SPP dan biaya akademik hingga lulus (S1, S2, S3 & persiapan bahasa)." },
    { title: "Monthly Living Allowance", desc: "Uang saku bulanan terstandar pemerintah KSA untuk kebutuhan harian." },
    { title: "Annual Airfare Allowance", desc: "Tiket pesawat pulang-pergi internasional Indonesia — Arab Saudi setiap tahun." },
    { title: "Subsidized Campus Housing", desc: "Fasilitas asrama mahasiswa modern lengkap dengan konsumsi & utilitas." },
    { title: "Comprehensive Healthcare", desc: "Layanan medis dan asuransi kesehatan penuh di rumah sakit universitas." },
    { title: "Intensive Arabic Prep", desc: "Kelas persiapan bahasa Arab komprehensif bagi non-native speaker." },
  ];

  const universities = [
    { name: "Islamic University of Madinah (UIM)", city: "Madinah Al-Munawwarah", spec: "Pusat Studi Islam & Hukum Syariah Global" },
    { name: "Imam Mohammad Ibn Saud (IMSIU)", city: "Riyadh", spec: "Syariah, Humaniora & Ilmu Sosial Utama" },
    { name: "Umm Al-Qura University (UQU)", city: "Makkah Al-Mukarramah", spec: "Sains, Teknik & Keislaman Terkemuka" },
    { name: "King Saud University (KSU)", city: "Riyadh", spec: "Kampus Riset Kedokteran & Sains Unggulan KSA" },
    { name: "Qassim University", city: "Al-Qassim", spec: "Pertanian, Sains Terapan & Studi Islam" },
    { name: "Northern Border University (NBU)", city: "Ar'ar", spec: "Kampus Modern dengan Ekspansi Beasiswa Internasional" },
  ];

  return (
    <section className="scholarship section" id="beasiswa">
      <div className="wrap scholarship-grid">
        <div className="scholarship-visual reveal visible">
          <div className="arch-card">
            <div className="arabic">العلم<br />يفتح<br />الأبواب</div>
            <span>Knowledge opens world-class opportunities.</span>
          </div>
          <div className="seal">
            100%<br />
            <small>Fully Funded</small>
          </div>
        </div>

        <div className="scholarship-copy reveal visible">
          <div className="eyebrow">
            <span /> SCHOLARSHIP ARCHITECTURE
          </div>
          <h2>
            Saudi Government Scholarship:<br />
            <em>Fasilitas Penuh Tanpa Beban Biaya.</em>
          </h2>
          <p>
            Program beasiswa pemerintah Kerajaan Arab Saudi yang dikelola Kementerian Pendidikan KSA memberikan dukungan penuh bagi mahasiswa internasional.
          </p>

          <div className="benefits">
            {benefits.map((b, i) => (
              <div key={b.title}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{b.title}</strong>
                  <small>{b.desc}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="university-strip">
            <small className="uni-header">UNIVERSITAS MITRA REKRUTMEN UTAMA:</small>
            <div className="uni-tags">
              {universities.map((u) => (
                <span className="uni-tag" key={u.name} title={`${u.city} — ${u.spec}`}>
                  🏛️ {u.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
