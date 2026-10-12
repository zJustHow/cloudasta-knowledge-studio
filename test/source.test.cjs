'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {extract,zipEntries}=require('../src/source.cjs'),{parse,digest}=require('../src/corpus.cjs');
const root=path.resolve(__dirname,'../demo-files'),manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'))),read=id=>{const doc=manifest.find(d=>d.id===id),bytes=fs.readFileSync(path.join(root,doc.path));return {doc,bytes,...extract(bytes,doc)};};
test('native Office documents carry actual source content and source locations',()=>{
 const word=read('onboarding-v1');assert.ok(zipEntries(word.bytes)['word/document.xml'].includes('security'));assert.match(word.text,/qualified acceptance/);assert.match(word.sections[0].location,/Heading:.*paragraph/);
 const deck=read('acme-proposal-v2');assert.equal(deck.sections.length,8);assert.match(deck.sections[4].text,/Engineering feasibility remains unconfirmed/);assert.match(deck.sections[4].location,/Slide 5/);
 const price=read('acme-pricing');assert.match(price.text,/C2: 21/);assert.match(price.text,/31 March 2027/);assert.ok(price.sections.every(s=>s.location.startsWith('Sheet ')));
 for(const d of manifest){const bytes=fs.readFileSync(path.join(root,d.path));assert.equal(digest(bytes),d.hash);const chunks=parse(bytes,d);assert.equal(new Set(chunks.map(c=>c.id)).size,chunks.length);assert.ok(chunks.every(c=>c.text.length<=1400));}
});
test('duplicate exports remain byte-identical, with retention kept in metadata',()=>{for(const [copy,source]of [['onboarding-copy','onboarding-v1'],['backup-copy','backup-v2'],['pricing-copy','pricing-v1'],['acme-qbr-copy','acme-qbr-q2']])assert.equal(read(copy).doc.hash,read(source).doc.hash);assert.equal(read('pricing-copy').doc.retention,'legal_hold');});
test('Office extraction rejects malformed and encrypted packages',()=>{const {bytes,doc}=read('access-v1');assert.throws(()=>extract(Buffer.from('Not a document'),doc),/Invalid Office/);const corrupted=Buffer.from(bytes),end=corrupted.lastIndexOf(Buffer.from([0x50,0x4b,0x05,0x06])),pos=corrupted.readUInt32LE(end+16);corrupted.writeUInt16LE(1,pos+8);assert.throws(()=>extract(corrupted,doc),/Unsupported/);});
