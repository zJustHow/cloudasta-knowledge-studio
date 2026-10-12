'use strict';
const path=require('node:path'),{Store}=require('../src/store.cjs'),{Agent}=require('../src/agent.cjs'),{Qwen}=require('../src/model.cjs');
(async()=>{const store=new Store(process.env.DATA_DIR||path.resolve('var')),agent=new Agent(store,new Qwen());try{console.log('Generated '+agent.initialize()+' fictional files.');console.log(await agent.index());}finally{store.close();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
