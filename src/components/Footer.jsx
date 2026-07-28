import React, { useState } from "react";
import { Logo } from "./Navbar";
import { Icon } from "./Icons";

export function Footer({ onBuyClick }) {
  const [policy, setPolicy] = useState(null);

  return (
    <>
      <section className="final-cta">
        <div className="shell final-cta-card">
          <div>
            <span className="section-label">31 Juli–2 Agustus 2026</span>
            <h2>Siap menemukan jalur studimu?</h2>
            <p>Amankan tiket dan siapkan pertanyaan yang ingin kamu bawa ke expo.</p>
          </div>
          <button className="btn btn-primary btn-large" onClick={onBuyClick}>Beli Tiket Sekarang <Icon name="arrow" /></button>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-main">
          <div>
            <Logo />
            <p>Festival pendidikan dan beasiswa Arab Saudi untuk pelajar Indonesia.</p>
          </div>
          <nav aria-label="Navigasi footer">
            <strong>Event</strong>
            <a href="#tentang">Tentang</a>
            <a href="#agenda">Agenda</a>
            <a href="#pembicara">Pembicara</a>
            <a href="#tiket">Tiket</a>
          </nav>
          <nav aria-label="Informasi">
            <strong>Bantuan</strong>
            <button onClick={() => setPolicy("privacy")}>Privasi</button>
            <button onClick={() => setPolicy("terms")}>Syarat pembelian</button>
            <button onClick={() => setPolicy("refund")}>Kebijakan refund</button>
          </nav>
          <div className="footer-contact">
            <strong>Kontak</strong>
            <a href="mailto:info@saudiexpo.id">info@saudiexpo.id</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Saudi Education Expo</span>
          <span>SMESCO Indonesia · Jakarta</span>
        </div>
      </footer>

      {policy && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPolicy(null)}>
          <div className="policy-modal" role="dialog" aria-modal="true" aria-label="Informasi kebijakan" onMouseDown={(event) => event.stopPropagation()}>
            <button className="icon-button modal-close" onClick={() => setPolicy(null)} aria-label="Tutup kebijakan"><Icon name="close" /></button>
            {policy === "privacy" && <>
              <h2>Kebijakan Privasi</h2>
              <p>Data pembeli dan peserta digunakan untuk pemesanan, penerbitan tiket, komunikasi event, dan proses check-in.</p>
              <p>Implementasi produksi wajib menyimpan data pada infrastruktur aman dan membatasi akses berdasarkan peran panitia.</p>
            </>}
            {policy === "terms" && <>
              <h2>Syarat Pembelian</h2>
              <p>Satu tiket berlaku sesuai kategori dan benefit yang dipilih. Tiket aktif setelah pembayaran berhasil diverifikasi.</p>
              <p>QR bersifat unik dan tidak boleh disebarkan kepada pihak lain.</p>
            </>}
            {policy === "refund" && <>
              <h2>Kebijakan Refund</h2>
              <p>Transaksi yang berhasil bersifat final, kecuali event dibatalkan oleh penyelenggara. Perubahan nama dapat diajukan sebelum check-in.</p>
            </>}
          </div>
        </div>
      )}
    </>
  );
}
