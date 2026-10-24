import {readiness,searchAddresses,searchParcels,aerialResponse,unseal,correctParcel} from '../../../../lib/property-provider.mjs';
import {editModel} from '../../../../lib/model-tools.mjs';
import {designPDF,designDXF} from '../../../../lib/exports.mjs';
import {feasibility} from '../../../../lib/feasibility.mjs';
import {demoProperty,siteRecord,siteSVG} from '../../../../lib/site-planner.mjs';
import {planSVG} from '../../../../lib/architect.mjs';
import {env} from 'cloudflare:workers';
import {normalize,generate} from '../../../../lib/geometry.mjs';
export const dynamic='force-dynamic';
const TTL=7*86400000;
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'};
const reply=(value:unknown,status=200)=>Response.json(value,{status,headers});
export async function GET(request:Request){return handle(request);}
export async function POST(request:Request){return handle(request);}
async function handle(request:Request){
 try{
 const owner=request.headers.get('oai-authenticated-user-id');
 if(!owner||!request.headers.get('oai-authenticated-user-email'))return reply({error:'Sign in with ChatGPT to use this private preview.'},401);
 const url=new URL(request.url),action=url.pathname.split('/').pop(),db=env.DB;
 if(!db)return reply({error:'Preview storage is unavailable.'},503);
 if(request.method==='POST'){
  if(request.headers.get('sec-fetch-site')==='cross-site'||(request.headers.get('origin')&&request.headers.get('origin')!==url.origin))return reply({error:'Origin rejected'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'JSON required'},415);
 }
 let b:any={};if(request.method==='POST'){const raw=await request.text();if(raw.length>65536)return reply({error:'Request too large'},413);b=JSON.parse(raw);}
 const now=Date.now();
 // Expired records are never returned, and are physically removed on the next API request.
 await db.batch([db.prepare('DELETE FROM studio_preview_projects WHERE expires<=?').bind(now),db.prepare('DELETE FROM studio_preview_requests WHERE expires<=?').bind(now),db.prepare('DELETE FROM studio_project_versions WHERE expires<=?').bind(now)]);
 const owned=async(id:string)=>db.prepare('SELECT id,data FROM studio_preview_projects WHERE id=? AND owner=? AND expires>?').bind(id,owner,now).first();
 const persist=async(pid:string,data:any,previous:any=null)=>{
  data.revision=(previous?JSON.parse(previous.data).revision||0:0)+1;const json=JSON.stringify(data);
  const statements=[previous?db.prepare('UPDATE studio_preview_projects SET data=?,updated=?,expires=? WHERE id=? AND owner=? AND data=?').bind(json,now,now+TTL,pid,owner,previous.data):db.prepare('INSERT INTO studio_preview_projects(id,owner,data,updated,expires) VALUES(?,?,?,?,?)').bind(pid,owner,json,now,now+TTL),db.prepare('INSERT INTO studio_project_versions(id,project_id,owner,revision,data,created,expires) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM studio_preview_projects WHERE id=? AND owner=? AND data=?) AND changes()=1').bind(crypto.randomUUID(),pid,owner,data.revision,json,now,now+TTL,pid,owner,json),db.prepare('DELETE FROM studio_project_versions WHERE project_id=? AND owner=? AND id NOT IN (SELECT id FROM studio_project_versions WHERE project_id=? AND owner=? ORDER BY revision DESC LIMIT 20)').bind(pid,owner,pid,owner)];
  const results=await db.batch(statements);const result:any=results[0],changed=result?.meta?.changes??result?.changes;if(Number(changed)!==1)throw Error('Project changed in another tab. Reopen before saving.');return {id:pid,...data};
 };
 if(action==='providers'&&request.method==='GET')return reply(readiness(env));
 if(action==='address-search'&&request.method==='POST')return reply(await searchAddresses(b.query,env,owner,fetch,b.autocomplete===true));
 if(action==='parcel-search'&&request.method==='POST')return reply(await searchParcels(b.ticket,env,owner));
 if(action==='parcel-correction'&&request.method==='POST')return reply({property:await correctParcel(b.ticket,b.geometry,b.reason,env,owner)});
 if(action==='aerial'&&request.method==='GET')return aerialResponse(url.searchParams.get('ticket'),env,owner);
 if(action==='session'&&request.method==='GET')return reply({account:true,integration:'disabled',mode:'private-demo',retentionDays:7});
 if(action==='concepts'&&request.method==='POST'){const first=generate(b,0);return reply({concepts:Array.from({length:first.architecture?2:10},(_,i)=>i?generate(b,i):first)});}
 if(action==='property'&&request.method==='POST')return reply({property:demoProperty(normalize(b.parameters)),status:'demo-unverified',sources:[{kind:'synthetic',title:'Forma demo geometry',url:null}],message:'Demo preview: no parcel, zoning or live feasibility lookup is connected. Site dimensions and buffers are assumptions.'});
 if(action==='export'&&request.method==='GET'&&['pdf','dxf'].includes(url.searchParams.get('format')||'')){
  const r:any=await owned(String(url.searchParams.get('id')||''));if(!r)return reply({error:'Project not found'},404);const data=JSON.parse(r.data);if(!data.concept.architecture)return reply({error:'Architectural plan required'},400);
  const site=url.searchParams.get('site')==='1',format=url.searchParams.get('format'),options={site,project:data},body=format==='pdf'?designPDF(data.concept,options):designDXF(data.concept,options);
  return new Response(body,{headers:{...headers,'Content-Type':format==='pdf'?'application/pdf':'application/dxf','Content-Disposition':`attachment; filename="forma-${site?'site':'floor'}-plan.${format}"`}});
 }
 if(action==='export'&&request.method==='GET'){const r:any=await db.prepare('SELECT data FROM studio_preview_projects WHERE id=? AND owner=? AND expires>?').bind(url.searchParams.get('id'),owner,now).first();if(!r)return reply({error:'Project not found'},404);const data=JSON.parse(r.data);if(!data.concept.architecture)return reply({error:'Architectural ADU required'},400);return new Response(url.searchParams.get('site')==='1'?siteSVG({...data.concept,property:data.site.property.verification==='demo-unverified'?undefined:{...data.site.property,aerial:{...data.site.property.aerial,url:null}}}):planSVG(data.concept),{headers:{...headers,'Content-Type':'image/svg+xml','Content-Disposition':url.searchParams.get('site')==='1'?'attachment; filename="forma-site-plan.svg"':'attachment; filename="forma-adu-floor-plan.svg"'}});}
 if(action==='projects'&&request.method==='GET'){
 const rows=await db.prepare('SELECT id,data,updated FROM studio_preview_projects WHERE owner=? AND expires>? ORDER BY updated DESC').bind(owner,now).all();
 return reply({projects:rows.results.map((r:any)=>({...JSON.parse(r.data),id:r.id,updated:new Date(r.updated).toISOString()})).filter((p:any)=>url.searchParams.get('trash')==='1'?!!p.deletedAt:!p.deletedAt)});
 }
 if(action==='versions'&&request.method==='GET'){const pid=String(url.searchParams.get('id')||'');if(!await owned(pid))return reply({error:'Project not found'},404);const rows=await db.prepare('SELECT id,revision,data,created FROM studio_project_versions WHERE project_id=? AND owner=? AND expires>? ORDER BY revision DESC').bind(pid,owner,now).all();return reply({versions:rows.results.map((r:any)=>({id:r.id,revision:r.revision,created:new Date(r.created).toISOString(),name:JSON.parse(r.data).name||'Untitled design'}))});}
 if(action==='project-action'&&request.method==='POST'){
  const previous:any=await owned(String(b.id||''));if(!previous)return reply({error:'Project not found'},404);const data=JSON.parse(previous.data);
  if(b.op==='duplicate'){const count:any=await db.prepare('SELECT COUNT(*) AS n FROM studio_preview_projects WHERE owner=?').bind(owner).first();if(count.n>=50)return reply({error:'Project limit reached.'},429);const pid=crypto.randomUUID();data.name=(data.name||'Untitled design')+' - copy';delete data.deletedAt;if(data.site)data.site.projectId=pid;return reply(await persist(pid,data));}
  if(b.revision!==(data.revision||0))return reply({error:'Project changed in another tab. Reopen before saving.'},409);
  if(b.op==='trash'){data.deletedAt=new Date(now).toISOString();return reply(await persist(previous.id,data,previous));}
  if(b.op==='restore'){delete data.deletedAt;return reply(await persist(previous.id,data,previous));}
  if(b.op==='restore-version'){const version:any=await db.prepare('SELECT data FROM studio_project_versions WHERE id=? AND project_id=? AND owner=? AND expires>?').bind(String(b.versionId||''),previous.id,owner,now).first();if(!version)return reply({error:'Version not found'},404);const restored=JSON.parse(version.data);delete restored.deletedAt;return reply(await persist(previous.id,restored,previous));}
  return reply({error:'Unsupported project action'},400);
 }
 if(action==='projects'&&request.method==='POST'){
 const parameters=normalize(b.parameters),variant=Number(b.variant??0);
 if(!Number.isInteger(variant)||variant<0||variant>9)return reply({error:'Invalid concept'},400);
 const address=String(b.address||'Demo property, California').slice(0,300);
 let property;if(b.propertyTicket){if(!readiness(env).ready)return reply({error:readiness(env).message},503);property=await unseal(b.propertyTicket,env,owner,'property');}
 if(!property&&!address.toLowerCase().startsWith('demo'))return reply({error:'Use a demo property label beginning with “Demo”. Real customer addresses are disabled in this preview.'},400);
 const pid=b.id||crypto.randomUUID();
 const previous:any=b.id?await owned(pid):null;
 if(b.id&&!previous)return reply({error:'Project not found'},404);
 if(previous&&(JSON.parse(previous.data).deletedAt||b.revision!==(JSON.parse(previous.data).revision||0)))return reply({error:'Project changed or is in the trash. Reopen before saving.'},409);
 const count:any=await db.prepare('SELECT COUNT(*) AS n FROM studio_preview_projects WHERE owner=?').bind(owner).first();
 if(!b.id&&count.n>=50)return reply({error:'Demo limit reached. Delete your demo data before saving more.'},429);
 const prior=previous?JSON.parse(previous.data):null,briefKeys=['type','area','beds','baths','units','publicDepth','bedSplit','style'] as const;
 const sameBase=prior?.baseConcept&&prior.variant===variant&&briefKeys.every(k=>prior.parameters[k]===parameters[k]);
 const baseConcept=sameBase?{...prior.baseConcept,parameters}:generate(parameters,variant);
 const concept={...editModel(baseConcept,b.edits||[]),...(property?{property:{...property,ticket:b.propertyTicket}}:{})};
 const visualization={mode:['cutaway','exterior'].includes(b.visualization?.mode)?b.visualization.mode:'cutaway',roof:['flat','gable','none'].includes(b.visualization?.roof)?b.visualization.roof:'flat',angle:Number.isFinite(b.visualization?.angle)&&b.visualization.angle>=0&&b.visualization.angle<=360?b.visualization.angle:0};
 const data={name:String(b.name||'Untitled design').slice(0,120),description:String(b.description||'').slice(0,2000),address,parameters,variant,baseConcept,edits:b.edits||[],concept:{...concept,visualization},visualization,site:siteRecord(concept,pid),feasibility:feasibility(concept)};
 return reply(await persist(pid,data,previous));
 }
 if(action==='handoff'&&request.method==='POST'){
 const project:any=await db.prepare('SELECT data FROM studio_preview_projects WHERE id=? AND owner=? AND expires>?').bind(String(b.projectId||''),owner,now).first();
 if(!project)return reply({error:'Save this project first'},404);
 if(b.consent!==true||!/^\S+@example\.com$/i.test(String(b.email||''))||!String(b.name||'').toLowerCase().startsWith('demo'))return reply({error:'Use a name beginning “Demo”, an @example.com email and explicit consent.'},400);
 const count:any=await db.prepare('SELECT COUNT(*) AS n FROM studio_preview_requests WHERE owner=?').bind(owner).first();if(count.n>=20)return reply({error:'Demo request limit reached.'},429);
 if(JSON.parse(project.data).deletedAt)return reply({error:'Restore this project before requesting review.'},409);
 const requestType=['feasibility','consultation','proposal'].includes(b.requestType)?b.requestType:'feasibility';
 const id=crypto.randomUUID(),data={contractVersion:1,project:JSON.parse(project.data),contact:{name:String(b.name).slice(0,150),email:String(b.email).slice(0,200)},requestType,notes:String(b.notes||'').slice(0,2000),requestedServices:Array.isArray(b.requestedServices)?b.requestedServices.filter((s:any)=>typeof s==='string').slice(0,8).map((s:string)=>s.slice(0,100)):[],consentAt:new Date(now).toISOString(),integrationStatus:'disabled'};
 await db.prepare('INSERT INTO studio_preview_requests(id,owner,data,created,expires) VALUES(?,?,?,?,?)').bind(id,owner,JSON.stringify(data),now,now+TTL).run();
 return reply({id,status:'saved-demo',message:'Demo review request saved for 7 days. It has not been sent to Forma Intelligence or the Forma team.'},202);
 }
 if(action==='review-requests'&&request.method==='GET'){const rows=await db.prepare('SELECT id,data,created FROM studio_preview_requests WHERE owner=? AND expires>? ORDER BY created DESC').bind(owner,now).all();return reply({requests:rows.results.map((r:any)=>({id:r.id,...JSON.parse(r.data),created:new Date(r.created).toISOString()}))});}
 if(action==='delete-data'&&request.method==='POST'&&b.confirm===true){await db.batch([db.prepare('DELETE FROM studio_preview_projects WHERE owner=?').bind(owner),db.prepare('DELETE FROM studio_preview_requests WHERE owner=?').bind(owner),db.prepare('DELETE FROM studio_project_versions WHERE owner=?').bind(owner)]);return reply({ok:true});}
 return reply({error:'Endpoint unavailable in this private demo.'},404);
 }catch(e){return reply({error:e instanceof Error&&!/SQL|D1|JSON|HMAC|crypto|base64/i.test(e.message)?e.message:'Unable to process this preview request.'},e instanceof Error&&e.message.startsWith('Project changed in another tab')?409:400);}
}
