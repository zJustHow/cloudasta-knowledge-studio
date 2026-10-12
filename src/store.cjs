'use strict';
const fs=require('node:fs'),path=require('node:path'),{DatabaseSync}=require('node:sqlite');
const blank=()=>({schema:1,revision:0,paused:false,documents:[],chunks:[],index:null,relations:[],reviews:[],jobs:[],traces:[],audit:[],lastAnswer:null});
class Store{constructor(dir){this.dir=dir;fs.mkdirSync(dir,{recursive:true,mode:0o700});this.db=new DatabaseSync(path.join(dir,'brain.sqlite'));this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS state(id INTEGER PRIMARY KEY,payload TEXT NOT NULL);');if(!this.db.prepare('SELECT id FROM state').get())this.db.prepare('INSERT INTO state VALUES(1,?)').run(JSON.stringify(blank()));this.state=JSON.parse(this.db.prepare('SELECT payload FROM state WHERE id=1').get().payload);let recovered=false;for(const j of this.state.jobs)if(['running','indexing'].includes(j.status)){j.status='interrupted';j.error='Server restarted. Resume this job to continue.';recovered=true;}for(const d of this.state.documents)if(d.processingStatus==='processing'){d.processingStatus='pending';d.processed=false;recovered=true;}if(recovered)this.save();}
 save(){this.state.revision++;this.db.prepare('UPDATE state SET payload=? WHERE id=1').run(JSON.stringify(this.state));}
 atomic(fn){const before=structuredClone(this.state);this.db.exec('BEGIN IMMEDIATE');try{const result=fn(this.state);this.save();this.db.exec('COMMIT');return result;}catch(e){this.state=before;this.db.exec('ROLLBACK');throw e;}}
 reset(){this.state=blank();this.save();}
 close(){this.db.close();}}
module.exports={Store,blank};
