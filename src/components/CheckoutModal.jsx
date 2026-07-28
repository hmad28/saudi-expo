import React, { useMemo, useState } from "react";
import { createOrder } from "../utils/storage";
import { Icon } from "./Icons";

const emptyAttendee = { fullName: "", institution: "" };
const paymentMethods = [
  ["QRIS", "QRIS", "Scan dari aplikasi bank atau e-wallet"],
  ["Virtual Account BCA", "Virtual Account", "BCA, Mandiri, BNI, dan BRI"],
  ["Kartu Kredit / Debit", "Kartu", "Visa dan Mastercard"],
];

export function CheckoutModal({ ticket, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [ticketCount, setTicketCount] = useState(1);
  const [buyer, setBuyer] = useState({
    fullName: "",
    email: "",
    confirmEmail: "",
    phone: "",
    city: "",
    institution: "",
    category: "Pelajar SMA/MA",
    agreeTerms: false,
  });
  const [attendees, setAttendees] = useState([{ ...emptyAttendee }]);
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const pricing = useMemo(() => {
    const subtotal = ticket.price * ticketCount;
    const adminFee = 5000;
    const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
    return { subtotal, adminFee, discount, total: subtotal + adminFee - discount };
  }, [ticket.price, ticketCount, promoApplied]);

  const formatMoney = (value) => `Rp${value.toLocaleString("id-ID")}`;
  const changeBuyer = (key, value) => setBuyer((current) => ({ ...current, [key]: value }));

  const changeCount = (nextCount) => {
    const count = Math.min(ticket.maxPerOrder || 5, Math.max(1, nextCount));
    setTicketCount(count);
    setAttendees((current) => {
      const next = current.slice(0, count);
      while (next.length < count) next.push({ ...emptyAttendee });
      return next;
    });
  };

  const goToBuyer = () => {
    setMessage("");
    setStep(2);
  };

  const submitBuyer = (event) => {
    event.preventDefault();
    setMessage("");
    if (buyer.email.trim().toLowerCase() !== buyer.confirmEmail.trim().toLowerCase()) {
      setMessage("Email dan konfirmasi email belum sama.");
      return;
    }
    if (!buyer.agreeTerms) {
      setMessage("Setujui syarat pembelian untuk melanjutkan.");
      return;
    }
    setAttendees((current) => current.map((attendee, index) => index === 0 && !attendee.fullName
      ? { fullName: buyer.fullName, institution: buyer.institution }
      : attendee));
    setStep(3);
  };

  const submitAttendees = (event) => {
    event.preventDefault();
    const incomplete = attendees.findIndex((attendee) => !attendee.fullName.trim());
    if (incomplete !== -1) {
      setMessage(`Lengkapi nama peserta ${incomplete + 1}.`);
      return;
    }
    setMessage("");
    setStep(4);
  };

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "SAUDI2026") {
      setPromoApplied(true);
      setMessage("Promo 10% berhasil digunakan.");
    } else {
      setPromoApplied(false);
      setMessage("Kode promo belum valid.");
    }
  };

  const pay = () => {
    setProcessing(true);
    setMessage("");
    window.setTimeout(() => {
      try {
        const orderResult = createOrder({
          buyerData: buyer,
          ticketType: ticket,
          ticketCount,
          attendeesData: attendees,
          paymentMethod,
          discountCode: promoApplied ? "SAUDI2026" : "",
        });
        setResult(orderResult);
        setStep(5);
      } catch (error) {
        setMessage(error.message || "Pesanan belum dapat diproses.");
      } finally {
        setProcessing(false);
      }
    }, 900);
  };

  const summary = (
    <div className="order-summary">
      <div className="summary-ticket">
        <span className="ticket-badge">{ticket.featured ? "Paling diminati" : "Tiket SEE26"}</span>
        <h3>{ticket.name}</h3>
        <p>{ticketCount} tiket · berlaku 3 hari</p>
      </div>
      <div className="summary-lines">
        <div><span>Subtotal</span><strong>{formatMoney(pricing.subtotal)}</strong></div>
        <div><span>Biaya layanan</span><strong>{formatMoney(pricing.adminFee)}</strong></div>
        {pricing.discount > 0 && <div className="discount-line"><span>Diskon</span><strong>−{formatMoney(pricing.discount)}</strong></div>}
      </div>
      <div className="summary-total"><span>Total pembayaran</span><strong>{formatMoney(pricing.total)}</strong></div>
      <p className="summary-secure"><Icon name="shield" size={17} />Data dan pembayaran diproses secara aman.</p>
    </div>
  );

  return (
    <div className="modal-backdrop checkout-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="checkout-header">
          <div>
            <span>Checkout SEE26</span>
            <h2 id="checkout-title">{step === 5 ? "Pesanan berhasil" : "Selesaikan pemesanan"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Tutup checkout"><Icon name="close" /></button>
        </header>

        {step < 5 && (
          <div className="checkout-progress" aria-label={`Langkah ${step} dari 4`}>
            {["Tiket", "Pembeli", "Peserta", "Bayar"].map((label, index) => (
              <div className={step >= index + 1 ? "is-active" : ""} key={label}>
                <span>{index + 1}</span><small>{label}</small>
              </div>
            ))}
          </div>
        )}

        {step < 5 && (
          <details className="mobile-order-summary">
            <summary><span>Ringkasan pesanan</span><strong>{formatMoney(pricing.total)}</strong></summary>
            {summary}
          </details>
        )}

        {message && <div className={`form-message ${promoApplied ? "is-success" : ""}`} aria-live="polite">{message}</div>}

        {step === 5 && result ? (
          <div className="checkout-success">
            <span className="success-icon"><Icon name="check" size={30} /></span>
            <h3>Pembayaran berhasil.</h3>
            <p>Digital pass untuk {ticketCount} peserta sudah dibuat.</p>
            <div><span>Nomor pesanan</span><strong>{result.order.orderNumber}</strong></div>
            <button className="btn btn-primary btn-full" onClick={() => onSuccess(result.accessToken)}>
              Buka Digital Pass <Icon name="arrow" />
            </button>
          </div>
        ) : (
          <div className="checkout-layout">
            <div className="checkout-content">
              {step === 1 && (
                <div className="checkout-step">
                  <span className="form-label">Tiket dipilih</span>
                  <div className="selected-ticket">
                    <div><h3>{ticket.name}</h3><p>{ticket.note}</p></div>
                    <strong>{formatMoney(ticket.price)}</strong>
                  </div>
                  <label className="form-label" htmlFor="ticket-quantity">Jumlah tiket</label>
                  <div className="quantity-control" id="ticket-quantity">
                    <button type="button" onClick={() => changeCount(ticketCount - 1)} disabled={ticketCount === 1} aria-label="Kurangi tiket"><Icon name="minus" /></button>
                    <strong>{ticketCount}</strong>
                    <button type="button" onClick={() => changeCount(ticketCount + 1)} disabled={ticketCount >= (ticket.maxPerOrder || 5)} aria-label="Tambah tiket"><Icon name="plus" /></button>
                  </div>
                  <small className="field-hint">Maksimal {ticket.maxPerOrder || 5} tiket per pesanan.</small>
                  <button className="btn btn-primary btn-full" onClick={goToBuyer}>Lanjutkan <Icon name="arrow" /></button>
                </div>
              )}

              {step === 2 && (
                <form className="checkout-step" onSubmit={submitBuyer}>
                  <div className="form-heading"><h3>Data pembeli</h3><p>Tiket dan konfirmasi dikirim ke email ini.</p></div>
                  <div className="form-grid">
                    <label>Nama lengkap<input name="name" autoComplete="name" value={buyer.fullName} onChange={(event) => changeBuyer("fullName", event.target.value)} placeholder="Nama sesuai identitas…" required /></label>
                    <label>Email aktif<input type="email" name="email" autoComplete="email" spellCheck="false" value={buyer.email} onChange={(event) => changeBuyer("email", event.target.value)} placeholder="nama@email.com…" required /></label>
                    <label>Konfirmasi email<input type="email" name="confirmEmail" autoComplete="off" spellCheck="false" value={buyer.confirmEmail} onChange={(event) => changeBuyer("confirmEmail", event.target.value)} placeholder="Ketik ulang email…" required /></label>
                    <label>Nomor WhatsApp<input type="tel" name="phone" autoComplete="tel" inputMode="tel" value={buyer.phone} onChange={(event) => changeBuyer("phone", event.target.value)} placeholder="08xxxxxxxxxx…" required /></label>
                    <label>Kota domisili<input name="city" autoComplete="address-level2" value={buyer.city} onChange={(event) => changeBuyer("city", event.target.value)} placeholder="Contoh: Bandung…" required /></label>
                    <label>Instansi / sekolah<input name="organization" autoComplete="organization" value={buyer.institution} onChange={(event) => changeBuyer("institution", event.target.value)} placeholder="Nama sekolah atau kampus…" required /></label>
                    <label className="form-span">Kategori peserta<select value={buyer.category} onChange={(event) => changeBuyer("category", event.target.value)}>
                      <option>Pelajar SMA/MA</option><option>Santri</option><option>Mahasiswa</option><option>Orang Tua / Wali</option><option>Umum & Profesional</option>
                    </select></label>
                    <label className="check-control form-span"><input type="checkbox" checked={buyer.agreeTerms} onChange={(event) => changeBuyer("agreeTerms", event.target.checked)} /><span>Saya menyetujui syarat pembelian dan memastikan data sudah benar.</span></label>
                  </div>
                  <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Kembali</button><button className="btn btn-primary" type="submit">Data Peserta <Icon name="arrow" /></button></div>
                </form>
              )}

              {step === 3 && (
                <form className="checkout-step" onSubmit={submitAttendees}>
                  <div className="form-heading"><h3>Data peserta</h3><p>Setiap peserta mendapatkan satu QR unik.</p></div>
                  <div className="attendee-list">
                    {attendees.map((attendee, index) => (
                      <fieldset key={index}>
                        <legend>Peserta {index + 1}</legend>
                        <label>Nama lengkap<input value={attendee.fullName} onChange={(event) => setAttendees((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, fullName: event.target.value } : item))} placeholder="Nama peserta…" required /></label>
                        <label>Instansi<input value={attendee.institution} onChange={(event) => setAttendees((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, institution: event.target.value } : item))} placeholder="Sekolah, kampus, atau institusi…" /></label>
                      </fieldset>
                    ))}
                  </div>
                  <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>Kembali</button><button className="btn btn-primary" type="submit">Pilih Pembayaran <Icon name="arrow" /></button></div>
                </form>
              )}

              {step === 4 && (
                <div className="checkout-step">
                  <div className="form-heading"><h3>Metode pembayaran</h3><p>Pilih metode yang paling nyaman.</p></div>
                  <div className="payment-list">
                    {paymentMethods.map(([id, title, detail]) => (
                      <label className={paymentMethod === id ? "is-selected" : ""} key={id}>
                        <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={(event) => setPaymentMethod(event.target.value)} />
                        <span><strong>{title}</strong><small>{detail}</small></span>
                        <i />
                      </label>
                    ))}
                  </div>
                  <div className="promo-control">
                    <label htmlFor="promo-code">Kode promo</label>
                    <div><input id="promo-code" value={promo} disabled={promoApplied} onChange={(event) => setPromo(event.target.value)} placeholder="Masukkan kode promo…" /><button className="btn btn-secondary" type="button" onClick={applyPromo} disabled={!promo.trim() || promoApplied}>{promoApplied ? "Digunakan" : "Terapkan"}</button></div>
                  </div>
                  <div className="form-actions"><button className="btn btn-secondary" onClick={() => setStep(3)} disabled={processing}>Kembali</button><button className="btn btn-primary pay-button" onClick={pay} disabled={processing}>{processing ? "Memproses…" : `Bayar ${formatMoney(pricing.total)}`}</button></div>
                </div>
              )}
            </div>
            <aside className="desktop-order-summary">{summary}</aside>
          </div>
        )}
      </section>
    </div>
  );
}
