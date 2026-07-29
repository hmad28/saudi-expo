const KEY="SEE26_APPLICATIONS_V1";
export const getApplications=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}};
export function submitApplication(type,data){
  const token=Array.from(crypto.getRandomValues(new Uint8Array(18)),v=>v.toString(36).padStart(2,"0")).join("");
  const prefix=type==="SPONSORSHIP"?"SP":type==="BOOTH"?"BT":"LB";
  const app={id:crypto.randomUUID(),number:`SEE26-${prefix}-${Date.now().toString(36).toUpperCase()}`,token,type,status:"SUBMITTED",data,createdAt:new Date().toISOString()};
  localStorage.setItem(KEY,JSON.stringify([app,...getApplications()]));
  window.dispatchEvent(new Event("see26:applications"));
  return app;
}
export const getApplication=(token)=>getApplications().find(a=>a.token===token);
