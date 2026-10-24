import {wallSolids,validateADU} from './architect.mjs';

const near=(a,b)=>Math.abs(a-b)<1e-5;
const overlap=(a,b)=>a.x<b.x+b.w-1e-5&&a.x+a.w>b.x+1e-5&&a.y<b.y+b.d-1e-5&&a.y+a.d>b.y+1e-5;
export const fixturePresets={queen:{name:'Queen bed',w:5,d:6.667,h:1.8},twin:{name:'Twin bed',w:3.167,d:6.333,h:1.8},king:{name:'King bed',w:6.333,d:6.667,h:1.8},tub:{name:'Tub / shower',w:5,d:2.5,h:1.6},shower:{name:'Shower',w:3,d:3,h:2.5}};
export const fixtureOptions=id=>id?.includes('bed')?['queen','twin','king']:id==='tub'?['tub','shower']:[];
export function resolveModel(c){
 c.solids=wallSolids(c);c.grossArea=c.width*c.depth;c.area=c.grossArea;
 const rectangles=c.solids.filter(s=>s.z===0).map(s=>{const h=near(s.y1,s.y2);return {x:Math.min(s.x1,s.x2)-(h?0:s.thickness/2),y:Math.min(s.y1,s.y2)-(h?s.thickness/2:0),w:h?Math.abs(s.x2-s.x1):s.thickness,d:h?s.thickness:Math.abs(s.y2-s.y1)};});
 const cuts=[...new Set(rectangles.flatMap(r=>[r.x,r.x+r.w]))].sort((a,b)=>a-b);let wallArea=0;
 for(let i=1;i<cuts.length;i++){const mid=(cuts[i-1]+cuts[i])/2,intervals=rectangles.filter(r=>r.x<=mid&&r.x+r.w>=mid).map(r=>[r.y,r.y+r.d]).sort((a,b)=>a[0]-b[0]);let end=-Infinity,total=0;for(const [a,b] of intervals){total+=Math.max(0,b-Math.max(a,end));end=Math.max(end,b);}wallArea+=(cuts[i]-cuts[i-1])*total;}
 c.wallArea=wallArea;c.netArea=c.grossArea-wallArea;for(const r of c.rooms)r.area=r.w*r.d;
 c.issues=validateADU(c).filter(s=>!s.startsWith('Planning checks passed'));
 for(const r of c.rooms){if(r.w<3||r.d<3)c.issues.push('Room too narrow for this planning model: '+r.name);if(r.id.startsWith('bed')&&(r.w<7||r.d<7||r.w*r.d<70))c.issues.push('Bedroom planning allowance not met: '+r.name);for(const q of c.rooms)if(r.id<q.id&&overlap(r,q))c.issues.push('Rooms overlap: '+r.name+' / '+q.name);}
 for(const w of c.walls){const items=[...c.doors,...c.windows].filter(o=>o.wallId===w.id).sort((a,b)=>a.start-b.start);for(let i=1;i<items.length;i++)if(items[i].start<items[i-1].start+items[i-1].width-1e-5)c.issues.push('Openings overlap on wall: '+w.id);}
 for(const w of c.walls.filter(w=>!['south','north','east','west'].includes(w.id)))for(const end of [1,2]){const L=Math.hypot(w.x2-w.x1,w.y2-w.y1),nx=-(w.y2-w.y1)/L,ny=(w.x2-w.x1)/L,joined=c.walls.some(q=>{if(q===w)return false;return [-w.thickness/2,0,w.thickness/2].some(offset=>{const p={x:w['x'+end]+nx*offset,y:w['y'+end]+ny*offset},dx=q.x2-q.x1,dy=q.y2-q.y1,t=Math.max(0,Math.min(1,((p.x-q.x1)*dx+(p.y-q.y1)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-q.x1-t*dx,p.y-q.y1-t*dy)<=q.thickness/2+.025;});});if(!joined)c.issues.push('Unresolved wall junction: '+w.id+' endpoint '+end);}
 for(const o of c.doors){const w=c.walls.find(w=>w.id===o.wallId),L=Math.hypot(w.x2-w.x1,w.y2-w.y1),t=(o.start+o.width/2)/L,x=w.x1+t*(w.x2-w.x1),y=w.y1+t*(w.y2-w.y1);for(const id of [o.from,o.to]){const r=c.rooms.find(r=>r.id===id);if(r&&(x<r.x-.6||x>r.x+r.w+.6||y<r.y-.6||y>r.y+r.d+.6))c.issues.push('Door no longer adjoins its room: '+o.id+' / '+r.name);}}
 for(const o of c.doors.filter(o=>o.kind==='hinged')){const w=c.walls.find(w=>w.id===o.wallId),L=Math.hypot(w.x2-w.x1,w.y2-w.y1),ux=(w.x2-w.x1)/L,uy=(w.y2-w.y1)/L,hx=w.x1+ux*o.start,hy=w.y1+uy*o.start;for(const f of c.fixtures){let hit=false;for(let angle=0;angle<=90&&!hit;angle+=10)for(let r=.25;r<o.width;r+=.2){const a=angle*Math.PI/180*o.swing,x=hx+r*(ux*Math.cos(a)-uy*Math.sin(a)),y=hy+r*(uy*Math.cos(a)+ux*Math.sin(a));if(x>f.x+.02&&x<f.x+f.w-.02&&y>f.y+.02&&y<f.y+f.d-.02){hit=true;break;}}if(hit)c.issues.push('Door swing may conflict with fixture: '+o.id+' / '+f.name);}}
 c.issues=[...new Set(c.issues)];c.validation={status:c.issues.length?'needs-review':'planning-checks-passed',warnings:[...c.issues],codeCompliance:'not-established'};
 if(!c.issues.length)c.issues.push('Planning geometry checks passed. Professional code, egress, accessibility and clearance review required.');
 return c;
}
const number=(value,min,max)=>{if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw Error(`Edit value must be between ${min} and ${max}.`);return value;};
export function editModel(base,commands=[]){
 if(!Array.isArray(commands)||commands.length>100)throw Error('A design supports at most 100 edit operations. Save a new base design before adding more.');
 if(!base.architecture&&commands.length)throw Error('Direct editing requires an architectural plan.');
 const c=structuredClone(base);
 for(const op of commands){
  if(!op||typeof op!=='object')throw Error('Invalid edit operation.');
  if(op.kind==='room'){
   let r=c.rooms.find(r=>r.id===op.id);if(!r)throw Error('Unknown room.');
   for(const [size,axis,end] of [['w','x',c.width],['d','y',c.depth]]){if(op[size]===undefined)continue;const target=number(op[size],3,60),delta=target-r[size];if(Math.abs(delta)<1e-6)continue;
    const wall=c.walls.find(w=>!['south','north','east','west'].includes(w.id)&&near(w[axis+'1'],w[axis+'2'])&&(near(w[axis+'1'],r[axis]+r[size]+w.thickness/2)||near(w[axis+'1'],r[axis]-w.thickness/2)));
    if(!wall)throw Error('No movable partition at this room edge. Resize the exterior footprint instead.');const sign=wall[axis+'1']>r[axis]?1:-1;
    Object.assign(c,editModel(c,[{kind:'wall',id:wall.id,position:wall[axis+'1']+sign*delta}]));r=c.rooms.find(r=>r.id===op.id);
   }
  }else if(op.kind==='wall'){
   const w=c.walls.find(w=>w.id===op.id);if(!w)throw Error('Unknown wall.');if(['south','north','east','west'].includes(w.id))throw Error('Use footprint dimensions to resize exterior walls.');
   const vertical=near(w.x1,w.x2),axis=vertical?'x':'y',other=vertical?'y':'x',old=w[axis+'1'],position=number(op.position,.75,(vertical?c.width:c.depth)-.75),delta=position-old,min=Math.min(w[other+'1'],w[other+'2']),max=Math.max(w[other+'1'],w[other+'2']);
   for(const line of c.walls)for(const i of [1,2])if((near(line[axis+i],old)||near(line[axis+i],old-w.thickness/2)||near(line[axis+i],old+w.thickness/2))&&line[other+i]>=min-1e-5&&line[other+i]<=max+1e-5)line[axis+i]+=delta;
   for(const r of c.rooms){const start=axis,end=vertical?'w':'d',a=vertical?r.y:r.x,b=a+(vertical?r.d:r.w);if(a>=max||b<=min)continue;if(near(r[start]+r[end],old-w.thickness/2))r[end]+=delta;else if(near(r[start],old+w.thickness/2)){r[start]+=delta;r[end]-=delta;}}
  }else if(op.kind==='door'||op.kind==='window'){
   const o=(op.kind==='door'?c.doors:c.windows).find(o=>o.id===op.id);if(!o)throw Error('Unknown opening.');const w=c.walls.find(w=>w.id===o.wallId),L=Math.hypot(w.x2-w.x1,w.y2-w.y1);if(op.width!==undefined)o.width=number(op.width,op.kind==='door'?2:1,10);o.start=number(op.start,0,L-o.width);if(op.swing!==undefined){if(![-1,1].includes(op.swing))throw Error('Invalid door swing.');o.swing=op.swing;}
  }else if(op.kind==='fixture'){
   const f=c.fixtures.find(f=>f.id===op.id);if(!f)throw Error('Unknown fixture.');if(op.preset){if(!fixtureOptions(f.id).includes(op.preset))throw Error('Fixture preset does not apply to this element.');Object.assign(f,fixturePresets[op.preset]);}if(op.w!==undefined)f.w=number(op.w,.5,12);if(op.d!==undefined)f.d=number(op.d,.5,12);f.x=number(op.x,.5,c.width-.5-f.w);f.y=number(op.y,.5,c.depth-.5-f.d);
  }else if(op.kind==='resize'){
   const width=number(op.width,16,60),depth=number(op.depth,18,70),sx=width/c.width,sy=depth/c.depth;
   for(const w of c.walls){w.x1*=sx;w.x2*=sx;w.y1*=sy;w.y2*=sy;}
   for(const o of [...c.doors,...c.windows]){const w=c.walls.find(w=>w.id===o.wallId);o.start*=near(w.y1,w.y2)?sx:sy;}
   for(const r of c.rooms){r.x*=sx;r.y*=sy;r.w*=sx;r.d*=sy;}
   for(const f of c.fixtures){f.x*=sx;f.y*=sy;}
   c.width=width;c.depth=depth;
   // Preserve fixed wall assemblies and real fixture/opening sizes. Correct room edges to the wall faces below.
   for(const w of c.walls.filter(w=>['south','north','east','west'].includes(w.id))){if(w.id==='south')w.y1=w.y2=.25;if(w.id==='north')w.y1=w.y2=depth-.25;if(w.id==='west')w.x1=w.x2=.25;if(w.id==='east')w.x1=w.x2=width-.25;}
   for(const r of c.rooms){if(r.x<.6){r.w+=r.x-.5;r.x=.5;}if(r.y<.6){r.d+=r.y-.5;r.y=.5;}if(r.x+r.w>width-.6)r.w=width-.5-r.x;if(r.y+r.d>depth-.6)r.d=depth-.5-r.y;}
  }else throw Error('Unsupported edit operation.');
 }
 c.edits=structuredClone(commands);if(c.architecture){resolveModel(c);if(commands.some(o=>o.kind==='resize')){const warning='Footprint resized: wall junctions, room faces and fixed-size openings/fixtures require review.';c.issues.push(warning);c.validation.warnings.push(warning);c.validation.status='needs-review';}}return c;
}
export function editorOverlay(c,selection=''){
 const key=(kind,id)=>kind+':'+id;let svg='<g class="editor-overlay">';
 for(const w of c.walls)svg+=`<line data-edit="wall:${w.id}" x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}" stroke="${selection===key('wall',w.id)?'#007c91':'#007c91'}" stroke-opacity="${selection===key('wall',w.id)?'.9':'.18'}" stroke-width=".65" style="cursor:${near(w.x1,w.x2)?'ew-resize':'ns-resize'}"/>`;
 for(const f of c.fixtures)svg+=`<rect data-edit="fixture:${f.id}" x="${f.x}" y="${f.y}" width="${f.w}" height="${f.d}" fill="${selection===key('fixture',f.id)?'#007c9144':'transparent'}" stroke="#007c91" stroke-width=".07" style="cursor:move"/>`;
 for(const kind of ['door','window'])for(const o of kind==='door'?c.doors:c.windows){const w=c.walls.find(w=>w.id===o.wallId),L=Math.hypot(w.x2-w.x1,w.y2-w.y1);svg+=`<line data-edit="${kind}:${o.id}" x1="${w.x1+(w.x2-w.x1)*o.start/L}" y1="${w.y1+(w.y2-w.y1)*o.start/L}" x2="${w.x1+(w.x2-w.x1)*(o.start+o.width)/L}" y2="${w.y1+(w.y2-w.y1)*(o.start+o.width)/L}" stroke="${selection===key(kind,o.id)?'#e05a22':'#1593a6'}" stroke-width=".5" style="cursor:move"/>`;}
 return svg+'</g>';
}
