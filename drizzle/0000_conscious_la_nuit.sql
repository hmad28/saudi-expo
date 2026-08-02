CREATE TYPE "public"."application_status" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CONFIRMED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING_PAYMENT', 'PAYMENT_REVIEW', 'PAYMENT_REJECTED', 'PAID', 'EXPIRED', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'UNDER_REVIEW', 'SUCCESS', 'REJECTED', 'EXPIRED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('ACTIVE', 'VOID', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'FINANCE', 'CHECKIN', 'VIEWER');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"purpose" text NOT NULL,
	"file_key" text NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" text NOT NULL,
	"public_token_hash" text NOT NULL,
	"type" text NOT NULL,
	"status" "application_status" DEFAULT 'SUBMITTED' NOT NULL,
	"organization_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"data" jsonb NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_number_unique" UNIQUE("number"),
	CONSTRAINT "applications_public_token_hash_unique" UNIQUE("public_token_hash")
);
--> statement-breakpoint
CREATE TABLE "attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"email" text,
	"gender" text NOT NULL,
	"birth_date" text,
	"guardian_name" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"event_date" text NOT NULL,
	"gate" text DEFAULT 'Main Gate' NOT NULL,
	"operator_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"public_token_hash" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"product_id" text NOT NULL,
	"product_snapshot" jsonb NOT NULL,
	"quantity" integer NOT NULL,
	"buyer_name" text NOT NULL,
	"buyer_phone" text NOT NULL,
	"buyer_email" text NOT NULL,
	"buyer_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"subtotal" integer NOT NULL,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"donation" integer DEFAULT 0 NOT NULL,
	"service_fee" integer DEFAULT 0 NOT NULL,
	"unique_code" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"status" "order_status" DEFAULT 'PENDING_PAYMENT' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"accepted_terms_version" text NOT NULL,
	"accepted_terms_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number"),
	CONSTRAINT "orders_public_token_hash_unique" UNIQUE("public_token_hash"),
	CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"method" text DEFAULT 'MANUAL_TRANSFER' NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"claimed_amount" integer,
	"transferred_at" timestamp with time zone,
	"proof_key" text,
	"proof_url" text,
	"proof_name" text,
	"proof_type" text,
	"proof_size" integer,
	"rejection_reason" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"date_label" text NOT NULL,
	"valid_dates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"price" integer NOT NULL,
	"original_price" integer,
	"unit" text NOT NULL,
	"status" text NOT NULL,
	"remaining" integer,
	"benefits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sale_starts_at" timestamp with time zone,
	"sale_ends_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"window_ends_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"attendee_id" uuid NOT NULL,
	"access_token_hash" text NOT NULL,
	"checkin_token_hash" text NOT NULL,
	"code" text NOT NULL,
	"status" "ticket_status" DEFAULT 'ACTIVE' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_access_token_hash_unique" UNIQUE("access_token_hash"),
	CONSTRAINT "tickets_checkin_token_hash_unique" UNIQUE("checkin_token_hash"),
	CONSTRAINT "tickets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "upload_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"purpose" text NOT NULL,
	"owner_reference" text,
	"file_key" text,
	"file_url" text,
	"file_name" text,
	"file_type" text,
	"file_size" integer,
	"expires_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "upload_intents_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'VIEWER' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_files" ADD CONSTRAINT "application_files_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendees" ADD CONSTRAINT "attendees_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_operator_id_user_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_attendee_id_attendees_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "public"."attendees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applications_type_idx" ON "applications" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "attendee_order_position_uidx" ON "attendees" USING btree ("order_id","position");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "checkin_ticket_date_uidx" ON "checkins" USING btree ("ticket_id","event_date");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_buyer_email_idx" ON "orders" USING btree ("buyer_email");--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tickets_order_idx" ON "tickets" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");