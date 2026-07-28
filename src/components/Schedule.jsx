import React from "react";
import { Icon } from "./Icons";

export function Schedule() {
  return (
    <section className="section-block agenda-section" id="agenda">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-label">Agenda resmi</span>
            <h2>Rundown sedang disiapkan.</h2>
            <p>Jadwal sesi, waktu, dan pembagian area akan ditampilkan setelah dikonfirmasi oleh panitia.</p>
          </div>
        </div>
        <div className="announcement-state">
          <span className="announcement-icon"><Icon name="calendar" size={26} /></span>
          <div><small>Status informasi</small><h3>Segera diumumkan</h3><p>Pantau kanal resmi Saudi Education Expo untuk pembaruan agenda.</p></div>
        </div>
      </div>
    </section>
  );
}
