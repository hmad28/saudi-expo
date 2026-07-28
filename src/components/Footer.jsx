import React from "react";
import { Logo } from "./Navbar";
import { Icon } from "./Icons";

export function Footer({ onTicketClick }) {
  return (
    <>
      <section className="final-cta">
        <div className="shell final-cta-card">
          <div>
            <span className="section-label">Agenda tahunan Saudi Expo</span>
            <h2>Siapkan langkah studimu ke Arab Saudi.</h2>
            <p>31 Juli–2 Agustus 2026 · SMESCO Indonesia, Jakarta</p>
          </div>
          <button className="btn btn-primary btn-large" onClick={onTicketClick}>Lihat Informasi Tiket <Icon name="arrow" /></button>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-main">
          <div><Logo /><p>Agenda tahunan informasi pendidikan Arab Saudi untuk masyarakat Indonesia.</p></div>
          <nav aria-label="Navigasi footer">
            <strong>Event</strong>
            <a href="#sejarah">Sejarah</a>
            <a href="#aktivitas">Aktivitas</a>
            <a href="#agenda">Agenda</a>
            <a href="#tiket">Tiket</a>
          </nav>
          <nav aria-label="Informasi">
            <strong>Informasi</strong>
            <a href="#pembicara">Pembicara & institusi</a>
            <a href="#dokumentasi">Dokumentasi 2025</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="footer-contact">
            <strong>Kanal resmi</strong>
            <a href="https://instagram.com/saudieduexpo.id" target="_blank" rel="noreferrer">@saudieduexpo.id</a>
            <small>Kebijakan dan kontak resmi lainnya segera diumumkan.</small>
          </div>
        </div>
        <div className="shell footer-bottom"><span>© 2026 Saudi Education Expo</span><span>Agenda kolaboratif PPMI Saudi dan organisasi wilayah</span></div>
      </footer>
    </>
  );
}
