import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { applicationFiles, applications, auditLogs, uploadIntents } from "../db/schema.js";
import { applicationReceivedEmail } from "../mail.js";
import { createPublicToken, getRequestIp, hashToken } from "../security.js";

const applicationInput = z.object({
  type: z.enum(["SPONSORSHIP", "BOOTH", "INSTITUTION"]),
  data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  fileIntentTokens: z.array(z.string().min(32).max(128)).max(2).default([]),
  requestToken: z.string().min(32).max(128),
});

const requiredValue = (data, keys) => keys.map((key) => String(data[key] || "").trim()).find(Boolean) || "";

export async function createApplication(input, request) {
  const parsed = applicationInput.parse(input);
  const tokenHash = hashToken(parsed.requestToken);
  const existing = await db.query.applications.findFirst({ where: eq(applications.publicTokenHash, tokenHash) });
  if (existing) return getApplication(parsed.requestToken);
  const organizationName = requiredValue(parsed.data, ["organizationName", "brandName", "institutionName"]);
  const contactName = requiredValue(parsed.data, ["picName", "coordinatorName"]);
  const contactEmail = String(parsed.data.email || "").trim().toLowerCase();
  const contactPhone = String(parsed.data.phone || "").trim();
  if (!organizationName || !contactName || !z.email().safeParse(contactEmail).success || !contactPhone) throw Object.assign(new Error("Identitas organisasi dan kontak belum lengkap."), { status: 400 });

  const intents = parsed.fileIntentTokens.length ? await db.select().from(uploadIntents).where(inArray(uploadIntents.tokenHash, parsed.fileIntentTokens.map(hashToken))) : [];
  if (intents.length !== parsed.fileIntentTokens.length || intents.some((intent) => !intent.completedAt || intent.consumedAt || intent.expiresAt <= new Date() || !["APPLICATION_LOGO", "APPLICATION_PROPOSAL"].includes(intent.purpose))) throw Object.assign(new Error("Dokumen upload tidak valid atau sudah digunakan."), { status: 400 });

  const prefix = parsed.type === "SPONSORSHIP" ? "SP" : parsed.type === "BOOTH" ? "BT" : "LB";
  const number = `SEE26-${prefix}-${Date.now().toString(36).toUpperCase()}-${createPublicToken(3).slice(0, 4).toUpperCase()}`;
  const application = await db.transaction(async (tx) => {
    const [created] = await tx.insert(applications).values({ number, publicTokenHash: tokenHash, type: parsed.type, organizationName, contactName, contactEmail, contactPhone, data: parsed.data }).returning();
    if (intents.length) {
      await tx.insert(applicationFiles).values(intents.map((intent) => ({ applicationId: created.id, purpose: intent.purpose, fileKey: intent.fileKey, fileUrl: intent.fileUrl, fileName: intent.fileName, fileType: intent.fileType, fileSize: intent.fileSize })));
      await tx.update(uploadIntents).set({ consumedAt: new Date() }).where(inArray(uploadIntents.id, intents.map((intent) => intent.id)));
    }
    await tx.insert(auditLogs).values({ action: "APPLICATION_SUBMITTED", entityType: "APPLICATION", entityId: created.id, ipAddress: getRequestIp(request), userAgent: request.get("user-agent") || null });
    return created;
  });
  applicationReceivedEmail(application, parsed.requestToken).catch(() => undefined);
  return serializeApplication(application, intents.map((intent) => ({ id: intent.id, purpose: intent.purpose, name: intent.fileName, type: intent.fileType, size: intent.fileSize })));
}

export async function getApplication(publicToken) {
  const application = await db.query.applications.findFirst({ where: eq(applications.publicTokenHash, hashToken(publicToken)) });
  if (!application) return null;
  const files = await db.select().from(applicationFiles).where(eq(applicationFiles.applicationId, application.id));
  return serializeApplication(application, files);
}

export async function listApplications() {
  const rows = await db.select().from(applications).orderBy(desc(applications.createdAt)).limit(200);
  const ids = rows.map((row) => row.id);
  const files = ids.length ? await db.select().from(applicationFiles).where(inArray(applicationFiles.applicationId, ids)) : [];
  return rows.map((application) => serializeApplication(application, files.filter((file) => file.applicationId === application.id), true));
}

export async function reviewApplication(id, status, currentUser, request) {
  const parsedStatus = z.enum(["UNDER_REVIEW", "APPROVED", "CONFIRMED", "REJECTED"]).parse(status);
  const [application] = await db.update(applications).set({ status: parsedStatus, reviewedBy: currentUser.id, reviewedAt: new Date(), updatedAt: new Date() }).where(eq(applications.id, id)).returning();
  if (!application) throw Object.assign(new Error("Pengajuan tidak ditemukan."), { status: 404 });
  await db.insert(auditLogs).values({ actorId: currentUser.id, action: `APPLICATION_${parsedStatus}`, entityType: "APPLICATION", entityId: id, ipAddress: getRequestIp(request) });
  return serializeApplication(application, [], true);
}

const serializeApplication = (application, files = [], admin = false) => ({
  id: admin ? application.id : undefined,
  number: application.number,
  type: application.type,
  status: application.status,
  data: application.data,
  organizationName: application.organizationName,
  contactName: application.contactName,
  contactEmail: admin ? application.contactEmail : undefined,
  contactPhone: admin ? application.contactPhone : undefined,
  attachments: files.map((file) => ({ id: file.id, purpose: file.purpose, key: admin ? file.fileKey : undefined, name: file.fileName || file.name, type: file.fileType || file.type, size: file.fileSize || file.size })),
  createdAt: application.createdAt,
  updatedAt: application.updatedAt,
});
