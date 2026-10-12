'use strict';
// Duplicate metadata stays on its original file; candidates retain that provenance.
function duplicateLinks(state,source){
 const links=[],seen=new Set([source.id]);
 function visit(id){for(const relation of state.relations.filter(r=>r.executed&&r.type==='duplicate'&&r.source===id)){
  const parent=state.documents.find(d=>d.id===id),doc=state.documents.find(d=>d.id===relation.target);
  if(!parent||!doc||seen.has(doc.id)||parent.hash!==doc.hash||relation.sourceHash!==parent.hash||relation.targetHash!==doc.hash||relation.sourceVersion!==parent.version||relation.targetVersion!==doc.version)continue;
  seen.add(doc.id);
  const add=(target,type,keys=[])=>{if(target&&target!==source.id&&!links.some(x=>x.document_id===target&&x.type===type))links.push({document_id:target,type,keys,via:doc.id});};
  add(doc.replaces,'supersedes');for(const ref of doc.references||[])add(ref,'depends_on');
  for(const edge of state.relations.filter(r=>r.executed&&r.source===doc.id&&r.sourceHash===doc.hash&&r.sourceVersion===doc.version&&r.targetHash===state.documents.find(d=>d.id===r.target)?.hash&&r.targetVersion===state.documents.find(d=>d.id===r.target)?.version))if(/supersedes/.test(edge.type)||edge.type==='depends_on')add(edge.target,/supersedes/.test(edge.type)?'supersedes':edge.type,edge.keys);
  visit(doc.id);
 }}
 visit(source.id);return links;
}
function unresolvedLinks(state,source){return duplicateLinks(state,source).filter(link=>![...state.relations.filter(r=>r.executed),...state.reviews.filter(r=>r.status==='pending'||r.status==='resolved')].some(r=>r.source===source.id&&r.target===link.document_id&&(link.type==='supersedes'?/supersedes/.test(r.type):r.type===link.type)&&r.sourceHash===source.hash&&r.sourceVersion===source.version&&r.targetVersion===state.documents.find(d=>d.id===r.target)?.version&&r.targetHash===state.documents.find(d=>d.id===r.target)?.hash));}
module.exports={duplicateLinks,unresolvedLinks};
