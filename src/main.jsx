import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const Arrow = ({ diagonal = false }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={diagonal ? "M7 17 17 7M8 7h9v9" : "M5 12h14m-5-5 5 5-5 5"} />
  </svg>
);

const Pattern = () => (
  <svg className="pattern" viewBox="0 0 180 180" aria-hidden="true">
    <path d="M90 2 113 28 146 24 142 57 170 77 147 101 154 134 121 136 102 165 76 143 44 154 36 122 5 109 23 81 6 53 38 42 47 10 78 21Z" />
    <circle cx="90" cy="90" r="45" />
    <path d="m90 45 18 27 32 8-22 24 2 33-30-14-30 14 2-33-22-24 32-8Z" />
  </svg>
);

const schedule = {
  "Hari 1": [
    ["08.00", "Registrasi & Expo Dibuka", "Main Hall"],
    ["09.30", "Grand Opening Ceremony", "Main Stage"],
    ["11.00", "Peluang Studi di Arab Saudi", "Education Stage"],
    ["13.30", "Mengenal Study in Saudi", "Scholarship Hub"],
    ["15.30", "Alumni Stories: Hidup & Belajar di Saudi", "Main Stage"],
  ],
  "Hari 2": [
    ["09.00", "Bedah Beasiswa Fully Funded", "Scholarship Hub"],
    ["10.30", "Meet the Saudi Universities", "Main Stage"],
    ["13.00", "Menyiapkan Dokumen & CV", "Education Stage"],
    ["15.00", "Konsultasi Jurusan & Kampus", "Consultation Area"],
    ["16.30", "Saudi Cultural Experience", "Main Stage"],
  ],
  "Hari 3": [
    ["09.00", "Campus & Career Pathways", "Education Stage"],
    ["11.00", "Parents Session: Aman Studi di Saudi", "Main Stage"],
    ["13.30", "Application Clinic", "Scholarship Hub"],
    ["15.00", "Networking with Alumni", "Community Area"],
    ["16.30", "Closing & Next Step", "Main Stage"],
  ],
};

const tickets = [
  {
    name: "Student Pass",
    note: "Untuk pelajar & mahasiswa",
    price: "85.000",
    old: "120.000",
    status: "Kuota tersisa 38%",
    perks: ["Akses expo 3 hari", "Semua seminar utama", "Digital event kit"],
  },
  {
    name: "Early Access",
    note: "Pilihan paling lengkap",
    price: "145.000",
    old: "195.000",
    status: "Early bird s.d. 30 Mei",
    featured: true,
    perks: ["Semua benefit Student Pass", "Priority seating", "1-on-1 consultation slot", "Exclusive networking"],
  },
  {
    name: "Family Pass",
    note: "2 dewasa + 2 anak",
    price: "320.000",
    old: "400.000",
    status: "Terbatas 150 paket",
    perks: ["Akses expo 3 hari", "Parents information session", "Family consultation lane"],
  },
];

const faqs = [
  ["Apakah tiket berlaku untuk tiga hari?", "Ya. Semua kategori tiket di atas memberikan akses selama 31 Juli–2 Agustus 2026 sesuai benefit masing-masing."],
  ["Apakah saya langsung mendaftar beasiswa di event?", "SEE26 membantu kamu memahami jalur, menyiapkan dokumen, dan bertemu perwakilan kampus. Pendaftaran resmi tetap dilakukan melalui portal Study in Saudi."],
  ["Apakah QR tiket harus dicetak?", "Tidak. Cukup tunjukkan QR aktif dari ponsel saat check-in. Pastikan kecerahan layar cukup dan koneksi tersedia."],
  ["Bagaimana jika email tiket tidak masuk?", "Periksa folder spam terlebih dahulu. Kamu juga dapat meminta pengiriman ulang dengan email pembelian dan nomor pesanan."],
  ["Apakah anak-anak membutuhkan tiket?", "Anak di bawah 6 tahun gratis tanpa alokasi kursi. Usia 6 tahun ke atas memerlukan tiket, dan anak di bawah 12 tahun wajib didampingi orang dewasa."],
];

function Logo({ light = false }) {
  return (
    <a className={`logo ${light ? "light" : ""}`} href="#top" aria-label="Saudi Education Expo">
      <span className="logo-mark">SEE<span>26</span></span>
      <span className="logo-copy"><b>Saudi Education</b><small>Expo 2026 · Jakarta</small></span>
    </a>
  );
}

