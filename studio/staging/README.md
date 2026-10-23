# Forma Studio PR 18 private staging

This is the preview adapter for the canonical `development/forma-studio` branch. It uses the Sites Vinext/Cloudflare Worker runtime and an isolated D1 database. Source is maintained in this branch; the separate Sites source repository is a deployment mirror only. The preview does not run the standalone Node/SQLite server or change production hosting.

## Access and testing

Owner-private Sites access requires the owner's ChatGPT sign-in. No preview password, email registration or recovery database is created. Verification and recovery are handled by the owner's ChatGPT account. Do not invite external testers without reviewing access, privacy and production-auth requirements.

Use `Demo property, California` as the property label, `Demo Tester` as the contact name, and `tester@example.com` as the email. Real parcel lookup and Intelligence integrations are disabled. Existing copied marketing forms are intercepted before submission and cannot send live inquiries.

Test: select each project type, change area/rooms, explore ten concepts, switch plan/site/3D, adjust site placement, save a project, reload and reopen it through My projects, and save a consented demo review request. Account shows the platform sign-in model. My projects includes deletion of all owned preview data.

API records are scoped to the platform-supplied authenticated user ID. Records expire after seven days and are excluded immediately; physical deletion of expired rows occurs on the next API request. A user may delete their own projects and review requests immediately. Limits: 50 projects and 20 review requests per owner. No live emails, CRM records, parcel searches or costs are created. Database tables and source files are not publicly served.

## Build and test

Use the Sites install/build/package helpers from the Sites skill. `node --test tests/*.test.mjs` tests the staging API against an in-memory SQLite adapter, including auth rejection, cross-origin protection, owner isolation, consent, demo-only restrictions, expiry/purge, erasure and all six project categories. Migrations are generated from `db/schema.ts` and committed under `drizzle/`; publishing applies them only to this preview's D1 database.

The developer-only synthetic local identity is guarded by `import.meta.env.DEV` in the preserved starter Worker entrypoint. Hosted builds eliminate that branch. Hosted requests must have identity headers supplied by Sites; no anonymous or bypass-token writes are accepted.

## Browser QA

Desktop Chrome: existing homepage/navigation, Studio navigation, property input, six project types and ten-concept counts, plan/site/3D, concept selection, save/reload/reopen, restored type/area, consented demo handoff and account dialog checked.

Mobile 390x844 and tablet 820x1024: real iframe viewports using `/qa.html?size=mobile` and `/qa.html?size=tablet` in Chrome. These are responsive browser checks, not physical iPhone/iPad device tests. Mobile menu, property input, concept generation/selection and 3D verified; tablet site view verified. Same-origin framing is allowed only to enable the QA harness. Desktop, mobile and tablet screenshots are committed with the PR evidence.

Hosted owner sign-in is enforced by Sites. Local browser QA uses a synthetic development identity; the browser did not exercise ChatGPT sign-in/recovery or two real hosted accounts. Account isolation is tested against the API implementation. Do not describe these as hosted multi-account end-to-end tests.

## Later production proposal — approval required

1. Keep the current marketing site and custom-domain DNS unchanged during development.
2. For launch, approve either a same-origin proxy for `/studio` and `/api/studio/*` to a hardened backend or a deliberate whole-domain hosting migration. GitHub Pages alone cannot run either backend. This preview is not a proxy implementation for the custom domain.
3. Decide production customer authentication, email verification/recovery, per-user access, retention/deletion, backups, monitoring and privacy terms before public access. Staging ChatGPT owner sign-in is not the final customer account flow.
4. Verify and implement a narrow server-to-server Forma Intelligence API with scoped credentials and allowlisted public data. No live Intelligence access is configured here.
5. Require Cody's explicit approval of a working preview before merging PR 18 or changing production hosting, DNS, website files or Intelligence records.

Plan-generation limitations remain those in `../README.md`: conceptual rectangular space allocation and massing only, not permit-ready design, verified feasibility, construction estimates or Revit exports.
