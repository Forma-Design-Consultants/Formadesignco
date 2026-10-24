import {activeProperty,placePoint,footprint,siteAnalysis} from './site-planner.mjs';
const ascii=s=>String(s??'').replace(/[′’]/g,"'").replace(/[″]/g,'"').replace(/[^\x20-\x7e]/g,'-');
const n=x=>Number(x.toFixed(4));
export function designDXF(c,{site=false}={}){
 const out=['0','SECTION','2','HEADER','9','$ACADVER','1','AC1015','9','$INSUNITS','70','2','0','ENDSEC','0','SECTION','2','ENTITIES'];
 const world=(x,y)=>site?placePoint({x,y},c):{x,y};
 const line=(a,b,layer)=>out.push('0','LINE','8',layer,'10',String(n(a.x)),'20',String(n(-a.y)),'30','0','11',String(n(b.x)),'21',String(n(-b.y)),'31','0');
 const polygon=(poly,layer)=>poly.forEach((p,i)=>line(p,poly[(i+1)%poly.length],layer));
 for(const w of c.solids.filter(s=>s.z===0)){const horizontal=Math.abs(w.y2-w.y1)<1e-6,t=w.thickness/2,poly=horizontal?[[w.x1,w.y1-t],[w.x2,w.y2-t],[w.x2,w.y2+t],[w.x1,w.y1+t]]:[[w.x1-t,w.y1],[w.x2-t,w.y2],[w.x2+t,w.y2],[w.x1+t,w.y1]];polygon(poly.map(([x,y])=>world(x,y)),'WALLS');}
 for(const o of [...c.windows,...c.doors]){const w=c.walls.find(w=>w.id===o.wallId),L=Math.hypot(w.x2-w.x1,w.y2-w.y1),ux=(w.x2-w.x1)/L,uy=(w.y2-w.y1)/L,x=w.x1+ux*o.start,y=w.y1+uy*o.start;line(world(x,y),world(x+ux*o.width,y+uy*o.width),'sill'in o?'WINDOWS':'DOORS');if(o.kind==='hinged'){line(world(x,y),world(x-uy*o.swing*o.width,y+ux*o.swing*o.width),'DOORS');let previous=world(x+ux*o.width,y+uy*o.width);for(let i=1;i<=12;i++){const a=i*Math.PI/24*o.swing,p=world(x+o.width*(ux*Math.cos(a)-uy*Math.sin(a)),y+o.width*(uy*Math.cos(a)+ux*Math.sin(a)));line(previous,p,'DOOR_SWINGS');previous=p;}}}
 for(const f of c.fixtures)polygon([[f.x,f.y],[f.x+f.w,f.y],[f.x+f.w,f.y+f.d],[f.x,f.y+f.d]].map(([x,y])=>world(x,y)),'FIXTURES');
 for(const r of c.rooms){const p=world(r.x+r.w/2,r.y+r.d/2);out.push('0','TEXT','8','ROOMS','10',String(n(p.x)),'20',String(n(-p.y)),'30','0','40','.5','1',ascii(r.name));}
 if(site){const prop=activeProperty(c);polygon(prop.parcel,'PARCEL_PRELIMINARY');for(const s of prop.structures)polygon(s.polygon,'EXISTING_STRUCTURES');}
 out.push('0','ENDSEC','0','EOF');return out.join('\r\n')+'\r\n';
}
export function designPDF(c,{site=false,project={}}={}){
 const streams=[],width=792,height=612;
 const page=(isSite)=>{
  let ops='0.15 0.18 0.16 RG 0.15 0.18 0.16 rg\n';
  const text=(x,y,size,value)=>{const s=ascii(value).replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)');ops+=`BT /F1 ${size} Tf ${n(x)} ${n(y)} Td (${s}) Tj ET\n`;};
  text(30,578,17,'FORMA STUDIO / '+(isSite?'PRELIMINARY SITE PLAN':'ARCHITECTURAL FLOOR PLAN'));text(30,560,10,project.name||'Concept design');text(30,546,8,project.address||'Demo property');text(30,24,8,'CONCEPT ONLY - NOT PERMIT READY. GIS IS NOT A SURVEY. PROFESSIONAL REVIEW REQUIRED.');
  const prop=activeProperty(c),bounds=isSite?[...prop.parcel,...footprint(c)]:[{x:-4,y:-4},{x:c.width+5,y:c.depth+5}],xs=bounds.map(p=>p.x),ys=bounds.map(p=>p.y),minX=Math.min(...xs),minY=Math.min(...ys),w=Math.max(...xs)-minX,d=Math.max(...ys)-minY,scale=Math.min(510/w,465/d),ox=30+(510-w*scale)/2,oy=70+(465-d*scale)/2,xy=p=>({x:ox+(p.x-minX)*scale,y:oy+(d-(p.y-minY))*scale}),world=(x,y)=>isSite?placePoint({x,y},c):{x,y};
  const line=(a,b,weight=.5)=>{const p=xy(a),q=xy(b);ops+=`${n(weight)} w ${n(p.x)} ${n(p.y)} m ${n(q.x)} ${n(q.y)} l S\n`;};
  const poly=(points,weight=.5)=>points.forEach((p,i)=>line(p,points[(i+1)%points.length],weight));
  if(isSite){poly(prop.parcel,1.3);for(const s of prop.structures){poly(s.polygon,.8);const center=s.polygon.reduce((p,q)=>({x:p.x+q.x/s.polygon.length,y:p.y+q.y/s.polygon.length}),{x:0,y:0}),at=xy(center);text(at.x-30,at.y,6,s.label);}for(const q of siteAnalysis(c).clearances){line(q.a,q.b,.3);const at=xy({x:(q.a.x+q.b.x)/2,y:(q.a.y+q.b.y)/2});text(at.x+2,at.y+2,6,q.distance.toFixed(1)+' ft');}}
  for(const s of c.solids.filter(s=>s.z===0))line(world(s.x1,s.y1),world(s.x2,s.y2),Math.max(.3,s.thickness*scale));
  for(const f of c.fixtures)poly([[f.x,f.y],[f.x+f.w,f.y],[f.x+f.w,f.y+f.d],[f.x,f.y+f.d]].map(([x,y])=>world(x,y)),.35);
  for(const o of [...c.doors,...c.windows]){const wall=c.walls.find(w=>w.id===o.wallId),L=Math.hypot(wall.x2-wall.x1,wall.y2-wall.y1),ux=(wall.x2-wall.x1)/L,uy=(wall.y2-wall.y1)/L,x=wall.x1+ux*o.start,y=wall.y1+uy*o.start;if('sill'in o){ops+='0.2 0.45 0.5 RG\n';line(world(x,y),world(x+ux*o.width,y+uy*o.width),.6);ops+='0.15 0.18 0.16 RG\n';}else if(o.kind==='hinged'){line(world(x,y),world(x-uy*o.swing*o.width,y+ux*o.swing*o.width),.4);let last=world(x+ux*o.width,y+uy*o.width);for(let i=1;i<=12;i++){const a=i*Math.PI/24*o.swing,p=world(x+o.width*(ux*Math.cos(a)-uy*Math.sin(a)),y+o.width*(uy*Math.cos(a)+ux*Math.sin(a)));line(last,p,.25);last=p;}}}
  if(!isSite){for(const r of c.rooms){const p=xy({x:r.x+r.w/2,y:r.y+r.d/2});text(p.x-r.name.length*1.6,p.y,6,r.name);text(p.x-20,p.y-9,5.5,`${r.w.toFixed(1)} x ${r.d.toFixed(1)} ft`);}line({x:0,y:-2},{x:c.width,y:-2});for(const x of [0,c.width])line({x,y:-.5},{x,y:-2.5});let at=xy({x:c.width/2,y:-2.5});text(at.x-20,at.y,8,c.width.toFixed(2)+' ft');line({x:c.width+2,y:0},{x:c.width+2,y:c.depth});for(const y of [0,c.depth])line({x:c.width+.5,y},{x:c.width+2.5,y});at=xy({x:c.width+2.5,y:c.depth/2});text(at.x,at.y,8,c.depth.toFixed(2)+' ft');}
  text(560,520,10,`${c.width.toFixed(2)} x ${c.depth.toFixed(2)} ft`);text(560,503,9,`Gross: ${c.grossArea.toFixed(1)} SF`);text(560,489,9,`Net floor: ${c.netArea.toFixed(1)} SF`);text(560,475,9,`1 ft = ${scale.toFixed(3)} PDF points`);
  const scaleEnd=xy(isSite?{x:minX+20,y:minY+d}:{x:10,y:c.depth+2}),scaleStart=xy(isSite?{x:minX,y:minY+d}:{x:0,y:c.depth+2});ops+=`.6 w ${n(scaleStart.x)} ${n(scaleStart.y)} m ${n(scaleEnd.x)} ${n(scaleEnd.y)} l S\n`;text(scaleStart.x,scaleStart.y-10,7,isSite?'0                         20 FT':'0                         10 FT');
  let rows=isSite?[prop.verification+' / NOT A SURVEY','Boundary source: '+(prop.sources[0]?.title||'unknown'),'Imagery omitted from export',...siteAnalysis(c).clearances.map(q=>`${q.label}: ${q.distance.toFixed(1)} ft`),'Legal setbacks: unknown',`Assumed buffer: ${c.parameters.setback} ft`,'Unmapped structures/constraints unknown']:c.rooms.map(r=>`${r.name}: ${(r.w*r.d).toFixed(1)} SF`);
  rows=[...rows,'Warnings:',...(isSite?siteAnalysis(c).conflicts:[]),...c.issues];let y=450;for(const raw of rows){const words=ascii(raw).split(' ');let row='';for(const word of words){if((row+' '+word).length>36){text(560,y,7,row);y-=10;row=word;}else row+=(row?' ':'')+word;}if(row){text(560,y,7,row);y-=12;}if(y<100){text(560,85,7,'See structured JSON for full warnings.');break;}}
  streams.push(ops);
 };
 page(false);if(site)page(true);
 const objects=[null,'<< /Type /Catalog /Pages 2 0 R >>','', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];const pages=[];
 for(const stream of streams){const pageId=objects.length,streamId=pageId+1;pages.push(`${pageId} 0 R`);objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamId} 0 R >>`,`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);}
 objects[2]=`<< /Type /Pages /Kids [${pages.join(' ')}] /Count ${pages.length} >>`;let pdf='%PDF-1.4\n',offsets=[0];for(let i=1;i<objects.length;i++){offsets.push(pdf.length);pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`;}const xref=pdf.length;pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;return new TextEncoder().encode(pdf);
}
