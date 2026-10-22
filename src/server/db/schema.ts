import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  date,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
});
export const customers = pgTable("customers", {
  id: uuid().defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text().notNull().unique(),
  messenger: text(),
  address: text(),
  createdAt: createdAt(),
});
export const jobOrders = pgTable(
  "job_orders",
  {
    id: uuid().defaultRandom().primaryKey(),
    jobNumber: text("job_number").notNull().unique(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    category: text().notNull(),
    brand: text(),
    model: text(),
    serialNumber: text("serial_number"),
    reportedIssue: text("reported_issue").notNull(),
    accessoriesReceived: text("accessories_received"),
    conditionNotes: text("condition_notes"),
    ageNote: text("age_note"),
    underManufacturerWarranty: text("under_manufacturer_warranty", {
      enum: ["yes", "no", "unknown"],
    })
      .notNull()
      .default("unknown"),
    powersOn: text("powers_on", { enum: ["yes", "no", "unknown"] })
      .notNull()
      .default("unknown"),
    serviceType: text("service_type", {
      enum: ["drop_off", "pickup_delivery"],
    }).notNull(),
    serviceAddress: text("service_address"),
    diagnosis: text(),
    laborCost: integer("labor_cost"),
    partsCost: integer("parts_cost"),
    depositPaid: integer("deposit_paid").notNull().default(0),
    finalCost: integer("final_cost"),
    status: text({
      enum: [
        "received",
        "diagnosing",
        "awaiting_approval",
        "waiting_for_parts",
        "in_repair",
        "ready_for_pickup",
        "released",
        "unrepairable",
        "cancelled",
      ],
    })
      .notNull()
      .default("received"),
    expectedCompletionDate: date("expected_completion_date"),
    warrantyDays: integer("warranty_days").notNull(),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    consentTerms: boolean("consent_terms").notNull(),
    consentPrivacy: boolean("consent_privacy").notNull(),
    createdVia: text("created_via", {
      enum: ["customer_form", "staff"],
    }).notNull(),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check(
      "job_costs_nonnegative",
      sql`${t.laborCost} >= 0 AND ${t.partsCost} >= 0 AND ${t.depositPaid} >= 0 AND ${t.finalCost} >= 0`,
    ),
    check("job_warranty_nonnegative", sql`${t.warrantyDays} >= 0`),
  ],
);
export const jobStatusHistory = pgTable("job_status_history", {
  id: uuid().defaultRandom().primaryKey(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobOrders.id),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  note: text(),
  changedBy: uuid("changed_by").references(() => users.id),
  createdAt: createdAt(),
});
export const jobCounters = pgTable("job_counters", {
  date: date().primaryKey(),
  lastValue: integer("last_value").notNull(),
});
export const settings = pgTable(
  "settings",
  {
    id: integer().primaryKey().default(1),
    shopName: text("shop_name").notNull(),
    tagline: text().notNull(),
    ownerName: text("owner_name").notNull(),
    address: text().notNull(),
    phone: text().notNull(),
    messengerLink: text("messenger_link"),
    defaultWarrantyDays: integer("default_warranty_days").notNull(),
    termsText: text("terms_text").notNull(),
    warrantyText: text("warranty_text").notNull(),
    notificationText: text("notification_text").notNull(),
    unclaimedDays: integer("unclaimed_days").notNull(),
  },
  (t) => [
    check("settings_singleton", sql`${t.id} = 1`),
    check(
      "settings_days_nonnegative",
      sql`${t.defaultWarrantyDays} >= 0 AND ${t.unclaimedDays} >= 0`,
    ),
  ],
);
