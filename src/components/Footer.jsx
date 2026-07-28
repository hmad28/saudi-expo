import React, { useState } from "react";
import { Logo } from "./Navbar";
import { Pattern } from "./About";

export function Footer({ onBuyClick }) {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      <section className="closing">
        <Pattern />
        <div className="wrap closing-content reveal visible">
          <span className="closing-kicker">31 JULI — 02 AGUSTUS 2026 · SMESCO JAKARTA</span>
          <h2>
            Masa depan studimu di Saudi<br />
            dimulai <em>di sini.</em>
          </h2>
          <p>Amankan kursimu sekarang. Dapatkan jawaban pasti dan alur pendaftaran beasiswa yang jelas.</p>
          <button className="button primary large" onClick={onBuyClick}>
            Beli Tiket Sekarang
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

      <footer>
        <div className="wrap footer-top">
          <Logo light />
          <div className="footer-nav">
            <a href="#tentang">Tentang</a>
            <a href="#program">Program</a>
            <a href="#beasiswa">Beasiswa</a>
            <a href="#rundown">Rundown</a>
            <a href="#tiket">Tiket</a>
            <a href="#venue">Venue</a>
          </div>
          <div className="socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">YouTube PPMI ↗</a>
            <a href="mailto:info@saudiexpo.id">info@saudiexpo.id ↗</a>
          </div>
        </div>

        <div className="wrap footer-bottom">
          <span>© 2026 Saudi Education Expo (SEE26) · PPMI Arab Saudi & Affiliates. All Rights Reserved.</span>
          <div>
            <button className="text-button" onClick={() => setActiveModal("privacy")}>Kebijakan Privasi</button>
            <button className="text-button" onClick={() => setActiveModal("terms")}>Syarat & Ketentuan</button>
            <button className="text-button" onClick={() => setActiveModal("refund")}>Kebijakan Refund</button>
          </div>
        </div>
      </footer>

      {activeModal && (
        <div className="modal-backdrop" onMouseDown={() => setActiveModal(null)}>
          <div className="policy-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            {activeModal === "privacy" && (
              <div>
                <h2>Kebijakan Privasi</h2>
                <p>Data pribadi pembeli dan peserta (Nama, Email, WhatsApp, Instansi) hanya digunakan untuk kepentingan pendaftaran, penerbitan tiket digital, verifikasi check-in gate, serta pengiriman informasi resmi seputar Saudi Education Expo 2026.</p>
                <p>Data tidak dijual atau dibagikan kepada pihak ketiga di luar kepanitiaan resmi SEE26 dan portal Study in Saudi.</p>
              </div>
            )}
            {activeModal === "terms" && (
              <div>
                <h2>Syarat & Ketentuan Pembelian</h2>
                <p>1. Satu tiket berlaku penuh untuk 3 hari pelaksanaan event (31 Juli - 2 Agustus 2026).</p>
                <p>2. Tiket digital dan QR Code unik akan dikirimkan otomatis setelah pembayaran terverifikasi.</p>
                <p>3. Peserta wajib menunjukkan QR Code resmi saat melalui gate check-in di SMESCO Hall.</p>
                <p>4. Dilarang menduplikasi atau menyebarluaskan QR Code tiket kepada pihak yang tidak berkepentingan.</p>
              </div>
            )}
            {activeModal === "refund" && (
              <div>
                <h2>Kebijakan Refund & Pembatalan</h2>
                <p>Seluruh transaksi tiket yang telah berhasil diproses bersifat final dan non-refundable (tidak dapat diuangkan kembali), kecuali apabila terjadi pembatalan total event oleh pihak penyelenggara.</p>
                <p>Koreksi nama peserta karena kesalahan ketik dapat diajukan kepada tim panitia melalui email support@saudiexpo.id.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
