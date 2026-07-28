import React, { useState } from "react";
import { getStoredDatabase } from "../utils/storage";

export function TicketLookupModal({ onClose, onOpenPass }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [foundAccessToken, setFoundAccessToken] = useState(null);

  const handleLookup = (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!orderNumber.trim() || !email.trim()) {
      setIsError(true);
      return setMessage("Silakan isi Nomor Pesanan dan Email.");
    }

    const db = getStoredDatabase();
    const matched = db.orders.find(
      (o) =>
        o.orderNumber.trim().toUpperCase() === orderNumber.trim().toUpperCase() &&
        o.buyerEmail.trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (matched) {
      setFoundAccessToken(matched.accessToken);
      setMessage(`Pesanan ${matched.orderNumber} ditemukan! Status: ${matched.status}`);
    } else {
      setIsError(true);
      setMessage("Data pesanan tidak ditemukan. Periksa kembali Nomor Pesanan & Email.");
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="ticket-modal lookup-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup pencarian">
          ×
        </button>

        <div className="eyebrow">
          <span /> BANTUAN TIKET SAYA
        </div>
        <h2>Cari & Kirim Ulang Tiket</h2>
        <p>
          Lupa menyimpan tiket digital? Masukkan nomor pesanan (contoh: <code>SE26-8F4K2P</code>) dan alamat email pembelian kamu.
        </p>

        {message && (
          <div className={`lookup-alert ${isError ? "error" : "success"}`}>
            {message}
          </div>
        )}

        {!foundAccessToken ? (
          <form onSubmit={handleLookup}>
            <label>
              Nomor Pesanan (Order Number) *
              <input
                type="text"
                placeholder="SE26-8F4K2P"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
              />
            </label>

            <label>
              Email Pembelian *
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="button primary wide">
              Cari Tiket Saya
            </button>
            <small>🔒 Proteksi Rate Limit & Privasi Data Terjamin</small>
          </form>
        ) : (
          <div className="found-ticket-box">
            <p>Tiket aktif ditemukan!</p>
            <button
              className="button primary wide"
              onClick={() => {
                onClose();
                onOpenPass(foundAccessToken);
              }}
            >
              🎟️ Buka Tiket Digital Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
