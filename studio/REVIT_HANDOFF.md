# Revit interoperability assessment

## Implemented interchange

The authenticated staging export endpoint generates dimensioned vector PDF, floor/site SVG, structured JSON and a 2D ASCII DXF (AC1015, INSUNITS=2/feet). These are conceptual interchange files, not native RVT or a permit set. DXF import into Revit/AutoCAD has not been executed in this environment; a successful browser download or unit test is not downstream CAD acceptance.

The DXF separates WALLS, WINDOWS, DOORS, DOOR_SWINGS, FIXTURES, ROOMS, PARCEL_PRELIMINARY and EXISTING_STRUCTURES. Wall outlines use floor-level wall solids, so hosted apertures remain visible. Fixtures are schematic outlines, not manufacturer families. Plan coordinates are feet with Y inverted to a CAD north-up axis. Site export applies the exact selected placement before that axis conversion. Do not apply the placement a second time.

## Practical drafter workflow

1. Download the selected design JSON, floor DXF, site DXF and PDF. Record the project revision and geometry-derived plan ID. Resolve all warnings with the client before design development.
2. In a new, disposable Forma Revit test project, import/link the CAD file using explicit feet and a deliberate local origin. Confirm a 25-foot baseline measures 25 feet; compare exterior footprint, wall thickness and opening widths to JSON/PDF. Do not assume automatic unit detection or surveyed positioning succeeded.
3. Treat CAD geometry as a reference underlay. Reconstruct native walls using Forma wall assemblies; place actual door/window/furniture/plumbing families, hosted to the correct walls. Replace schematic windows with qualified egress/accessibility selections as appropriate.
4. Align a sourced/measured site survey separately. The exported GIS local origin, cosine scale and original WGS84 ring are planning metadata, not a Revit shared-coordinate control network. Verify survey datum and site north with the responsible professional before establishing shared coordinates.
5. Reconcile all dimensions, room areas, wall assemblies, junctions, roof geometry, egress, accessibility, structural/MEP/energy systems and jurisdiction notes. Build the coordinated Revit sheets through Forma's drafting checklist; Studio is not a stamped plan generator.

## Structured reconstruction contract

| JSON field | Revit reconstruction target | Review required |
| --- | --- | --- |
| concept.width/depth, units | Baseline footprint and units | Outside-face footprint vs wall location lines |
| concept.walls[id,x1,y1,x2,y2,thickness,height] | Native wall centerline, type and height | Type-to-assembly mapping and junction cleanup |
| concept.doors/windows[wallId,start,width,sill,height] | Hosted families at offsets along oriented wall | Family insertion origin, hand/facing, type sizes, lintels, egress |
| concept.rooms[x,y,w,d] | Room/area reference | Closet inclusion and actual Revit room boundaries |
| concept.fixtures[x,y,w,d,z,h] | Schematic reference for families | Family dimensions, manufacturer clearances and MEP |
| site.placement | One local translation/rotation | Avoid double transform; axis handedness |
| site.property.georeference | Planning site anchor metadata | Survey datum/precision, never automatic legal control |
| project revision / site.planId | Design provenance | Do not import stale alternatives |

A Dynamo/CPython or C# reconstruction importer is feasible, but requires Forma's actual template, family/type mappings and a Revit test session. No automatic reconstruction importer is implemented or claimed tested here.

## IFC / RVT decision

IFC is not implemented. A meaningful IFC export needs correct spatial hierarchy, semantic wall/opening/door/fixture relationships, stable GUIDs, units, placements and independent IFC validation plus Revit round-trip testing. A single triangulated shell would not satisfy editable BIM interchange. Native RVT export is not implemented and cannot be certified without Revit-compatible tooling and a licensed test runtime.

Official Autodesk references reviewed:
- CAD import: https://help.autodesk.com/cloudhelp/2026/ENU/Revit-Model/files/GUID-E8705303-0610-4A82-9118-0C3A742706D2.htm
- Positioning imports/links: https://help.autodesk.com/cloudhelp/2022/ENU/Revit-Model/files/GUID-C922A152-0A30-4E27-BED2-BCE9FF2E5E30.htm
- IFC link and coordinate options: https://help.autodesk.com/cloudhelp/2026/ENU/Revit-Model/files/GUID-DE8B322A-A507-4E03-93EC-AA21F354E43B.htm
- Revit 2027 CAD layers/import symbols: https://help.autodesk.com/cloudhelp/2027/ENU/Revit-DocumentPresent/files/GUID-AE73725C-E248-4338-9FBC-A44E5D99B66E.htm

Revit acceptance remains incomplete until a drafter verifies the exported test package in Forma's actual template. No production project is modified as part of this work.
