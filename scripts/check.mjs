import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const html=await readFile(path.join(root,'index.html'),'utf8');
const js=await readFile(path.join(root,'app.js'),'utf8');
const guardian=await readFile(path.join(root,'guardian.js'),'utf8');
const fonts=await readFile(path.join(root,'assets/fonts.css'),'utf8');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'Exactly one main heading');
assert(!/\+92|5039260|tel:/.test(html+js),'Phone number must not appear on the page');
assert(!(html+js).includes('—'),'Website copy must not contain em dashes');
assert(html.includes('https://www.instagram.com/sh.sheikhsaad/'),'Instagram footer link');
assert(html.includes('aria-controls="main-nav"'),'Accessible navigation');
assert(html.includes('download'),'Resume download action');
const urls=[...new Set([...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)].map(m=>m[1]).concat([...js.matchAll(/['"](\/assets\/[^'"]+)['"]/g)].map(m=>m[1])))];
urls.push(...[...fonts.matchAll(/url\((\/[^)]+)\)/g)].map(m=>m[1]),'/assets/vendor/three.module.min.js','/assets/vendor/three.core.min.js');
for(const url of urls){await readFile(path.join(root,new URL(url,'http://localhost').pathname));const response=await fetch('http://127.0.0.1:4317'+url,{method:'HEAD'});assert.equal(response.status,200,url);}
for(const id of ['about','projects','experience','contact','toolkit'])assert(html.includes(`id="${id}"`),`Section ${id}`);
const pdf=await readFile(path.join(root,'assets/Muhammad_Saad_Ahmed_Resume.pdf'));assert(pdf.subarray(0,4).toString()==='%PDF','Real PDF');
for(const file of (await readdir(path.join(root,'assets/projects'))).filter(f=>f.endsWith('.mp4'))){const response=await fetch('http://127.0.0.1:4317/assets/projects/'+file,{headers:{Range:'bytes=0-127'}});assert.equal(response.status,206,'Video range request');assert.equal((await response.arrayBuffer()).byteLength,128);}
assert.equal((await fetch('http://127.0.0.1:4317/not-a-page')).status,404,'Missing page is 404');
assert(html.includes('id="motion-toggle"'),'Motion control');
assert(guardian.includes('prefers-reduced-motion')&&guardian.includes('visibilitychange'),'Motion preferences and background suspension');
console.log(`Passed: ${urls.length} asset links, PDF, phone privacy, page structure, social links, and video range playback support.`);
