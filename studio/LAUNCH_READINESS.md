# Production launch gate - NOT READY

No merge, live deployment, domain/DNS changes, production customer-data changes or Intelligence writes are authorized. Do not request launch approval while the following gates remain open.

- [ ] Live California address/APN/parcel/aerial acceptance with licensed staging keys, explicit budget and data-use permissions; tests must distinguish ambiguity, neighbors, stacked parcels and missing data.
- [ ] Production customer authentication provider/registration, verification, recovery, guest policy, account isolation and abuse/rate-limit design approved and tested. Owner-private ChatGPT access is staging only.
- [ ] Physical iPad/iPhone Pointer Events and Safari QA; hosted two-account end-to-end isolation; complete accessibility audit with a screen reader and keyboard.
- [ ] Independent CAD/Revit validation of PDF/SVG/DXF/JSON units, coordinate handedness, hosted opening offsets and model reconstruction.
- [ ] Complete Spanish localization and professional review of technical warnings, consent, privacy language and exports. Current Spanish primary controls are explicitly beta.
- [ ] Architectural constraints for all advertised supported sizes/edits; unresolved warnings must not become claims of permit readiness. Full topology/structural/egress/accessibility/MEP/energy review is not implemented.
- [ ] Provider-derived real existing buildings, multiparcel/holed/large polygon support and surveyed/manual corrections fully tested if included in launch scope; currently unsupported cases must remain explicit.
- [ ] Verified jurisdiction/ADU rule sources, applicability, update dates and professional review. Geometry metrics and assumed buffers do not establish legal eligibility, setbacks, lot coverage or buildability.
- [ ] Customer privacy notice, consent terms, retention/deletion/export policy, provider data licenses and internal access reviewed. Do not test with real customer data without separate authorization.
- [ ] Approved staging Forma Intelligence endpoint/contract, scoped server-to-server credentials, delivery idempotency, retries, error queue and end-to-end acceptance before any live handoff. Current outbox is demo-only and sends nothing.
- [ ] Reference uploads designed with size/type scanning, private storage, retention and ownership controls. Uploads are not implemented; no unscanned public upload endpoint is exposed.
- [ ] Backups/restore drill, observability, error alerts, cost limits, quotas, security review, concurrent update testing and incident/rollback process.
- [ ] Production hosting decision approved: retain static marketing with a same-origin proxy for /studio and /api/studio/* to a hardened app, or approve an intentional hosting migration. GitHub Pages cannot execute the Worker/Node APIs.
- [ ] Regression check of current marketing design, content, contact forms, SEO routes and analytics; confirm explicit production scope with Cody.
- [ ] Cody reviews complete working core workflow and explicitly authorizes a separately reviewed merge/deployment plan.

## Safe deployment proposal (not executed)

Build and preserve a versioned backend artifact and append-only D1 migrations; validate on owner-private staging first. Back up target data before any approved migration. Add the same-origin route/proxy only after hosting approval, retaining current page URLs and asset behavior. Configure production-specific secrets, auth, licenses and service quotas independently of staging. Run smoke tests and a reversible routing rollback drill. Do not promote the preview's synthetic identity branch, demo contacts, local SQLite file or owner allowlist into public production.

## Staging operational requirements

Existing Sites Vinext/Cloudflare Worker and D1 are sufficient for the current private preview. Runtime assets use same-origin APIs; the development source lives on PR #18 and the separate Sites source repository is a deployment mirror. Generated migrations 0000 through 0002 are immutable once applied. Only the owner audience is retained. Project/review records expire after seven days; versions are additionally capped at 20 per project. Temporary browser image URLs and provider tokens are not distributed through exports.
