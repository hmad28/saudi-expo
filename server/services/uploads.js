import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";
import { createUploadthing } from "uploadthing/express";
import { UploadThingError, UTApi } from "uploadthing/server";
import { db } from "../db/index.js";
import { orders, uploadIntents } from "../db/schema.js";
import { getSession } from "../auth.js";
import { createPublicToken, hashToken } from "../security.js";

const uploadPurpose = z.enum(["PAYMENT_PROOF", "APPLICATION_LOGO", "APPLICATION_PROPOSAL", "MEDIA_ASSET"]);

export async function createUploadIntent(input, { allowMedia = false } = {}) {
  const parsed = z.object({ purpose: uploadPurpose, ownerToken: z.string().min(32).max(128).optional() }).parse(input);
  if (parsed.purpose === "MEDIA_ASSET" && !allowMedia) throw Object.assign(new Error("Akses upload media ditolak."), { status: 403 });
  let ownerReference = null;
  if (parsed.purpose === "PAYMENT_PROOF") {
    if (!parsed.ownerToken) throw Object.assign(new Error("Token pesanan diperlukan."), { status: 400 });
    const order = await db.query.orders.findFirst({ where: eq(orders.publicTokenHash, hashToken(parsed.ownerToken)) });
    if (!order || !["PENDING_PAYMENT", "PAYMENT_REJECTED"].includes(order.status) || order.expiresAt <= new Date()) throw Object.assign(new Error("Pesanan tidak dapat menerima bukti pembayaran."), { status: 409 });
    ownerReference = order.id;
  }
  const token = createPublicToken();
  const [intent] = await db.insert(uploadIntents).values({
    tokenHash: hashToken(token),
    purpose: parsed.purpose,
    ownerReference,
    expiresAt: new Date(Date.now() + 30 * 60_000),
  }).returning();
  return { token, purpose: intent.purpose, expiresAt: intent.expiresAt };
}

export async function listMediaAssets() {
  return db.select({ id: uploadIntents.id, key: uploadIntents.fileKey, url: uploadIntents.fileUrl, name: uploadIntents.fileName, type: uploadIntents.fileType, size: uploadIntents.fileSize, createdAt: uploadIntents.createdAt })
    .from(uploadIntents)
    .where(and(eq(uploadIntents.purpose, "MEDIA_ASSET"), isNotNull(uploadIntents.completedAt)))
    .orderBy(desc(uploadIntents.completedAt))
    .limit(100);
}

async function resolveIntent(token, expectedPurpose) {
  const intent = await db.query.uploadIntents.findFirst({
    where: and(eq(uploadIntents.tokenHash, hashToken(token)), eq(uploadIntents.purpose, expectedPurpose), isNull(uploadIntents.completedAt)),
  });
  if (!intent || intent.expiresAt <= new Date()) throw new UploadThingError("Upload intent tidak valid atau kedaluwarsa.");
  return intent;
}

const f = createUploadthing();
const utapi = new UTApi();

export async function createPrivateFileUrl(fileKey) {
  const result = await utapi.generateSignedURL(fileKey, { expiresIn: "10 minutes" });
  return result.ufsUrl || result.url;
}

const completeIntent = async (intentId, file) => {
  await db.update(uploadIntents).set({
    fileKey: file.key,
    fileUrl: file.ufsUrl || file.url,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    completedAt: new Date(),
  }).where(eq(uploadIntents.id, intentId));
  return { intentId };
};

export const uploadRouter = {
  paymentProof: f({ image: { maxFileSize: "5MB", maxFileCount: 1, acl: "private" }, pdf: { maxFileSize: "5MB", maxFileCount: 1, acl: "private" } })
    .input(z.object({ intentToken: z.string().min(32).max(128) }))
    .middleware(async ({ input }) => ({ intent: await resolveIntent(input.intentToken, "PAYMENT_PROOF") }))
    .onUploadComplete(({ metadata, file }) => completeIntent(metadata.intent.id, file)),
  applicationLogo: f({ image: { maxFileSize: "5MB", maxFileCount: 1 } })
    .input(z.object({ intentToken: z.string().min(32).max(128) }))
    .middleware(async ({ input }) => ({ intent: await resolveIntent(input.intentToken, "APPLICATION_LOGO") }))
    .onUploadComplete(({ metadata, file }) => completeIntent(metadata.intent.id, file)),
  applicationProposal: f({ pdf: { maxFileSize: "5MB", maxFileCount: 1, acl: "private" } })
    .input(z.object({ intentToken: z.string().min(32).max(128) }))
    .middleware(async ({ input }) => ({ intent: await resolveIntent(input.intentToken, "APPLICATION_PROPOSAL") }))
    .onUploadComplete(({ metadata, file }) => completeIntent(metadata.intent.id, file)),
  mediaAsset: f({ image: { maxFileSize: "16MB", maxFileCount: 8 }, video: { maxFileSize: "128MB", maxFileCount: 2 }, pdf: { maxFileSize: "16MB", maxFileCount: 4 } })
    .input(z.object({ intentToken: z.string().min(32).max(128) }))
    .middleware(async ({ req, input }) => {
      const session = await getSession(req);
      if (!session?.user || !["ADMIN"].includes(session.user.role)) throw new UploadThingError("Akses upload media ditolak.");
      return { intent: await resolveIntent(input.intentToken, "MEDIA_ASSET"), userId: session.user.id };
    })
    .onUploadComplete(({ metadata, file }) => completeIntent(metadata.intent.id, file)),
};
