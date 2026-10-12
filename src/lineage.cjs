'use strict';
const {eligible}=require('./retrieval.cjs');
const isVersion=type=>['full_supersedes','partial_supersedes'].includes(type);
function reaches(state,source,target,seen=new Set()){
 if(source===target)return true;if(seen.has(source))return false;seen.add(source);
 return state.relations.filter(r=>r.executed&&isVersion(r.type)&&r.source===source).some(r=>reaches(state,r.target,target,seen));
}
function competing(state,source,target,keys){return state.relations.filter(r=>r.executed&&isVersion(r.type)&&r.target===target&&r.source!==source&&state.documents.find(d=>d.id===r.source)?.hash!==state.documents.find(d=>d.id===source)?.hash&&r.keys.some(k=>keys.includes(k))&&!reaches(state,source,r.source)&&!reaches(state,r.source,source));}
function graph(state){
 const now=new Date().toISOString().slice(0,10),docs=new Map(state.documents.map(d=>[d.id,d]));
 const confirmed=state.relations.filter(r=>r.executed).map(r=>{const review=state.reviews.find(e=>e.source===r.source&&e.target===r.target&&e.type===r.type&&e.sourceHash===r.sourceHash&&e.targetHash===r.targetHash&&e.status==='resolved'&&e.choice==='approve');return {...r,note:review?.note,decidedAt:review?.decidedAt,amendments:review?.amendments,edgeId:'relation:'+r.id,status:'confirmed',record:'relation'};});
 const reviews=state.reviews.filter(r=>r.target).map(r=>({...r,edgeId:'review:'+r.id,status:r.status==='pending'?'proposed':'dismissed',record:'review'})).filter(r=>r.status==='proposed'||!state.relations.some(e=>e.source===r.source&&e.target===r.target&&e.type===r.type&&e.sourceHash===r.sourceHash&&e.targetHash===r.targetHash));
 const edges=[...confirmed,...reviews].map(r=>({...r,parent:r.target,child:r.source,version:isVersion(r.type),stale:!docs.has(r.source)||!docs.has(r.target)||docs.get(r.source).hash!==r.sourceHash||docs.get(r.target).hash!==r.targetHash||docs.get(r.source).version!==r.sourceVersion||docs.get(r.target).version!==r.targetVersion,competingWith:isVersion(r.type)?competing(state,r.source,r.target,r.keys).map(e=>e.source):[]}));
 const nodes=state.documents.map(d=>{const chunks=state.chunks.filter(c=>c.docId===d.id),available=chunks.filter(c=>eligible(d,c,state,now));return {id:d.id,title:d.title,path:d.path,type:d.type,client:d.client,domain:d.domain,date:d.date,effective:d.effective,expires:d.expires,approval:d.approval,knowledgeStatus:d.knowledgeStatus,processingStatus:d.processingStatus,processor:d.processor,answerEligible:available.length>0,effectiveKeys:[...new Set(available.map(c=>c.key))],allKeys:[...new Set(chunks.map(c=>c.key))],availability:!d.date||!d.effective?'Date unverified':d.effective>now?'Future effective':d.expires&&d.expires<=now?'Expired':available.length?'Current answer source':'Outside current answers'};});
 return {nodes,edges,asOf:now};
}
module.exports={graph,isVersion,competing};
