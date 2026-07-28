import React from "react";

export function Logo() {
  return (
    <a className="brand" href="#top" aria-label="Saudi Education Expo 2026">
      <span className="brand-mark">SEE</span>
      <span className="brand-copy">
        <strong>Saudi Education Expo</strong>
        <small>Jakarta · 2026</small>
      </span>
    </a>
  );
}
export function Navbar({ menuOpen, setMenuOpen, onTicketClick }) {
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <nav className="site-nav shell" aria-label="Navigasi utama">
        <Logo />
        <div className={`nav-menu ${menuOpen ? "is-open" : ""}`}>
          <a href="#tentang" onClick={closeMenu}>Tentang</a>
          <a href="#sejarah" onClick={closeMenu}>Sejarah</a>
          <a href="#agenda" onClick={closeMenu}>Agenda</a>
          <a href="#tiket" onClick={closeMenu}>Tiket</a>
          <a href="#venue" onClick={closeMenu}>Lokasi</a>
          <button
            className="btn btn-primary nav-buy"
            onClick={() => {
              onTicketClick();
              closeMenu();
            }}
          >
            Info Tiket
          </button>
        </div>
        <button
          className="nav-toggle"
          aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
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
