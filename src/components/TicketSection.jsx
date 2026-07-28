import React from "react";
import { Icon } from "./Icons";

export function TicketSection() {
  return (
    <section className="section-block ticket-section" id="tiket">
      <div className="shell">
        <div className="ticket-announcement">
          <div>
            <span className="section-label">Tiket Saudi Education Expo 2026</span>
            <h2>Informasi tiket segera diumumkan.</h2>
            <p>Kategori, harga, benefit, periode penjualan, dan kuota akan ditampilkan setelah ditetapkan secara resmi oleh penyelenggara.</p>
            <div className="ticket-principles">
              <span><Icon name="shield" size={17} />Informasi resmi saja</span>
              <span><Icon name="ticket" size={17} />Checkout tanpa akun</span>
            </div>
          </div>
          <div className="ticket-notify">
            <span className="announcement-icon"><Icon name="mail" size={26} /></span>
            <small>Status penjualan</small>
            <strong>Segera diumumkan</strong>
            <a className="btn btn-primary btn-full" href="https://instagram.com/saudieduexpo.id" target="_blank" rel="noreferrer">Pantau Instagram Resmi <Icon name="arrow" size={18} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
