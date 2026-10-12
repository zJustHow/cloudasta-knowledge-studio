'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{Store}=require('../src/store.cjs'),{Agent}=require('../src/agent.cjs'),{Qwen}=require('../src/model.cjs');
async function fixture(t,{clean=false,model=new Qwen({})}={}){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cloudasta-rag-test-')),store=new Store(dir),agent=new Agent(store,model);t.after(async()=>{if(agent.task)await agent.task;store.close();fs.rmSync(dir,{recursive:true,force:true});});agent.initialize();await agent.index();if(clean){agent.start('local');await agent.task;}return {dir,store,agent,doc:id=>store.state.documents.find(d=>d.id===id)};}
module.exports={fixture};
