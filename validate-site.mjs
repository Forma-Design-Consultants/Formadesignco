import {existsSync,readdirSync,readFileSync,statSync} from 'node:fs';
const files=readdirSync('.').filter(file=>file.endsWith('.html'));
const failures=[];
const external=/^(https?:|mailto:|tel:|data:|#)/;
for(const file of files){
  const html=readFileSync(file,'utf8');
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const target=match[1].split(/[?#]/)[0];
    if(target&&!external.test(target)&&!existsSync(target))failures.push(`${file}: missing local asset ${target}`);
  }
  if(file!=='introduction.html'){
    const h1s=(html.match(/<h1/g)||[]).length;
    if(h1s!==1)failures.push(`${file}: expected 1 H1, found ${h1s}`);
  }
  if(!html.includes('<link rel="canonical"'))failures.push(`${file}: missing canonical`);
  if(!['introduction.html'].includes(file)&&!html.includes('<meta name="description"'))failures.push(`${file}: missing description`);
  for(const image of html.matchAll(/<img\s[^>]*>/g))if(!/\salt="[^"]*"/.test(image[0]))failures.push(`${file}: image without alt text`);
}
const home=readFileSync('index.html','utf8');
let initial=statSync('index.html').size+statSync('style.css').size+statSync('site.js').size;
for(const match of home.matchAll(/(?:href|src)="([^"]+)"/g)){
  const target=match[1].split(/[?#]/)[0];
  if(existsSync(target)&&!target.endsWith('.html')&&!['style.css','site.js'].includes(target))initial+=statSync(target).size;
}
if(initial>2100*1024)failures.push(`Homepage initial local payload is ${(initial/1024).toFixed(1)} KB; target is under 2.1 MB`);
const forbidden=['555-','Alex Mercer','Sarah Chen','Marcus Thorne','+24%','DESIGN. BUILD. FINANCE.'];
for(const phrase of forbidden)for(const file of files)if(readFileSync(file,'utf8').includes(phrase))failures.push(`${file}: forbidden placeholder or unsupported claim: ${phrase}`);
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`Validated ${files.length} HTML files; homepage initial local payload ${(initial/1024).toFixed(1)} KB.`);
