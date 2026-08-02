import { genUploader } from "uploadthing/client";

export async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: { ...(options.body ? { "content-type": "application/json" } : {}), ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Permintaan belum dapat diproses.");
    error.status = response.status;
    error.details = payload.details;
    throw error;
  }
  return payload.data ?? payload;
}

const { uploadFiles } = genUploader({ url: "/api/uploadthing" });

export async function uploadFile(endpoint, purpose, file, ownerToken) {
  const intent = await api(purpose === "MEDIA_ASSET" ? "/api/admin/upload-intents" : "/api/upload-intents", {
    method: "POST",
    body: JSON.stringify({ purpose, ownerToken }),
  });
  await uploadFiles(endpoint, { files: [file], input: { intentToken: intent.token } });
  return intent.token;
}
