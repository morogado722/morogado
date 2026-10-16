/* Local exhibition storage. Records and original blobs share one atomic transaction. */
(() => {
 'use strict';
 const DB='morogado-exhibition-v1', VERSION=1;
 let dbPromise,bookmarkQueue=Promise.resolve(); const hydratedUrls=new Map();
 const open=()=>dbPromise||(dbPromise=new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB,VERSION);
  request.onupgradeneeded=()=>{for(const name of ['batons','files','comments','settings'])if(!request.result.objectStoreNames.contains(name))request.result.createObjectStore(name,{keyPath:'id'});};
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>{dbPromise=null;reject(new Error('브라우저 저장소를 열지 못했어요. 시크릿 모드나 저장 용량을 확인해 주세요.'));};
 }));
 const read=async(name,id)=>{const db=await open();return new Promise((resolve,reject)=>{const r=db.transaction(name).objectStore(name)[id===undefined?'getAll':'get'](id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});};
 const write=async(name,value)=>{const db=await open();return new Promise((resolve,reject)=>{const t=db.transaction(name,'readwrite');t.objectStore(name).put(value);t.oncomplete=()=>resolve(value);t.onerror=()=>reject(new Error('저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.'));});};
 const id=()=>crypto.randomUUID?.()||'b-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 const fileName=v=>String(v||'파일').replace(/[\x00-\x1f/\\:*?"<>|]/g,'_').slice(0,180);
 const hydrate=async(record)=>{
  if(!record)return null;
  const r=structuredClone(record);
  for(const t of r.thumbnails||[]){if(t.blobId){if(!hydratedUrls.has(t.blobId)){const f=await read('files',t.blobId);if(f?.blob)hydratedUrls.set(t.blobId,URL.createObjectURL(f.blob));}t.url=hydratedUrls.get(t.blobId)||'';}
   const matches=(r.files||[]).filter(f=>f.id===t.originalFileId||(!t.originalFileId&&(f.originalName||f.name)===t.source));const original=matches.length===1?matches[0]:null;
   if(original&&(/^(image\/(png|jpeg|webp|gif))$/.test(original.type)||/\.(png|jpe?g|webp|gif)$/i.test(original.originalName||original.name))){if(!hydratedUrls.has(original.id)){const f=await read('files',original.id);if(f?.blob)hydratedUrls.set(original.id,URL.createObjectURL(f.blob));}t.originalUrl=hydratedUrls.get(original.id)||t.url;}
  }
  return r;
 };
 const safeThumb=async(t)=>{
  if(!t?.url)return null;
  if(/^(data:image\/(png|jpeg|webp|gif);|blob:)/.test(t.url)){const response=await fetch(t.url);const blob=await response.blob();if(blob.size>15*1024*1024)throw Error('썸네일이 너무 커요. 15MB 이하 이미지로 바꿔주세요.');return {meta:{label:String(t.label||'업로드 이미지'),source:String(t.source||'업로드 파일')},blob};}
  const url=new URL(t.url,location.href);if(url.origin!==location.origin)throw Error('외부 이미지는 파일로 첨부해 주세요.');return {meta:{url:url.pathname.slice(1),label:String(t.label||'미리보기'),source:String(t.source||'업로드 파일')}};
 };

 // Generated reference assets are a separate provenance from user originals.
 async function resolveFileBlob(record,file) {
  const saved=await read('files',file.id);
  if(saved?.blob)return saved.blob;
  if(record.id!=='calendar'||!record.designReference||file.provenance!=='generated-demo')return null;
  const url=new URL(file.url||'',location.href);
  const prefix=new URL('assets/director-demo/calendar/',location.href).pathname;
  if(url.origin!==location.origin||!url.pathname.startsWith(prefix)||url.username||url.password)throw Error('자료의 제공 경로를 확인하지 못했어요.');
  const response=await fetch(url.href,{credentials:'same-origin'});
  if(!response.ok)throw Error('작업 자료를 불러오지 못했어요. 다시 시도해 주세요.');
  const blob=await response.blob();
  if(blob.size!==file.size)throw Error('자료의 크기가 등록 정보와 달라요. 파일을 확인해 주세요.');
  if(file.sha256&&crypto.subtle){const bytes=await blob.arrayBuffer(),digest=await crypto.subtle.digest('SHA-256',bytes),actual=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');if(actual!==file.sha256)throw Error('자료가 등록된 파일과 달라요. 파일을 확인해 주세요.');}
  return blob;
 }

 let examples=[];
 const store={
  setExamples(records){examples=records;},
  async list(){const actual=await read('batons');return Promise.all([...actual.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),...examples].map(hydrate));},
  async get(key){return hydrate(await read('batons',key)||examples.find(r=>r.id===key));},
  async publish(data,files=[]){
   if(!String(data.title||'').trim())throw Error('바톤 제목을 입력해 주세요.');
   const originals=Array.from(files).filter(f=>f instanceof Blob);if(!originals.length)throw Error('이어받을 원본 파일을 한 개 이상 올려주세요.');
   if(originals.length>20||originals.some(f=>f.size>50*1024*1024)||originals.reduce((n,f)=>n+f.size,0)>100*1024*1024)throw Error('파일은 20개, 각 50MB, 합계 100MB까지 올릴 수 있어요.');
   const parent=data.parentId?await store.get(data.parentId):null;
   if(data.parentId&&!parent)throw Error('이전 바톤을 찾지 못했어요. 다시 선택해 주세요.');
   const key=id(), blobs=[]; const now=new Date().toISOString();
   const record={...structuredClone(data),id:key,title:String(data.title).trim().slice(0,120),summary:String(data.summary||'').slice(0,500),author:String(data.author||await store.setting('nickname')||'찬우').slice(0,40),createdAt:now,example:false,flowering:false,files:[],thumbnails:[],artifacts:(data.artifacts||[]).filter(x=>['seeding','planting','growing','blooming'].includes(x))};
   const categoryAliases={'그래픽 디자인':'그래픽','편집 디자인':'편집·출판','편집디자인':'편집·출판','일러스트레이션':'일러스트','제품 디자인':'제품·산업','산업 디자인':'제품·산업','브랜드 디자인':'브랜딩','3D 아트':'3D아트','UI/UX':'UI·UX'};record.category=(Array.isArray(record.category)?record.category:[]).map(v=>categoryAliases[v]||v);
   record.credits=[...new Set([...(parent?.credits||[]),...(parent?[parent.author]:[]),record.author].filter(Boolean))];
   delete record.stage;delete record.pct;delete record.percent;
   for(let i=0;i<originals.length;i++){const f=originals[i],fileId=key+'-file-'+i;const meta=data.files?.[i]||{};record.files.push({id:fileId,name:fileName(f.name||meta.name||'원본_'+(i+1)),originalName:String(f.name||meta.name||'원본_'+(i+1)),size:f.size,kind:meta.kind||'unclassified',type:f.type||'application/octet-stream'});blobs.push({id:fileId,batonId:key,blob:f});}
   record.artifacts=[...new Set([...record.artifacts,...record.files.map(f=>f.kind).filter(k=>['seeding','planting','growing','blooming'].includes(k))])];
   for(const [i,t] of (data.thumbnails||[]).slice(0,10).entries()){const thumb=await safeThumb(t);if(!thumb)continue;const sourceIndex=/^f\d+$/.test(t.sourceId||'')?Number(t.sourceId.slice(1)):-1;if(record.files[sourceIndex])thumb.meta.originalFileId=record.files[sourceIndex].id;if(thumb.blob){const blobId=key+'-thumb-'+i;blobs.push({id:blobId,batonId:key,blob:thumb.blob});record.thumbnails.push({...thumb.meta,blobId});}else record.thumbnails.push(thumb.meta);}
   const db=await open();await new Promise((resolve,reject)=>{const tx=db.transaction(['batons','files'],'readwrite');tx.objectStore('batons').add(record);for(const blob of blobs)tx.objectStore('files').add(blob);tx.oncomplete=resolve;tx.onerror=()=>reject(Error('바톤을 저장하지 못했어요. 저장 공간을 확인한 뒤 다시 시도해 주세요.'));tx.onabort=()=>reject(Error('바톤 저장이 취소됐어요. 원본 파일은 발행되지 않았어요.'));});
   // The transaction has committed. Reading preview blobs belongs to get/list;
   // a later read failure must never turn a successful publish into a retry.
   window.dispatchEvent(new CustomEvent('morogado:changed',{detail:{type:'published',id:key}}));return structuredClone(record);
  },
  async bookmarks(){return (await read('settings','bookmarks'))?.value||[];},
  async isBookmarked(key){return (await store.bookmarks()).includes(key);},
  toggleBookmark(key){const operation=bookmarkQueue.then(async()=>{const arr=await store.bookmarks();const on=!arr.includes(key);await write('settings',{id:'bookmarks',value:on?[...arr,key]:arr.filter(x=>x!==key)});window.dispatchEvent(new CustomEvent('morogado:changed',{detail:{type:'bookmark',id:key,on}}));return on;});bookmarkQueue=operation.catch(()=>{});return operation;},
  async setting(key,value){if(value===undefined)return (await read('settings',key))?.value;await write('settings',{id:key,value});return value;},
  async comments(key){return (await read('comments')).filter(c=>c.batonId===key&&c.type!=='idea').sort((a,b)=>a.createdAt.localeCompare(b.createdAt));},
  async ideas(key){return (await read('comments')).filter(c=>c.batonId===key&&c.type==='idea').sort((a,b)=>a.createdAt.localeCompare(b.createdAt));},
  async addIdea(key,title,text){if(!await store.get(key))throw Error('바톤을 찾지 못했어요.');const cleanTitle=String(title||'').trim(),cleanText=String(text||'').trim();if(!cleanTitle||!cleanText)throw Error('아이디어 제목과 내용을 입력해 주세요.');if(cleanTitle.length>120||cleanText.length>1000)throw Error('제목은 120자, 내용은 1,000자까지 적을 수 있어요.');const idea={id:id(),type:'idea',batonId:key,title:cleanTitle,text:cleanText,author:await store.setting('nickname')||'찬우',createdAt:new Date().toISOString(),isReference:false};await write('comments',idea);return idea;},
  async addComment(key,text,parentId=null){const record=await store.get(key);if(!record)throw Error('바톤을 찾지 못했어요.');const clean=String(text).trim();if(!clean)throw Error('내용을 입력해 주세요.');if(clean.length>1000)throw Error('댓글은 1,000자까지 적을 수 있어요.');if(parentId){const parent=await read('comments',parentId);const reference=record.designReference&&(record.referenceComments||[]).find(c=>c.id===parentId&&c.batonId===key);if((!parent&&!reference)||(parent&&(parent.batonId!==key||parent.type==='idea')))throw Error('답글을 남길 댓글을 찾지 못했어요.');}const c={id:id(),batonId:key,parentId,text:clean,author:await store.setting('nickname')||'찬우',createdAt:new Date().toISOString()};await write('comments',c);return c;},
  async deleteComment(key){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('comments','readwrite');tx.objectStore('comments').delete(key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});},
  async remove(key){const db=await open();const all=await read('batons');if(all.some(r=>r.parentId===key))throw Error('이어받은 바톤이 있어요. 계승 기록을 보존하기 위해 삭제할 수 없어요.');const files=await read('files'),comments=await read('comments');await new Promise((resolve,reject)=>{const t=db.transaction(['batons','files','comments'],'readwrite');t.objectStore('batons').delete(key);for(const f of files.filter(x=>x.batonId===key)){t.objectStore('files').delete(f.id);const url=hydratedUrls.get(f.id);if(url)URL.revokeObjectURL(url);hydratedUrls.delete(f.id);}for(const c of comments.filter(x=>x.batonId===key))t.objectStore('comments').delete(c.id);t.oncomplete=resolve;t.onerror=()=>reject(t.error);});window.dispatchEvent(new CustomEvent('morogado:changed',{detail:{type:'deleted',id:key}}));},
  async download(key,fileId){const record=await store.get(key);if(!record)throw Error('바톤을 찾지 못했어요.');
   if(fileId){const meta=record.files.find(f=>f.id===fileId);if(!meta)throw Error('파일을 찾지 못했어요.');const blob=await resolveFileBlob(record,meta);if(!blob)throw Error('원본 작업 파일은 첨부되지 않았어요. 미리보기 이미지는 자료 묶음으로 받을 수 있어요.');return saveBlob(blob,meta.name);}
   if(!window.JSZip)throw Error('다운로드 도구를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.');
   const zip=new JSZip();const folders={seeding:'01_방향',planting:'02_형태',growing:'03_마감',blooming:'04_발표',unclassified:'05_미분류'};
   const paths=new Set(),mapping=[];
   for(const file of record.files||[]){const blob=await resolveFileBlob(record,file);if(blob){const folder=folders[file.kind]||folders.unclassified;let name=file.name,n=1;while(paths.has(folder+'/'+name)){n++;const dot=file.name.lastIndexOf('.');name=dot>0?file.name.slice(0,dot)+'_'+n+file.name.slice(dot):file.name+'_'+n;}const path=folder+'/'+name;paths.add(path);zip.file(path,blob);mapping.push({id:file.id,originalName:file.originalName||file.name,path,bytes:blob.size,provenance:file.provenance||'uploader-original',sha256:file.sha256||null});}}
   zip.file('files-manifest.json',JSON.stringify(mapping,null,2));
   const handoff={title:record.title,summary:record.summary,author:record.author,credits:record.credits,artifacts:record.artifacts,category:record.category,tools:record.tools,note:record.note,noteText:record.noteText,noteLegacy:record.noteLegacy,storyChecks:record.storyChecks,nextIdeas:record.nextIdeas,productionState:record.productionState,productionInfo:record.productionInfo,referenceImages:record.referenceImages,fileFormats:record.fileFormats,fileChecks:record.fileChecks,printDetails:record.printDetails,sourceKinds:record.sourceKinds,references:record.references,fileLinks:record.fileLinks,provenance:record.provenance,designReference:record.designReference,license:record.license,materials:record.materials,lessons:record.lessons,physical:record.physical??null,dimensions:record.dimensions,palette:record.palette,fonts:(record.fonts||[]).map(font=>window.MorogadoFontCatalog?.supplement(font)||font),startDate:record.startDate,endDate:record.endDate,parentId:record.parentId,createdAt:record.createdAt};zip.file('baton-info.json',JSON.stringify(handoff,null,2));
   if(record.example){for(const [i,t] of record.thumbnails.entries()){const r=await fetch(t.url);if(!r.ok)throw Error('미리보기를 불러오지 못했어요.');zip.file('미리보기/'+(i+1)+'.'+(t.url.split('.').pop()||'png'),await r.blob());}}
   const generated=Boolean(record.designReference&&(record.files||[]).some(f=>f.provenance==='generated-demo'));
   zip.file('README.txt',[record.title,generated?'이번 구현을 위해 새로 생성한 시연 자료입니다. 피그마 작업자가 첨부한 원본 파일이 아닙니다. AI 확장자 파일은 PDF 호환 벡터 파일이며 Illustrator 네이티브 편집 정보와 원본 레이어는 포함하지 않습니다. 상업 인쇄 승인과 외부 사용 권리는 확정되지 않았습니다.':record.example?'피그마에서 제공된 미리보기만 포함해요. 편집 가능한 원본 작업 파일은 첨부되지 않았어요.':'업로더가 확인한 원본 파일이에요.',`작성자: ${record.author}`,`크레딧: ${(record.credits||[record.author]).join(', ')}`,`바톤 ID: ${record.id}`,`이전 바톤: ${record.parentId||'없음'}`,...(record.noteText?[`바톤 노트: ${record.noteText}`,`이어받을 아이디어: ${(record.nextIdeas||[]).filter(Boolean).join(' / ')||'미입력'}`]:[`의도: ${record.note?.intent||'미입력'}`,`한 일: ${record.note?.done||'미입력'}`,`남은 일: ${record.note?.remaining||'미입력'}`,`원하는 도움: ${record.note?.help||'미입력'}`]),'크레딧과 계승 관계를 함께 남겨 주세요. 권리 확인은 각 작업의 제공 조건을 따라야 해요.'].join('\n'));
   saveBlob(await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:3}}),fileName(record.title)+(generated?'_작업자료':record.example?'_미리보기':'_바톤')+'.zip');
  },
  async storageEstimate(){return navigator.storage?.estimate?await navigator.storage.estimate():null;}
 };
 function saveBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 window.MorogadoStore=store;
})();
