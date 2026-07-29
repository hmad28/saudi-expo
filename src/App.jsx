import React, { useEffect, useRef, useState } from "react";
import { AGE_POLICY, CHECKOUT_CONFIG, EVENT, FAQS, MISSING_ASSETS, SCHEDULE, SPEAKERS, TICKETS } from "./data/eventConfig";
import { approvePayment, confirmCheckIn, createOrder, expireStaleOrders, formatDateTime, formatRupiah, getDatabase, getOrderByToken, getTicketByToken, rejectPayment, submitPaymentProof, validateCheckInToken } from "./utils/storage";
import { Icon } from "./components/Icons";
import { PartnershipLanding, SponsorshipPage, BoothPage, InstitutionLanding, InstitutionFormPage, ApplicationStatusPage } from "./PartnershipPages";
import { getApplications, updateApplicationStatus } from "./utils/applicationStore";
import { openPrivateFile, storePrivateFile } from "./utils/fileStore";

const navigate = (path) => {
  const next = new URL(path, window.location.origin);
  window.history.pushState({}, "", `${next.pathname}${next.search}${next.hash}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
  const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  requestAnimationFrame(() => {
    const target = next.hash && document.querySelector(next.hash);
    if (target) target.scrollIntoView({ behavior, block: "start" });
    else window.scrollTo({ top: 0, behavior });
  });
};

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    const interceptInternalNavigation = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.origin);
      if (destination.origin !== window.location.origin) return;
      event.preventDefault();
      navigate(`${destination.pathname}${destination.search}${destination.hash}`);
    };
    addEventListener("popstate", handler);
    document.addEventListener("click", interceptInternalNavigation);
    return () => {
      removeEventListener("popstate", handler);
      document.removeEventListener("click", interceptInternalNavigation);
    };
  }, []);
  return path;
}

function Logo({ inverse = false }) {
  return (
    <a className={`logo-lockup ${inverse ? "inverse" : ""}`} href="/" aria-label="Kembali ke beranda">
      <img src={EVENT.logo} alt="" width="52" height="52" />
      <span><strong>Saudi Education Expo</strong><small>31 Jul–2 Agu 2026</small></span>
    </a>
  );
}

function Header({ checkout = false }) {
  const [open, setOpen] = useState(false);
  const currentPath = window.location.pathname;
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header className={`topbar ${checkout ? "checkout-topbar" : ""}`}>
      <nav className="container nav" aria-label="Navigasi utama">
        <Logo />
        {!checkout && (
          <>
            <button className="menu-toggle" aria-expanded={open} aria-controls="primary-menu" onClick={() => setOpen(!open)} aria-label={open ? "Tutup menu" : "Buka menu"}>
              <span /><span />
            </button>
            <div className={`nav-links ${open ? "open" : ""}`} id="primary-menu">
              <a href="/tentang" aria-current={currentPath === "/tentang" ? "page" : undefined} onClick={() => setOpen(false)}>Tentang</a>
              <a href="/pembicara" aria-current={currentPath === "/pembicara" ? "page" : undefined} onClick={() => setOpen(false)}>Pembicara</a>
              <a href="/jadwal" aria-current={currentPath === "/jadwal" ? "page" : undefined} onClick={() => setOpen(false)}>Jadwal</a>
              <a href="/kemitraan" aria-current={currentPath.startsWith("/kemitraan") || currentPath.startsWith("/lembaga") ? "page" : undefined} onClick={() => setOpen(false)}>Kolaborasi</a>
              <a href="/tiket" aria-current={currentPath === "/tiket" ? "page" : undefined} onClick={() => setOpen(false)} className="button button-small">Beli Tiket</a>
            </div>
          </>
        )}
        {checkout && <a className="text-button" href="/tiket"><Icon name="arrow" className="icon-back" /> Ubah tiket</a>}
      </nav>
    </header>
  );
}

function Countdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const start = new Date(EVENT.countdownAt).getTime();
  const gateOpen = new Date(EVENT.startsAt).getTime();
  const end = new Date(EVENT.endsAt).getTime();
  const diff = Math.max(0, start - now);
  const values = [
    [Math.floor(diff / 86400000), "Hari"],
    [Math.floor((diff / 3600000) % 24), "Jam"],
    [Math.floor((diff / 60000) % 60), "Menit"],
    [Math.floor((diff / 1000) % 60), "Detik"],
  ];
  const heading = now < start ? "Menuju Saudi Education Expo 2026" : now < gateOpen ? "Saudi Education Expo dimulai hari ini" : now <= end ? "Saudi Education Expo 2026 sedang berlangsung" : "Saudi Education Expo 2026 telah selesai";
  return (
    <section className="countdown-band" aria-labelledby="countdown-title">
      <div className="container countdown-layout">
        <div><span className="poster-tag lime">31.07—02.08</span><h2 id="countdown-title">{heading}</h2></div>
        {now < start ? (
          <div className="countdown-numbers" aria-live="off">
            {values.map(([value, label]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}
          </div>
        ) : <a className="button button-cream" href={now <= end ? "/jadwal" : "/dokumentasi"}>{now <= end ? "Lihat jadwal hari ini" : "Lihat dokumentasi"}</a>}
      </div>
      <div className="container fact-strip">
        {EVENT.highlights.filter(([, , status]) => status !== "NEEDS_ORGANIZER_CONFIRMATION").map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="campaign-hero">
      <div className="hero-noise" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="poster-tag yellow">Saudi Education Expo 2026</span>
          <h1>Temukan kampus impianmu <span>di Arab Saudi.</span></h1>
          <p>Festival pendidikan yang mempertemukanmu dengan kampus, mahasiswa aktif, alumni, pembicara, dan informasi beasiswa Arab Saudi dalam satu tempat.</p>
          <div className="hero-meta">
            <span><Icon name="calendar" />{EVENT.datesLabel}</span>
            <span><Icon name="pin" />{EVENT.venueShort}</span>
          </div>
          <div className="hero-actions">
            <a className="button button-lime" href="/tiket">Beli Tiket <Icon name="arrow" /></a>
            <a className="button button-outline-light" href="/jadwal">Lihat Jadwal</a>
          </div>
        </div>
        <div className="campaign-collage" aria-label="Identitas kampanye Saudi Education Expo 2026">
          <figure className="official-logo-poster">
            <img src={EVENT.logoGreen} alt="Logo resmi Saudi Education Expo 2026" width="1920" height="1600" fetchpriority="high" />
          </figure>
          <div className="campaign-note">
            <small>Pameran pendidikan Arab Saudi</small>
            <strong>SMESCO<br />JAKARTA</strong>
          </div>
          <div className="asset-slot">
            <span>Dokumentasi event</span>
            <strong>Aset resmi dibutuhkan</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

const SectionIntro = ({ label, title, children, light = false }) => (
  <header className={`section-intro ${light ? "light" : ""}`}><span className="eyebrow">{label}</span><h2>{title}</h2>{children}</header>
);

function About() {
  return (
    <>
      <section className="section about-section" id="tentang">
        <div className="container about-grid">
          <SectionIntro label="Tentang Saudi Education Expo" title={<>Akses informasi studi Saudi, <span>langsung dari ekosistemnya.</span></>}>
            <blockquote>Bukan hanya mengetahui kampusnya. Kamu juga memahami jalan menuju ke sana.</blockquote>
          </SectionIntro>
          <div className="about-copy">
            <p>Saudi Education Expo merupakan agenda kolaborasi dari PPMI Saudi dan wilayah yang menghimpun kepanitiaan independen.</p>
            <p>Inisiatif ini berangkat dari upaya memperkenalkan universitas-universitas yang ada di Arab Saudi, kemudian berkembang menjadi sebuah ekshibisi pendidikan.</p>
            <p>Melalui event ini, pengunjung memperoleh akses informasi yang valid, komprehensif, dan dapat ditanyakan langsung kepada mahasiswa aktif, alumni, pembicara, dan pihak yang memahami proses studi di Arab Saudi.</p>
          </div>
        </div>
      </section>
      <section className="continuity">
        <div className="container continuity-grid">
          <div className="year-block"><span>2025</span><strong>Saudi University Expo</strong><small>Awal perjalanan</small></div>
          <div className="continuity-arrow" aria-hidden="true">→</div>
          <div className="year-block active"><span>2026</span><strong>Saudi Education Expo</strong><small>Cakupan edukasi yang lebih lengkap</small></div>
          <div className="continuity-copy">
            <h2>Dari Saudi University Expo 2025 menuju Saudi Education Expo 2026.</h2>
            <p>Pada 2026, cakupan acara diperluas untuk menghadirkan konsultasi, workshop, seminar, talkshow, networking, dan pameran kampus yang lebih lengkap.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function ProblemAndPurpose() {
  const purposes = [
    "Memperkenalkan universitas terkemuka Arab Saudi secara langsung.",
    "Menyajikan informasi beasiswa dan pendaftaran yang valid.",
    "Membangun jejaring alumni, mahasiswa aktif, dan calon mahasiswa.",
    "Mempererat hubungan pendidikan Indonesia dan Arab Saudi.",
    "Membantu memahami langkah konkret menuju studi di Saudi.",
  ];
  return (
    <section className="section fact-section">
      <div className="container fact-grid">
        <div className="fact-stat"><span>FAKTA PENDIDIKAN KITA</span><strong>6,82%</strong><small>Sumber: materi GoodStats yang disuplai penyelenggara</small></div>
        <div className="fact-copy">
          <h2>Banyak mimpi berhenti karena kurangnya akses informasi.</h2>
          <p>Materi kampanye menyebut bahwa pada 2024, sekitar 6,82% penduduk Indonesia telah menyelesaikan pendidikan tinggi. Keterbatasan ekonomi, biaya pendidikan, dan kurangnya akses informasi masih menjadi tantangan.</p>
          <p>SEE tidak mengklaim menyelesaikan seluruh masalah itu. Namun, event ini membuka akses informasi yang sebelumnya terasa jauh, tersebar, dan membingungkan.</p>
          <strong>Insya Allah, kita dapat mengubah narasi itu bersama-sama.</strong>
        </div>
        <div className="purpose-index">
          <h3>Saudi Education Expo siap membantu mewujudkan mimpimu.</h3>
          {purposes.map((purpose, index) => <div key={purpose}><span>0{index + 1}</span><p>{purpose}</p></div>)}
        </div>
      </div>
    </section>
  );
}

const activities = [
  ["01", "Seminar Inspiratif", "Wawasan tentang Arab Saudi sebagai pusat ilmu, sejarah, peradaban, dan peluang pendidikan."],
  ["02", "Talkshow Alumni", "Kisah nyata tentang pendaftaran, kehidupan di Saudi, adaptasi budaya, karier, dan perjalanan setelah lulus."],
  ["03", "Workshop Interaktif", "Persiapan Study in Saudi, CV, surat rekomendasi, dokumen beasiswa, bahasa, dan strategi aplikasi."],
  ["04", "Booth Kampus Saudi", "Diskusi langsung tentang universitas, jurusan, kehidupan kampus, pendaftaran, dan beasiswa."],
  ["05", "Bazar & Community Space", "Produk, merchandise, makanan, souvenir, dan suasana komunitas mahasiswa Indonesia di Arab Saudi."],
];
function Activities() {
  return (
    <section className="section activities-section">
      <div className="container">
        <SectionIntro label="Yang akan kamu temukan" title={<>Bukan cuma datang dan mendengar. <span>Kamu bisa bertanya, belajar, dan terhubung.</span></>} />
        <div className="activity-editorial">
          {activities.map(([number, title, copy], index) => (
            <article className={`activity activity-${index + 1}`} key={title}><span>{number}</span><div className="asset-mini">Foto resmi<br />belum tersedia</div><h3>{title}</h3><p>{copy}</p></article>
          ))}
          <aside><span className="poster-tag lime">Sepanjang hari</span><strong>Campus & Scholarship Expo</strong></aside>
        </div>
      </div>
    </section>
  );
}

function AudienceOutcomes() {
  const audiences = [
    ["01", "Pelajar SMA, MA, Pesantren", "Mencari jalur pendaftaran, informasi kampus, dan peluang beasiswa S1."],
    ["02", "Mahasiswa", "Ingin melanjutkan studi ke jenjang S2 atau S3."],
    ["03", "Guru dan Pendidik", "Membutuhkan informasi terpercaya bagi para murid."],
    ["04", "Masyarakat Umum", "Ingin memahami peluang studi, beasiswa, dan kehidupan di Arab Saudi."],
  ];
  const outcomes = ["Mengenal universitas yang relevan.", "Memahami beasiswa dan jalur pendaftaran.", "Mengetahui dokumen yang perlu disiapkan.", "Terhubung dengan mahasiswa, alumni, dan komunitas.", "Memahami kehidupan studi secara realistis.", "Mendapat referensi sesi lanjutan yang relevan."];
  return (
    <section className="section audience-section">
      <div className="container">
        <SectionIntro label="Untuk siapa?" title="Punya mimpi belajar? Berarti event ini untukmu." />
        <div className="audience-list">{audiences.map(([n, title, copy]) => <article key={title}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <div className="outcome-journey">
          <div><span className="eyebrow">Hasil kunjungan</span><h2>Datang dengan pertanyaan.<br /><em>Pulang dengan rencana.</em></h2></div>
          <ol>{outcomes.map((item) => <li key={item}>{item}</li>)}</ol>
        </div>
      </div>
    </section>
  );
}

function TrustAndSpeakers({ showTrust = true, showSpeakers = true, initialAll = false, showToggle = true }) {
  const [all, setAll] = useState(initialAll);
  const shown = all ? SPEAKERS : SPEAKERS.slice(0, 8);
  return (
    <>
      {showTrust && <section className="trust-section">
        <div className="container trust-grid">
          <div><span className="poster-tag yellow">Dukungan institusional</span><h2>SEE bukan acara biasa.</h2><p>Acara ini menjadi wujud upaya memperkuat akses informasi dan hubungan pendidikan Indonesia dengan Arab Saudi.</p></div>
          <div className="trust-names">
            <article><strong>Syaikh Dr. Ahmad Ibn Isa Al-Hazimy</strong><span>Atase Agama dan Pendidikan Kedutaan Besar Arab Saudi</span></article>
            <article><strong>Prof. Dr. Muhammad Irfan Helmy, Lc., M.A.</strong><span>Atase Pendidikan dan Kebudayaan Kedutaan Besar Republik Indonesia</span></article>
          </div>
        </div>
      </section>}
      {showSpeakers && <section className="section speakers-section" id="pembicara">
        <div className="container">
          <SectionIntro label="Pembicara & kontributor" title="Belajar langsung dari pembicara, alumni, dan praktisi pendidikan."><p><strong>70+ mahasiswa perwakilan kampus Arab Saudi</strong> akan hadir.</p></SectionIntro>
          <div className="speaker-grid">
            {shown.map((speaker, index) => <article key={speaker.id}><div className="speaker-photo"><span>{speaker.name.split(" ").filter((word) => /^[A-Z]/.test(word)).slice(0, 2).map((word) => word[0]).join("")}</span><small>Foto resmi belum tersedia</small></div><span>#{String(index + 1).padStart(2, "0")}</span><h3>{speaker.name}</h3><p>Metadata sesi menunggu konfirmasi organizer.</p></article>)}
          </div>
          {showToggle && <button className="button button-dark centered" onClick={() => setAll(!all)}>{all ? "Tampilkan ringkas" : "Lihat Semua Pembicara"}</button>}
        </div>
      </section>}
    </>
  );
}

function Schedule() {
  const params = new URLSearchParams(location.search);
  const [day, setDay] = useState(params.get("day") ? `day-${params.get("day")}` : "day-1");
  const [stage, setStage] = useState(params.get("stage") === "main" ? "Main Stage" : params.get("stage") === "mini" ? "Mini Stage" : "Semua");
  const dayData = SCHEDULE.find((item) => item.id === day);
  const sessions = dayData.sessions.filter((item) => stage === "Semua" || item.stage === stage);
  const selectDay = (next) => {
    setDay(next);
    const query = new URLSearchParams(location.search);
    query.set("day", next.replace("day-", ""));
    history.replaceState({}, "", `${location.pathname}?${query}#jadwal`);
  };
  const selectStage = (next) => {
    setStage(next);
    const query = new URLSearchParams(location.search);
    if (next === "Semua") query.delete("stage");
    else query.set("stage", next === "Main Stage" ? "main" : "mini");
    history.replaceState({}, "", `${location.pathname}?${query}#jadwal`);
  };
  const handleDayKeys = (event, index) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? SCHEDULE.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + SCHEDULE.length) % SCHEDULE.length;
    selectDay(SCHEDULE[nextIndex].id);
    document.getElementById(`schedule-tab-${nextIndex}`)?.focus();
  };
  return (
    <section className="section schedule-section" id="jadwal">
      <div className="container">
        <SectionIntro label="Jadwal lengkap" title="Tiga hari untuk menemukan jalur studimu." />
        <div className="schedule-controls">
          <div className="tablist" role="tablist" aria-label="Pilih hari">
            {SCHEDULE.map((item, index) => <button id={`schedule-tab-${index}`} role="tab" aria-selected={day === item.id} aria-controls="schedule-panel" tabIndex={day === item.id ? 0 : -1} key={item.id} onKeyDown={(event) => handleDayKeys(event, index)} onClick={() => selectDay(item.id)}>{item.short}<small>{item.label}</small></button>)}
          </div>
          <div className="filter-pills" aria-label="Filter stage">
            {["Semua", "Main Stage", "Mini Stage"].map((item) => <button className={stage === item ? "active" : ""} aria-pressed={stage === item} key={item} onClick={() => selectStage(item)}>{item}</button>)}
          </div>
        </div>
        <aside className="all-day-banner"><span>Sepanjang hari</span><strong>Campus & Scholarship Expo</strong><small>Jam operasional final sedang dikonfirmasi oleh panitia.</small></aside>
        <div className="schedule-list" id="schedule-panel" role="tabpanel" aria-live="polite">
          {sessions.map((item, index) => <article key={`${item.time}-${item.title}`}><time>{item.time}</time><div><span className="stage-label">{item.stage}</span>{item.category && <span className="akhwat-label">{item.category}</span>}<h3>{item.title}</h3></div><span className="schedule-index">{String(index + 1).padStart(2, "0")}</span></article>)}
        </div>
      </div>
    </section>
  );
}

