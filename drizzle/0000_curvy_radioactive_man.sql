CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"messenger" text,
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "job_counters" (
	"date" date PRIMARY KEY NOT NULL,
	"last_value" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_number" text NOT NULL,
	"customer_id" uuid NOT NULL,
	"category" text NOT NULL,
	"brand" text,
	"model" text,
	"serial_number" text,
	"reported_issue" text NOT NULL,
	"accessories_received" text,
	"condition_notes" text,
	"age_note" text,
	"under_manufacturer_warranty" text DEFAULT 'unknown' NOT NULL,
	"powers_on" text DEFAULT 'unknown' NOT NULL,
	"service_type" text NOT NULL,
	"service_address" text,
	"diagnosis" text,
	"labor_cost" integer,
	"parts_cost" integer,
	"deposit_paid" integer DEFAULT 0 NOT NULL,
	"final_cost" integer,
	"status" text DEFAULT 'received' NOT NULL,
	"expected_completion_date" date,
	"warranty_days" integer NOT NULL,
	"released_at" timestamp with time zone,
	"consent_terms" boolean NOT NULL,
	"consent_privacy" boolean NOT NULL,
	"created_via" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_orders_job_number_unique" UNIQUE("job_number"),
	CONSTRAINT "job_costs_nonnegative" CHECK ("job_orders"."labor_cost" >= 0 AND "job_orders"."parts_cost" >= 0 AND "job_orders"."deposit_paid" >= 0 AND "job_orders"."final_cost" >= 0),
	CONSTRAINT "job_warranty_nonnegative" CHECK ("job_orders"."warranty_days" >= 0)
);
--> statement-breakpoint
CREATE TABLE "job_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"note" text,
	"changed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"shop_name" text NOT NULL,
	"tagline" text NOT NULL,
	"owner_name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"messenger_link" text,
	"default_warranty_days" integer NOT NULL,
	"terms_text" text NOT NULL,
	"warranty_text" text NOT NULL,
	"notification_text" text NOT NULL,
	"unclaimed_days" integer NOT NULL,
	CONSTRAINT "settings_singleton" CHECK ("settings"."id" = 1),
	CONSTRAINT "settings_days_nonnegative" CHECK ("settings"."default_warranty_days" >= 0 AND "settings"."unclaimed_days" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "job_orders" ADD CONSTRAINT "job_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_status_history" ADD CONSTRAINT "job_status_history_job_id_job_orders_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_status_history" ADD CONSTRAINT "job_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;