function App() {
  const [menu, setMenu] = useState(false);
  const [day, setDay] = useState("Hari 1");
  const [openFaq, setOpenFaq] = useState(0);
  const [selected, setSelected] = useState(null);
  const [time, setTime] = useState({});

  useEffect(() => {
    const target = new Date("2026-07-31T09:00:00+07:00");
    const tick = () => {
      const diff = Math.max(0, target - new Date());
      setTime({
        hari: Math.floor(diff / 86400000),
        jam: Math.floor((diff / 3600000) % 24),
        menit: Math.floor((diff / 60000) % 60),
        detik: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const nav = useMemo(() => ["Tentang", "Program", "Rundown", "Tiket", "Venue", "FAQ"], []);

  const toId = (item) => `#${item.toLowerCase()}`;

  return (
    <main id="top">
      <header className="nav-shell">
        <nav className="nav wrap">
          <Logo light />
          <div className={`nav-links ${menu ? "open" : ""}`}>
            {nav.map((item) => <a key={item} href={toId(item)} onClick={() => setMenu(false)}>{item}</a>)}
            <button className="button nav-cta" onClick={() => setSelected(tickets[1])}>Beli Tiket <Arrow /></button>
          </div>
          <button className="menu-button" aria-label="Buka menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <span /><span />
          </button>
        </nav>
      </header>

      <section className="hero">
        <img src="/see26-hero.png" className="hero-image" alt="Pelajar Indonesia menatap kampus modern di Arab Saudi" />
        <div className="hero-overlay" />
        <div className="hero-lines" />
        <div className="hero-content wrap">
          <div className="eyebrow hero-eyebrow"><span /> Saudi Education Expo 2026</div>
          <h1>Temukan jalanmu<br />menuju <em>Saudi.</em></h1>
          <p className="hero-lead">Bertemu kampus, alumni, dan para ahli yang akan membantumu mengubah mimpi studi di Arab Saudi menjadi rencana nyata.</p>
          <div className="hero-actions">
            <button className="button primary" onClick={() => setSelected(tickets[1])}>Amankan Tiket <Arrow /></button>
            <a className="text-link light-link" href="#rundown">Jelajahi acaranya <Arrow diagonal /></a>
          </div>
        </div>
        <div className="hero-bottom wrap">
          <div className="event-facts">
            <div><small>Tanggal</small><b>31 Jul — 02 Agu 2026</b></div>
            <div><small>Lokasi</small><b>SMESCO, Jakarta</b></div>
          </div>
          <div className="countdown" aria-label="Hitung mundur acara">
            {Object.entries(time).map(([label, value]) => (
              <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="signal-bar">
        <div className="wrap signal-grid reveal">
          {[["30+", "Institusi"], ["20+", "Pembicara"], ["03", "Hari penuh"], ["5.000+", "Calon pelajar"]].map(([n, l]) => (
            <div className="stat" key={l}><strong>{n}</strong><span>{l}</span></div>
          ))}
        </div>
      </section>

      <section className="about section" id="tentang">
        <Pattern />
        <div className="wrap about-grid">
          <div className="section-intro reveal">
            <div className="eyebrow"><span /> Tentang SEE26</div>
            <h2>Bukan sekadar expo.<br />Ini <em>titik berangkat.</em></h2>
          </div>
          <div className="about-copy reveal">
            <p className="large-copy">Saudi Education Expo mempertemukan pelajar Indonesia dengan akses, pengetahuan, dan orang-orang yang tepat untuk menempuh pendidikan di Arab Saudi.</p>
            <p>Dari program beasiswa penuh hingga kehidupan kampus, kamu akan mendapat jawaban langsung—bukan sekadar informasi dari layar.</p>
            <a className="text-link" href="#program">Lihat yang akan kamu temukan <Arrow diagonal /></a>
          </div>
          <div className="editorial-note reveal">
            <span>Indonesia</span><i />
            <b>Gateway to<br />Saudi Education</b>
            <i /><span>Saudi Arabia</span>
          </div>
        </div>
      </section>

      <section className="program section dark-section" id="program">
        <div className="wrap">
          <div className="section-heading reveal">
            <div><div className="eyebrow gold"><span /> Program utama</div><h2>Tiga hari untuk melihat<br /><em>masa depanmu</em> lebih dekat.</h2></div>
            <p>Dirancang untuk membawamu dari rasa ingin tahu menuju langkah aplikasi yang konkret.</p>
          </div>
          <div className="program-list">
            {[
              ["01", "University Expo", "Temui langsung perwakilan kampus unggulan dan gali jurusan yang paling sesuai."],
              ["02", "Scholarship Sessions", "Bedah beasiswa Saudi Government Scholarship, benefit, dan strategi lolos."],
              ["03", "Application Clinic", "Bawa dokumenmu. Dapatkan arahan tentang CV, rekomendasi, dan portal Study in Saudi."],
              ["04", "Alumni & Culture", "Dengar realita hidup, belajar, beradaptasi, dan bertumbuh dari alumni Indonesia."],
            ].map(([n, title, desc]) => (
              <article className="program-row reveal" key={n}>
                <span className="program-number">{n}</span><h3>{title}</h3><p>{desc}</p>
                <span className="round-arrow"><Arrow diagonal /></span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="scholarship section">
        <div className="wrap scholarship-grid">
          <div className="scholarship-visual reveal">
            <div className="arch-card">
              <div className="arabic">العلم<br />يفتح<br />الأبواب</div>
              <span>Knowledge opens doors.</span>
            </div>
            <div className="seal">100%<br /><small>Fully funded*</small></div>
          </div>
          <div className="scholarship-copy reveal">
            <div className="eyebrow"><span /> Scholarship spotlight</div>
            <h2>Lebih dari biaya kuliah yang <em>ditanggung penuh.</em></h2>
            <p>Kenali dukungan yang tersedia bagi penerima Saudi Government Scholarship dan siapkan aplikasi yang lebih kuat.</p>
            <div className="benefits">
              {["Tuition waiver", "Monthly allowance", "University housing", "Healthcare access", "Annual airfare", "Arabic preparation"].map((item, i) => (
                <div key={item}><span>{String(i + 1).padStart(2, "0")}</span>{item}</div>
              ))}
            </div>
            <small className="disclaimer">*Benefit mengikuti kebijakan universitas dan program yang berlaku.</small>
          </div>
        </div>
      </section>

      <section className="schedule section" id="rundown">
        <div className="wrap">
          <div className="section-heading light-heading reveal">
            <div><div className="eyebrow"><span /> Rundown acara</div><h2>Susun harimu.<br /><em>Jangan lewatkan momen.</em></h2></div>
            <p>Agenda terpilih. Jadwal lengkap dan nama pembicara akan diperbarui menjelang acara.</p>
          </div>
          <div className="day-tabs reveal" role="tablist">
            {Object.keys(schedule).map((item, i) => (
              <button key={item} className={day === item ? "active" : ""} onClick={() => setDay(item)}>
                <span>0{i + 1}</span>{item}<small>{["Jum, 31 Jul", "Sab, 01 Agu", "Min, 02 Agu"][i]}</small>
              </button>
            ))}
          </div>
          <div className="timeline reveal">
            {schedule[day].map(([hour, title, stage]) => (
              <div className="timeline-row" key={title}>
                <time>{hour}<small>WIB</small></time><h3>{title}</h3><span>{stage}</span><button aria-label={`Detail ${title}`}><Arrow diagonal /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tickets section" id="tiket">
        <div className="wrap">
          <div className="ticket-heading reveal">
            <div className="eyebrow"><span /> Tiket SEE26</div>
            <h2>Pilih aksesmu.<br /><em>Mulai perjalananmu.</em></h2>
            <p>Satu tiket berlaku untuk tiga hari. QR unik akan langsung dikirim setelah pembayaran terverifikasi.</p>
          </div>
          <div className="ticket-grid">
            {tickets.map((ticket) => (
              <article className={`ticket-card reveal ${ticket.featured ? "featured" : ""}`} key={ticket.name}>
                {ticket.featured && <div className="recommend">Paling diminati</div>}
                <div className="ticket-top"><div><span className="ticket-name">{ticket.name}</span><small>{ticket.note}</small></div><span className="ticket-dot" /></div>
                <div className="price"><small>Rp</small><strong>{ticket.price}</strong><del>Rp{ticket.old}</del></div>
                <div className="quota"><span /><b>{ticket.status}</b></div>
                <ul>{ticket.perks.map((perk) => <li key={perk}>✓ <span>{perk}</span></li>)}</ul>
                <button className={`button ${ticket.featured ? "primary" : "outline"}`} onClick={() => setSelected(ticket)}>Pilih tiket <Arrow /></button>
              </article>
            ))}
          </div>
          <p className="payment-note reveal">Pembayaran aman melalui QRIS, virtual account, e-wallet, dan kartu. Biaya layanan ditampilkan transparan saat checkout.</p>
        </div>
      </section>

      <section className="venue section" id="venue">
        <div className="venue-art"><Pattern /><span className="venue-word">JAKARTA</span></div>
        <div className="wrap venue-grid">
          <div className="venue-copy reveal">
            <div className="eyebrow gold"><span /> Lokasi acara</div>
            <h2>Di jantung<br /><em>Jakarta Selatan.</em></h2>
            <p>Ruang expo yang luas, akses yang mudah, dan fasilitas lengkap untuk tiga hari penuh eksplorasi.</p>
            <a className="button primary" href="https://maps.google.com/?q=SMESCO+Indonesia" target="_blank" rel="noreferrer">Buka Google Maps <Arrow diagonal /></a>
          </div>
          <div className="venue-card reveal">
            <span className="venue-label">Venue</span>
            <h3>SMESCO Exhibition &<br />Convention Hall</h3>
            <p>Jl. Gatot Subroto Kav. 94<br />Pancoran, Jakarta Selatan</p>
            <div className="venue-meta"><div><small>Tanggal</small><b>31 Jul – 02 Agu</b></div><div><small>Waktu</small><b>09.00 – 18.00</b></div></div>
          </div>
        </div>
      </section>

      <section className="partners section">
        <div className="wrap">
          <div className="partner-heading reveal"><span>Didukung oleh jaringan pendidikan</span><p>Bersama institusi, komunitas, dan partner yang membuka lebih banyak jalan.</p></div>
          <div className="logo-row reveal">
            {["PPMI Saudi", "Study in Saudi", "SMESCO", "Alumni Network", "Saudi Universities"].map((item) => <div key={item}>{item}</div>)}
          </div>
        </div>
      </section>

      <section className="faq section" id="faq">
        <div className="wrap faq-grid">
          <div className="faq-title reveal"><div className="eyebrow"><span /> Informasi penting</div><h2>Masih ada<br /><em>pertanyaan?</em></h2><p>Tim kami siap membantu lewat kanal resmi SEE26.</p></div>
          <div className="accordion reveal">
            {faqs.map(([q, a], i) => (
              <article className={openFaq === i ? "open" : ""} key={q}>
                <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}><span>{q}</span><b>{openFaq === i ? "−" : "+"}</b></button>
                <div className="answer"><p>{a}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="closing">
        <Pattern />
        <div className="wrap closing-content reveal">
          <span className="closing-kicker">31.07 — 02.08.2026 · Jakarta</span>
          <h2>Masa depanmu di Saudi<br />dimulai <em>di sini.</em></h2>
          <p>Amankan kursimu dan pulang dengan arah yang lebih jelas.</p>
          <button className="button primary large" onClick={() => setSelected(tickets[1])}>Beli Tiket Sekarang <Arrow /></button>
        </div>
      </section>

      <footer>
        <div className="wrap footer-top">
          <Logo light />
          <div className="footer-nav">{nav.slice(0, 4).map((item) => <a key={item} href={toId(item)}>{item}</a>)}</div>
          <div className="socials"><a href="#instagram">Instagram ↗</a><a href="#youtube">YouTube ↗</a></div>
        </div>
        <div className="wrap footer-bottom"><span>© 2026 Saudi Education Expo</span><div><a href="#privacy">Privasi</a><a href="#terms">Syarat & Ketentuan</a><a href="#refund">Refund</a></div></div>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <section className="ticket-modal" role="dialog" aria-modal="true" aria-label="Pilih jumlah tiket" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Tutup">×</button>
            <div className="eyebrow"><span /> Mulai checkout</div>
            <h2>{selected.name}</h2>
            <p>{selected.note}. Tiket digital dan QR unik dikirim ke email setelah pembayaran berhasil.</p>
            <div className="modal-order"><span>1 × {selected.name}</span><strong>Rp{selected.price}</strong></div>
            <label>Email aktif<input type="email" placeholder="nama@email.com" autoFocus /></label>
            <button className="button primary wide" onClick={() => alert("Demo checkout siap dihubungkan ke payment gateway.")}>Lanjut isi data <Arrow /></button>
            <small>Dengan melanjutkan, kamu menyetujui syarat pembelian SEE26.</small>
          </section>
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