function TicketSelector() {
  const categories = [...new Set(TICKETS.map((item) => item.category))];
  const [category, setCategory] = useState("Tiket Harian");
  const products = TICKETS.filter((item) => item.category === category);
  const [productId, setProductId] = useState("regular-d1");
  const [quantity, setQuantity] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef(null);
  const detailTriggerRef = useRef(null);
  useEffect(()=>{
    if(!sheetOpen)return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sheet=sheetRef.current;
    const focusable=[...sheet.querySelectorAll("button,a[href]")];
    focusable[0]?.focus();
    const onKey=(event)=>{
      if(event.key==="Escape"){setSheetOpen(false);detailTriggerRef.current?.focus()}
      if(event.key==="Tab"&&focusable.length){const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
    };
    addEventListener("keydown",onKey);return()=>{removeEventListener("keydown",onKey);document.body.style.overflow=previousOverflow};
  },[sheetOpen]);
  useEffect(() => {
    if (!products.some((item) => item.id === productId)) setProductId(products[0].id);
  }, [category]);
  const product = TICKETS.find((item) => item.id === productId);
  const purchasable = product.status === "AVAILABLE";
  return (
    <section className="section ticket-section" id="tiket">
      <div className="container">
        <SectionIntro label="Pilih tiket" title="Satu pilihan dalam satu waktu. Jelas sebelum bayar."><p>Harga dan status berikut mengikuti materi produk yang disuplai organizer. Produk dengan mekanik belum jelas dinonaktifkan.</p></SectionIntro>
        <div className="ticket-workbench">
          <div className="ticket-picker">
            <div className="ticket-categories">{categories.map((item) => <button key={item} aria-pressed={item === category} className={item === category ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
            <label className="select-label">Pilih produk<select name="ticketProduct" value={productId} onChange={(event) => setProductId(event.target.value)}>{products.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
            <div className="selected-product">
              <div className="product-title"><span className={`status ${product.status.toLowerCase()}`}>{product.status === "AVAILABLE" ? "Tersedia" : product.status === "SOLD_OUT" ? "Tiket habis" : "Konfigurasi belum lengkap"}</span><h3>{product.name}</h3><p>{product.date}</p></div>
              <div className="price"><strong>{formatRupiah(product.price)}</strong>{product.originalPrice && <del>{formatRupiah(product.originalPrice)}</del>}<span>{product.unit}</span></div>
              <ul>{product.benefits.map((benefit) => <li key={benefit}><Icon name="check" />{benefit}</li>)}</ul>
              {purchasable ? <div className="quantity"><span>Jumlah tiket</span><div><button disabled={quantity === 1} onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Kurangi jumlah">−</button><output aria-live="polite">{quantity}</output><button disabled={quantity === 10} onClick={() => setQuantity(Math.min(10, quantity + 1))} aria-label="Tambah jumlah">+</button></div></div> : <p className="configuration-note">{product.status === "SOLD_OUT" ? "Produk tidak dapat dipilih karena stok sumber menunjukkan 0." : "Checkout dinonaktifkan sampai mekanik produk dikonfirmasi organizer."}</p>}
              <button ref={detailTriggerRef} className="text-cta ticket-detail-trigger" onClick={()=>setSheetOpen(true)}>Lihat Detail Tiket <Icon name="arrow"/></button>
            </div>
          </div>
          <aside className="ticket-preview">
            <div className="pass-head"><img src={EVENT.logo} alt="" width="50" height="50" /><span>SATU PESERTA</span></div>
            <div className="pass-body"><small>SAUDI EDUCATION EXPO 2026</small><strong>Nama Pengunjung</strong><span>{product.name}</span><div><span>{product.date}</span><span>{EVENT.venueShort}</span></div></div>
            <div className="fake-qr" aria-label="Pratinjau posisi QR"><span>SEE<br />26</span></div>
            <div className="summary-total"><span>Total</span><strong aria-live="polite">{formatRupiah(product.price * quantity)}</strong></div>
            <button className="button button-lime button-full" disabled={!purchasable} onClick={() => navigate(`/checkout?ticket=${product.id}&qty=${quantity}`)}>{purchasable ? "Lanjut ke Checkout" : product.status === "SOLD_OUT" ? "Tiket Habis" : "Menunggu Konfirmasi"}</button>
          </aside>
        </div>
        <AgePolicy />
      </div>
      <div className="ticket-purchase-bar"><span><strong>{quantity} Tiket</strong><small>{formatRupiah(product.price*quantity)}</small></span><button className="button button-lime" disabled={!purchasable} onClick={()=>navigate(`/checkout?ticket=${product.id}&qty=${quantity}`)}>Lanjut</button></div>
      {sheetOpen&&<div className="sheet-backdrop" role="presentation" onMouseDown={()=>{setSheetOpen(false);detailTriggerRef.current?.focus()}}><section ref={sheetRef} className="ticket-sheet" role="dialog" aria-modal="true" aria-labelledby="ticket-sheet-title" onMouseDown={e=>e.stopPropagation()}><header><div><span className="eyebrow">Detail tiket</span><h2 id="ticket-sheet-title">{product.name}</h2></div><button className="icon-close" aria-label="Tutup detail tiket" onClick={()=>{setSheetOpen(false);detailTriggerRef.current?.focus()}}><Icon name="close"/></button></header><p>{product.date}</p><ul>{product.benefits.map(x=><li key={x}>{x}</li>)}</ul><dl><div><dt>QR</dt><dd>{product.qrQuantity||"Menunggu konfirmasi"} per peserta</dd></div><div><dt>Souvenir</dt><dd>{product.souvenir?"Termasuk":"Tidak disebutkan"}</dd></div><div><dt>Refund</dt><dd>Sesuai syarat tiket</dd></div></dl><div className="sheet-links"><a href="/jadwal">Jadwal terkait</a><a href="/faq">Kebijakan usia</a></div></section></div>}
    </section>
  );
}

function AgePolicy() {
  const [open, setOpen] = useState(false);
  return <div className="age-policy"><button aria-expanded={open} onClick={() => setOpen(!open)}><span><Icon name="users" /><strong>Ketentuan Usia Peserta</strong></span><Icon name={open ? "minus" : "plus"} /></button>{open && <ul>{AGE_POLICY.map((item) => <li key={item}>{item}</li>)}</ul>}</div>;
}

function VenueDocumentationPartners() {
  return (
    <>
      <section className="section venue-section" id="venue">
        <div className="container venue-layout">
          <div className="venue-poster"><span>SMESCO</span><strong>JAKARTA<br />SELATAN</strong><small>Foto venue resmi dibutuhkan</small></div>
          <div><SectionIntro label="Lokasi event" title="Temui kami di SMESCO Indonesia." /><h3>{EVENT.venue}</h3><address>{EVENT.address}</address><p>{EVENT.datesLabel}</p><a className="button button-dark" href={EVENT.mapUrl} target="_blank" rel="noreferrer">Buka di Google Maps <Icon name="arrow" /></a></div>
        </div>
      </section>
      <section className="section documentation-section" id="dokumentasi">
        <div className="container">
          <SectionIntro label="Dokumentasi" title="Lihat perjalanan Saudi Expo sebelumnya."><p>Sebelum menjadi Saudi Education Expo 2026, perjalanan ini telah tumbuh melalui Saudi University Expo 2025.</p></SectionIntro>
          <div className="documentation-grid">
            <div className="doc-main"><Icon name="play" size={48} /><strong>Aftermovie 2025</strong><span>Thumbnail & URL resmi dibutuhkan</span></div>
            {["Seminar", "Booth kampus", "Audience", "Committee"].map((item) => <div className="doc-tile" key={item}><span>{item}</span><small>Aset resmi belum tersedia</small></div>)}
          </div>
        </div>
      </section>
      <section className="partners-section">
        <div className="container partners-layout"><div><span className="eyebrow">Penyelenggara</span><h2>PPMI Arab Saudi</h2></div><div><span className="eyebrow">Partner & sponsor</span><p>Daftar logo belum disuplai. Tidak ada kategori atau partner yang dibuat untuk mengisi ruang.</p></div></div>
      </section>
    </>
  );
}

function Faq({ limit = FAQS.length }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq-section">
      <div className="container faq-layout">
        <SectionIntro label="Pertanyaan umum" title="Sebelum kamu membeli tiket." />
        <div className="faq-list">{FAQS.slice(0,limit).map(([question, answer], index) => <article key={question}><button aria-expanded={open === index} aria-controls={`faq-${index}`} onClick={() => setOpen(open === index ? -1 : index)}><span>{question}</span><Icon name={open === index ? "minus" : "plus"} /></button><div id={`faq-${index}`} hidden={open !== index}><p>{answer}</p></div></article>)}{limit < FAQS.length && <a className="text-cta faq-more" href="/faq">Baca Semua Pertanyaan <Icon name="arrow"/></a>}</div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <>
      <section className="closing-cta"><div className="container"><span className="poster-tag lime">31 JUL—02 AGU</span><h2>Siapkan langkah studimu ke Arab Saudi.</h2><p>Temukan kampus, informasi beasiswa, dan orang yang bisa menjawab pertanyaanmu.</p><a className="button button-cream" href="/tiket">Beli Tiket</a></div></section>
      <footer><div className="container footer-grid"><Logo inverse /><nav><a href="/tentang">Tentang</a><a href="/jadwal">Jadwal</a><a href="/tiket">Tiket</a><a href="/mitra">Mitra</a><a href="/syarat-ketentuan">Syarat & Ketentuan</a><a href="/kebijakan-privasi">Privasi</a></nav><div><strong>{EVENT.venue}</strong><span>{EVENT.datesLabel} · WIB</span><a href={EVENT.social.instagram} target="_blank" rel="noreferrer">Instagram resmi</a></div></div><div className="container footer-bottom"><span>© 2026 PPMI Arab Saudi</span><span>Platform resmi acara · SEE 2026</span></div></footer>
    </>
  );
}

function HomeTeasers() {
  const activitiesShort = activities.slice(0, 4);
  const day = SCHEDULE[0];
  return <>
    <section className="section home-intro"><div className="container teaser-split"><SectionIntro label="Kenali Saudi Education Expo" title="Akses studi Saudi, langsung dari ekosistemnya." /><div><p>Temui mahasiswa aktif, alumni, pembicara, dan komunitas yang memahami proses studi di Arab Saudi—dari kampus dan beasiswa sampai kehidupan sehari-hari.</p><a className="text-cta" href="/tentang">Kenali Saudi Education Expo <Icon name="arrow" /></a></div></div></section>
    <section className="section home-activities"><div className="container"><SectionIntro label="Kegiatan utama" title="Datang untuk bertanya, belajar, dan terhubung." /><div className="home-activity-grid">{activitiesShort.map(([n,title,copy])=><article key={title}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><a className="button button-dark centered" href="/kegiatan">Lihat Semua Kegiatan</a></div></section>
    <section className="section home-speakers"><div className="container"><SectionIntro label="Pembicara pilihan" title="Belajar dari orang yang menjalani ekosistemnya." /><div className="home-speaker-row">{SPEAKERS.slice(0,6).map((s)=><article key={s.id}><div>{s.name.split(" ").filter(w=>/^[A-Z]/.test(w)).slice(0,2).map(w=>w[0]).join("")}</div><h3>{s.name}</h3></article>)}</div><a className="text-cta" href="/pembicara">Lihat Semua Pembicara <Icon name="arrow" /></a></div></section>
    <section className="section home-schedule"><div className="container teaser-split"><SectionIntro label="Preview jadwal" title={day.label} /><div className="mini-schedule">{day.sessions.slice(0,5).map(s=><article key={s.time+s.title}><time>{s.time}</time><div><small>{s.stage}</small><strong>{s.title}</strong></div></article>)}<a className="text-cta" href="/jadwal">Lihat Jadwal Lengkap <Icon name="arrow" /></a></div></div></section>
    <section className="section home-ticket"><div className="container teaser-split"><SectionIntro label="Tiket SEE 2026" title="Pilih hari yang paling relevan untukmu." /><div><p>Regular Day 1 dan Day 3 tersedia. Bundle serta beberapa kategori lain mengikuti status resmi dan konfigurasi panitia.</p><a className="button button-lime" href="/tiket">Lihat dan Pilih Tiket</a></div></div></section>
    <section className="section home-venue"><div className="container teaser-split"><div className="venue-poster"><span>SMESCO</span><strong>JAKARTA</strong></div><div><SectionIntro label="Lokasi" title="SMESCO Exhibition & Convention Hall" /><p>{EVENT.address}</p><a className="text-cta" href="/lokasi">Lihat Informasi Lokasi <Icon name="arrow" /></a></div></div></section>
    <section className="section collaboration-teaser"><div className="container"><SectionIntro label="Kolaborasi bersama SEE 2026" title="Hadir sebagai mitra, exhibitor, atau lembaga." /><div className="collaboration-actions"><a href="/kemitraan/sponsorship">Sponsorship & Kemitraan <Icon name="arrow"/></a><a href="/kemitraan/booth">Booth & Exhibitor <Icon name="arrow"/></a><a href="/lembaga">Pendaftaran Lembaga <Icon name="arrow"/></a></div></div></section>
    <section className="section home-doc"><div className="container teaser-split"><div className="doc-main"><Icon name="play" size={44}/><strong>Aftermovie 2025</strong><span>Aset resmi belum tersedia</span></div><div><SectionIntro label="Dokumentasi" title="Perjalanan yang dimulai pada 2025." /><a className="text-cta" href="/dokumentasi">Lihat Dokumentasi <Icon name="arrow"/></a></div></div></section>
    <Faq limit={5} />
  </>;
}

function Landing() {
  const availableStartingPrice = Math.min(...TICKETS.filter((item) => item.status === "AVAILABLE").map((item) => item.price));
  return (
    <>
      <a className="skip-link" href="#main">Lewati ke konten utama</a>
      <Header />
      <main id="main"><Hero /><Countdown /><HomeTeasers /><Footer /></main>
      <div className="mobile-buy"><span><small>Mulai</small><strong>{formatRupiah(availableStartingPrice)}</strong></span><a href="/tiket" className="button button-lime">Beli Tiket</a></div>
    </>
  );
}

const DetailShell = ({ children, title, label, intro }) => <><Header/><main className="detail-page"><header className="page-masthead"><div className="container"><span className="poster-tag lime">{label}</span><h1>{title}</h1>{intro&&<p>{intro}</p>}</div></header>{children}</main><Footer/></>;
function AboutPage(){return <DetailShell label="Tentang SEE 2026" title="Mengapa Saudi Education Expo hadir."><About/><ProblemAndPurpose/><TrustAndSpeakers showSpeakers={false}/></DetailShell>}
function ActivitiesPage(){return <DetailShell label="Program event" title="Lima cara untuk belajar dan terhubung."><Activities/><AudienceOutcomes/></DetailShell>}
function SchedulePage(){return <DetailShell label="31 Jul—2 Agu 2026" title="Jadwal lengkap dua stage."><Schedule/></DetailShell>}
function SpeakersPage(){return <DetailShell label="Pembicara & kontributor" title="Belajar langsung dari ekosistem pendidikan Saudi."><TrustAndSpeakers showTrust={false} initialAll showToggle={false}/></DetailShell>}
function TicketsPage(){return <DetailShell label="Pilih tiket" title="Pilih tiket SEE 2026." intro="Satu produk aktif dalam satu waktu. Status habis dan produk yang belum lengkap ditampilkan apa adanya."><TicketSelector/></DetailShell>}
function LocationPage(){return <DetailShell label="Lokasi event" title="Temui kami di SMESCO Indonesia."><section className="section"><div className="container venue-layout"><div className="venue-poster"><span>SMESCO</span><strong>JAKARTA</strong><small>Foto resmi menunggu organizer</small></div><div><h2>{EVENT.venue}</h2><address>{EVENT.address}</address><p>{EVENT.datesLabel}</p><a className="button button-dark" href={EVENT.mapUrl}>Buka di Google Maps</a></div></div></section></DetailShell>}
function DocumentationPage(){return <DetailShell label="Saudi Expo 2025—2026" title="Lihat perjalanan Saudi Expo sebelumnya."><section className="section documentation-section"><div className="container documentation-grid"><div className="doc-main"><Icon name="play"/><strong>Aftermovie 2025</strong><span>URL resmi belum tersedia</span></div>{["Seminar","Booth","Audience","Committee"].map(x=><div className="doc-tile" key={x}><span>{x}</span><small>Aset resmi belum tersedia</small></div>)}</div></section></DetailShell>}
function PartnersPage(){const filters=["Semua","Sponsor Utama","Sponsor","Exhibitor","Media Partner","Event Partner","Community Partner","Education Partner"];const [filter,setFilter]=useState("Semua");return <DetailShell label="Direktori kolaborator" title="Mitra Saudi Education Expo 2026."><section className="section"><div className="container"><div className="filter-pills">{filters.map(x=><button className={filter===x?"active":""} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div><div className="partner-empty"><strong>Data {filter.toLowerCase()} belum tersedia.</strong><p>Logo dan kategori hanya akan ditampilkan setelah metadata dikonfirmasi organizer.</p></div></div></section></DetailShell>}
function FaqPage(){return <DetailShell label="Pusat bantuan" title="Pertanyaan & kebijakan event."><Faq/></DetailShell>}
function PrivacyPage(){return <DetailShell label="Legal" title="Kebijakan Privasi"><section className="section"><div className="container legal-copy"><p>Saudi Education Expo memproses data pembeli, peserta, dan pendaftar hanya untuk pemesanan, komunikasi acara, pembayaran, check-in, serta pelaporan internal yang relevan.</p><h2>Data yang diproses</h2><p>Identitas, kontak, institusi, kategori peserta, data transaksi, persetujuan ketentuan, dan riwayat check-in. Bukti pembayaran hanya dapat diakses petugas berwenang.</p><h2>Hak dan keamanan</h2><p>Implementasi production wajib menetapkan retensi data, kanal permintaan akses/penghapusan, vendor pemroses data, serta kebijakan insiden sebelum menerima data publik.</p></div></section></DetailShell>}

const emptyBuyer = { fullName: "", phone: "", email: "", emailConfirmation: "", ageRange: "", institutionLevel: "", institutionName: "", category: "" };
const emptyAttendee = () => ({ fullName: "", phone: "", email: "", ageRange: "", birthDate: "", guardianName: "", institutionLevel: "", institutionName: "", category: "", gender: "" });
const CHECKOUT_DRAFT_PREFIX = "SEE26_CHECKOUT_DRAFT";
const ageOnEventDate = (birthDate) => {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T00:00:00+07:00`);
  const eventDate = new Date("2026-07-31T00:00:00+07:00");
  let age = eventDate.getFullYear() - birth.getFullYear();
  const beforeBirthday = eventDate.getMonth() < birth.getMonth() || (eventDate.getMonth() === birth.getMonth() && eventDate.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};
function Checkout() {
  const query = new URLSearchParams(location.search);
  const product = TICKETS.find((item) => item.id === query.get("ticket")) || TICKETS.find((item) => item.status === "AVAILABLE");
  const quantity = Math.min(10, Math.max(1, Number(query.get("qty")) || 1));
  const draftKey = `${CHECKOUT_DRAFT_PREFIX}:${product.id}:${quantity}`;
  const [draft] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(draftKey)) || {}; } catch { return {}; }
  });
  const [buyer, setBuyer] = useState(() => ({ ...emptyBuyer, ...draft.buyer }));
  const [attendees, setAttendees] = useState(() => draft.attendees?.length === quantity ? draft.attendees : Array.from({ length: quantity }, emptyAttendee));
  const [donation, setDonation] = useState(draft.donation ?? 0);
  const [customDonation, setCustomDonation] = useState(draft.customDonation ?? "");
  const [voucher, setVoucher] = useState(draft.voucher ?? "");
  const [voucherState, setVoucherState] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(draft.step && draft.step <= 4 ? draft.step : 1);
  const [attendeeIndex, setAttendeeIndex] = useState(draft.attendeeIndex ?? 0);
  const errorRef = useRef(null);
  const finalDonation = donation === "custom" ? Number(customDonation) || 0 : Number(donation);
  const subtotal = product.price * quantity;
  useEffect(() => {
    sessionStorage.setItem(draftKey, JSON.stringify({ buyer, attendees, donation, customDonation, voucher, step, attendeeIndex }));
  }, [draftKey, buyer, attendees, donation, customDonation, voucher, step, attendeeIndex]);
  const updateAttendee = (index, field, value) => setAttendees((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const copyBuyer = () => setAttendees((current) => current.map((item, index) => index ? item : ({ ...item, fullName: buyer.fullName, phone: buyer.phone, email: buyer.email, ageRange: buyer.ageRange, institutionLevel: buyer.institutionLevel, institutionName: buyer.institutionName, category: buyer.category })));
  const validateBuyer = () => {
    if (buyer.fullName.trim().length < 2) return "Masukkan nama lengkap pembeli.";
    if (!/^(\+?62|0)8\d{7,12}$/.test(buyer.phone.replace(/\s/g, ""))) return "Masukkan nomor WhatsApp Indonesia yang valid.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) return "Masukkan email aktif untuk menerima tiket.";
    if (buyer.email.toLowerCase() !== buyer.emailConfirmation.toLowerCase()) return "Email dan konfirmasi email belum sama.";
    if (!buyer.ageRange) return "Pilih rentang umur pembeli.";
    if (!buyer.institutionLevel || !buyer.category) return "Lengkapi kategori dan jenjang institusi pembeli.";
    if (buyer.institutionLevel !== "Masyarakat Umum" && !buyer.institutionName.trim()) return "Masukkan asal sekolah, kampus, lembaga, atau komunitas pembeli.";
    return "";
  };
  const validateAttendee = (item, index) => {
    if (!item.fullName.trim() || !item.ageRange || !item.institutionLevel || !item.category || !item.gender) return `Lengkapi data wajib Pengunjung ${index + 1}.`;
    if (item.phone && !/^(\+?62|0)8\d{7,12}$/.test(item.phone.replace(/\s/g, ""))) return `Periksa nomor WhatsApp Pengunjung ${index + 1}.`;
    if (item.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) return `Periksa email Pengunjung ${index + 1}.`;
    if (item.institutionLevel !== "Masyarakat Umum" && !item.institutionName.trim()) return `Masukkan asal institusi Pengunjung ${index + 1}.`;
    if (item.ageRange === "Dibawah 15 Tahun" && !item.birthDate) return `Masukkan tanggal lahir Pengunjung ${index + 1}.`;
    const age = ageOnEventDate(item.birthDate);
    if (age !== null && age < 0) return `Tanggal lahir Pengunjung ${index + 1} tidak valid.`;
    if (age !== null && age < 6) return `Pengunjung ${index + 1} berusia di bawah 6 tahun dan tidak memerlukan tiket berbayar. Hubungkan anak dengan tiket orang tua atau wali.`;
    if (age !== null && age < 12 && !item.guardianName.trim()) return `Masukkan nama orang tua atau wali untuk Pengunjung ${index + 1}.`;
    return "";
  };
  const validateAttendees = () => {
    for (let index = 0; index < attendees.length; index += 1) {
      const attendeeError = validateAttendee(attendees[index], index);
      if (attendeeError) {
        setAttendeeIndex(index);
        return attendeeError;
      }
    }
    return "";
  };
  const showError = (message) => {
    setError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  };
  const nextStep = () => {
    const validationError = step === 1 ? validateBuyer() : step === 2 ? validateAttendees() : donation === "custom" && finalDonation < 1000 ? "Masukkan nominal donasi minimal Rp1.000 atau pilih tanpa donasi." : "";
    if (validationError) return showError(validationError);
    setError("");
    setStep((current) => Math.min(4, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const validate = () => validateBuyer() || validateAttendees() || (!terms ? "Setujui Syarat dan Ketentuan sebelum melanjutkan." : "");
  const submit = (event) => {
    event.preventDefault();
    if (step < 4) {
      nextStep();
      return;
    }
    const validationError = validate();
    if (validationError) return showError(validationError);
    setLoading(true);
    try {
      const order = createOrder({ productId: product.id, quantity, buyer, attendees, donation: finalDonation, voucherCode: voucher, paymentMethod: "MANUAL_TRANSFER" });
      sessionStorage.removeItem(draftKey);
      navigate(`/payment/${order.publicToken}`);
    } catch (submitError) {
      setError(submitError.message);
      setLoading(false);
    }
  };
  const autocomplete = { fullName: "name", phone: "tel", email: "email", emailConfirmation: "email", institutionName: "organization" };
  const input = (label, field, type = "text", placeholder = "", required = true) => <label>{label}<input name={field} type={type} autoComplete={autocomplete[field] || "off"} spellCheck={type === "email" ? "false" : undefined} value={buyer[field]} placeholder={placeholder} required={required} onChange={(event) => setBuyer({ ...buyer, [field]: event.target.value })} /></label>;
  const select = (label, field, options) => <label>{label}<select name={field} value={buyer[field]} required onChange={(event) => setBuyer({ ...buyer, [field]: event.target.value })}><option value="">Pilih opsi</option>{options.map((item) => <option key={item}>{item}</option>)}</select></label>;
  if (product.status !== "AVAILABLE") return <><Header checkout /><main className="not-found"><img src={EVENT.logo} alt="" width="90" height="90" /><span>—</span><h1>Tiket ini belum dapat dibeli.</h1><p>{product.status === "SOLD_OUT" ? "Tiket sudah habis." : "Mekanik tiket masih dikonfirmasi oleh panitia."}</p><a className="button button-dark" href="/tiket">Pilih tiket lain</a></main></>;
  return (
    <>
      <Header checkout />
      <main className="checkout-page">
        <div className="container checkout-heading"><span className="eyebrow">Langkah {step} dari 4 · Guest checkout</span><h1>{["Data Pembeli","Data Pengunjung","Pembayaran","Konfirmasi"][step-1]}</h1><div className="checkout-progress">{[1,2,3,4].map(n=><span className={step>=n?"active":""} key={n}/>)}</div></div>
        <form className={`container checkout-layout checkout-step-${step}`} onSubmit={submit}>
          <div className="checkout-form">
            {error && <div className="form-error" role="alert" tabIndex="-1" ref={errorRef}>{error}</div>}
            {step===1&&<>
            <FormSection number="01" title="Data Pembeli" copy="Informasi pembayaran dan seluruh tautan tiket akan dikirim ke email pembeli.">
              <div className="form-grid">{input("Nama lengkap", "fullName", "text", "Masukkan nama lengkap")}{input("Nomor WhatsApp aktif", "phone", "tel", "Contoh: 0812 3456 7890")}{input("Email aktif", "email", "email", "nama@email.com")}{input("Konfirmasi email", "emailConfirmation", "email", "Ulangi email aktif")}{select("Rentang umur", "ageRange", CHECKOUT_CONFIG.ageRanges)}{select("Jenjang institusi / masyarakat umum", "institutionLevel", CHECKOUT_CONFIG.institutionLevels)}{select("Kategori pembeli", "category", CHECKOUT_CONFIG.categories)}{input("Asal sekolah, kampus, lembaga, atau komunitas", "institutionName", "text", "Contoh: SMA Cahaya Sunnah", false)}</div>
            </FormSection>
            </>}
            {step===2&&<>
            <FormSection number="02" title="Data Pengunjung" copy="Satu tiket dan satu QR unik akan dibuat untuk setiap pengunjung.">
              <button type="button" className="text-button copy-buyer" onClick={copyBuyer}>Samakan Pengunjung 1 dengan data pembeli</button>
              <div className="attendee-status">{attendees.map((a,i)=><button type="button" className={i===attendeeIndex?"active":""} onClick={()=>setAttendeeIndex(i)} key={i}>Pengunjung {i+1}<small>{a.fullName&&a.gender?"Lengkap":"Belum lengkap"}</small></button>)}</div>
              {attendees.map((attendee, index) => index===attendeeIndex&&<fieldset className="attendee" key={index}><legend>Pengunjung {index + 1} dari {quantity}</legend><div className="form-grid">
                <label>Nama lengkap<input name={`attendee-${index}-name`} autoComplete="name" required value={attendee.fullName} onChange={(event) => updateAttendee(index, "fullName", event.target.value)} /></label>
                <label>WhatsApp aktif <small>Opsional</small><input name={`attendee-${index}-phone`} autoComplete="tel" type="tel" value={attendee.phone} onChange={(event) => updateAttendee(index, "phone", event.target.value)} /></label>
                <label>Email <small>Opsional</small><input name={`attendee-${index}-email`} autoComplete="email" spellCheck="false" type="email" value={attendee.email} onChange={(event) => updateAttendee(index, "email", event.target.value)} /></label>
                <label>Rentang umur<select name={`attendee-${index}-age`} required value={attendee.ageRange} onChange={(event) => updateAttendee(index, "ageRange", event.target.value)}><option value="">Pilih rentang umur</option>{CHECKOUT_CONFIG.ageRanges.map((item) => <option key={item}>{item}</option>)}</select></label>
                {attendee.ageRange === "Dibawah 15 Tahun" && <label>Tanggal lahir<input name={`attendee-${index}-birth-date`} type="date" required max="2026-07-31" value={attendee.birthDate} onChange={(event) => updateAttendee(index, "birthDate", event.target.value)} /><small>Dipakai untuk menerapkan aturan usia 6 dan 12 tahun.</small></label>}
                {ageOnEventDate(attendee.birthDate) !== null && ageOnEventDate(attendee.birthDate) < 12 && <label>Nama orang tua atau wali<input name={`attendee-${index}-guardian`} autoComplete="name" required value={attendee.guardianName} onChange={(event) => updateAttendee(index, "guardianName", event.target.value)} /><small>Wajib untuk peserta yang belum berusia 12 tahun saat event.</small></label>}
                <label>Jenis kelamin<select name={`attendee-${index}-gender`} required value={attendee.gender} onChange={(event) => updateAttendee(index, "gender", event.target.value)}><option value="">Pilih jenis kelamin</option>{CHECKOUT_CONFIG.genders.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label>Jenjang institusi<select name={`attendee-${index}-institution-level`} required value={attendee.institutionLevel} onChange={(event) => updateAttendee(index, "institutionLevel", event.target.value)}><option value="">Pilih jenjang</option>{CHECKOUT_CONFIG.institutionLevels.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label>Kategori<select name={`attendee-${index}-category`} required value={attendee.category} onChange={(event) => updateAttendee(index, "category", event.target.value)}><option value="">Pilih kategori</option>{CHECKOUT_CONFIG.categories.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="span-2">Asal institusi<input name={`attendee-${index}-institution`} autoComplete="organization" value={attendee.institutionName} onChange={(event) => updateAttendee(index, "institutionName", event.target.value)} /></label>
              </div></fieldset>)}
            </FormSection>
            </>}
            {step===3&&<>
            <FormSection number="03" title="Voucher dan Donasi" copy="Donasi bersifat opsional dan tidak menjadi bagian dari harga tiket.">
              <div className="voucher-row"><label>Kode voucher, jika ada<input name="voucherCode" autoComplete="off" spellCheck="false" value={voucher} onChange={(event) => { setVoucher(event.target.value.toUpperCase()); setVoucherState(""); }} placeholder="Masukkan kode…" /></label><button type="button" className="button button-outline" onClick={() => setVoucherState(voucher ? "Voucher tidak valid atau belum tersedia untuk publik." : "Masukkan kode voucher terlebih dahulu.")}>Periksa</button></div>
              {voucherState && <p className="field-message">{voucherState}</p>}
              <div className="donation-options">{[0, ...CHECKOUT_CONFIG.donationPresets, "custom"].map((value) => <button type="button" className={donation === value ? "active" : ""} key={value} onClick={() => setDonation(value)}>{value === 0 ? "Tanpa donasi" : value === "custom" ? "Nominal lain" : formatRupiah(value)}</button>)}</div>
              {donation === "custom" && <label>Nominal donasi<input name="donationAmount" inputMode="numeric" type="number" min="1000" value={customDonation} onChange={(event) => setCustomDonation(event.target.value)} /></label>}
            </FormSection>
            <FormSection number="04" title="Metode Pembayaran" copy="Gateway otomatis belum dikonfigurasi. Manual transfer tersedia untuk development flow.">
              <label className="payment-option active"><input name="paymentMethod" type="radio" value="MANUAL_TRANSFER" checked readOnly /><span><strong>Transfer manual · BSI</strong><small>Verifikasi oleh admin setelah bukti pembayaran dikirim.</small></span></label>
              <label className="payment-option disabled"><input name="paymentMethod" type="radio" value="AUTOMATIC_GATEWAY" disabled /><span><strong>QRIS / Virtual Account</strong><small>Memerlukan payment gateway dan webhook terverifikasi.</small></span></label>
            </FormSection>
            </>}
            {step===4&&<>
            <FormSection number="04" title="Tinjau Pesanan" copy={`${quantity} tiket untuk ${attendees.length} pengunjung.`}>
              <div className="review-list"><p><strong>Pembeli</strong><span>{buyer.fullName||"Belum lengkap"}</span></p><p><strong>Tiket</strong><span>{product.name}</span></p><p><strong>Total</strong><span>{formatRupiah(subtotal+finalDonation)}</span></p></div>
            </FormSection>
            <label className="terms-check"><input name="acceptTerms" type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} /><span>Saya telah membaca dan menyetujui <a href="/syarat-ketentuan" target="_blank">Syarat dan Ketentuan Saudi Education Expo 2026</a>.</span></label>
            <button className="checkout-mobile-submit" disabled={loading}>
              <span><small>Total sementara</small><strong>{formatRupiah(subtotal + finalDonation)}</strong></span>
              <b>{loading ? "Memproses…" : "Bayar Sekarang"}</b>
            </button>
            </>}
            <div className="step-actions">{step>1&&<button type="button" className="button button-outline" onClick={()=>{setError("");setStep(step-1)}}>Kembali</button>}{step<4&&<button type="button" className="button button-dark" onClick={nextStep}>Lanjut</button>}</div>
          </div>
          <aside className="order-summary">
            <span className="eyebrow">Ringkasan pesanan</span><h2>{product.name}</h2><p>{product.date}</p>
            <dl><div><dt>Harga tiket</dt><dd>{formatRupiah(product.price)} × {quantity}</dd></div><div><dt>Subtotal Tiket</dt><dd>{formatRupiah(subtotal)}</dd></div><div><dt>Donasi</dt><dd>{formatRupiah(finalDonation)}</dd></div><div><dt>Biaya Layanan</dt><dd>{formatRupiah(0)}</dd></div></dl>
            <div className="order-total"><span>Total sementara</span><strong aria-live="polite">{formatRupiah(subtotal + finalDonation)}</strong><small>Kode unik transfer ditentukan saat order dibuat.</small></div>
            <button className="button button-lime button-full" disabled={loading||step<4}>{loading ? "Membuat pesanan…" : step<4?"Selesaikan langkah di sebelah kiri":"Bayar Sekarang"}</button>
            <p className="secure-note"><Icon name="shield" />Harga divalidasi ulang ketika order dibuat.</p>
          </aside>
        </form>
      </main>
    </>
  );
}

const FormSection = ({ number, title, copy, children }) => <section className="form-section"><header><span>{number}</span><div><h2>{title}</h2><p>{copy}</p></div></header>{children}</section>;

function PaymentPage({ token, confirmOnly = false }) {
  const [order, setOrder] = useState(() => getOrderByToken(token));
  const [now, setNow] = useState(Date.now());
  const [proof, setProof] = useState(null);
  const [amount, setAmount] = useState(order?.total || "");
  const [transferredAt, setTransferredAt] = useState("");
  const [message, setMessage] = useState("");
  const [proofSubmitting, setProofSubmitting] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      expireStaleOrders();
      setOrder(getOrderByToken(token));
    }, 1000);
    return () => clearInterval(timer);
  }, [token]);
  if (!order) return <NotFound />;
  const remaining = Math.max(0, new Date(order.expiresAt).getTime() - now);
  const clock = [Math.floor(remaining / 3600000), Math.floor((remaining / 60000) % 60), Math.floor((remaining / 1000) % 60)].map((v) => String(v).padStart(2, "0")).join(":");
  const submitProof = async (event) => {
    event.preventDefault();
    if (!proof || !transferredAt) return setMessage("Lengkapi waktu transfer dan bukti pembayaran.");
    if (Number(amount) <= 0) return setMessage("Masukkan jumlah pembayaran yang valid.");
    if (proof.size > CHECKOUT_CONFIG.payment.proofMaxBytes) return setMessage("Ukuran bukti pembayaran melebihi 5 MB.");
    if (!["image/jpeg", "image/png", "application/pdf"].includes(proof.type)) return setMessage("Gunakan file JPG, PNG, atau PDF.");
    const transferTime = new Date(transferredAt).getTime();
    if (transferTime < new Date(order.createdAt).getTime() - 5 * 60000) return setMessage("Waktu transfer tidak boleh sebelum pesanan dibuat.");
    if (transferTime > Date.now() + 5 * 60000) return setMessage("Waktu transfer tidak boleh berada di masa depan.");
    setProofSubmitting(true);
    try {
      const attachment = await storePrivateFile(proof, `PAYMENT_PROOF:${order.id}`);
      const updated = submitPaymentProof(token, { ...attachment, claimedAmount: Number(amount), transferredAt });
      setOrder({ ...updated });
      setMessage("Konfirmasi pembayaran berhasil dikirim. Panitia akan memeriksa pembayaranmu.");
    } catch (submitError) {
      setMessage(submitError.message || "Bukti pembayaran belum dapat disimpan. Coba lagi.");
    } finally {
      setProofSubmitting(false);
    }
  };
  const statusLabel = {
    PENDING: "Menunggu pembayaran",
    UNDER_REVIEW: "Sedang diperiksa",
    SUCCESS: "Pembayaran berhasil",
    EXPIRED: "Waktu pembayaran berakhir",
    REJECTED: "Pembayaran ditolak",
  }[order.paymentStatus] || order.paymentStatus.replaceAll("_", " ");
  return (
    <>
      <Header checkout />
      <main className="payment-page"><div className="container payment-grid">
        <section className="payment-instruction">
          <span className={`payment-status ${order.paymentStatus.toLowerCase()}`}>{statusLabel}</span>
          <h1>{order.status === "PAID" ? "Pembayaran berhasil" : order.status === "PAYMENT_REVIEW" ? "Pembayaran sedang diperiksa" : order.status === "PAYMENT_REJECTED" ? "Konfirmasi pembayaran perlu diperbaiki" : order.status === "EXPIRED" ? "Waktu pembayaran telah berakhir" : "Total yang harus dibayarkan"}</h1>
          <div className="pay-amount">{formatRupiah(order.total)}</div>
          {["PENDING_PAYMENT", "PAYMENT_REJECTED"].includes(order.status) && <><p>Transfer sesuai nominal yang tertera, termasuk tiga digit terakhir.</p><div className="expiry"><span>Berakhir dalam</span><strong>{clock}</strong><small>Bayar sebelum {formatDateTime(order.expiresAt)}</small></div></>}
          {["PENDING_PAYMENT", "PAYMENT_REJECTED"].includes(order.status) && <><div className="bank-card"><span>{CHECKOUT_CONFIG.payment.bank}</span><strong>{CHECKOUT_CONFIG.payment.accountNumber}</strong><small>a.n. {CHECKOUT_CONFIG.payment.accountHolder}</small><button className="text-button" onClick={() => navigator.clipboard.writeText(CHECKOUT_CONFIG.payment.accountNumber)}><Icon name="copy" /> Salin rekening</button></div>
          <details open><summary>Mobile Banking</summary><ol><li>Buka aplikasi mobile banking.</li><li>Pilih menu transfer.</li><li>Masukkan nomor rekening tujuan.</li><li>Masukkan nominal termasuk kode unik.</li><li>Periksa nama penerima dan selesaikan transfer.</li><li>Simpan bukti pembayaran.</li></ol></details>
          <details><summary>ATM</summary><ol><li>Pilih menu transfer antarbank.</li><li>Masukkan rekening tujuan.</li><li>Masukkan nominal persis seperti total tagihan.</li><li>Simpan bukti transaksi.</li></ol></details></>}
          {order.status === "PENDING_PAYMENT" && !confirmOnly && <a className="button button-dark" href={`/payment/${token}/confirm`}>Konfirmasi Pembayaran</a>}
          {order.status === "PAYMENT_REJECTED" && <><div className="form-error"><strong>Alasan:</strong> {order.rejectionReason}</div>{!confirmOnly && <a className="button button-dark" href={`/payment/${token}/confirm`}>Kirim ulang bukti</a>}</>}
          {["PENDING_PAYMENT", "PAYMENT_REJECTED"].includes(order.status) && confirmOnly && <form className="proof-form" onSubmit={submitProof}><h2>{order.status === "PAYMENT_REJECTED" ? "Kirim Ulang Bukti Pembayaran" : "Konfirmasi Pembayaran"}</h2><label>Jumlah nominal pembayaran<input name="confirmedPaymentAmount" inputMode="numeric" type="number" min="1" required value={amount} onChange={(event) => setAmount(event.target.value)} /></label>{Number(amount) !== order.total && <p className="field-message">Nominal berbeda dari total tagihan {formatRupiah(order.total)} dan akan memerlukan pemeriksaan.</p>}<label>Tanggal dan waktu pembayaran<input name="paymentTransferredAt" type="datetime-local" required value={transferredAt} onChange={(event) => setTransferredAt(event.target.value)} /></label><label>Bukti pembayaran<input name="paymentProof" type="file" accept=".jpg,.jpeg,.png,.pdf" required onChange={(event) => setProof(event.target.files[0])} /></label><button className="button button-dark" disabled={proofSubmitting}>{proofSubmitting ? "Menyimpan bukti…" : "Kirim Konfirmasi"}</button></form>}
          {message && <div className="success-message" role="status">{message}</div>}
          {order.status === "EXPIRED" && <a className="button button-dark" href="/tiket">Pilih tiket lagi</a>}
          {order.status === "PAID" && <div className="ticket-link-list"><h2>Tiket digital</h2>{order.tickets.map((ticket, index) => <a className="button button-lime" href={`/ticket/${ticket.accessToken}`} key={ticket.id}>Lihat tiket {index + 1} · {ticket.attendee.fullName}</a>)}</div>}
        </section>
        <OrderBreakdown order={order} />
      </div></main>
    </>
  );
}

function OrderBreakdown({ order }) {
  const men = order.attendees.filter((item) => item.gender === "Laki-laki").length;
  const women = order.attendees.filter((item) => item.gender === "Perempuan").length;
  return <aside className="payment-summary"><span className="eyebrow">Rincian pembayaran</span><h2>{order.orderNumber}</h2><dl><div><dt>Tiket</dt><dd>{order.productSnapshot.name}</dd></div><div><dt>Jumlah</dt><dd>{order.quantity}</dd></div><div><dt>Subtotal Tiket</dt><dd>{formatRupiah(order.subtotal)}</dd></div><div><dt>Diskon</dt><dd>−{formatRupiah(order.discountAmount)}</dd></div><div><dt>Donasi</dt><dd>{formatRupiah(order.donation)}</dd></div><div><dt>Biaya Layanan</dt><dd>{formatRupiah(order.serviceFee)}</dd></div><div><dt>Kode Unik</dt><dd>{formatRupiah(order.uniqueCode)}</dd></div></dl><div className="order-total"><span>Total Pembayaran</span><strong>{formatRupiah(order.total)}</strong></div><div className="buyer-summary"><span>Data Pembeli</span><strong>{order.buyer.fullName}</strong><small>{order.buyer.email.replace(/(^.).+(@.*$)/, "$1••••$2")}</small><small>{order.buyer.phone.replace(/(\+\d{4})\d+(\d{3})$/, "$1••••$2")}</small><small>Pengunjung: {men} laki-laki · {women} perempuan</small></div></aside>;
}

function QrImage({ value }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let active = true;
    import("qrcode").then(({ default: QRCode }) => QRCode.toDataURL(value, { width: 320, margin: 3, color: { dark: "#032F22", light: "#FFFFFF" } })).then((result) => active && setSrc(result));
    return () => { active = false; };
  }, [value]);
  return src ? <img src={src} alt="QR tiket untuk check-in" width="256" height="256" /> : <div className="qr-loading">Membuat QR…</div>;
}

function TicketPage({ token }) {
  const result = getTicketByToken(token);
  if (!result) return <NotFound />;
  const { order, ticket } = result;
  const attendance = (order.productSnapshot.validDates || []).map((date) => {
    const checkIn = ticket.checkIns.find((item) => item.eventDate === date);
    const label = SCHEDULE.find((item) => item.date === date)?.label || date;
    return { date, label, checkIn };
  });
  const downloadCalendar = () => {
    const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", "UID:see26@saudieduexpo.id", "DTSTART;VALUE=DATE:20260731", "DTEND;VALUE=DATE:20260803", `SUMMARY:${EVENT.name}`, `LOCATION:${EVENT.venue}, ${EVENT.address}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "saudi-education-expo-2026.ics";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <main className="ticket-page">
      <div className="ticket-page-head"><Logo inverse /><span>Tiket Digital</span></div>
      <div className="wallet-pass">
        <header><img src={EVENT.logo} alt="Saudi Education Expo 2026" width="60" height="60" /><span className={`status ${ticket.status.toLowerCase()}`}>{ticket.status === "ACTIVE" ? "Aktif" : ticket.status.replaceAll("_", " ")}</span></header>
        <section><small>Nama pengunjung</small><h1>{ticket.attendee.fullName}</h1><p>{order.productSnapshot.name}</p></section>
        <div className="perforation" />
        <div className="qr-zone"><QrImage value={`${location.origin}/check-in/${ticket.checkinToken}`} /><strong>{ticket.code}</strong><span>Tunjukkan QR ini kepada petugas check-in</span></div>
        <dl><div><dt>Tanggal berlaku</dt><dd>{order.productSnapshot.validity}</dd></div><div><dt>Lokasi</dt><dd>{EVENT.venue}</dd></div></dl>
        <div className="attendance-history"><strong>Riwayat kehadiran</strong>{attendance.map((item) => <div key={item.date}><span>{item.label}</span><small>{item.checkIn ? `Check-in ${formatDateTime(item.checkIn.at)}` : "Belum check-in"}</small></div>)}</div>
      </div>
      <div className="ticket-actions"><button onClick={() => navigator.clipboard.writeText(ticket.code)}><Icon name="copy" />Salin kode</button><button onClick={() => window.print()}><Icon name="print" />Cetak / simpan PDF</button><a href={`https://wa.me/?text=${encodeURIComponent(`Tiket SEE 2026: ${location.href}`)}`} target="_blank" rel="noreferrer"><Icon name="arrow" />Bagikan via WhatsApp</a><a href={EVENT.mapUrl} target="_blank" rel="noreferrer"><Icon name="pin" />Google Maps</a><button onClick={downloadCalendar}><Icon name="calendar" />Tambah ke kalender</button></div>
      <div className="ticket-details"><details><summary>Informasi Event</summary><p>{EVENT.datesLabel}<br />{EVENT.venue}<br />{EVENT.address}</p></details><details><summary>Rincian Pembayaran</summary><p>{order.orderNumber}<br />Total: {formatRupiah(order.total)}<br />Dibayar: {formatDateTime(order.paidAt)}</p></details><details><summary>Syarat Tiket</summary><p>Satu QR berlaku untuk satu peserta. Bundle divalidasi satu kali per hari.</p></details></div>
    </main>
  );
}

function CheckInPage({ token }) {
  const [result, setResult] = useState(() => validateCheckInToken(token));
  const staffMode = sessionStorage.getItem("SEE26_STAFF_DEMO") === "true";
  const performCheckIn = () => setResult(confirmCheckIn(token));
  const ticket = result.ticket;
  return <main className="checkin-page">
    <div className="checkin-card">
      <Logo />
      <span className={`payment-status ${result.success ? "success" : "pending"}`}>{result.success ? "Tiket valid" : "Perlu perhatian"}</span>
      <h1>{result.message}</h1>
      {ticket && <div className="checkin-person"><span>Pengunjung</span><strong>{ticket.attendee.fullName}</strong><small>{result.order.productSnapshot.name}</small>{result.previous && <small>Check-in sebelumnya: {formatDateTime(result.previous.at)}</small>}</div>}
      {!staffMode && <div className="admin-warning">Konfirmasi check-in hanya tersedia setelah petugas mengaktifkan sesi scanner dari dashboard internal pada perangkat ini.</div>}
      {staffMode && result.success && <button className="button button-lime button-full" onClick={performCheckIn}>Konfirmasi Check-in</button>}
      <a className="text-cta" href={staffMode ? "/admin" : "/admin"}>{staffMode ? "Kembali ke dashboard" : "Masuk sebagai petugas"} <Icon name="arrow" /></a>
    </div>
  </main>;
}

function Terms() {
  const sections = [
    ["Ketentuan Umum", ["Tiket hanya berlaku untuk satu orang dan tidak dapat digunakan bersamaan oleh lebih dari satu orang.", "Tiket yang telah dibeli tidak dapat dikembalikan dan tidak dapat ditukar, kecuali kondisi tertentu yang ditetapkan panitia.", "Single Day Pass berlaku satu hari. Bundle Pass berlaku 31 Juli–2 Agustus 2026.", "Setiap tiket memiliki QR Code unik."]],
    ["Penggunaan Tiket dan Check-in", ["QR dapat ditunjukkan secara digital atau cetak.", "QR hanya dapat digunakan satu kali per hari.", "Panitia dapat menolak QR tidak valid, sudah digunakan, tidak berlaku, dibatalkan, atau belum dibayar.", "Bundle menggunakan satu QR dengan validasi harian ticketId + eventDate."]],
    ["Perubahan Jadwal dan Acara", ["Panitia dapat mengubah jadwal, susunan acara, atau narasumber.", "Dalam force majeure, acara dapat ditunda, dipindahkan, online, atau hybrid.", "Tiket mengikuti kebijakan lanjutan panitia."]],
    ["Keamanan dan Ketertiban", ["Pengunjung wajib menjaga keamanan dan ketertiban.", "Senjata, bahan peledak, narkotika, minuman keras, dan barang berbahaya dilarang.", "Pelanggaran dapat menyebabkan pengunjung dikeluarkan tanpa refund."]],
    ["Dokumentasi dan Publikasi", ["Panitia dapat mengambil foto dan video selama acara.", "Kehadiran memberikan izin penggunaan dokumentasi untuk publikasi, promosi, dan dokumentasi acara."]],
    ["Kehilangan dan Tanggung Jawab", ["Panitia tidak bertanggung jawab atas kehilangan atau kerusakan barang pribadi.", "Pengunjung bertanggung jawab atas barang masing-masing."]],
    ["Ketentuan Usia", AGE_POLICY],
  ];
  return <><Header checkout /><main className="legal-page container"><span className="eyebrow">Versi {CHECKOUT_CONFIG.termsVersion}</span><h1>Syarat dan Ketentuan Tiket<br />Saudi Education Expo 2026</h1><p>Dengan membeli dan/atau menggunakan tiket, pengunjung dianggap telah membaca, memahami, dan menyetujui ketentuan berikut.</p>{sections.map(([title, items], index) => <section key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><ol>{items.map((item) => <li key={item}>{item}</li>)}</ol></div></section>)}</main></>;
}

function AdminPage() {
  const [, render] = useState(0);
  const [staffMode, setStaffMode] = useState(() => sessionStorage.getItem("SEE26_STAFF_DEMO") === "true");
  const [rejectingToken, setRejectingToken] = useState("");
  const [rejectionReason, setRejectionReason] = useState("Nominal tidak sesuai");
  const database = getDatabase();
  const applications = getApplications();
  useEffect(() => {
    const handler = () => render((value) => value + 1);
    addEventListener("see26:database", handler);
    addEventListener("see26:applications", handler);
    return () => {
      removeEventListener("see26:database", handler);
      removeEventListener("see26:applications", handler);
    };
  }, []);
  const enableStaff = () => {
    sessionStorage.setItem("SEE26_STAFF_DEMO", "true");
    setStaffMode(true);
  };
  return <main className="admin-page">
    <header><Logo /><div><span>Operasional pengembangan</span><strong>{database.orders.length} pesanan · {applications.length} pengajuan</strong></div></header>
    <div className="admin-content">
      <h1>Review pembayaran</h1>
      <p className="admin-warning">Mode demonstrasi lokal. Autentikasi, database server, penyimpanan privat, email, gateway, dan identitas audit tetap wajib sebelum penjualan publik.</p>
      <div className="admin-toolbar"><button className={`button ${staffMode ? "button-outline" : "button-dark"}`} onClick={enableStaff} disabled={staffMode}>{staffMode ? "Mode petugas aktif di perangkat ini" : "Aktifkan mode petugas demo"}</button></div>
      {database.orders.length ? <div className="admin-orders">{database.orders.map((order) => <article key={order.id}>
        <div><span className={`payment-status ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus.replaceAll("_", " ")}</span><h2>{order.orderNumber}</h2><p>{order.buyer.fullName} · {order.productSnapshot.name} · {formatRupiah(order.total)}</p>{order.proof && <button className="text-button" onClick={() => openPrivateFile(order.proof.id)}>Buka bukti · {order.proof.name}</button>}</div>
        <div>{order.status === "PAYMENT_REVIEW" && rejectingToken !== order.publicToken && <><button className="button button-dark" onClick={() => approvePayment(order.publicToken)}>Setujui</button><button className="button button-outline" onClick={() => setRejectingToken(order.publicToken)}>Tolak</button></>}{rejectingToken === order.publicToken && <div className="admin-reject"><label>Alasan penolakan<select value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)}><option>Nominal tidak sesuai</option><option>Bukti pembayaran tidak terbaca</option><option>Pembayaran tidak ditemukan</option><option>Rekening tujuan tidak sesuai</option><option>Bukti pembayaran duplikat</option><option>Pembayaran melewati batas waktu</option></select></label><button className="button button-dark" onClick={() => { rejectPayment(order.publicToken, rejectionReason); setRejectingToken(""); }}>Konfirmasi penolakan</button><button className="text-button" onClick={() => setRejectingToken("")}>Batal</button></div>}{order.status === "PAID" && <button className="button button-outline" onClick={() => navigate(`/order/${order.publicToken}`)}>Lihat semua tiket</button>}<button className="text-button" onClick={() => navigate(`/payment/${order.publicToken}`)}>Buka pesanan</button></div>
      </article>)}</div> : <div className="empty-state">Belum ada pesanan lokal.</div>}
      <h2 className="admin-section-title">Kemitraan & Lembaga</h2>
      {applications.length ? <div className="admin-orders">{applications.map((application) => <article key={application.id}><div><span className="payment-status pending">{application.type}</span><h2>{application.number}</h2><p>{application.data.organizationName || application.data.brandName || application.data.institutionName}</p>{application.attachments?.map((attachment) => <button className="text-button" key={attachment.id} onClick={() => openPrivateFile(attachment.id)}>Buka {attachment.name}</button>)}</div><div><strong>{application.status}</strong>{application.status === "SUBMITTED" && <button className="text-button" onClick={() => updateApplicationStatus(application.token, "UNDER_REVIEW")}>Mulai review</button>}{application.status === "UNDER_REVIEW" && <><button className="button button-dark" onClick={() => updateApplicationStatus(application.token, application.type === "SPONSORSHIP" ? "CONFIRMED" : "APPROVED")}>Setujui</button><button className="button button-outline" onClick={() => updateApplicationStatus(application.token, "REJECTED")}>Tolak</button></>}</div></article>)}</div> : <div className="empty-state">Belum ada pengajuan.</div>}
      <details className="handoff"><summary>Aset dan keputusan organizer yang belum tersedia</summary><ul>{[...MISSING_ASSETS, ...EVENT.unresolved].map((item) => <li key={item}>{item}</li>)}</ul></details>
    </div>
  </main>;
}

function NotFound() {
  return <main className="not-found"><img src={EVENT.logo} alt="" width="90" height="90" /><span>404</span><h1>Halaman tidak ditemukan.</h1><a className="button button-dark" href="/">Kembali ke beranda</a></main>;
}

export default function App() {
  const path = useRoute();
  useEffect(() => {
    const labels = {
      "/": "Saudi Education Expo 2026",
      "/tentang": "Tentang SEE 2026",
      "/kegiatan": "Kegiatan SEE 2026",
      "/jadwal": "Jadwal SEE 2026",
      "/pembicara": "Pembicara SEE 2026",
      "/tiket": "Tiket SEE 2026",
      "/mitra": "Mitra SEE 2026",
      "/lokasi": "Lokasi SEE 2026",
      "/dokumentasi": "Dokumentasi Saudi Expo",
      "/faq": "FAQ SEE 2026",
      "/syarat-ketentuan": "Syarat Tiket SEE 2026",
      "/terms": "Syarat Tiket SEE 2026",
      "/kebijakan-privasi": "Kebijakan Privasi SEE 2026",
      "/checkout": "Checkout Tiket SEE 2026",
      "/payment": "Pembayaran Tiket SEE 2026",
      "/order": "Status Pesanan SEE 2026",
      "/ticket": "Tiket Digital SEE 2026",
      "/check-in": "Validasi Tiket SEE 2026",
      "/kemitraan": "Kolaborasi SEE 2026",
      "/lembaga": "Pendaftaran Lembaga SEE 2026",
    };
    const prefix = Object.keys(labels).find((route) => route !== "/" && path.startsWith(route));
    document.title = `${labels[path] || labels[prefix] || "Halaman tidak ditemukan"} | Saudi Education Expo`;
  }, [path]);
  if (path === "/checkout") return <Checkout />;
  if (path.startsWith("/payment/") && path.endsWith("/confirm")) return <PaymentPage token={path.split("/")[2]} confirmOnly />;
  if (path.startsWith("/payment/")) return <PaymentPage token={path.split("/")[2]} />;
  if (path.startsWith("/order/")) return <PaymentPage token={path.split("/")[2]} />;
  if (path.startsWith("/check-in/")) return <CheckInPage token={path.split("/")[2]} />;
  if (path.startsWith("/ticket/")) return <TicketPage token={path.split("/")[2]} />;
  if (path === "/tentang") return <AboutPage />;
  if (path === "/kegiatan") return <ActivitiesPage />;
  if (path === "/jadwal") return <SchedulePage />;
  if (path === "/pembicara") return <SpeakersPage />;
  if (path === "/tiket") return <TicketsPage />;
  if (path === "/mitra") return <PartnersPage />;
  if (path === "/lokasi") return <LocationPage />;
  if (path === "/dokumentasi") return <DocumentationPage />;
  if (path === "/faq") return <FaqPage />;
  if (path === "/syarat-ketentuan" || path === "/terms") return <Terms />;
  if (path === "/kebijakan-privasi") return <PrivacyPage />;
  if (path === "/kemitraan") return <PartnershipLanding />;
  if (path === "/kemitraan/sponsorship") return <SponsorshipPage />;
  if (path === "/kemitraan/booth") return <BoothPage />;
  if (path === "/lembaga") return <InstitutionLanding />;
  if (path === "/lembaga/daftar/ikhwan") return <InstitutionFormPage group="IKHWAN" />;
  if (path === "/lembaga/daftar/akhwat") return <InstitutionFormPage group="AKHWAT" />;
  if (path.startsWith("/kemitraan/status/")) return <ApplicationStatusPage token={path.split("/")[3]} />;
  if (path.startsWith("/lembaga/status/")) return <ApplicationStatusPage token={path.split("/")[3]} />;
  if (path === "/admin") return <AdminPage />;
  if (path !== "/") return <NotFound />;
  return <Landing />;
}
