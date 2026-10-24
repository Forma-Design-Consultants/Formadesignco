import {activeProperty,placePoint,footprint} from './site-planner.mjs';
export function architectural3D(c,{site=false,angle=0,mode='cutaway',roof='flat'}={}){
 const prop=site?activeProperty(c):null,a=(angle-45)*Math.PI/180,co=Math.cos(a),si=Math.sin(a),cut=mode==='exterior'?9:3.5,project=(p,z=0)=>[p.x*co-p.y*si,(p.x*si+p.y*co)*.48-z],world=(x,y)=>site?placePoint({x,y},c):{x,y},faces=[];
 let roofLayer=false;
 const face=(vertices,color)=>faces.push({roof:roofLayer,depth:vertices.reduce((s,v)=>s+v.x*si+v.y*co,0)/vertices.length,points:vertices.map(v=>project(v,v.z).join(',')).join(' '),color});
 const prism=(polygon,z,h,color)=>{const low=polygon.map(p=>({...p,z})),high=polygon.map(p=>({...p,z:z+h}));for(let i=0;i<polygon.length;i++)face([low[i],low[(i+1)%low.length],high[(i+1)%high.length],high[i]],color);face(high,color);};
 const box=(x,y,w,d,z,h,color)=>prism([[x,y],[x+w,y],[x+w,y+d],[x,y+d]].map(([x,y])=>world(x,y)),z,h,color);
 box(0,0,c.width,c.depth,-.25,.25,'#d6d1c4');
 for(const s of c.solids.filter(s=>s.z<cut)){const horizontal=Math.abs(s.y2-s.y1)<1e-6;box(Math.min(s.x1,s.x2)-(horizontal?0:s.thickness/2),Math.min(s.y1,s.y2)-(horizontal?s.thickness/2:0),horizontal?Math.abs(s.x2-s.x1):s.thickness,horizontal?s.thickness:Math.abs(s.y2-s.y1),s.z,Math.min(s.h,cut-s.z),'#e8e5da');}
 for(const f of c.fixtures)box(f.x,f.y,f.w,f.d,f.z||0,Math.min(f.h,cut),'#aebaa6');
 if(mode==='exterior')for(const o of c.windows){const w=c.walls.find(w=>w.id===o.wallId),L=Math.hypot(w.x2-w.x1,w.y2-w.y1),p=world(w.x1+(w.x2-w.x1)*o.start/L,w.y1+(w.y2-w.y1)*o.start/L),q=world(w.x1+(w.x2-w.x1)*(o.start+o.width)/L,w.y1+(w.y2-w.y1)*(o.start+o.width)/L);face([{...p,z:o.sill},{...q,z:o.sill},{...q,z:o.sill+o.height},{...p,z:o.sill+o.height}],'#8fb6be');}
 roofLayer=true;
 if(mode==='exterior'&&roof==='flat')box(0,0,c.width,c.depth,9,.3,'#7e8178');
 if(mode==='exterior'&&roof==='gable'){const v=(x,y,z)=>({...world(x,y),z});face([v(0,0,9),v(c.width,0,9),v(c.width,c.depth/2,12),v(0,c.depth/2,12)],'#8d9187');face([v(0,c.depth/2,12),v(c.width,c.depth/2,12),v(c.width,c.depth,9),v(0,c.depth,9)],'#777d71');face([v(0,0,9),v(0,c.depth,9),v(0,c.depth/2,12)],'#d9d6c8');face([v(c.width,0,9),v(c.width,c.depth,9),v(c.width,c.depth/2,12)],'#d9d6c8');}
 roofLayer=false;
 if(prop)for(const s of prop.structures)prism(s.polygon,0,s.height||9,'#b8b4a9');
 faces.sort((a,b)=>Number(a.roof)-Number(b.roof)||a.depth-b.depth);const ground=site?prop.parcel:[world(0,0),world(c.width,0),world(c.width,c.depth),world(0,c.depth)],bounds=[...ground,...(site?footprint(c):[])].map(p=>project(p)),xs=bounds.map(p=>p[0]),ys=bounds.map(p=>p[1]),x=Math.min(...xs)-6,y=Math.min(...ys)-16,width=Math.max(...xs)-x+6,height=Math.max(...ys)-y+14;
 const image=prop?.aerial?.url?`<image href="${prop.aerial.url.replaceAll('&','&amp;')}" x="${prop.aerial.x}" y="${prop.aerial.y}" width="${prop.aerial.width}" height="${prop.aerial.height}" transform="matrix(${co} ${si*.48} ${-si} ${co*.48} 0 0)"/>`:'';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}" role="img" aria-label="Matching ${mode} architectural 3D${site?' site placement':''}"><polygon points="${ground.map(p=>project(p).join(',')).join(' ')}" fill="#e4e9dd" stroke="#586b51" stroke-width=".2"/>${image}${faces.map(f=>`<polygon points="${f.points}" fill="${f.color}" stroke="#626b5c" stroke-width=".06"/>`).join('')}<text x="${x+width/2}" y="${y+height-3}" text-anchor="middle" font-family="Arial" font-size="${Math.max(.65,width/80)}">SAME PLAN GEOMETRY · ${mode==='exterior'?'9 FT WALLS · CONCEPT ROOF':'3.5 FT CUTAWAY · ROOF HIDDEN'} · NOT PERMIT READY</text></svg>`;
}
