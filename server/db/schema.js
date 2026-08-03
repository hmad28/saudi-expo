import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const userRole = pgEnum("user_role", ["ADMIN", "FINANCE", "CHECKIN", "VIEWER"]);
export const orderStatus = pgEnum("order_status", ["PENDING_PAYMENT", "PAYMENT_REVIEW", "PAYMENT_REJECTED", "PAID", "EXPIRED", "CANCELLED", "REFUNDED"]);
export const paymentStatus = pgEnum("payment_status", ["PENDING", "UNDER_REVIEW", "SUCCESS", "REJECTED", "EXPIRED", "REFUNDED"]);
export const ticketStatus = pgEnum("ticket_status", ["ACTIVE", "VOID", "REFUNDED"]);
export const applicationStatus = pgEnum("application_status", ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "CONFIRMED", "REJECTED"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: userRole("role").notNull().default("VIEWER"),
  banned: boolean("banned").notNull().default(false),
  ...timestamps,
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
}, (table) => [index("session_user_idx").on(table.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  ...timestamps,
}, (table) => [index("account_user_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  dateLabel: text("date_label").notNull(),
  validDates: jsonb("valid_dates").notNull().default([]),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  unit: text("unit").notNull(),
  status: text("status").notNull(),
  remaining: integer("remaining"),
  benefits: jsonb("benefits").notNull().default([]),
  metadata: jsonb("metadata").notNull().default({}),
  saleStartsAt: timestamp("sale_starts_at", { withTimezone: true }),
  saleEndsAt: timestamp("sale_ends_at", { withTimezone: true }),
  version: integer("version").notNull().default(1),
  ...timestamps,
}, (table) => [index("products_status_idx").on(table.status)]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(),
  publicTokenHash: text("public_token_hash").notNull().unique(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  productId: text("product_id").notNull().references(() => products.id),
  productSnapshot: jsonb("product_snapshot").notNull(),
  quantity: integer("quantity").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerPhone: text("buyer_phone").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  buyerMetadata: jsonb("buyer_metadata").notNull().default({}),
  subtotal: integer("subtotal").notNull(),
  discountAmount: integer("discount_amount").notNull().default(0),
  donation: integer("donation").notNull().default(0),
  serviceFee: integer("service_fee").notNull().default(0),
  uniqueCode: integer("unique_code").notNull().default(0),
  total: integer("total").notNull(),
  status: orderStatus("status").notNull().default("PENDING_PAYMENT"),
  paymentStatus: paymentStatus("payment_status").notNull().default("PENDING"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  acceptedTermsVersion: text("accepted_terms_version").notNull(),
  acceptedTermsAt: timestamp("accepted_terms_at", { withTimezone: true }).notNull(),
  ...timestamps,
}, (table) => [index("orders_status_idx").on(table.status), index("orders_buyer_email_idx").on(table.buyerEmail)]);

export const attendees = pgTable("attendees", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  gender: text("gender").notNull(),
  birthDate: text("birth_date"),
  guardianName: text("guardian_name"),
  metadata: jsonb("metadata").notNull().default({}),
  ...timestamps,
}, (table) => [uniqueIndex("attendee_order_position_uidx").on(table.orderId, table.position)]);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  method: text("method").notNull().default("MANUAL_TRANSFER"),
  status: paymentStatus("status").notNull().default("PENDING"),
  claimedAmount: integer("claimed_amount"),
  transferredAt: timestamp("transferred_at", { withTimezone: true }),
  proofKey: text("proof_key"),
  proofUrl: text("proof_url"),
  proofName: text("proof_name"),
  proofType: text("proof_type"),
  proofSize: integer("proof_size"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: text("reviewed_by").references(() => user.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [index("payments_order_idx").on(table.orderId), index("payments_status_idx").on(table.status)]);

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  attendeeId: uuid("attendee_id").notNull().references(() => attendees.id, { onDelete: "cascade" }),
  accessTokenHash: text("access_token_hash").notNull().unique(),
  checkinTokenHash: text("checkin_token_hash").notNull().unique(),
  code: text("code").notNull().unique(),
  status: ticketStatus("status").notNull().default("ACTIVE"),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  ...timestamps,
}, (table) => [index("tickets_order_idx").on(table.orderId)]);

export const checkins = pgTable("checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  eventDate: text("event_date").notNull(),
  gate: text("gate").notNull().default("Main Gate"),
  operatorId: text("operator_id").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("checkin_ticket_date_uidx").on(table.ticketId, table.eventDate)]);

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number").notNull().unique(),
  publicTokenHash: text("public_token_hash").notNull().unique(),
  type: text("type").notNull(),
  status: applicationStatus("status").notNull().default("SUBMITTED"),
  organizationName: text("organization_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  data: jsonb("data").notNull(),
  reviewedBy: text("reviewed_by").references(() => user.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [index("applications_status_idx").on(table.status), index("applications_type_idx").on(table.type)]);

export const applicationFiles = pgTable("application_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  purpose: text("purpose").notNull(),
  fileKey: text("file_key").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const uploadIntents = pgTable("upload_intents", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  purpose: text("purpose").notNull(),
  ownerReference: text("owner_reference"),
  fileKey: text("file_key"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileType: text("file_type"),
  fileSize: integer("file_size"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: text("actor_id").references(() => user.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("audit_entity_idx").on(table.entityType, table.entityId), index("audit_created_idx").on(table.createdAt)]);

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(1),
  windowEndsAt: timestamp("window_ends_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const schema = {
  user,
  session,
  account,
  verification,
  products,
  orders,
  attendees,
  payments,
  tickets,
  checkins,
  applications,
  applicationFiles,
  uploadIntents,
  auditLogs,
  rateLimits,
};
