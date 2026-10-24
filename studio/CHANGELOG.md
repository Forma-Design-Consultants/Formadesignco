# Forma Studio development changelog

## Master directive execution checkpoint - October 23, 2026 (California)

### Added
- Shared architectural catalog for studio, one-bedroom and three-bedroom ADUs; existing two-bedroom baseline preserved. Supported starts are 400/600/750/1,050 gross SF with two mirrored variants.
- Graphical partition/opening/fixture movement, room-edge resizing, footprint resizing, fixture presets, keyboard adjustment, undo/redo/reset and bounded server replay of edits.
- Extended planning checks for opening overlaps, room bounds/overlap, wall junctions and sampled door-swing conflicts. Resizes carry explicit review warnings; none establishes code compliance.
- Geometry-derived plan identities; stored base snapshots preserve new custom designs independently of future generator revisions.
- Full-height exterior/cutaway architectural/site projection, window glazing, flat/gable/hidden roof, orbit, zoom and pan. Fixed roof-painter occlusion observed in mobile QA.
- Named projects and notes, saved alternatives, side-by-side comparisons, duplicate, reversible trash, 20-snapshot history, restore as a new revision and optional autosave.
- Atomic optimistic-save guard and conflict responses, including concurrent identical-request tests and protection against relabeling a changed workspace as saved.
- Authenticated vector PDF and layered DXF exports alongside existing SVG/JSON. Floor PDFs include dimensions/rooms/schedule; site export adds a second sheet and preliminary distances/warnings.
- Feasibility data contract with mapped area/coverage ratios, assumptions and explicit unknown regulatory fields.
- Twelve project categories with clear separation between architectural ADUs and brief/space-study categories.
- Feasibility/consultation/proposal request flow with services, notes, versioned project snapshot, consent and owner outbox. Delivery remains disabled.
- Spanish primary-control beta with stable stored identifiers and language preference.
- Privacy/current-data download and explicit erasure UI while retaining recoverable trash and seven-day staging retention.
- Opt-in debounced address suggestions behind existing licensed-provider readiness/quota gates.
- Current architecture/readme, provider-access update, Revit interchange assessment, complete backlog and launch checklist.

### Validation
- 47 automated cases: architecture, editing, placement, georeferencing, signed provider selections, API security/ownership, versions/concurrency, outbox, failures/quotas, PDF/DXF structures and localization.
- TypeScript no-emit check and production-style Worker build; 37-page marketing regression validation.
- Independent ezdxf audit of a site DXF: AC1015, feet units, 252 LINE entities, zero errors and zero fixes. This is not Revit import acceptance.
- Two-page PDF parsed by Poppler, rendered and visually inspected after dimension/site-warning additions. No clipped sheet content observed. PDF symbols remain schematic; the SVG carries more detailed fixture symbols.
- Desktop Chrome: actual partition pointer drag, numeric edit, undo/redo, save/full reload/reopen with edited room dimensions, duplicate, placement/rotation, exterior site 3D, comparison, version restore, four starts, fixture preset, Spanish stable identifiers and demo review outbox. Hosted final-build save/reopen also retained edited room dimensions; fixed a stale sidebar save label observed during that check.
- Mobile 390×844 and tablet 820×1024 iframe checks: no horizontal body overflow (375/375 and 805/805). Numeric room/partition editing, 3D/site rotation, exterior roof, camera zoom/pan and opt-in autosave revision verified. These are not physical touch/Safari tests.
- Hosted PDF endpoint returned HTTP 200/outcome ok; managed browser download capture failed. Completed browser download remains an explicit acceptance item.

### Unfinished / blocked
- Live California property lookup/alignment/billing: requires licensed Mapbox/Regrid access and owner-approved use/budget/test property. No simulated response is described as live.
- Actual professional review delivery: requires an authorized staging Intelligence contract/credential and separate permission; no emails/production records created.
- Full Spanish, complex GIS/site cases, richer room/topology editor, all non-ADU architectural engines, uploads, native RVT/IFC, physical device/hosted multi-account/accessibility certification and production operations are open. Full platform completion is not claimed.

## Prior milestones
- Owner-private persistent Worker/D1 preview with account isolation and demo outbox.
- Dimensioned 750 SF architectural ADU with shared wall/opening/fixture model and SVG/JSON.
- Synthetic Site Planner with scaled drag/rotation, finite-edge distances, intersections, save/reopen and matching placement projection.
- Licensed property adapter foundation: Mapbox permanent geocoding/imagery, Regrid parcel selection, source metadata, coordinate conversion, signed tickets, manual boundary correction and graceful missing-access fallback.

All milestones remain on PR #18's development branch. No production merge/deployment, DNS change, paid subscription, customer-record change or Intelligence write is included.
