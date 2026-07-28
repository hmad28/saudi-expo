import React, { useState } from "react";
import { getStoredDatabase } from "../utils/storage";
import { Icon } from "./Icons";

export function TicketLookupModal({ onClose, onOpenPass }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [accessToken, setAccessToken] = useState(null);

  const lookup = (event) => {
    event.preventDefault();
    const db = getStoredDatabase();
    const order = db.orders.find((item) =>
      item.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase()
      && item.buyerEmail.toLowerCase() === email.trim().toLowerCase()
    );
    if (!order) {
      setAccessToken(null);
      setMessage("Detail pesanan belum cocok. Periksa nomor pesanan dan email.");
      return;
    }
    setAccessToken(order.accessToken);
    setMessage("Pesanan ditemukan. Kamu dapat membuka digital pass.");
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="lookup-modal" role="dialog" aria-modal="true" aria-labelledby="lookup-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <span className="lookup-icon"><Icon name="ticket" /></span>
          <div><small>Bantuan tiket</small><h2 id="lookup-title">Buka kembali tiketmu</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Tutup pencarian tiket"><Icon name="close" /></button>
        </header>
        <p>Gunakan nomor pesanan dan email yang sama saat checkout.</p>
        <form onSubmit={lookup}>
          <label>Nomor pesanan<input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} autoComplete="off" placeholder="Contoh: SE26-8F4K2P…" required /></label>
          <label>Email pembelian<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" spellCheck="false" placeholder="nama@email.com…" required /></label>
          {message && <div className={`lookup-message ${accessToken ? "is-success" : ""}`} aria-live="polite">{message}</div>}
          {!accessToken ? (
            <button className="btn btn-primary btn-full" type="submit">Cari Tiket <Icon name="search" /></button>
          ) : (
            <button className="btn btn-primary btn-full" type="button" onClick={() => onOpenPass(accessToken)}>Buka Digital Pass <Icon name="arrow" /></button>
          )}
        </form>
        <small className="lookup-note"><Icon name="shield" size={16} />Jangan bagikan nomor pesanan dan akses tiket kepada orang lain.</small>
      </section>
    </div>
  );
}
