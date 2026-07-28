import React from "react";
import { Icon } from "./Icons";

export function Partners() {
  return (
    <section className="section-block partner-section" id="dukungan">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-label">Dukungan kelembagaan & partner</span>
            <h2>Disusun melalui kolaborasi komunitas pelajar Saudi.</h2>
            <p>Saudi Education Expo merupakan agenda kolaboratif PPMI Saudi dan organisasi wilayahnya, dengan pelaksanaan melalui kepanitiaan independen.</p>
          </div>
        </div>
        <div className="support-grid">
          <article><span className="quick-icon"><Icon name="users" /></span><small>Inisiator kolaborasi</small><h3>PPMI Saudi</h3></article>
          <article><span className="quick-icon"><Icon name="map" /></span><small>Jaringan kolaborasi</small><h3>Organisasi wilayah PPMI Saudi</h3></article>
          <article className="is-pending"><span className="quick-icon"><Icon name="university" /></span><small>Partner resmi lainnya</small><h3>Segera diumumkan</h3></article>
        </div>
      </div>
    </section>
  );
}
