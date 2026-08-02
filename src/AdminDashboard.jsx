import React, { useEffect, useMemo, useState } from "react";
import { EVENT, MISSING_ASSETS } from "./data/eventConfig";
import { authClient } from "./utils/authClient";
import { uploadFile } from "./utils/api";
import { approvePayment, formatDateTime, formatRupiah, getAdminOverview, openPrivateFile, rejectPayment, updateApplicationStatus } from "./utils/storage";

const statusLabel = (value) => String(value || "").replaceAll("_", " ");

function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    const result = await authClient.signIn.email(form);
    if (result.error) { setError(result.error.message || "Email atau password tidak valid."); setBusy(false); }
  };
  return <main className="ops-login"><section><a href="/" className="ops-brand"><img src={EVENT.logo} alt="" width="38" height="38"/><span>SEE 2026</span></a><div className="ops-login-copy"><span>SECURE OPERATIONS</span><h1>Satu pusat kendali untuk hari event.</h1><p>Review pembayaran, pengajuan mitra, dan validasi tiket menggunakan data server terbaru.</p></div></section><form onSubmit={submit}><span className="ops-kicker">Authorized personnel only</span><h2>Masuk ke dashboard</h2><label>Email<input name="email" type="email" autoComplete="username" spellCheck="false" required value={form.email} onChange={event=>setForm({...form,email:event.target.value})}/></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength="12" required value={form.password} onChange={event=>setForm({...form,password:event.target.value})}/></label>{error&&<p className="form-error" role="alert">{error}</p>}<button className="button button-lime" disabled={busy}>{busy?"Memverifikasi…":"Masuk aman"}</button><a href="/" className="text-button">Kembali ke situs publik</a></form></main>;
}

