import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
if(!process.env.RUNTIME_NODE_MODULES)throw Error('Set RUNTIME_NODE_MODULES to the authoring runtime node_modules directory.');
const runtimeRequire=createRequire(path.join(process.env.RUNTIME_NODE_MODULES,'author-runtime.cjs'));
const {Presentation,PresentationFile}=await import(pathToFileURL(runtimeRequire.resolve('@oai/artifact-tool')).href);
const docx=runtimeRequire('docx');
const require=createRequire(import.meta.url),{definitions}=require('../src/demo-content.cjs'),{digest}=require('../src/corpus.cjs');
const {Document,Packer,Paragraph,TextRun,HeadingLevel,Header,Footer,PageNumber,AlignmentType,Table,TableRow,TableCell,WidthType,ShadingType}=docx;
const root=path.resolve('demo-files'),draft=path.resolve('.build/corpus'),docs=definitions();
await fs.mkdir(root,{recursive:true});
await fs.mkdir(draft,{recursive:true});
// Remove only the previous managed demo fixtures, never environment or user files.
try{for(const d of JSON.parse(await fs.readFile(path.join(root,'manifest.json'),'utf8')))await fs.rm(path.join(root,d.path),{force:true});}catch(e){if(e.code!=='ENOENT')throw e;}
const filenames={
'access-v1':'OPS-101_Workspace_Access_r1.docx','access-v2':'OPS-101_Workspace_Access_r2.docx','backup-v1':'OPS-204_Recovery_Operations_r1.docx','backup-v2':'OPS-204_Recovery_Operations_r2.docx','backup-copy':'OPS-204_Recovery_Operations_r2_shared-copy.docx','onboarding-v1':'CS-110_Customer_Onboarding_r1.docx','onboarding-addendum':'CS-110_Kickoff_Amendment_review.docx','onboarding-copy':'CS-110_Customer_Onboarding_export.docx','incident-v1':'SUP-301_Incident_Response_2026.docx','incident-future':'SUP-301_Incident_Response_Jan2027.docx','undated-sop':'Support_Response_Working_Note.docx','qbr-guide':'CS-220_Quarterly_Review_Playbook.docx',
'pricing-v1':'FIN-2026-01_Managed_Workspace_Rates.xlsx','pricing-v2':'FIN-2026-09_Rate_Review_DRAFT.xlsx','pricing-copy':'FIN-2026-01_Rates_Legal_Archive.xlsx','legacy-pricing':'MIG-2025_Pilot_Campaign.xlsx','acme-pricing':'Acme_Approved_Commercial_Schedule_2026.xlsx','beta-pricing':'Beta_Approved_Commercial_Schedule_2026.xlsx',
'acme-proposal-v1':'Acme_Workspace_Migration_20260410_r1.pptx','acme-proposal-v2':'Acme_Workspace_Migration_20260905_r2.pptx','beta-proposal':'Beta_Workspace_Migration_20260510.pptx','proposal-template':'Workspace_Migration_Proposal_Template_Jul2026.pptx',
'acme-qbr-q1':'Acme_QBR_2026Q1_Confirmed.md','acme-qbr-q2':'Acme_QBR_2026Q2_Confirmed.md','beta-qbr-q2':'Beta_QBR_2026Q2_Confirmed.md','acme-qbr-copy':'Acme_QBR_2026Q2_shared-copy.md',
'pricing-meet':'2026-10-05_Commercial_Planning_Meet.txt','onboarding-meet':'2026-09-25_Onboarding_Retrospective_Meet.txt','acme-meet':'2026-09-15_Acme_Delivery_Review_Meet.txt','security-meet':'2026-09-22_Access_Controls_Meet.txt'};
const titles={'access-v1':'Workspace access procedure | Revision 1.0','access-v2':'Workspace access procedure | Revision 2.0','backup-v1':'Backup and recovery operations | Revision 1.0','backup-v2':'Backup and recovery operations | Revision 2.0','onboarding-v1':'Customer onboarding and service acceptance','onboarding-addendum':'Customer onboarding: kickoff scheduling amendment','incident-v1':'Production incident response procedure','incident-future':'Production incident response: January 2027 schedule','pricing-v1':'Managed workspace commercial framework | 2026','pricing-v2':'Managed workspace rate review | Finance draft','legacy-pricing':'Small-tenant migration pilot campaign | 2025','acme-pricing':'Acme Field Services | Approved commercial schedule','beta-pricing':'Beta Health Logistics | Approved commercial schedule','qbr-guide':'Quarterly customer review playbook','undated-sop':'Support acknowledgement target | Working note'};
for(const d of docs){d.path=filenames[d.id];d.title=titles[d.id]||d.title;d.sheetKeys={};d.slideKeys=d.slides?.map(s=>s[0]);}
await fs.writeFile(path.join(draft,'author-data.json'),JSON.stringify(docs,null,2));
const p=text=>new Paragraph({spacing:{after:150,line:276},children:[new TextRun(text)]});
for(const d of docs.filter(d=>!d.copyOf)){
 if(d.type==='SOP'){
  const control=[['Document owner',d.owner],['Business date',d.date||'Not recorded'],['Approval',d.approval==='draft'?'Pending / working copy':'Approved by the service owner'],['Effective date',d.effective||'Not verified'],['Classification','Internal operations · fictional demonstration']];
  const table=new Table({width:{size:9360,type:WidthType.DXA},columnWidths:[2600,6760],rows:control.map(([k,v])=>new TableRow({children:[k,v].map((x,i)=>new TableCell({width:{size:i?6760:2600,type:WidthType.DXA},shading:{fill:i?'FFFFFF':'F1F4F6',type:ShadingType.CLEAR},margins:{top:100,bottom:100,left:130,right:130},children:[p(x)]}))}))});
  const children=[new Paragraph({heading:HeadingLevel.TITLE,children:[new TextRun(d.title.replace(' | ','\n'))]}),p('CLOUDASTA  /  SERVICE OPERATIONS'),table,p('Purpose: define the operational steps, accountable owners and evidence needed for this procedure. This record belongs to a wholly fictional customer and operations dataset.')];
  for(const s of d.sections){children.push(new Paragraph({heading:HeadingLevel.HEADING_1,children:[new TextRun(s.heading)]}));for(const para of s.text.split(/\n\n/))children.push(p(para));}
  const document=new Document({creator:'Cloudasta Demo',title:d.title,styles:{default:{document:{run:{font:'Arial',size:21,color:'263445'}}},paragraphStyles:[{id:'Title',name:'Title',basedOn:'Normal',run:{font:'Arial',size:42,bold:true,color:'162D40'},paragraph:{spacing:{before:100,after:260},keepNext:true}},{id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Arial',size:28,bold:true,color:'162D40'},paragraph:{spacing:{before:300,after:180},outlineLevel:0,keepNext:true}}]},sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1080,bottom:1080,left:1440,right:1440}}},headers:{default:new Header({children:[p('CLOUDASTA    /    CONTROLLED OPERATIONS RECORD')]})},footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:'FICTIONAL DEMONSTRATION  ·  ',size:16}),new TextRun({children:[PageNumber.CURRENT],size:16})]})]})},children}]});
  await fs.writeFile(path.join(root,d.path),await Packer.toBuffer(document));
 }else if(d.type==='Proposal deck'){
  const deck=Presentation.create({slideSize:{width:1280,height:720}});
  const addText=(slide,text,x,y,w,h,size,color,bold=false)=>{const shape=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});shape.text=text;shape.text.style={typeface:'Arial',fontSize:size,color,bold};return shape;};
  for(const [i,[key,title,body,notes]]of d.slides.entries()){
   const slide=deck.slides.add();slide.background.fill=i===0?'#172F42':'#F9FAF8';const ink=i===0?'#FFFFFF':'#172F42';
   addText(slide,'CLOUDASTA  /  '+(d.client==='Global'?'DELIVERY ENABLEMENT':d.client.toUpperCase()+' CUSTOMER PROPOSAL'),72,45,1136,32,16,i===0?'#B8CDD7':'#59717E',true);
   addText(slide,title,72,124,1100,i===0?180:115,i===0?60:44,ink,true);
   addText(slide,body,76,i===0?355:278,1095,300,i===0?28:31,i===0?'#E0EAF0':'#344B58');
   addText(slide,'FICTIONAL DEMONSTRATION  ·  '+(d.date||'UNDATED')+'  ·  '+(d.approval==='draft'?'FOR REVIEW':'APPROVED'),72,666,1000,26,13,i===0?'#B8CDD7':'#697D86');
   addText(slide,String(i+1).padStart(2,'0'),1160,662,48,30,18,ink);
   slide.speakerNotes.text=notes;
  }
  const candidate=path.join(draft,d.id+'.draft.pptx');await(await PresentationFile.exportPptx(deck)).save(candidate);
  const skill=process.env.PRESENTATIONS_SKILL_DIR||'/Users/zjusthow/.codex/plugins/cache/openai-primary-runtime/presentations/26.1011.11113/skills/presentations';
  const {finalizePresentation}=await import('file://'+skill+'/container_tools/artifact_tool_utils.mjs');
  await finalizePresentation({workspaceDir:path.resolve('.'),candidatePath:candidate,finalPath:path.join(root,d.path),pythonExecutable:process.env.RUNTIME_PYTHON||'python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:path.join(draft,d.id+'.validation.json')});
  for(const [i,slide]of deck.slides.items.entries()){const png=await deck.export({slide,format:'png',scale:0.7});await fs.writeFile(path.join(draft,d.id+'-'+(i+1)+'.png'),new Uint8Array(await png.arrayBuffer()));}
 }else if(d.type==='Client QBR notes'){
  const content='# '+d.title+'\n\nCloudasta Customer Success / '+d.client+'\n\n'+d.sections.map(s=>'## '+s.heading+'\n\n'+s.text).join('\n\n')+'\n\n---\nFictional demonstration. All parties, metrics and record identifiers are invented.\n';await fs.writeFile(path.join(root,d.path),content);
 }else if(d.type==='Meet transcript'){
  const content='Google Meet — transcript export (simulated)\n'+d.title+'\nDate: '+d.date+' | Timezone: UTC | Duration: '+d.meeting.duration+'\nParticipants: '+d.meeting.people+'\nLanguage: English\nTranscript may contain recognition errors. Statements are not policy approvals.\n\n'+d.sections.map(s=>'## '+s.heading+'\n\n'+s.text).join('\n\n')+'\n\n[End of transcript]\nFictional demonstration. No real meeting was recorded.\n';await fs.writeFile(path.join(root,d.path),content);
 }
}
// Pricing workbooks are authored by the companion Python script.
await fs.writeFile(path.join(draft,'author-data.json'),JSON.stringify(docs,null,2));
const pricing=spawnSync(process.env.RUNTIME_PYTHON||'python3',['scripts/author-pricing.py'],{stdio:'inherit'});if(pricing.status!==0)throw Error('Pricing workbook authoring failed.');
const authored=JSON.parse(await fs.readFile(path.join(draft,'author-data.json'),'utf8'));
for(const d of authored.filter(d=>d.copyOf)){const src=authored.find(s=>s.id===d.copyOf);await fs.copyFile(path.join(root,src.path),path.join(root,d.path));d.headings=src.headings;d.sheetKeys=src.sheetKeys;d.slideKeys=src.slideKeys;}
const manifest=[];for(const d of authored){const {sections,slides,meeting,contentTitle,copyOf,...meta}=d;manifest.push({...meta,version:1,aiAllowed:true,synthetic:true,hash:digest(await fs.readFile(path.join(root,d.path)))});}
await fs.writeFile(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2));
console.log('Authored '+manifest.length+' native fictional source records.');
