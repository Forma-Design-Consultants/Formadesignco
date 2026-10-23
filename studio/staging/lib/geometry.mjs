import {buildADU} from './architect.mjs';
export const types=['ADU','Custom home','Addition','Garage conversion','Duplex / multifamily','Commercial / tenant improvement'];
export function normalize(input={}){
 const num=(key,fallback,min,max)=>{const n=Number(input[key]??fallback);if(!Number.isFinite(n)||n<min||n>max)throw Error(`Invalid ${key}`);return n;};
 const type=input.type??'ADU';if(!types.includes(type))throw Error('Invalid project type');
 return {publicDepth:num('publicDepth',12.5,11.5,13),bedSplit:num('bedSplit',12.5,11,14),type,area:num('area',800,200,20000),beds:Math.round(num('beds',2,0,8)),baths:Math.round(num('baths',1,1,6)),units:Math.round(num('units',2,2,20)),width:num('width',40,10,300),depth:num('depth',60,10,500),setback:num('setback',4,0,50),rotation:num('rotation',0,0,270),offsetX:num('offsetX',0,-200,200),offsetY:num('offsetY',0,-200,200),style:['Modern','Traditional','Contemporary'].includes(input.style)?input.style:'Modern'};
}
export function generate(input,variant=0){
 const p=normalize(input);if(p.type==='ADU'&&p.beds===2&&p.baths===1&&p.area>=700&&p.area<=900)return buildADU(p,variant);const commercial=p.type.startsWith('Commercial'),multi=p.type.startsWith('Duplex');
 const ratio=[1.25,1,1.6,.8,2,1.1,1.4,.7,1.8,.9][variant%10];
 const w=Math.sqrt(p.area*ratio),d=p.area/w;
 const names=commercial?['Reception','Flexible work area','Meeting room','Restroom','Storage']:['Living / kitchen',...Array.from({length:p.beds},(_,i)=>`Bedroom ${i+1}`),...Array.from({length:p.baths},(_,i)=>`Bath ${i+1}`),'Utility / storage'];
 const rooms=[];
 function unit(x,y,uw,ud,prefix=''){
  const privateNames=names.slice(1),living=commercial?.28:.43;
  rooms.push({name:prefix+names[0],x,y,w:uw*living,d:ud});
  const weights=privateNames.map(n=>n.startsWith('Bedroom')?1:n.startsWith('Bath')?.48:.38);const sum=weights.reduce((a,b)=>a+b,0);let cy=y;
  privateNames.forEach((name,i)=>{const rd=ud*weights[i]/sum;rooms.push({name:prefix+name,x:x+uw*living,y:cy,w:uw*(1-living),d:rd});cy+=rd;});
 }
 const count=multi?p.units:1;
 for(let i=0;i<count;i++)unit(0,d*i/count,w,d/count,multi?`Unit ${i+1} · `:'');
 const issues=[];const rot=p.rotation%180!==0,fw=rot?d:w,fd=rot?w:d;
 if(fw>p.width-2*p.setback||fd>p.depth-2*p.setback||Math.abs(p.offsetX)+fw/2>p.width/2-p.setback||Math.abs(p.offsetY)+fd/2>p.depth/2-p.setback)issues.push('Footprint exceeds your assumed site envelope. Adjust placement, size, or site dimensions.');
 if(rooms.some(r=>r.name.includes('Bedroom')&&(r.w<7||r.d<7||r.w*r.d<70)))issues.push('One or more bedrooms are too small for this planning check. Reduce room count or increase area.');
 if(multi)issues.push('Unit access, shared circulation, accessibility, parking and fire separation require professional design.');
 if(commercial)issues.push('Occupancy, egress, accessibility and plumbing fixture counts require professional review.');
 if(['Addition','Garage conversion'].includes(p.type))issues.push('Existing walls, structure and connection to the main building must be measured and reviewed.');
 return {variant,width:w,depth:d,area:p.area,rooms,issues,parameters:p,scope:'Conceptual space allocation only; openings, circulation, structure, code compliance and costs are not resolved.'};
}
