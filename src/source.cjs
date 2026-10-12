'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const decode=s=>s.replace(/&#x([0-9a-f]+);/gi,(_,x)=>String.fromCodePoint(parseInt(x,16))).replace(/&#(\d+);/g,(_,x)=>String.fromCodePoint(+x)).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
function zipEntries(buffer){
 if(buffer.length>32*1024*1024)throw Error('Source exceeds the demo size limit.');
 let end=-1;for(let i=buffer.length-22;i>=Math.max(0,buffer.length-65557);i--)if(buffer.readUInt32LE(i)===0x06054b50){end=i;break;}
 if(end<0)throw Error('Invalid Office package.');const count=buffer.readUInt16LE(end+10);if(count>2000)throw Error('Too many package entries.');let pos=buffer.readUInt32LE(end+16),total=0;const entries={};
 for(let n=0;n<count;n++){
  if(pos+46>buffer.length||buffer.readUInt32LE(pos)!==0x02014b50)throw Error('Invalid package directory.');
  const flags=buffer.readUInt16LE(pos+8),method=buffer.readUInt16LE(pos+10),size=buffer.readUInt32LE(pos+20),expanded=buffer.readUInt32LE(pos+24),nameLen=buffer.readUInt16LE(pos+28),extra=buffer.readUInt16LE(pos+30),comment=buffer.readUInt16LE(pos+32),offset=buffer.readUInt32LE(pos+42),name=buffer.subarray(pos+46,pos+46+nameLen).toString('utf8');
  if(flags&1||![0,8].includes(method)||expanded>8*1024*1024||(total+=expanded)>64*1024*1024)throw Error('Unsupported or oversized Office package.');
  if(offset+30>buffer.length||buffer.readUInt32LE(offset)!==0x04034b50)throw Error('Invalid package entry.');
  const start=offset+30+buffer.readUInt16LE(offset+26)+buffer.readUInt16LE(offset+28);if(start+size>buffer.length)throw Error('Truncated package entry.');
  if(/\.xml$/.test(name)||/\.rels$/.test(name)){const bytes=buffer.subarray(start,start+size),out=method===8?zlib.inflateRawSync(bytes,{maxOutputLength:8*1024*1024}):bytes;if(out.length!==expanded)throw Error('Invalid package entry length.');entries[name]=out.toString('utf8');}
  pos+=46+nameLen+extra+comment;
 }return entries;
}
const paragraphs=(xml,prefix)=>[...(xml||'').matchAll(new RegExp('<'+prefix+':p(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+prefix+':p>','g'))].map(m=>[...m[1].matchAll(new RegExp('<'+prefix+':t(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+prefix+':t>','g'))].map(x=>decode(x[1])).join('')).filter(Boolean);
function splitHeadings(lines,doc,kind){let current;const sections=[];for(let i=0;i<lines.length;i++){const line=lines[i],heading=line.replace(/^## /,'').trim(),key=doc.headings?.[heading];if(key){if(current)sections.push(current);current={key,heading,text:'',location:kind==='docx'?`Heading: ${heading} · paragraph ${i+1}`:`Lines ${i+1}`};}else if(current)current.text+=(current.text?'\n':'')+line;}if(current)sections.push(current);return sections;}
function extract(buffer,doc){
 const ext=path.extname(doc.path).toLowerCase();let sections=[],text='';
 if(['.md','.txt'].includes(ext)){text=buffer.toString('utf8');sections=splitHeadings(text.split(/\r?\n/),doc,ext.slice(1));}
 else{const entries=zipEntries(buffer);
 if(ext==='.docx'){const lines=paragraphs(entries['word/document.xml'],'w');text=lines.join('\n\n');sections=splitHeadings(lines,doc,'docx');}
 else if(ext==='.pptx'){
  const names=Object.keys(entries).filter(n=>/^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a,b)=>+a.match(/slide(\d+)/)[1]- +b.match(/slide(\d+)/)[1]);
  sections=names.map((name,i)=>{const lines=paragraphs(entries[name],'a'),notes=paragraphs(entries[`ppt/notesSlides/notesSlide${i+1}.xml`],'a').filter(l=>l!==String(i+1));return {key:doc.slideKeys?.[i]||'slide-'+(i+1),heading:lines[1]||lines[0],text:lines.join('\n')+(notes.length?'\n\nPresenter notes: '+notes.join('\n'):''),location:`Slide ${i+1} (including presenter notes)`};});text=sections.map(s=>s.location+'\n'+s.text).join('\n\n');
 }else if(ext==='.xlsx'){
  const strings=[...(entries['xl/sharedStrings.xml']||'').matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)].map(m=>[...m[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(x=>decode(x[1])).join(''));
  const rels={};for(const m of (entries['xl/_rels/workbook.xml.rels']||'').matchAll(/<Relationship\b([^>]+)\/?\s*>/g)){const id=m[1].match(/\bId="([^"]+)"/)?.[1],target=m[1].match(/\bTarget="([^"]+)"/)?.[1];if(id&&target)rels[id]=target.startsWith('/')?target.slice(1):path.posix.normalize('xl/'+target);}
  for(const m of (entries['xl/workbook.xml']||'').matchAll(/<sheet\b([^>]+)\/?\s*>/g)){const name=decode(m[1].match(/\bname="([^"]+)"/)?.[1]||''),rid=m[1].match(/\br:id="([^"]+)"/)?.[1],xml=entries[rels[rid]],key=doc.sheetKeys?.[name];if(!key)continue;const rows=[];
   for(const row of (xml||'').matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)){const cells=[];for(const c of row[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)){const ref=c[1].match(/\br="([^"]+)"/)?.[1]||'',type=c[1].match(/\bt="([^"]+)"/)?.[1],v=c[2].match(/<v[^>]*>([\s\S]*?)<\/v>/)?.[1];let value=type==='s'?strings[+v]:type==='inlineStr'?[...c[2].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(x=>decode(x[1])).join(''):decode(v||'');if(value)cells.push(ref+': '+value);}if(cells.length)rows.push(cells.join(' | '));}
   sections.push({key,heading:name,text:rows.join('\n'),location:`Sheet ${name} · ${rows.length} populated rows`});
  }text=sections.map(s=>s.location+'\n'+s.text).join('\n\n');
 }else throw Error('Unsupported source format.');
 }
 if(!sections.length||sections.some(s=>!s.text.trim()))throw Error('No readable business sections.');return {text,sections};
}
function readSource(root,doc){const bytes=fs.readFileSync(path.join(root,doc.path));return {bytes,...extract(bytes,doc)};}
module.exports={extract,readSource,zipEntries};
