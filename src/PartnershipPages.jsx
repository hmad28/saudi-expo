import React, { useState } from "react";
import { EVENT } from "./data/eventConfig";
import { submitApplication, getApplication } from "./utils/applicationStore";
import { Icon } from "./components/Icons";

const go=p=>{history.pushState({},"",p);dispatchEvent(new PopStateEvent("popstate"));scrollTo(0,0)};
const Page=({label,title,copy,children})=><main className="application-page"><a className="application-logo" href="/"><img src={EVENT.logo} alt="" width="48" height="48"/><span>Saudi Education Expo 2026</span></a><header><span>{label}</span><h1>{title}</h1><p>{copy}</p></header>{children}</main>;
export function PartnershipLanding(){return <Page label="Kolaborasi bersama SEE 2026" title="Pilih bentuk kolaborasi yang tepat." copy="Sponsorship, exhibitor, dan pendaftaran lembaga memiliki proses review yang berbeda."><div className="application-paths"><a href="/kemitraan/sponsorship"><strong>Sponsorship & Kemitraan</strong><p>Dukungan finansial, produk, layanan, media, komunitas, pendidikan, atau strategis.</p><Icon name="arrow"/></a><a href="/kemitraan/booth"><strong>Booth & Exhibitor</strong><p>Ajukan kehadiran brand, institusi, produk, atau layanan di area expo.</p><Icon name="arrow"/></a><a href="/lembaga"><strong>Pendaftaran Lembaga</strong><p>Daftarkan rencana kunjungan sekolah, pesantren, kampus, atau komunitas.</p><Icon name="arrow"/></a></div></Page>}
const baseFields=[["organizationName","Nama organisasi"],["organizationType","Jenis organisasi"],["businessCategory","Kategori usaha"],["website","Website"],["socialMedia","Media sosial"],["address","Alamat"],["city","Kota"],["picName","Nama PIC"],["picRole","Jabatan PIC"],["phone","WhatsApp aktif","tel"],["email","Email aktif","email"]];
const boothFields=[["brandName","Nama brand atau institusi"],["legalName","Nama badan hukum"],["category","Kategori exhibitor"],["description","Deskripsi brand"],["products","Produk atau layanan"],["website","Website"],["instagram","Instagram"],["address","Alamat"],["city","Kota"],["picName","Nama PIC"],["picRole","Jabatan PIC"],["phone","WhatsApp","tel"],["email","Email","email"],["boothType","Tipe booth yang diminta"],["boothQuantity","Jumlah booth","number"],["attendanceDates","Tanggal kehadiran"],["staffCount","Jumlah staf","number"],["electricity","Kebutuhan listrik"],["furniture","Kebutuhan meja dan kursi"],["internet","Kebutuhan internet"],["notes","Catatan penempatan"]];
function ApplicationForm({ type, fields, group }) {
  const [data, setData] = useState(group ? { coordinatorGroup: group } : {});
  const [files, setFiles] = useState({ logo: null, proposal: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const optionalFields = new Set(["website", "socialMedia", "instagram", "notes", "estimatedValue"]);
  const submit = async (event) => {
    event.preventDefault();
    if (type === "INSTITUTION" && Number(data.male || 0) + Number(data.female || 0) !== Number(data.total || 0)) {
      setError("Jumlah peserta laki-laki dan perempuan harus sama dengan estimasi total peserta.");
      return;
    }
    const selectedFiles = Object.values(files).filter(Boolean);
    if (selectedFiles.some((file) => file.size > 5 * 1024 * 1024)) {
      setError("Setiap dokumen maksimal berukuran 5 MB.");
      return;
    }
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (selectedFiles.some((file) => !allowedTypes.includes(file.type))) {
      setError("Gunakan PNG, JPG, WebP, atau PDF sesuai kolom dokumen.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const app = await submitApplication(type, data, Object.values(files));
      go(`/${type === "INSTITUTION" ? "lembaga" : "kemitraan"}/status/${app.token}`);
    } catch {
      setError("Pengajuan belum dapat disimpan. Periksa ruang penyimpanan browser dan coba lagi.");
      setBusy(false);
    }
  };
  return <form className="application-form" onSubmit={submit}>
    {fields.map(([key, label, inputType = "text"]) => inputType === "textarea"
      ? <label key={key}>{label}<textarea name={key} required={!optionalFields.has(key)} value={data[key] || ""} onChange={(event) => setData({ ...data, [key]: event.target.value })} /></label>
      : <label key={key}>{label}<input autoComplete={inputType === "email" ? "email" : inputType === "tel" ? "tel" : key.toLowerCase().includes("name") ? "organization" : "off"} required={!optionalFields.has(key)} type={inputType} name={key} value={data[key] || ""} onChange={(event) => setData({ ...data, [key]: event.target.value })} /></label>)}
    {type !== "INSTITUTION" && <>
      <label>Logo <small>PNG, JPG, atau WebP</small><input name="logo" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(event) => setFiles((current) => ({ ...current, logo: event.target.files[0] || null }))} /></label>
      <label>Company profile atau proposal <small>PDF</small><input name="proposal" type="file" accept=".pdf" onChange={(event) => setFiles((current) => ({ ...current, proposal: event.target.files[0] || null }))} /></label>
    </>}
    {Object.values(files).filter(Boolean).length > 0 && <p className="field-message" role="status">{Object.values(files).filter(Boolean).length} dokumen siap disimpan bersama pengajuan.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <label className="consent"><input name="consent" type="checkbox" required />Saya menyetujui penggunaan data untuk review dan tindak lanjut pengajuan.</label>
    <button className="button button-lime" disabled={busy}>{busy ? "Mengirim…" : "Kirim Pengajuan"}</button>
  </form>;
}
export function SponsorshipPage(){return <Page label="Sponsorship & kemitraan" title="Bangun kolaborasi bersama SEE 2026." copy="Format, nilai, eksposur, dan benefit akan dibahas bersama partnership team. Tidak ada paket yang diasumsikan sebelum kesepakatan."><ApplicationForm type="SPONSORSHIP" fields={[...baseFields,["partnershipType","Jenis kemitraan"],["objective","Tujuan kolaborasi","textarea"],["support","Dukungan yang diajukan","textarea"],["activation","Kebutuhan aktivasi","textarea"],["estimatedValue","Estimasi nilai, opsional"],["notes","Catatan","textarea"]]}/></Page>}
export function BoothPage(){return <Page label="Booth & exhibitor" title="Hadir di area Campus & Scholarship Expo." copy="Kebutuhan booth akan direview panitia. Pengajuan tidak otomatis berarti persetujuan atau penempatan."><ApplicationForm type="BOOTH" fields={boothFields}/></Page>}
export function InstitutionLanding(){return <Page label="Pendaftaran lembaga" title="Pilih admin koordinator lembaga." copy="Jalur ikhwan dan akhwat disimpan terpisah sesuai arahan organizer."><div className="application-paths two"><a href="/lembaga/daftar/ikhwan"><strong>Admin Lembaga Ikhwan</strong><p>Koordinator kelompok ikhwan.</p><Icon name="arrow"/></a><a href="/lembaga/daftar/akhwat"><strong>Admin Lembaga Akhwat</strong><p>Koordinator kelompok akhwat.</p><Icon name="arrow"/></a></div></Page>}
const institutionFields=[["institutionName","Nama lembaga"],["institutionType","Jenis lembaga"],["educationLevel","Jenjang pendidikan"],["address","Alamat lengkap"],["city","Kota atau kabupaten"],["province","Provinsi"],["website","Website"],["socialMedia","Media sosial"],["coordinatorName","Nama koordinator"],["coordinatorRole","Peran koordinator"],["phone","WhatsApp aktif","tel"],["email","Email aktif","email"],["ageRange","Rentang usia"],["attendanceDays","Rencana hari kehadiran"],["total","Estimasi total peserta","number"],["male","Estimasi peserta laki-laki","number"],["female","Estimasi peserta perempuan","number"],["transport","Metode transportasi"],["departureCity","Kota keberangkatan"],["notes","Catatan khusus","textarea"]];
export function InstitutionFormPage({group}){return <Page label={`Admin lembaga ${group.toLowerCase()}`} title="Daftarkan rencana kunjungan lembaga." copy="Tahap awal hanya memerlukan estimasi. Data nama peserta dikumpulkan setelah pengajuan disetujui."><ApplicationForm type="INSTITUTION" fields={institutionFields} group={group}/></Page>}
export function ApplicationStatusPage({token}){const app=getApplication(token);if(!app)return <Page label="Status pengajuan" title="Pengajuan tidak ditemukan." copy="Periksa kembali tautan aman yang diberikan setelah pengajuan."/>;return <Page label="Status pengajuan" title={app.number} copy="Simpan tautan aman ini untuk memantau tindak lanjut panitia."><div className="application-status"><span>{app.type}</span><strong>{app.status.replaceAll("_"," ")}</strong><p>Dikirim {new Intl.DateTimeFormat("id-ID",{dateStyle:"long",timeStyle:"short",timeZone:EVENT.timezone}).format(new Date(app.createdAt))} WIB</p>{app.attachments?.length>0&&<p>{app.attachments.length} dokumen tersimpan pada perangkat ini.</p>}<a className="button button-dark" href={EVENT.social.instagram} target="_blank" rel="noreferrer">Hubungi Penyelenggara</a></div></Page>}
