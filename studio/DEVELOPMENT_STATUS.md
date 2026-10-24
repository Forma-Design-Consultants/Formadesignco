# Forma Studio execution checkpoint

Production is frozen. PR #18 stays draft on development/forma-studio. The existing owner-private preview is the only authorized hosting target. No subscriptions, live CRM/email writes or real customer test data are authorized.

## Complete work register

| Workstream | Current state / next acceptance requirement |
| --- | --- |
| Real property | Mapbox/Regrid adapters, signed provenance and manual polygon correction implemented. BLOCKED: licensed provider tokens, permitted storage/display/export uses, budget and authorized test address. Live end-to-end acceptance is incomplete. |
| Property maps | Demo drag/rotate/measurement/3D working; real provider geometry shares coordinates. Fixed imagery viewport. Multi-parcel assemblies, holes, large polygons, real building outlines, map pan/zoom remain open. |
| Architectural generator | Implemented and tested: studio/1BR/2BR/3BR starts with two mirrors, fixtures, hosted openings and shared solids. Unsupported combinations/categories remain labeled studies. Additional room requirements and genuinely different modern/traditional arrangements remain open. |
| Direct editor | Implemented bounded partition/opening/fixture/room/footprint edits, presets, undo/redo, server replay, junction/overlap/swing warnings. New saved designs retain base snapshots. Arbitrary topology, nonrectangular building footprints and full architectural constraints remain unfinished. |
| Projects | Implemented names/notes, duplicate alternatives, comparison, revisions, 20 snapshots, restore, optional autosave, reversible trash, privacy export/erasure and stale-writer protection. Public customer registration/guest policy needs production architecture approval. |
| 3D | Implemented exterior/cutaway, orbit, zoom/pan and concept roofs from shared solids. Roof-painter defect found in mobile QA was fixed. SVG projection remains schematic; complex overlapping-object occlusion, terrain and photorealism are not certified. |
| Feasibility | Implemented source/status framework, parcel/footprint/known-area ratios and explicit unknown regulations. Verified constraints remain blocked on authoritative datasets and applicability review. |
| Exports | Implemented SVG/JSON/PDF/DXF. PDF rendered/inspected; ezdxf audit has zero errors/fixes. Revit assessment documented; actual Revit/CAD import, IFC and native RVT remain incomplete. |
| Review | Implemented typed feasibility/consultation/proposal requests, notes/services, consent, owned project snapshot and review queue. Demo-only; actual delivery is BLOCKED on authorized staging contract/credentials. |
| Spanish | Implemented primary-control beta preserving stored identifiers. Technical selectors/warnings, privacy text and exports need a complete bilingual review. |
| Privacy/security | Owner isolation and signed property data tested; retain seven-day staging expiry. Production auth, backups, monitoring, recovery, data policy and external tester review remain launch blockers. |
| QA | Run geometry/editor/API/security/export regressions and responsive mouse tests for changes. Physical touch/Safari, multiple hosted accounts, live data and downstream CAD/Revit import require separate acceptance. |

## Core workflow acceptance

Real address → sourced parcel → aerial: BLOCKED until provider access; controlled provider fixtures do not satisfy live acceptance. Architectural selection → exact placement → measurements → 2D/3D → editing → save/reopen/export: extend and test in staging. Review requests remain a consented demo outbox, NOT delivery to Forma. The twelve-step core workflow and full platform are not complete while these gates remain.

## Validation checkpoint

47 automated tests pass, including direct editing, geometric identity, provider autocomplete contract, versions/retention/erasure, concurrency, PDF/DXF and 16 exact runtime mirrors. TypeScript no-emit and the packaged Worker build passed. Marketing regression validation passed for 37 HTML pages.

Desktop Chrome verified actual partition drag (13.5 to 15 feet), numeric changes, undo/redo, saved edited room dimensions after full reload, duplication/comparison, version restoration as a new revision, four architectural starts, twin-bed substitution, Spanish identifier stability and consented demo consultation/outbox. Mobile 390×844 and tablet 820×1024 iframe checks verified numeric editing, exterior/cutaway, site rotation and camera zoom/pan with no horizontal body overflow (375/375 and 805/805). This is not physical touch/Safari certification.

Independent export QA: two vector PDF sheets rendered and inspected after dimensions/warnings were added; DXF AC1015 with units=feet and 252 LINE entities passed ezdxf with zero errors/fixes. Revit import is NOT tested. Hosted PDF request returned HTTP 200/outcome ok in Worker logs, but the managed browser reported a failed download capture. Do not claim a completed browser download; owner-browser acceptance remains open.

The existing owner-private preview was updated successfully from Sites source commit a3ca0243eb58c1e68cd3c8124483a29c14796b2d, version appgprj_6adbbeb4ad908191ab8351f028b5acdb~appgver_3ff2c074c3cc819184d78298299b3882. URL: https://forma-studio-pr18-preview.justwulfy.chatgpt.site/studio. Hosted editing/save/reopen retained the changed bedroom dimensions. A stale sidebar save-state label found in hosted QA was fixed before this final publication. Owner-only audience was verified; no external viewers were added. No production change was made.

Autosave was also verified in the tablet viewport: after the first manual save, editing project notes produced revision 2 without another Save click. Available screenshot files are qa-evidence/master-three-bedroom.jpg and qa-evidence/master-mobile-exterior.jpg. Comparison and hosted editor captures were visually inspected, but their file synchronization did not complete; no nonexistent screenshot link is supplied.

## Exact next actions

1. Preserve this checkpoint in draft PR #18. The existing owner-private preview update and final build/tests are complete; keep subsequent work on the same development branch and private Site.
2. When licensed keys/rights/budget are available, configure only the preview secrets and run a public authorized California address/APN through all twelve core steps. Record actual imagery alignment, source date, missing/ambiguous cases and resulting persisted plan; do not replace fixture claims with live claims before then.
3. Continue unblocked work in order: complete Spanish technical/consent/export localization; stronger room/topology constraints and irregular building footprints; GIS multiparcel/holed geometry and sourced real structures; Revit template/type mapping and downstream import acceptance when a test runtime is provided.
4. Harden production auth/guest policy, upload scanning/storage, observability/backups, complete accessibility/device testing and staged Intelligence delivery only with the separate access/authorization gates in LAUNCH_READINESS.md.

No full-platform completion or production readiness is claimed. Do not ask the owner to choose the next feasible feature, and do not treat missing paid API access as permission to buy services or modify production.
