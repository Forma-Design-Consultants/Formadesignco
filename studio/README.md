# Forma Studio - development branch

Owner-private preview: https://forma-studio-pr18-preview.justwulfy.chatgpt.site/studio

Future production route: https://www.formadesignconsultants.com/studio. Production is unchanged. PR #18 remains draft on development/forma-studio. No production hosting, DNS, customer records, email or Intelligence integration is changed or authorized.

## Current implementation

The current customer workspace is staging/, a Vinext/Cloudflare Worker app with account-scoped D1 persistence. Its source is canonical in this GitHub branch; the separate Sites repository is a deployment mirror. The root Node/SQLite server and original static client remain a compatibility harness for the initial milestone; they do not contain the full advanced staging UI and must not be deployed as the current platform.

- Architectural starts: 400 SF studio (20×20), 600 SF one-bedroom (20×30), existing 750 SF two-bedroom (25×30), 1,050 SF three-bedroom (34×30.88). Two mirrored options each. All have one bathroom, wall assemblies, hosted openings, kitchen/bath fixtures, storage, dimensions, room schedules and net/gross area. Parameter changes can expose warnings; these are concepts, not guaranteed valid or permit-ready designs.
- Direct editor: select/drag partitions, openings and fixtures; resize rooms through adjoining partitions; edit opening offsets/widths; resize footprint; choose bed/shower presets; undo/redo/reset. Numeric controls complement graphical interaction. The server replays bounded commands against a stored base model, rather than trusting arbitrary client geometry.
- Validation: wall bounds/junctions, room overlap/dimensions/connectivity, opening bounds/overlap, fixture bounds/wall collisions, sampled door swings, area accounting and site intersections. This is not complete code, egress, accessibility, structural or MEP validation. Resized junctions and fixed-size fixtures explicitly require review.
- Site Planner: exact footprint/plan placement, arbitrary rotation, pointer drag, precise nudges, lot-line distances, building intersections, source/assumption labels and matching cutaway/exterior 3D. Geometry-based plan IDs distinguish edits and remain stable across placement. Drawing zoom/pan does not change real-world measurements.
- 3D: shared wall solids, opening voids and fixtures; cutaway/full exterior, flat/gable/hidden conceptual roof, orbit, zoom/pan. This is a schematic orthographic SVG projection, not a photorealistic renderer, terrain model or BIM model. Complex overlapping-object occlusion still needs acceptance testing.
- Projects: names/notes, multiple properties/designs/placements, duplication, comparison, optional autosave after first save, optimistic revisions, up to 20 snapshots, restore as a new revision, reversible trash, explicit account erasure/export. New snapshots retain their base model for deterministic replay after generator changes.
- Exports: vector floor/site SVG, structured JSON, floor PDF or two-sheet floor+site PDF, feet-based layered DXF. Imagery/auth tickets are excluded. PDF rendering and independent DXF parser audit are checked; Revit import is not certified.
- Feasibility: mapped lot area, footprint/known-structure ratios and geometric conflicts. Jurisdiction, legal setbacks, height, easements, utilities and fire requirements stay unknown without authoritative sources. No buildability or cost promise.
- Twelve project categories support scoped briefs/studies: detached/attached/junior ADUs, custom homes, additions, conversions, duplex/multifamily, affordable housing, residential development, commercial buildings/TI. Only supported detached ADU combinations use the detailed architectural generator; other categories remain labeled space studies.
- Review: feasibility/consultation/proposal requests store the edited project, placement, sources, assumptions, demo contacts, services, notes and consent in an owner-scoped staging outbox. Nothing is sent to Forma, email or production Intelligence.
- Spanish primary controls are a labeled beta. Some technical warnings, selectors and exports remain English; full localization is unfinished.

## Real-property access remains blocked

Server-side Mapbox/Regrid integration is implemented and fixture-tested, but no live connection is claimed. Required: dedicated MAPBOX_ACCESS_TOKEN (permanent Geocoding v6 plus Static Images), REGRID_API_TOKEN (California polygons), confirmed licensed display/storage/derived-export uses, provider spending cap and authorized public/demo test property. We generate PROPERTY_SIGNING_SECRET; PROPERTY_LICENSE_CONFIRMED and REAL_PROPERTY_ENABLED remain disabled until approved/configured.

See [REAL_PROPERTY_INTEGRATION.md](REAL_PROPERTY_INTEGRATION.md) for providers, sources, prices and coordinate assumptions. No subscription was purchased. Missing data never becomes invented real geometry. Holed/multipart parcels, over 128 vertices or over 1,500-foot extents remain unsupported; real building outlines are not connected. Use the labeled synthetic demo while credentials are unavailable.

## Development, tests and privacy

Use the Sites skill's existing-project workflow with staging/.openai/hosting.json. Dependencies are configured. Generate append-only migrations from staging/db/schema.ts; do not modify applied migrations. Apply pending migrations separately to local D1 before browser QA with the starter's documented Wrangler --local command. Only the separate owner-private preview is an authorized hosting target.

From the repository root: npm test runs compatibility, staging, geometry, provider and export tests; npm run check validates 37 marketing HTML pages. From staging: node node_modules/typescript/bin/tsc --noEmit checks TypeScript. Build/package with the Sites helper. Browser QA uses desktop Chrome and 390/820px iframe viewports. Physical devices/Safari and hosted multi-account acceptance remain separate gates.

Owner-private ChatGPT sign-in supplies identity. The synthetic local identity is development-only and compiled out of hosted builds. Project/version/outbox actions are account-scoped. Records expire in seven days; histories also cap at 20 snapshots. Trash is recoverable until expiry. Permanent erasure removes owned projects, histories and review requests. Provider quota counters retain only owner/day/count and expire separately. Provider secrets never reach the browser.

## Remaining work and launch gate

The complete platform and all twelve live workflow acceptance steps are NOT complete. Live property lookup and actual review delivery require external access/authorization. Full Spanish, complex GIS/site cases, arbitrary CAD topology, richer room requirements, non-ADU architectural engines, uploads, native BIM/IFC, production customer auth, device/accessibility certification and operational hardening remain open. A milestone passing is not full platform completion.

See [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) for the backlog/checkpoint, [REVIT_HANDOFF.md](REVIT_HANDOFF.md) for interchange limits, and [LAUNCH_READINESS.md](LAUNCH_READINESS.md) for deployment/security gates. Do not request production launch until the complete system is reviewed and Cody explicitly approves a separate merge/deployment plan.
