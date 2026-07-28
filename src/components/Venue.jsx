import React from "react";
import { Icon } from "./Icons";

export function Venue() {
  return (
    <section className="section-block venue-section" id="venue">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-label">Lokasi event</span>
            <h2>Mudah dijangkau dari berbagai arah.</h2>
          </div>
        </div>
        <article className="venue-card">
          <div className="venue-image-wrap">
            <img src="/smesco-venue.webp" alt="SMESCO Exhibition and Convention Hall" width="1200" height="670" loading="lazy" />
            <span className="map-pin"><Icon name="pin" size={21} /></span>
          </div>
          <div className="venue-content">
            <span className="venue-tag">SMESCO Indonesia</span>
            <h3>SMESCO Indonesia, Jakarta</h3>
            <p>Lokasi penyelenggaraan Saudi Education Expo 2026 yang telah dikonfirmasi oleh penyelenggara.</p>
            <div className="venue-facts">
              <div><Icon name="calendar" /><span><small>Tanggal</small><strong>31 Jul–2 Agu 2026</strong></span></div>
              <div><Icon name="pin" /><span><small>Kota</small><strong>Jakarta</strong></span></div>
            </div>
            <a className="btn btn-primary" href="https://maps.google.com/?q=SMESCO+Indonesia+Jakarta" target="_blank" rel="noreferrer">
              Buka di Google Maps <Icon name="arrow" size={18} />
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