export default function AdminDashboard() {
  const { data: session, isPending } = authClient.useSession();
  const [overview, setOverview] = useState({ orders: [], applications: [], media: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("payments");
  const [rejecting, setRejecting] = useState("");
  const [reason, setReason] = useState("Nominal tidak sesuai");
  const [scannerToken, setScannerToken] = useState("");
  const [mediaBusy, setMediaBusy] = useState(false);
  const canViewOverview = session?.user && session.user.role !== "CHECKIN";
  useEffect(() => {
    if (!session?.user) return;
    const next = new URLSearchParams(location.search).get("next");
    if (next?.startsWith("/check-in/")) location.replace(next);
  }, [session?.user?.id]);
  const load = async () => {
    if (!canViewOverview) { setLoading(false); return; }
    setLoading(true); setError("");
    try { setOverview(await getAdminOverview()); } catch (loadError) { setError(loadError.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (session?.user) load(); }, [session?.user?.id]);
  const stats = useMemo(() => ({
    revenue: overview.orders.filter(order=>order.status==="PAID").reduce((sum,order)=>sum+order.total,0),
    review: overview.orders.filter(order=>order.status==="PAYMENT_REVIEW").length,
    paid: overview.orders.filter(order=>order.status==="PAID").length,
    applications: overview.applications.filter(item=>["SUBMITTED","UNDER_REVIEW"].includes(item.status)).length,
  }), [overview]);
  if (isPending) return <main className="ops-loading">Memverifikasi sesi…</main>;
  if (!session?.user) return <AdminLogin/>;
  const mutate = async (action) => { try { setError(""); await action(); await load(); } catch (actionError) { setError(actionError.message); } };
  const goScanner = (event) => { event.preventDefault(); const token=scannerToken.trim().split("/check-in/").pop(); if(token) location.href=`/check-in/${encodeURIComponent(token)}`; };
  return <main className="ops-shell">
    <header className="ops-topbar"><a href="/admin" className="ops-brand"><img src={EVENT.logo} alt="" width="38" height="38"/><span>SEE / OPS</span></a><div className="ops-event"><i/><span>{EVENT.datesLabel}</span><strong>Jakarta Command Center</strong></div><div className="ops-user"><span>{session.user.name}</span><small>{session.user.role}</small><button onClick={()=>authClient.signOut()}>Keluar</button></div></header>
    <nav className="ops-nav" aria-label="Dashboard"><button className={tab==="payments"?"active":""} onClick={()=>setTab("payments")}>Pembayaran <b>{stats.review}</b></button><button className={tab==="applications"?"active":""} onClick={()=>setTab("applications")}>Pengajuan <b>{stats.applications}</b></button><button className={tab==="scanner"?"active":""} onClick={()=>setTab("scanner")}>Check-in</button><button className={tab==="media"?"active":""} onClick={()=>setTab("media")}>Media</button><button className={tab==="readiness"?"active":""} onClick={()=>setTab("readiness")}>Readiness</button></nav>
    <section className="ops-content"><header className="ops-heading"><div><span className="ops-kicker">LIVE OPERATIONS / {new Intl.DateTimeFormat("id-ID",{dateStyle:"full",timeZone:EVENT.timezone}).format(new Date())}</span><h1>{tab==="payments"?"Payment control":tab==="applications"?"Partnership pipeline":tab==="scanner"?"Gate check-in":tab==="media"?"Media library":"Production readiness"}</h1></div><button className="ops-refresh" onClick={load} disabled={loading}>{loading?"Syncing…":"↻ Refresh data"}</button></header>
      {error&&<p className="form-error" role="alert">{error}</p>}
      {tab==="payments"&&<><div className="ops-stats"><article><span>Paid revenue</span><strong>{formatRupiah(stats.revenue)}</strong><small>Manual transfer approved</small></article><article className="urgent"><span>Needs review</span><strong>{stats.review}</strong><small>Payment proofs queued</small></article><article><span>Paid orders</span><strong>{stats.paid}</strong><small>Ticket batches issued</small></article><article><span>All orders</span><strong>{overview.orders.length}</strong><small>Server-backed records</small></article></div><div className="ops-table"><div className="ops-table-head"><span>Order / buyer</span><span>Product</span><span>Total</span><span>Status</span><span>Action</span></div>{overview.orders.map(order=><article key={order.id}><div><strong>{order.orderNumber}</strong><small>{order.buyer.fullName}<br/>{order.buyer.email}</small></div><span>{order.productSnapshot.name}</span><strong>{formatRupiah(order.total)}</strong><span className={`ops-pill ${order.status.toLowerCase()}`}>{statusLabel(order.status)}</span><div className="ops-actions">{order.proof&&<button onClick={()=>openPrivateFile(order.proof.key)}>Buka bukti</button>}{order.status==="PAYMENT_REVIEW"&&rejecting!==order.id&&<><button className="approve" onClick={()=>mutate(()=>approvePayment(order.id))}>Approve</button><button onClick={()=>setRejecting(order.id)}>Reject</button></>}{rejecting===order.id&&<div className="ops-reject"><select aria-label="Alasan penolakan" value={reason} onChange={e=>setReason(e.target.value)}><option>Nominal tidak sesuai</option><option>Bukti pembayaran tidak terbaca</option><option>Pembayaran tidak ditemukan</option><option>Rekening tujuan tidak sesuai</option><option>Bukti pembayaran duplikat</option><option>Pembayaran melewati batas waktu</option></select><button onClick={()=>mutate(async()=>{await rejectPayment(order.id,reason);setRejecting("")})}>Confirm</button></div>}</div></article>)}</div></>}
      {tab==="applications"&&<div className="ops-cards">{overview.applications.map(item=><article key={item.id}><header><span className="ops-pill">{item.type}</span><small>{formatDateTime(item.createdAt)}</small></header><h2>{item.organizationName}</h2><p>{item.contactName}<br/>{item.contactEmail}<br/>{item.contactPhone}</p><strong>{item.number}</strong><footer><span>{statusLabel(item.status)}</span>{item.attachments.map(file=><button key={file.id} onClick={()=>openPrivateFile(file.key)}>Open {file.name}</button>)}{item.status==="SUBMITTED"&&<button onClick={()=>mutate(()=>updateApplicationStatus(item.id,"UNDER_REVIEW"))}>Start review</button>}{item.status==="UNDER_REVIEW"&&<><button className="approve" onClick={()=>mutate(()=>updateApplicationStatus(item.id,item.type==="SPONSORSHIP"?"CONFIRMED":"APPROVED"))}>Approve</button><button onClick={()=>window.confirm(`Tolak pengajuan ${item.number}?`)&&mutate(()=>updateApplicationStatus(item.id,"REJECTED"))}>Reject</button></>}</footer></article>)}</div>}
      {tab==="scanner"&&<section className="ops-scanner"><span className="ops-kicker">GATE VALIDATION</span><h2>Scan atau tempel tautan QR tiket.</h2><p>Validasi dan check-in hanya bisa dilakukan oleh role CHECKIN atau ADMIN. Duplikasi dicegah di database per tiket dan tanggal event.</p><form onSubmit={goScanner}><input name="checkinToken" aria-label="Token atau URL check-in" autoComplete="off" spellCheck="false" value={scannerToken} onChange={e=>setScannerToken(e.target.value)} placeholder="Token atau URL /check-in/…"/><button className="button button-lime">Validasi tiket</button></form></section>}
      {tab==="media"&&<section className="ops-media"><header><div><span className="ops-kicker">UPLOADTHING MEDIA LIBRARY</span><h2>Aset situs dan dokumentasi.</h2><p>PNG, JPG, WebP, PDF, atau video. File media publik dapat dipakai di halaman event setelah metadata dan izin publikasi dikonfirmasi.</p></div><label className="button button-lime">{mediaBusy?"Mengunggah…":"Upload media"}<input name="mediaAsset" type="file" hidden disabled={mediaBusy} accept="image/*,video/*,.pdf" onChange={async event=>{const file=event.target.files?.[0];if(!file)return;setMediaBusy(true);try{await uploadFile("mediaAsset","MEDIA_ASSET",file);await load()}catch(uploadError){setError(uploadError.message)}finally{setMediaBusy(false);event.target.value=""}}}/></label></header><div className="ops-media-grid">{overview.media?.map(file=><a href={file.url} target="_blank" rel="noreferrer" key={file.id}>{file.type?.startsWith("image/")?<img src={file.url} alt={file.name} width="400" height="250" loading="lazy"/>:<div className="ops-file-icon">{file.type?.startsWith("video/")?"VIDEO":"FILE"}</div>}<strong>{file.name}</strong><small>{Math.ceil((file.size||0)/1024)} KB</small></a>)}</div></section>}
      {tab==="readiness"&&<div className="ops-readiness"><section><span>Backend</span><h2>Connected services</h2><ul><li className="done">Neon PostgreSQL + Drizzle</li><li className="done">Better Auth + RBAC</li><li className="done">UploadThing private intents</li><li className="done">Mailtrap sandbox adapter</li></ul></section><section><span>Organizer input</span><h2>Still required</h2><ul>{[...MISSING_ASSETS,...EVENT.unresolved].map(item=><li key={item}>{item}</li>)}</ul></section></div>}
    </section>
  </main>;
}
