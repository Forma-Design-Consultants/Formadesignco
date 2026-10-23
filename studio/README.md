# Forma Studio development version

Target: https://www.formadesignconsultants.com/studio

This is an isolated development branch. No production deployment, main-branch merge, existing customer-data changes, or Intelligence writes are included.

## Run the working preview

Requires Node 24 or later. No dependencies or installation are needed.

```sh
git clone --branch development/forma-studio https://github.com/Forma-Design-Consultants/Formadesignco.git
cd Formadesignco
npm run dev
```

Open http://localhost:4173/studio. The existing website is also served at `/` so its navigation can be reviewed in context. `npm test` runs geometry and HTTP/security tests. `npm run check` checks the existing website.

## Implemented

- Separate Studio page with existing branding, responsive controls and dedicated navigation link on current marketing pages. Existing page content and shared styles are preserved. Navigation generator includes the new entry.
- Six project types: ADU, custom home, addition, garage conversion, duplex/multifamily, commercial/TI. Adaptive brief questions, ten aspect-ratio concepts, structured rectangular room geometry, room-area schedule, conceptual 3D massing and assumed site placement with rotation/offsets.
- Explicit site assumptions, footprint and bedroom-size warnings. No fabricated parcel boundaries, zoning, eligibility, building costs, or source citations.
- Server-side project persistence in a local SQLite database, owner-scoped project reads/updates, guest sessions, development registration/sign-in/sign-out, scrypt password hashes, session rotation and expiry, HttpOnly SameSite cookies (Secure in production), JSON-only mutations, same-origin checks, response CSP, request/body limits and no client-side service credentials.
- Exportable structured JSON brief for downstream design work. Consent-based local review outbox containing project and contact information; it does not send emails or create Intelligence records.

## Integration findings and release blockers

The marketing repository is a static site. GitHub Pages cannot execute this Node backend. Do not merge this page alone and assume persistence/integrations will work. A separately hosted API and same-origin reverse proxy for `/api/studio/*` are required, or a deliberate hosting migration approved by Cody. `/studio` should resolve to `studio/index.html` without changing existing URLs. No hosting migration is made here.

The published Forma Intelligence Site did not declare an MCP server when inspected. This is not proof that no REST endpoints exist. A supported, authenticated Studio-facing API contract and staging credentials must be verified against its source before connecting. Do not expose the internal dashboard, forward internal records to customers, reuse Sites dispatch bypass credentials, or guess endpoints. A restricted server-to-server integration must return an allowlisted public property/feasibility DTO, preserve source URLs and verification status, and accept idempotent CRM/design handoffs. Local requests remain `pending-configuration` and are not automatically delivered.

Email verification, recovery, robust production authentication/rate limiting, project deletion/retention controls, production observability/backups, and consent/privacy review remain release blockers. Development account passwords should be unique test values. The local database is ignored by Git.

The generator is a space-allocation study, not an AI architect or permit-ready floor plan. Rooms partition a rectangle exactly but do not yet resolve circulation, doors/windows, existing conditions, full code compliance, project-specific construction assemblies, photorealistic renders, actual parcel maps, independently verified feasibility, real cost ranges, Revit export or Studio Pro editing. Area totals exclude wall thickness. Multifamily unit access/common areas require professional design. The 3D tab is conceptual massing with assumed 10-foot walls; it is not a construction model. No cost quote is calculated without a verified estimating basis.

## Verification

Five automated test cases exercise 60 concept/type combinations, area coverage and nonoverlap, placement/rotation and room warnings, invalid inputs, persistent project lifecycle, cross-session access denial, consent, account rotation/login/logout, cross-origin rejection, private-source denial and basic routes/security headers. Existing site validation passes on 37 root HTML pages.

The follow-up private staging adapter in `staging/` resolves the preview-hosting milestone. Real local Chrome browser QA now covers desktop plus 390px mobile and 820px tablet iframe viewports. See `staging/README.md` for the precise scope and remaining hosted sign-in verification limits; screenshots are in `qa-evidence/`. Eight automated cases now pass across the original and staging backends. No live Intelligence integration or production migration is included.

## Approval gate

Cody must review a working preview and explicitly approve before any merge or production deployment. No production environment variables, DNS, GitHub Pages settings, access settings or Intelligence configuration were changed.
