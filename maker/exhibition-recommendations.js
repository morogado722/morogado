/* Local extraction candidates for the exhibition. No AI requests, remote URL
 * reads, invented fonts, native editing claims, or Flowering assignment. */
(() => {
  'use strict';
  const CATEGORIES=['제품·산업','3D아트','브랜딩','그래픽','편집·출판','타이포·폰트','UI·UX','모션·영상','일러스트','패키지','공간·건축','기획'];
  const ALIASES={'그래픽 디자인':'그래픽','편집 디자인':'편집·출판','편집디자인':'편집·출판','일러스트레이션':'일러스트','제품 디자인':'제품·산업','산업 디자인':'제품·산업','브랜드 디자인':'브랜딩','3D 아트':'3D아트','UI/UX':'UI·UX'};
  const CATALOG=[['spoqahansansneo','Spoqa Han Sans Neo','https://spoqa.github.io/spoqa-han-sans/',['Thin (100)','Light (300)','Regular (400)','Medium (500)','Bold (700)']],['paperlogy','Paperlogy','https://freesentation.blog/paperlogyfont',['Thin','ExtraLight','Light','Regular','Medium','SemiBold','Bold','ExtraBold','Black']],['gmarketsans','Gmarket Sans','https://corp.gmarket.com/fonts/',['Light','Medium','Bold']],['nanummyeongjo','NanumMyeongjo','https://hangeul.naver.com/fonts/search?f=nanum',['Regular (400)','Bold (700)','ExtraBold (800)']]];
  const WEIGHTS=[['ExtraLight',200],['SemiBold',600],['ExtraBold',800],['Thin',100],['Light',300],['Regular',400],['Medium',500],['Bold',700],['Black',900]];
  const unique=values=>[...new Set(values.filter(Boolean))];
  const ARTIFACTS=['seeding','planting','growing','blooming'];
  const TOOL_CANDIDATES={ai:'Adobe Illustrator',psd:'Adobe Photoshop',fig:'Figma',sketch:'Sketch',blend:'Blender'};
  function defaultThumbnail(result){
    const thumbnails=result.thumbnails||[],sources=result.sources||[];
    for(const source of sources){const first=thumbnails.find(t=>t.sourceId===source.id&&Number(t.page)===1&&['page','slide'].includes(t.kind));if(first)return first.id;}
    return thumbnails.find(t=>Number(t.page)===1&&['page','slide'].includes(t.kind))?.id||thumbnails[0]?.id||null;
  }
  function completeDraftRecommendations(result){
    if(!result?.values||!Array.isArray(result.sources))return result;
    const prior=result.recommendations||{},values=result.values,categories=[...(prior.categories||[]),...(values.categories||[])],tools=[...(prior.tools||[]),...(values.tools||[]),...result.sources.map(source=>TOOL_CANDIDATES[source.ext]).filter(Boolean)],tags=[...(prior.tags||values.tags||[])],fileArtifacts={...(prior.fileArtifacts||{})},evidence=[];
    const add=(field,source,value,quote,basis)=>evidence.push({field,fileId:source.id,value,quote,basis,confidence:'low',location:'저장본 기본 규칙 추천'});
    for(const source of result.sources){
      const text=String(source.text||''),declaration=text.match(/(?:카테고리|categories|분류)\s*(?:[:：]|\t| {2,})\s*(.+?)(?=(?:사용\s*툴(?:\s*표기)?|진행\s*시기|규격|작업명)\s*(?:[:：]|\t| {2,})|[\r\n]|$)/i);
      if(declaration)for(const raw of declaration[1].split(/[,，·\t]/)){const value=raw.trim(),mapped=ALIASES[value]||value;if(CATEGORIES.includes(mapped)){categories.push(mapped);add('categories',source,mapped,declaration[0],'declared');}else if(value)tags.push(value);}
      const candidate=TOOL_CANDIDATES[source.ext];if(candidate){tools.push(candidate);add('tools',source,candidate,source.name,'extension');}
      for(const match of text.matchAll(/https?:\/\/(?:www\.)?figma\.com\/(?:design|file|proto)\/[^\s<>"']+/gi)){tools.push('Figma');add('tools',source,'Figma',match[0],'link');}
      let artifact=null;
      if(source.ext==='docx')artifact='seeding';
      else if(['ai','psd','fig','sketch','blend'].includes(source.ext))artifact='planting';
      else if(source.ext==='pdf'&&/인쇄|출력|print|press|칼선|dieline/i.test(source.name))artifact='growing';
      if(artifact&&!ARTIFACTS.includes(fileArtifacts[source.id])){fileArtifacts[source.id]=artifact;add('fileArtifacts',source,artifact,source.name,'extension');}
    }
    for(const link of result.links||[])if(/^https?:\/\/(?:www\.)?figma\.com\//i.test(link))tools.push('Figma');
    const mapped=unique(categories.map(c=>ALIASES[c]||c));
    result.recommendations={...prior,mode:'rules',externalAI:false,version:'exhibition-2',categories:mapped.filter(c=>CATEGORIES.includes(c)).slice(0,3),tools:unique(tools),tags:unique([...tags,...mapped.filter(c=>!CATEGORIES.includes(c))]),fileArtifacts,artifacts:unique([...(prior.artifacts||[]),...Object.values(fileArtifacts)]).filter(k=>ARTIFACTS.includes(k)),evidence:[...(prior.evidence||[]),...evidence]};
    return dedupeEvidence(result);
  }
  function filenameProject(name){
    let title=String(name||'').replace(/\.[^.]+$/,'');
    const suffix=/[_\s-]+(?:ai|pdf|docx|psd|png|jpe?g|인쇄용|출력용|인쇄|출력|기획서|디자인원본|print|export|source|v\d+(?:\.\d+)*)$/i;
    for(let next=title.replace(suffix,'');next!==title;next=title.replace(suffix,''))title=next;
    return title.replace(/[_\s]+/g,' ').trim().slice(0,120);
  }
  function fontDetails(font){
    const originalName=String(font.originalName||font.name||'').replace(/^[A-Z]{6}\+/,'').trim();
    const compact=originalName.toLowerCase().replace(/[^a-z0-9]/g,'');
    if(!originalName||/^(?:helvetica|courier|timesroman|times)(?:bold|italic|oblique|boldoblique|bolditalic)?$/.test(compact)||['serif','sansserif','monospace','inherit','systemui','symbol','zapfdingbats'].includes(compact))return null;
    const known=CATALOG.find(([prefix])=>compact.startsWith(prefix)&&(prefix!=='nanummyeongjo'||['nanummyeongjo','nanummyeongjoregular','nanummyeongjobold','nanummyeongjoextrabold'].includes(compact)));
    const style=WEIGHTS.find(([label])=>compact.includes(label.toLowerCase()));
    return {...font,originalName,name:known?known[1]:font.name,weights:font.weights||(style?`${style[0]} (${style[1]})`:''),downloadUrl:known?known[2]:font.downloadUrl||'',downloadUrlKnown:!!known,catalogWeights:known?[...known[3]]:[],catalogSourceURL:known?known[2]:'',embedded:font.embedded??null,used:font.used??null,weightBasis:font.weightBasis||(style?'폰트 이름의 굵기 선언':'굵기 미확인')};
  }
  function colorFeatures(hex){
    const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(...rgb),min=Math.min(...rgb),delta=max-min;
    let h=delta===0?0:max===rgb[0]?((rgb[1]-rgb[2])/delta)%6:max===rgb[1]?(rgb[2]-rgb[0])/delta+2:(rgb[0]-rgb[1])/delta+4;
    h=((h/6)%1+1)%1;const s=max===0?0:delta/max,l=(max+min)/2;
    const family=min>=.96&&delta<.06?'white':s<.1?'neutral':h>=.10&&h<=.22&&s>=.25?'yellow':(h>=.72&&h<=.96)||(h>=.94&&max<.65)?'purple':h>=.025&&h<=.22&&s<.22&&max>.78?'cream':h>=.025&&h<=.12&&l>.72&&s>=.22&&s<.5?'apricot':h>=.94||h<.06?'red':'other';
    return {rgb,family};
  }
  function palette(colors,limit=5){
    const valid=unique((colors||[]).filter(h=>/^#[0-9a-f]{6}$/i.test(h)).map(h=>h.toUpperCase())),info=new Map(valid.map(h=>[h,colorFeatures(h)]));
    const rank=hex=>info.get(hex).family==='white'?2:info.get(hex).family==='neutral'?1:0;
    const ranked=[...valid].sort((a,b)=>rank(a)-rank(b)),chosen=[];
    const similar=(a,b)=>{const aa=info.get(a),bb=info.get(b),distance=Math.hypot(...aa.rgb.map((n,i)=>n-bb.rgb[i]));return aa.family==='yellow'&&bb.family==='yellow'||distance<.16||aa.family===bb.family&&['cream','apricot'].includes(aa.family)&&distance<.25;};
    for(const family of ['yellow','purple','red','apricot','cream']){const candidate=ranked.find(h=>info.get(h).family===family&&!chosen.some(p=>similar(h,p)));if(candidate)chosen.push(candidate);if(chosen.length===limit)return chosen;}
    for(const hex of ranked){if(!chosen.some(p=>similar(hex,p)))chosen.push(hex);if(chosen.length===limit)break;}
    return chosen;
  }
  function unknownChecks(source,result){
    const checks={...source.checks},basis={editable:'원본 편집 앱에서 수정하는 검사는 하지 않았어요.',artboards:'네이티브 아트보드 구조는 확인하지 않았어요. PDF 페이지 수와 구분해요.',links:'외부 연결 파일의 존재·해결 상태는 확인하지 않았고 URL을 조회하지 않았어요.'};
    for(const key of Object.keys(basis))if(!checks[key])checks[key]={status:'unknown',value:null,confidence:'unknown',basis:basis[key]};
    if(!checks.readable){const read=!!source.text||result.thumbnails?.some(t=>t.sourceId===source.id);checks.readable={status:read?'confirmed':'unknown',value:read?true:null,confidence:read?'high':'unknown',basis:read?'본문 또는 실제 미리보기 일부를 확인했어요.':'브라우저에서는 이 파일의 본문을 확인하지 않았어요.'};}
    source.checks=checks;
  }
  function dedupeEvidence(result){
    const key=item=>JSON.stringify([item.field||'',item.fileId||item.sourceId||'',String(item.quote||'').replace(/\s+/g,' ').trim()]);
    const seen=new Map(),base=[],recommendations=[];
    function merge(target,item){
      const locations=unique([...(target.locations||[target.location]),...(item.locations||[item.location])]);
      const values=unique([...(target.values||[target.value]),...(item.values||[item.value])]);
      if(target.value==null&&item.value!=null)target.value=item.value;
      if(target.confidence==null&&item.confidence!=null)target.confidence=item.confidence;
      if(locations.length){target.locations=locations;target.location=locations.slice(0,6).join(' · ');}
      if(values.length)target.values=values;
    }
    for(const item of result.evidence||[]){const id=key(item);if(seen.has(id))merge(seen.get(id),item);else{const copy={...item};seen.set(id,copy);base.push(copy);}}
    for(const item of result.recommendations?.evidence||[]){const id=key(item);if(seen.has(id))merge(seen.get(id),item);else{const copy={...item};seen.set(id,copy);recommendations.push(copy);}}
    result.evidence=base;
    if(result.recommendations)result.recommendations.evidence=recommendations;
    return result;
  }
  function apply(result){
    if(!result?.values||!Array.isArray(result.sources))return result;
    const values=result.values,evidence=[],fileArtifacts={};
    result.sources.forEach(source=>unknownChecks(source,result));
    result.fonts=(result.fonts||[]).map(fontDetails).filter(Boolean);
    if(result.recommendations?.mode==='rules')return dedupeEvidence(result);
    const add=(field,source,value,quote,basis='rule')=>{const item={field,fileId:source?.id||null,value,quote,basis,confidence:'low',location:'브라우저 기본 규칙 추천'};evidence.push(item);if(source)(result.evidence||=[]).push(item);};
    const counts=new Map();result.sources.filter(s=>!s.parentId).forEach(s=>{const name=filenameProject(s.name);if(name)counts.set(name,(counts.get(name)||0)+1);});
    const common=[...counts].sort((a,b)=>b[1]-a[1]).find(([,n])=>n>=2)?.[0];
    if(common&&!(result.evidence||[]).some(e=>e.field==='title'&&e.basis==='declared')){values.title=common;result.sources.filter(s=>filenameProject(s.name)===common).forEach(s=>add('title',s,common,s.name,'filename'));}
    const mapped=unique((values.categories||[]).map(c=>ALIASES[c]||c)),categories=mapped.filter(c=>CATEGORIES.includes(c)).slice(0,3),tags=unique([...(values.tags||[]),...mapped.filter(c=>!CATEGORIES.includes(c))]);
    values.categories=categories;values.tags=tags;
    for(const source of result.sources){
      let key=null,basis='';
      if(source.ext==='docx'){source.kind='기획서';key='seeding';basis='DOCX 형식에 따른 기획서·방향 산출물 후보';}
      else if(['ai','psd','fig','sketch','blend'].includes(source.ext)){key='planting';basis='원본 형식에 따른 형태 산출물 후보 · 편집 가능 여부 미확인';}
      else if(source.ext==='pdf'&&/인쇄|출력|print|press|칼선|dieline/i.test(source.name)){source.kind=/칼선|dieline/i.test(source.name)?'인쇄용 칼선 파일':'인쇄용 출력 파일';key='growing';basis='파일명에 인쇄·출력 목적이 표시된 마감 산출물 후보 · 인쇄 승인 미확인';}
      if(key){fileArtifacts[source.id]=key;source.kindBasis=basis+' · 직접 수정 가능';source.artifactRecommendation={key,status:'candidate',basis,confidence:'low'};add('sourceKind',source,source.kind,source.name,source.ext==='pdf'?'filename':'extension');add('fileArtifacts',source,key,source.name,source.ext==='pdf'?'filename':'extension');}
    }
    const toolDetails=unique(values.tools||[]).map(value=>({value,status:'candidate',actualUsageVerified:false,sourceIds:[],basis:'파일 형식·선언·자료 URL에 따른 추천 · 실제 제작 툴 확인 필요'}));
    result.recommendations={mode:'rules',externalAI:false,version:'exhibition-2',title:values.title,fileArtifacts,artifacts:unique(Object.values(fileArtifacts)),palette:palette(result.colors),categories,tools:unique(values.tools||[]),tags,toolDetails,evidence,paletteBasis:'브라우저에서 실제로 확인한 RGB 중 유사색을 묶은 후보 · 인쇄 잉크값 아님'};
    result.analysisProvenance={mode:'rules',externalAI:false,description:'브라우저 기본 추출·파일명·형식 규칙 추천. PDF/DOCX 본문·네이티브 편집 정보는 서버 없이 확인하지 않음.'};
    return dedupeEvidence(result);
  }
  window.MorogadoExhibitionRecommendations=Object.freeze({apply,filenameProject,palette,fontDetails,defaultThumbnail,completeDraftRecommendations});
})();
