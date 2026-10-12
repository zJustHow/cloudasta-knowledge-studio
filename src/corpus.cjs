'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {extract}=require('./source.cjs');
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const definitions=()=>require('./demo-content.cjs').definitions();
function generate(root){
 const seed=path.resolve(__dirname,'../demo-files'),manifest=JSON.parse(fs.readFileSync(path.join(seed,'manifest.json'),'utf8'));
 fs.mkdirSync(root,{recursive:true});
 if(path.resolve(root)!==seed){
  const oldPath=path.join(root,'manifest.json');if(fs.existsSync(oldPath)){for(const d of JSON.parse(fs.readFileSync(oldPath,'utf8'))){if(path.basename(d.path)!==d.path)throw Error('Invalid managed source path.');fs.rmSync(path.join(root,d.path),{force:true});}}
  for(const d of manifest){const bytes=fs.readFileSync(path.join(seed,d.path));if(digest(bytes)!==d.hash)throw Error('Demo seed changed: '+d.id);fs.writeFileSync(path.join(root,d.path),bytes);}
  fs.writeFileSync(oldPath,JSON.stringify(manifest,null,2));
 }return manifest;
}
function parse(input,doc){const {sections}=extract(Buffer.isBuffer(input)?input:Buffer.from(input),doc),counts={};return sections.flatMap(s=>{
 const chunks=[];const text=s.text.trim();for(let offset=0;offset<text.length;){let end=Math.min(offset+1400,text.length);if(end<text.length){const boundary=text.lastIndexOf('\n',end);if(boundary>offset+700)end=boundary;else{const space=text.lastIndexOf(' ',end);if(space>offset+700)end=space;}}
 const body=text.slice(offset,end).trim(),n=counts[s.key]||0;counts[s.key]=n+1;
 chunks.push({id:doc.id+':'+s.key+':'+n,docId:doc.id,version:doc.version,key:s.key,text:body,location:s.location+(doc.type==='Meet transcript'?' · '+(body.match(/\[\d+:\d+:\d+\]/)?.[0]||'continued'):'')+` · segment ${n+1}`,hash:digest(body),offset});if(end>=text.length)break;offset=end;}
 return chunks;});}
module.exports={definitions,generate,parse,digest};
