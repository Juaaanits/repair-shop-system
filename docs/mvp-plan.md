# MVP Plan — Anton Fix Appliances Repair Job Order App

Deliver a counter-service workflow for appliance intake, repair management, and printable job order slips.

## Development process

Implement one milestone at a time. Review changes, run automated checks, and confirm the milestone acceptance criteria before merging. Setup instructions are maintained in the [README](../README.md), and review practices are defined in [Contributing](CONTRIBUTING.md).

## 1. MVP scope

**In (build now)**

- Public intake form (`/intake`) matching the prototype, saved to the database
- Confirmation screen with job number
- Owner login (one account, seeded)
- Admin jobs list: search + status filter
- Admin job detail: edit fields, labor/parts/deposit, balance due, status change with history
- "Notify customer" helper: prefilled message per status, copy button, `tel:`/`sms:` links, Messenger link if provided
- Printable Job Order Slip (A4/A5, shop copy + customer copy, terms, warranty, notification notice, signature lines)
- Settings page (owner): shop name, tagline, address, phone, warranty days, terms text, notification text
- PWA basics: manifest + icons so it can be added to the home screen

**Out (not in MVP)**
Public tracking page, QR codes, technician role/user management, appliance category editor (use a constant list), 80mm thermal layout, service worker/offline, automated Messenger/SMS, payments, inventory, photos, AI features. These are in section 5.

## 2. Data model (MVP)

- `users`: id, name, email (unique), password_hash, created_at
- `customers`: id, full_name, phone (normalized `+63…`), messenger (nullable), address (nullable), created_at
- `job_orders`: id (uuid), job_number (unique), customer_id, category (text from a constant list), brand, model, serial_number, reported_issue, accessories_received, condition_notes, age_note, under_manufacturer_warranty (yes/no/unknown), powers_on (yes/no/unknown), service_type (drop_off / pickup_delivery), service_address, diagnosis, labor_cost, parts_cost, deposit_paid, final_cost (all integer centavos, nullable except deposit default 0), status, expected_completion_date, warranty_days (copied from settings at creation), released_at, consent_terms, consent_privacy, created_via (customer_form / staff), created_at, updated_at
- `job_status_history`: id, job_id, from_status, to_status, note, changed_by, created_at
- `job_counters`: date (PK), last_value
- `settings`: single row (shop name, tagline, owner name, address, phone, messenger link, default warranty days, terms text, warranty text, notification text, unclaimed days)

Statuses: `received → diagnosing → awaiting_approval → waiting_for_parts → in_repair → ready_for_pickup → released`, plus `unrepairable` and `cancelled`.

## 3. Implementation milestones

Each milestone defines implementation requirements and acceptance checks. Record verification results in the pull request.

---

### M1 — Foundation

**Done when:** `npm run db:up && npm run db:migrate && npm run db:seed && npm run dev` initializes the application, the owner can sign in to the administration page, and unauthenticated requests to `/admin` redirect to login.

**Requirements:**

1. Scaffold a Next.js App Router + TypeScript (strict) + Tailwind project using npm (commit package-lock.json), ESLint, Prettier, Vitest.
2. Add Docker Compose Postgres and scripts: db:up, db:migrate, db:seed.
3. Define the Drizzle schema for ALL tables in section 2 and generate the initial migration.
4. Seed script: one owner user from env vars (OWNER_EMAIL, OWNER_PASSWORD, hashed with bcryptjs) and a default settings row with the default terms/warranty/notification texts.
5. Owner login with Auth.js credentials. /admin is protected by a server-side session check. Add a logout button.
6. Create .env.example, README with run instructions, and architecture notes in README.md.

**Manual test:** wrong password is rejected; right password reaches `/admin`; opening `/admin` in a private window redirects to login.

---

### M2 — Core domain

**Done when:** unit and integration tests pass for the rules below. No UI yet.

**Requirements:**

Build the domain layer in `src/server/services` with tests.

- normalizePhone: accepts 09XXXXXXXXX, 639XXXXXXXXX, +639XXXXXXXXX (spaces/dashes allowed) and returns +639XXXXXXXXX; rejects anything else.
- Zod schemas: intake input (address required only when service_type = pickup_delivery; both consents must be true), staff job update, status change.
- Status transitions in ONE file with a function canTransition(from, to). Every status can go to cancelled; released and cancelled are final.
- Money helpers: pesos <-> centavos, formatPeso, balanceDue = labor + parts - deposit.
- createJob service: find-or-create customer by normalized phone, create job with status received, write the first history row, all in one transaction.
- Job number generation using the atomic counter (INSERT ... ON CONFLICT DO UPDATE ... RETURNING) with the Manila date.
- changeStatus service: enforces canTransition and writes history.

Tests (Vitest): phone cases, schema edge cases, transition table, balance math, and a concurrency test that creates 20 jobs in parallel and asserts all job numbers are unique and sequential. Run the tests and record results in the pull request.

---

### M3 — Public intake form

**Done when:** A mobile intake submission creates a job in the database.

**Requirements:**

Implement `/intake` to match `docs/reference/anton-fix-intake.html` (layout, fields, wording, validation messages).

