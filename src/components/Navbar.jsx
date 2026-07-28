import React from "react";

export function Logo({ light = false }) {
  return (
    <a className={`logo ${light ? "light" : ""}`} href="#top" aria-label="Saudi Education Expo 2026">
      <span className="logo-mark">
        SEE<span>26</span>
      </span>
      <span className="logo-copy">
        <b>Saudi Education</b>
        <small>Expo 2026 · Jakarta</small>
      </span>
    </a>
  );
}

export function Navbar({ activeMode, setActiveMode, menuOpen, setMenuOpen, onBuyClick }) {
  return (
    <header className="nav-shell">
      <nav className="nav wrap">
        <Logo light />

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#tentang" onClick={() => setMenuOpen(false)}>Tentang</a>
          <a href="#program" onClick={() => setMenuOpen(false)}>Program</a>
          <a href="#beasiswa" onClick={() => setMenuOpen(false)}>Beasiswa</a>
          <a href="#rundown" onClick={() => setMenuOpen(false)}>Rundown</a>
          <a href="#tiket" onClick={() => setMenuOpen(false)}>Tiket</a>
          <a href="#venue" onClick={() => setMenuOpen(false)}>Venue</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>

          <div className="nav-mode-pills">
            <button
              className={`mode-pill ${activeMode === "lookup" ? "active" : ""}`}
              onClick={() => {
                setActiveMode("lookup");
                setMenuOpen(false);
              }}
            >
              🔍 Cek Tiket
            </button>
            <button
              className={`mode-pill admin ${activeMode === "admin" ? "active" : ""}`}
              onClick={() => {
                setActiveMode("admin");
                setMenuOpen(false);
              }}
            >
              🔐 Admin Panitia
            </button>
          </div>

          <button
            className="button nav-cta"
            onClick={() => {
              onBuyClick();
              setMenuOpen(false);
            }}
          >
            Beli Tiket
            <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16">
              <path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <button
          className="menu-button"
          aria-label="Buka menu navigasi"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
        </button>
      </nav>
    </header>
  );
}
