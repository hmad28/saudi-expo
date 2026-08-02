import { api, uploadFile } from "./api";

const publicToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

export async function submitApplication(type, data, files = []) {
  const [logo, proposal] = files;
  const fileIntentTokens = [];
  if (logo) fileIntentTokens.push(await uploadFile("applicationLogo", "APPLICATION_LOGO", logo));
  if (proposal) fileIntentTokens.push(await uploadFile("applicationProposal", "APPLICATION_PROPOSAL", proposal));
  const requestToken = publicToken();
  const application = await api("/api/applications", {
    method: "POST",
    body: JSON.stringify({ type, data, fileIntentTokens, requestToken }),
  });
  return { ...application, token: requestToken };
}

export const getApplication = (token) => api(`/api/applications/${encodeURIComponent(token)}`);
