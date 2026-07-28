import React from "react";
import { Icon } from "./Icons";

export function Speakers() {
  return (
    <section className="section-block speakers-section" id="pembicara">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-label">Pembicara & institusi peserta</span>
            <h2>Menunggu konfirmasi resmi.</h2>
            <p>Nama pembicara, kampus, dan institusi hanya akan ditampilkan setelah diumumkan oleh penyelenggara.</p>
          </div>
        </div>
        <div className="dual-announcement">
          <div className="announcement-state"><span className="announcement-icon"><Icon name="users" size={26} /></span><div><small>Pembicara</small><h3>Segera diumumkan</h3><p>Line-up resmi belum dipublikasikan.</p></div></div>
          <div className="announcement-state"><span className="announcement-icon"><Icon name="university" size={26} /></span><div><small>Institusi peserta</small><h3>Segera diumumkan</h3><p>Daftar institusi terkonfirmasi belum dipublikasikan.</p></div></div>
        </div>
      </div>
    </section>
  );
}
