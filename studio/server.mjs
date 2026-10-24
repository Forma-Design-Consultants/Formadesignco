import {demoProperty,siteRecord,siteSVG} from './site-planner.mjs';
import {planSVG} from './architect.mjs';
import http from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {resolve,extname,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {normalize,generate} from './geometry.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dbPath=process.env.STUDIO_DB||resolve(root,'.studio-data/studio.sqlite');await mkdir(dirname(dbPath),{recursive:true});
const db=new DatabaseSync(dbPath);db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE,password TEXT); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,owner TEXT,expires INTEGER); CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,owner TEXT,data TEXT,updated TEXT); CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY,owner TEXT,data TEXT,status TEXT,created TEXT);`);
const id=()=>randomBytes(24).toString('hex'), hash=s=>createHash('sha256').update(s).digest('hex');
const limit=new Map();
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
async function body(req){let s='';for await(const chunk of req){s+=chunk;if(s.length>65536)throw Error('Request too large');}return JSON.parse(s||'{}');}
function session(req,res){const token=(req.headers.cookie||'').match(/(?:^|; )studio_session=([a-f0-9]+)/)?.[1];const existing=token&&db.prepare('SELECT * FROM sessions WHERE token=? AND expires>?').get(hash(token),Date.now());if(existing)return existing;
 const t=id(),owner=id(),expires=Date.now()+7*86400000;db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(t),owner,expires);res.setHeader('Set-Cookie',`studio_session=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${process.env.NODE_ENV==='production'?'; Secure':''}`);return {owner,token:hash(t)};}
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
 try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/studio/')){
 const key=req.socket.remoteAddress;const now=Date.now();let bucket=limit.get(key);if(!bucket||bucket.reset<now){bucket={n:0,reset:now+60000};limit.set(key,bucket);}if(++bucket.n>180)return json(res,429,{error:'Please wait before trying again.'});
 if(!['GET','POST'].includes(req.method))return json(res,405,{error:'Method not allowed'});
 if(req.method==='POST'&&(req.headers['sec-fetch-site']==='cross-site'||(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`&&req.headers.origin!==`https://${req.headers.host}`)))return json(res,403,{error:'Origin rejected'});
 if(req.method==='POST'&&!req.headers['content-type']?.startsWith('application/json'))return json(res,415,{error:'JSON required'});
 const s=session(req,res),path=url.pathname.slice(12),b=req.method==='POST'?await body(req):{};
 if(path==='session')return json(res,200,{account:!!db.prepare('SELECT id FROM users WHERE id=?').get(s.owner),integration:'not-configured',mode:'development',message:'Property intelligence is not connected. Site dimensions and setbacks are user assumptions.'});
 if(path==='account'&&req.method==='POST'){
 const email=String(b.email||'').trim().toLowerCase(),password=String(b.password||'');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12||password.length>128)return json(res,400,{error:'Enter a valid email and a password with 12–128 characters.'});
 let user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
 if(b.action==='register'){if(user)return json(res,409,{error:'Account unavailable. Try signing in.'});const salt=id();user={id:s.owner};db.prepare('INSERT INTO users VALUES(?,?,?)').run(user.id,email,salt+':'+scryptSync(password,salt,64).toString('hex'));}
 else{if(!user)return json(res,401,{error:'Invalid email or password'});const [salt,stored]=user.password.split(':');if(!timingSafeEqual(Buffer.from(stored,'hex'),scryptSync(password,salt,64)))return json(res,401,{error:'Invalid email or password'});}
 db.prepare('DELETE FROM sessions WHERE token=?').run(s.token);const token=id();db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),user.id,Date.now()+7*86400000);res.setHeader('Set-Cookie',`studio_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${process.env.NODE_ENV==='production'?'; Secure':''}`);return json(res,200,{ok:true});
 }
 if(path==='logout'&&req.method==='POST'){db.prepare('DELETE FROM sessions WHERE token=?').run(s.token);res.setHeader('Set-Cookie','studio_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(res,200,{ok:true});}
 if(path==='concepts'&&req.method==='POST')return json(res,200,{concepts:Array.from({length:b.type==='ADU'&&Number(b.beds??2)===2&&Number(b.baths??1)===1&&Number(b.area)>=700&&Number(b.area)<=900?2:10},(_,i)=>generate(b,i))});
 if(path==='property'&&req.method==='POST')return json(res,200,{property:demoProperty(normalize(b.parameters)),address:String(b.address||'').slice(0,300),status:'demo-unverified',sources:[],message:'Parcel, zoning, utilities, setbacks and project eligibility require verification. No live property lookup is configured.'});
 if(path==='export'&&req.method==='GET'){const r=db.prepare('SELECT data FROM projects WHERE id=? AND owner=?').get(url.searchParams.get('id'),s.owner);if(!r)return json(res,404,{error:'Project not found'});const data=JSON.parse(r.data);if(!data.concept.architecture)return json(res,400,{error:'Architectural ADU required'});res.writeHead(200,{'Content-Type':'image/svg+xml','Content-Disposition':url.searchParams.get('site')==='1'?'attachment; filename="forma-site-plan.svg"':'attachment; filename="forma-adu-floor-plan.svg"','Cache-Control':'no-store'});res.end(url.searchParams.get('site')==='1'?siteSVG(data.concept):planSVG(data.concept));return;}
 if(path==='projects'&&req.method==='GET')return json(res,200,{projects:db.prepare('SELECT id,data,updated FROM projects WHERE owner=? ORDER BY updated DESC').all(s.owner).map(r=>({...JSON.parse(r.data),id:r.id,updated:r.updated}))});
 if(path==='projects'&&req.method==='POST'){
 const parameters=normalize(b.parameters),variant=Number(b.variant||0);if(!Number.isInteger(variant)||variant<0||variant>9)throw Error('Invalid concept');const pid=b.id||id();if(b.id&&!db.prepare('SELECT id FROM projects WHERE id=? AND owner=?').get(b.id,s.owner))return json(res,404,{error:'Project not found'});
 const data={address:String(b.address||'').slice(0,300),parameters,variant,concept:generate(parameters,variant),site:siteRecord(generate(parameters,variant),pid)};db.prepare('INSERT INTO projects VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated=excluded.updated').run(pid,s.owner,JSON.stringify(data),new Date().toISOString());return json(res,200,{id:pid,...data});
 }
 if(path==='handoff'&&req.method==='POST'){
 const project=db.prepare('SELECT data FROM projects WHERE id=? AND owner=?').get(b.projectId,s.owner);if(!project)return json(res,404,{error:'Save this project first'});
 if(b.consent!==true||!/^\S+@\S+\.\S+$/.test(String(b.email||''))||!String(b.name||'').trim())return json(res,400,{error:'Name, email and consent are required'});
 const data={project:JSON.parse(project.data),contact:{name:String(b.name).slice(0,150),email:String(b.email).slice(0,200)},consentAt:new Date().toISOString(),source:'forma-studio',integrationStatus:'pending-configuration'};const rid=id();db.prepare('INSERT INTO outbox VALUES(?,?,?,?,?)').run(rid,s.owner,JSON.stringify(data),'pending-configuration',new Date().toISOString());return json(res,202,{id:rid,status:'saved-locally',message:'Review request saved in this development environment. It has not been sent to Forma Intelligence or the Forma team.'});
 }
 return json(res,404,{error:'Unknown endpoint'});
 }
 let path=decodeURIComponent(url.pathname);if(path==='/studio'||path==='/studio/')path='/studio/index.html';if(path.endsWith('/'))path+='index.html';let file=resolve(root,'.'+path);if(!file.startsWith(root+'/')||path.includes('/.git')||path.includes('/.studio-data')||/\.(mjs|sqlite|json|md|yml)$/.test(path))return json(res,404,{error:'Not found'});
 const data=await readFile(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4'})[extname(file)]||'application/octet-stream');res.end(data);
 }catch(e){json(res,e.code==='ENOENT'?404:400,{error:e.code==='ENOENT'?'Not found':'Request could not be processed'});}
});
server.listen(Number(process.env.PORT||4173),'0.0.0.0',()=>console.log('Forma Studio development server ready'));
