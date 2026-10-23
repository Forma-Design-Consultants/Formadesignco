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

## Architectural ADU milestone

The architectural generator now supports a 25-foot-wide, single-story 2-bedroom/1-bath ADU in the 700–900 gross square-foot range. The default is 25×30 feet = 750 gross SF, approximately 672.64 SF of interior floor after unioning floor-level wall footprints. Net floor includes closets and doorway thresholds; room rectangle schedules include closet zones before closet partitions. Gross area is outside-face footprint, not a jurisdiction's verified fee/energy area.

The explicit model has 6-inch exterior walls, 5-inch interior partitions, 9-foot assumed wall heights, hosted door/window openings, swing directions, closets, kitchen cabinetry/sink/range/refrigerator, tub, toilet, vanity, laundry, linen and schematic furniture. The plan SVG has exterior/room dimensions, feet/inches, a graphic scale and concept labeling. The editable parameters are total gross area, living depth, bedroom split and mirrored orientation; editing is parametric, not arbitrary wall dragging or a CAD editor. SVG and JSON export preserve vectors/geometry. The 3D tab derives its wall solids and fixture bounds from the same model, with walls cut at 3′-6″ and roof hidden; window portions above that cut are not visible. Orbit changes projection only.

Two mirrored ADU options replace ten repeated diagrams in this slice. Other project types and unsupported room combinations remain legacy space studies. Warnings identify infeasible bathroom depth, site-envelope exceedance, fixture overlaps/bounds and wall collisions; these are planning constraints, not a full code checker. Door graph reachability is checked, but full accessibility, egress qualification, door maneuvering clearances, structure, energy and MEP remain professional design tasks. Some edits deliberately produce warnings; a warning does not establish a valid layout. DXF and Revit export remain later work.

Automated tests verify the default layout, net/gross sum, room nonoverlap, door graph reachability, opening host bounds/nonoverlap, doorway voids, mirrored geometry, parameter recomputation, identical wall solids used for rendering, SVG dimensions and fixture serialization, 3D orbit, and invalid-edit warnings. Local Chrome visually verified plan details, two variants, bedroom-width editing, 3D orbit and saving/restoring an edited plan. SVG download event capture timed out in the managed browser; SVG serialization is tested independently and should be checked by the owner in the private preview.