- Server-side submit using the createJob service. Re-validate with the Zod schema on the server; show field errors from the server too.
- Honeypot field and a simple per-IP rate limit (document its limitation in README.md).
- After success show the confirmation screen with the real job number and the notification + claim notices. Do not show a tracking code (not in MVP).
- Mobile-first, accessible labels, keyboard focus visible, dark mode via prefers-color-scheme.
- Appliance categories come from a single constant list.

Add tests for the server action (valid submit, invalid submit, honeypot filled). Record commands and results in the pull request.

**Manual test:** submit with missing fields (errors show); submit as pickup without an address (error); submit a valid one on your phone; confirm the job number looks like `AF-YYYYMMDD-001`.

---

### M4 — Admin jobs

**Done when:** The owner can manage a repair from received to released in the browser.

**Requirements:**

Build a tablet-friendly administration interface for job management.

- /admin/jobs: list with search (job number, customer name, phone, brand/model), status filter, newest first, pagination. Status badges.
- /admin/jobs/new: staff creates a job (same fields; consents recorded as confirmed by staff).
- /admin/jobs/[id]: edit fields, enter labor/parts/deposit/final cost (pesos in the UI, centavos in the DB), show balance due, change status with an optional note via changeStatus, show the status history timeline.
- "Notify customer" panel: prefilled message by status with {first_name}, {category}, {brand}, {job_number}, {balance}; Copy button; tel: and sms: links; Messenger link only if the customer gave a username/link. Templates live in one constants file. Do NOT call any Facebook/Messenger API.
- Every server action checks the session and re-validates input.

Add tests for the search query and for rejecting unauthenticated calls. Record results in the pull request.

**Manual test:** create a job from the form, find it by phone, move it through every status, try an illegal jump (e.g. received → released) and confirm it is rejected, check the history timeline.

---

### M5 — Print slip + settings

**Done when:** The slip prints from a tablet or laptop with a legible customer receipt.

**Requirements:**

1. /admin/jobs/[id]/print with a Print button (window.print) and a @media print stylesheet: hide app chrome, black-and-white friendly.
2. Layout: centered shop header (name, tagline, address, phone), rule, large job number, date/time (Manila), sections: Customer, Appliance, Issue & Diagnosis, Estimate (labor, parts, deposit, balance), Terms & Warranty, Signatures (customer + technician, printed names, date).
3. Print two copies on one A4 page (shop copy and customer copy) separated by a cut line. Add a single-copy option.
4. Terms text comes from settings and must include: notification notice, estimate-approval clause, pre-existing condition clause, warranty (warranty_days snapshot from the job, covers repaired fault/parts only, excluded cases), unclaimed-items clause, claim-with-ID notice, privacy line.
5. Owner-only /admin/settings to edit shop details and all terms texts, with a note: "These terms are templates. Have them reviewed by a qualified professional."
6. PWA basics: web app manifest, icons (192/512 + maskable), apple-touch-icon, theme color. No service worker yet.
7. Never print any device password.

Validate printing with browser PDF export and document layout limitations in the pull request.

**Manual test:** print to PDF and check both copies; change warranty days in settings, create a new job, and confirm old jobs keep their original days; add the site to the home screen on Android/iPad.

---

### M6 — Harden and deploy

**Requirements:**

- Add security headers (CSP, frame-ancestors, Referrer-Policy) appropriate for this app; explain anything you had to relax.
- Review every server action for auth + validation; record findings and resolutions in the pull request.
- Add one Playwright smoke test: submit intake -> owner login -> find job -> change status -> open print page.
- Write deployment steps for Vercel + a hosted Postgres (Neon or Supabase), including env vars and how to run migrations and seed in production.
- Write docs/PRIVACY.md: what personal data is stored and a retention suggestion.
  Run lint, typecheck, unit tests, and the smoke test; record results in the pull request.

## 4. Acceptance checklist (the MVP is done when all are true)

- [ ] A customer can submit the form on a phone and gets a job number
- [ ] Wrong/missing input is rejected on the server, not just in the browser
- [ ] Only the logged-in owner can see or change jobs
- [ ] Two jobs created at the same moment never get the same job number (test proves it)
- [ ] Illegal status jumps are rejected; every change appears in history
- [ ] Balance due is correct to the centavo
- [ ] The printed slip has shop details, appliance, costs, terms, warranty, notification notice, signature lines
- [ ] Old jobs keep their original warranty days after settings change
- [ ] The app can be added to a phone/tablet home screen
- [ ] `npm run lint`, `npm run typecheck`, `npm test` pass, and the Playwright smoke test passes

## 5. After the MVP (in this order)

1. Public tracking page with tracking code + last 4 phone digits, and a QR code on the slip
2. Technician role and user management
3. 80mm thermal slip layout
4. Appliance category editor, parts-cost breakdown
5. Photo attachments at intake
6. Service worker/offline shell
7. Automated customer messaging (only after checking the platform's current rules and approval requirements)
8. AI feature, e.g. reading model/serial plates from a photo

## 6. Test with the real user early

After M3, show the form to Anton and one real customer. After M5, run a pretend repair end to end with Anton using real wording. Fix wording and missing fields **before** building anything from section 5.
