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
 await db.batch([db.prepare('DELETE FROM studio_preview_projects WHERE expires<=?').bind(now),db.prepare('DELETE FROM studio_preview_requests WHERE expires<=?').bind(now)]);
 if(action==='session'&&request.method==='GET')return reply({account:true,integration:'disabled',mode:'private-demo',retentionDays:7});
 if(action==='concepts'&&request.method==='POST')return reply({concepts:Array.from({length:b.type==='ADU'&&Number(b.beds??2)===2&&Number(b.baths??1)===1&&Number(b.area)>=700&&Number(b.area)<=900?2:10},(_,i)=>generate(b,i))});
 if(action==='property'&&request.method==='POST')return reply({property:demoProperty(normalize(b.parameters)),status:'demo-unverified',sources:[{kind:'synthetic',title:'Forma demo geometry',url:null}],message:'Demo preview: no parcel, zoning or live feasibility lookup is connected. Site dimensions and buffers are assumptions.'});
 if(action==='export'&&request.method==='GET'){const r:any=await db.prepare('SELECT data FROM studio_preview_projects WHERE id=? AND owner=? AND expires>?').bind(url.searchParams.get('id'),owner,now).first();if(!r)return reply({error:'Project not found'},404);const data=JSON.parse(r.data);if(!data.concept.architecture)return reply({error:'Architectural ADU required'},400);return new Response(url.searchParams.get('site')==='1'?siteSVG(data.concept):planSVG(data.concept),{headers:{...headers,'Content-Type':'image/svg+xml','Content-Disposition':url.searchParams.get('site')==='1'?'attachment; filename="forma-site-plan.svg"':'attachment; filename="forma-adu-floor-plan.svg"'}});}
 if(action==='projects'&&request.method==='GET'){
 const rows=await db.prepare('SELECT id,data,updated FROM studio_preview_projects WHERE owner=? AND expires>? ORDER BY updated DESC').bind(owner,now).all();
 return reply({projects:rows.results.map((r:any)=>({...JSON.parse(r.data),id:r.id,updated:new Date(r.updated).toISOString()}))});
 }
 if(action==='projects'&&request.method==='POST'){
 const parameters=normalize(b.parameters),variant=Number(b.variant??0);
 if(!Number.isInteger(variant)||variant<0||variant>9)return reply({error:'Invalid concept'},400);
 const address=String(b.address||'Demo property, California').slice(0,300);
 if(!address.toLowerCase().startsWith('demo'))return reply({error:'Use a demo property label beginning with “Demo”. Real customer addresses are disabled in this preview.'},400);
 const pid=b.id||crypto.randomUUID();
 if(b.id&&!await db.prepare('SELECT id FROM studio_preview_projects WHERE id=? AND owner=? AND expires>?').bind(pid,owner,now).first())return reply({error:'Project not found'},404);
 const count:any=await db.prepare('SELECT COUNT(*) AS n FROM studio_preview_projects WHERE owner=?').bind(owner).first();
 if(!b.id&&count.n>=50)return reply({error:'Demo limit reached. Delete your demo data before saving more.'},429);
 const data={address,parameters,variant,concept:generate(parameters,variant),site:siteRecord(generate(parameters,variant),pid)};
 if(b.id)await db.prepare('UPDATE studio_preview_projects SET data=?,updated=?,expires=? WHERE id=? AND owner=?').bind(JSON.stringify(data),now,now+TTL,pid,owner).run();
 else await db.prepare('INSERT INTO studio_preview_projects(id,owner,data,updated,expires) VALUES(?,?,?,?,?)').bind(pid,owner,JSON.stringify(data),now,now+TTL).run();
 return reply({id:pid,...data});
 }
 if(action==='handoff'&&request.method==='POST'){
 const project:any=await db.prepare('SELECT data FROM studio_preview_projects WHERE id=? AND owner=? AND expires>?').bind(String(b.projectId||''),owner,now).first();
 if(!project)return reply({error:'Save this project first'},404);
 if(b.consent!==true||!/^\S+@example\.com$/i.test(String(b.email||''))||!String(b.name||'').toLowerCase().startsWith('demo'))return reply({error:'Use a name beginning “Demo”, an @example.com email and explicit consent.'},400);
 const count:any=await db.prepare('SELECT COUNT(*) AS n FROM studio_preview_requests WHERE owner=?').bind(owner).first();if(count.n>=20)return reply({error:'Demo request limit reached.'},429);
 const id=crypto.randomUUID(),data={project:JSON.parse(project.data),contact:{name:String(b.name).slice(0,150),email:String(b.email).slice(0,200)},consentAt:new Date(now).toISOString(),integrationStatus:'disabled'};
 await db.prepare('INSERT INTO studio_preview_requests(id,owner,data,created,expires) VALUES(?,?,?,?,?)').bind(id,owner,JSON.stringify(data),now,now+TTL).run();
 return reply({id,status:'saved-demo',message:'Demo review request saved for 7 days. It has not been sent to Forma Intelligence or the Forma team.'},202);
 }
 if(action==='delete-data'&&request.method==='POST'&&b.confirm===true){await db.batch([db.prepare('DELETE FROM studio_preview_projects WHERE owner=?').bind(owner),db.prepare('DELETE FROM studio_preview_requests WHERE owner=?').bind(owner)]);return reply({ok:true});}
 return reply({error:'Endpoint unavailable in this private demo.'},404);
 }catch{return reply({error:'Unable to process this preview request.'},400);}
}
