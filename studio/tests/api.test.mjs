import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
const temp=await mkdtemp(join(tmpdir(),'forma-test-'));const port=14373;const origin=`http://127.0.0.1:${port}`;const server=spawn(process.execPath,['studio/server.mjs'],{env:{...process.env,PORT:String(port),STUDIO_DB:join(temp,'test.sqlite')},stdio:['ignore','pipe','pipe']});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('exit',()=>reject(Error('Server failed to start')));});
let cookie='';async function request(path,data,opts={}){const r=await fetch(origin+'/api/studio/'+path,{method:data?'POST':'GET',headers:{'Content-Type':'application/json',cookie,...opts.headers},body:data?JSON.stringify(data):undefined});if(!opts.isolated&&r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};}
test.after(async()=>{server.kill();await new Promise(r=>server.once('exit',r));await rm(temp,{recursive:true,force:true});});
test('persistent project lifecycle, authorization, consent and account isolation',async()=>{
 assert.equal((await request('session')).data.integration,'not-configured');
 const r=await request('concepts',{area:900});assert.equal(r.data.concepts.length,10);
 const p=await request('projects',{address:'Development test property',parameters:{area:900},variant:2});assert.equal(p.status,200);
 assert.equal((await request('projects')).data.projects.length,1);
 const ownerCookie=cookie;cookie='';assert.equal((await request('projects')).data.projects.length,0);
 assert.equal((await request('projects',{id:p.data.id,parameters:{area:800}})).status,404);
 assert.equal((await request('handoff',{projectId:p.data.id,consent:true,name:'Test',email:'test@example.com'})).status,404);
 cookie=ownerCookie;
 assert.equal((await request('handoff',{projectId:p.data.id,consent:false,name:'Test',email:'test@example.com'})).status,400);
 const h=await request('handoff',{projectId:p.data.id,consent:true,name:'Test',email:'test@example.com'});assert.equal(h.status,202);assert.equal(h.data.status,'saved-locally');
 assert.equal((await request('account',{action:'register',email:'test@example.com',password:'development-test-pass-123'})).status,200);
 assert.equal((await request('session')).data.account,true);await request('logout',{});
 assert.equal((await request('projects')).data.projects.length,0);
 assert.equal((await request('account',{action:'login',email:'test@example.com',password:'wrong-password-123'})).status,401);
 assert.equal((await request('account',{action:'login',email:'test@example.com',password:'development-test-pass-123'})).status,200);
 assert.equal((await request('projects')).data.projects.length,1);
});
test('reject cross-origin mutation, malformed input and private source access',async()=>{
 assert.equal((await request('projects',{parameters:{area:900}},{headers:{origin:'https://untrusted.example'}})).status,403);
 assert.equal((await request('concepts',{area:-100})).status,400);
 for(const path of ['/.git/config','/.studio-data/studio.sqlite','/studio/server.mjs','/package.json'])assert.equal((await fetch(origin+path)).status,404);
 assert.equal((await fetch(origin+'/studio')).status,200);
 assert.equal((await fetch(origin+'/')).status,200);
 const page=await fetch(origin+'/studio');assert.ok(page.headers.get('content-security-policy').includes("frame-ancestors 'none'"));
});
