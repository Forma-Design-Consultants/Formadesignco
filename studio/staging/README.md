# Forma Studio PR #18 private staging

This is the current customer workspace for development/forma-studio. It uses the existing Sites Vinext/Cloudflare Worker runtime and isolated D1 database. Canonical source is in this GitHub branch; the separate Sites source repository is a deployment mirror. The marketing website, production DNS and Forma Intelligence are untouched.

Read [../README.md](../README.md) for the current feature inventory and limits, [../DEVELOPMENT_STATUS.md](../DEVELOPMENT_STATUS.md) for the execution checkpoint, and [../LAUNCH_READINESS.md](../LAUNCH_READINESS.md) before considering any external access.

## Owner testing

Open https://forma-studio-pr18-preview.justwulfy.chatgpt.site/studio with the existing owner's ChatGPT account. Owner-private access is preserved; no new customer password or recovery database is created.

Keep the property label Demo property, California. Try the four architectural starts, open Edit this floor plan, enable direct editing, move a partition or edit a selected room/opening/fixture, and use Undo/Redo. Resize only with attention to warnings. Place the selected edited plan on the demo lot, rotate/nudge/drag, and compare matching cutaway/exterior 3D with concept roof and camera controls.

Give the design a name, save, reopen through My projects, duplicate a separate plan/placement option and compare two or three saved designs. Version history restores an old snapshot as a new revision. Trash is reversible until expiry; Privacy & data offers current-data download and explicit permanent erasure. Autosave is opt-in and starts only after the first save. A changed revision in another tab is rejected instead of silently overwriting it.

Use Demo Tester and tester@example.com for feasibility/consultation/proposal review requests. Service choices, notes, consent, selected geometry and property assumptions stay together in My review requests. This is an isolated staging outbox: no emails or production CRM/Intelligence writes occur.

Spanish primary controls are beta; technical warnings/exports are not fully localized. Other project types are scoped briefs and space studies, not complete architectural engines.

## Property providers

Live lookup remains disabled without credentials, license confirmation and budget. See [../REAL_PROPERTY_INTEGRATION.md](../REAL_PROPERTY_INTEGRATION.md). Explicit search is the default. Opt-in 900 ms debounced autocomplete is available only when the licensed provider gate is ready and counts against the same 30-provider-request daily quota. No live integration has been accepted by fixture tests.

## Storage and auth

Records are owned by the platform-supplied stable user ID, with email required for the private preview. Synthetic local identity exists only in development and is eliminated from hosted builds. Do not bypass dispatch auth or reuse provider/bypass tokens as user credentials.

Projects, trash, review requests and history snapshots expire after seven days; expired rows are filtered immediately and physically purged on subsequent API use. Histories cap at 20 snapshots per project; the owner limit is 50 projects and 20 requests. Current-data export excludes history snapshots and removes signed tickets/image URLs. Permanent erasure removes owned projects, histories and review requests; owner/day provider quota counters expire separately.

New snapshots retain the generated base model plus bounded edit operations. Server replay and optimistic compare-and-swap protect architectural geometry and concurrent updates. Old compatibility projects without stored bases are reconstructed from their original parameters; this is a legacy migration path, not a promise of cross-version CAD fidelity.

## Build and validation

Use the Sites skill's existing-project open/build/package workflow; preserve the ID in .openai/hosting.json. Generate append-only migrations from db/schema.ts. Local D1 needs pending migrations applied with the starter's Wrangler --local command; hosted publication applies its own copies before Worker upload. Do not replay or edit applied migrations.

From repository root: npm test and npm run check. From staging: node node_modules/typescript/bin/tsc --noEmit. Build with the Sites helper. Owner-preview publication is authorized; production publication is not.

See the checkpoint for exact automated/browser/export results. Responsive iframe QA is not physical iPhone/iPad or Safari certification. Revit import, live provider alignment, full Spanish, external tester accounts and actual Intelligence delivery remain incomplete.
