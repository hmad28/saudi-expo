import { storePrivateFile } from "./fileStore";

const KEY = "SEE26_APPLICATIONS_V2";
const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(18)), (value) => value.toString(36).padStart(2, "0")).join("");

export const getApplications = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export async function submitApplication(type, data, files = []) {
  const token = randomToken();
  const prefix = type === "SPONSORSHIP" ? "SP" : type === "BOOTH" ? "BT" : "LB";
  const id = crypto.randomUUID();
  const attachments = await Promise.all(files.filter(Boolean).map((file) => storePrivateFile(file, `${type}:${id}`)));
  const app = {
    id,
    number: `SEE26-${prefix}-${Date.now().toString(36).toUpperCase()}`,
    token,
    type,
    status: "SUBMITTED",
    data,
    attachments,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify([app, ...getApplications()]));
  window.dispatchEvent(new Event("see26:applications"));
  return app;
}

export const getApplication = (token) => getApplications().find((application) => application.token === token);

export function updateApplicationStatus(token, status, note = "") {
  const applications = getApplications();
  const application = applications.find((item) => item.token === token);
  if (!application) throw new Error("Pengajuan tidak ditemukan.");
  application.status = status;
  application.auditLogs = [
    { at: new Date().toISOString(), action: `STATUS_${status}`, note, actor: "Development admin" },
    ...(application.auditLogs || []),
  ];
  localStorage.setItem(KEY, JSON.stringify(applications));
  window.dispatchEvent(new Event("see26:applications"));
  return application;
}
