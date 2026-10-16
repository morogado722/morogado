/* Calendar-only preview fixtures for the relay rail.
 * These records never publish files or write user storage. Images are reused
 * unchanged from the three existing calendar previews. All new authors and
 * parent links are demonstration data, not actual user activity.
 */
(() => {
  'use strict';
  const FIXTURE_KEY='calendar-relay-preview-v1';
  const SOURCE_NODE='3423:6036';
  const variations=[
    {fruit:0,title:'참외 달력 · 초여름',name:'초록 러너',theme:'초여름의 밝은 색'},
    {fruit:1,title:'자두 달력 · 한여름',name:'달빛 러너',theme:'한여름의 붉은 색'},
    {fruit:2,title:'복숭아 달력 · 늦여름',name:'잎새 러너',theme:'늦여름의 부드러운 색'},
    {fruit:0,title:'참외 달력 · 노란 리듬',name:'햇살 러너',theme:'노란색과 날짜의 리듬'},
    {fruit:1,title:'자두 달력 · 붉은 포인트',name:'나무 러너',theme:'붉은색을 강조하는 구성'},
    {fruit:2,title:'복숭아 달력 · 분홍 여백',name:'온유 러너',theme:'분홍색과 넉넉한 여백'},
    {fruit:0,title:'참외 달력 · 계절 모음',name:'바람 러너',theme:'계절별 달력을 모아 보는 구성'},
    {fruit:1,title:'자두 달력 · 제철 기록',name:'새봄 러너',theme:'과일의 제철을 기록하는 구성'},
    {fruit:2,title:'복숭아 달력 · 여름 엽서',name:'구름 러너',theme:'여름의 느낌을 담는 엽서 구성'},
    {fruit:0,title:'참외 달력 · 밝은 철',name:'이슬 러너',theme:'밝은 노란색으로 살펴보는 계절'},
    {fruit:1,title:'자두 달력 · 깊은 색',name:'물결 러너',theme:'짙은 붉은색으로 살펴보는 계절'},
    {fruit:2,title:'복숭아 달력 · 부드러운 색',name:'소담 러너',theme:'부드러운 색으로 살펴보는 계절'},
    {fruit:0,title:'과일 달력 · 다시 여름',name:'다온 러너',theme:'다른 과일과 다음 여름으로 이어가는 구성'}
  ];
  const imageNames=['imgImage770','imgImage765','imgImage766'];
  const fruitNames=['참외','자두','복숭아'];
  const owns=record=>record?.example===true&&record.provenance?.fixtureKey===FIXTURE_KEY;
  const nameOf=value=>typeof value==='object'&&value?String(value.name||value.displayName||''):String(value||'');
  const cleanNames=values=>[...new Set((Array.isArray(values)?values:[]).map(nameOf).filter(Boolean))];

  function apply(examples,asset) {
    if(!Array.isArray(examples))return {added:0,totalSampleNodes:0,reason:'examples-required'};
    const calendar=examples.find(r=>String(r.id)==='calendar');
    const red=examples.find(r=>String(r.id)==='calendar-red');
    const peach=examples.find(r=>String(r.id)==='calendar-peach');
    if(!calendar||!red||!peach)return {added:0,totalSampleNodes:0,reason:'existing-calendar-records-required'};
    // The module never repairs or rewrites the three existing parent links.
    if(String(red.parentId)!=='calendar'||String(peach.parentId)!=='calendar-red')return {added:0,totalSampleNodes:0,reason:'existing-calendar-chain-required'};
    const previews=imageNames.map((imageName,index)=>{
      const original=calendar.thumbnails?.[index];
      const photo=typeof original==='string'?{url:original}:original||{};
      const fallback=typeof asset==='function'?asset('3543-29246',imageName):'';
      const originalFallback=typeof asset==='function'?asset('3543-29246',imageName,true):'';
      const url=photo.url||fallback;
      return {url,originalUrl:photo.originalUrl||originalFallback||url,label:fruitNames[index]+' 달력',source:fruitNames[index]+' 달력'};
    });
    if(previews.some(photo=>!photo.url))return {added:0,totalSampleNodes:0,reason:'three-existing-previews-required'};
    const ids=variations.map((_,index)=>'calendar-relay-sample-'+String(index+4).padStart(2,'0'));
    if(examples.some(record=>ids.includes(String(record.id))&&!owns(record)))return {added:0,totalSampleNodes:0,reason:'sample-id-collision'};

    let parentId='calendar-peach';
    let previousCredits=cleanNames(peach.credits?.length?peach.credits:calendar.credits);
    const records=variations.map((variation,index)=>{
      const number=index+4,id=ids[index],fruit=fruitNames[variation.fruit];
      const author=variation.name;
      const credits=cleanNames([...previousCredits,variation.name]);
      const record={
        id,title:variation.title,
        summary:`${fruit} 달력의 원본 이미지를 바탕으로 ${variation.theme}을 살펴보는 달력이에요.`,
        author,credits,
        authorMessage:'달력을 이어갈 아이디어나 궁금한 점을 댓글로 남겨주세요.',
        category:['편집·출판','일러스트','굿즈'],
        displayCategories:['편집 디자인','일러스트레이션','굿즈'],
        tags:['과일','달력','여름'],tools:[],artifacts:[],
        thumbnails:[{...previews[variation.fruit]}],files:[],fileLinks:[],references:[],
        note:{
          intent:`${fruit} 달력의 색과 계절을 출발점으로 ${variation.theme}을 생각해 보는 방향이에요.`,
          done:'',
          remaining:'새롭게 편집한 원본 작업 파일은 첨부되지 않았어요.',
          help:'다른 과일이나 계절을 소재로 달력을 이어가볼 수 있어요.'
        },
        parentId,createdAt:'',example:true,previewOnly:true,flowering:false,
        demoRelay:true,logOnly:true,excludeFromHome:true,scope:'calendar-relay-log',
        provenance:{
          type:'calendar-relay-preview-sample',fixtureKey:FIXTURE_KEY,sampleIndex:number,
          sourceNode:SOURCE_NODE,sourceImageNode:'3543:29246',sourceImageConstant:imageNames[variation.fruit],
          generatedDemo:true,actualUserActivity:false,originalFilesAttached:false,imageEdited:false,
          parentLinkPurpose:'demonstration',authorPurpose:'demonstration',authorType:'demonstration-runner',authorActualUser:false,
          description:'사용자가 허용한 로그 탐색용 달력 변형 샘플입니다. 기존 이미지의 바이트를 재사용하며 실제 업로드·사용자 활동·작업 산출물·반응 수치를 생성하지 않습니다.'
        }
      };
      parentId=id;previousCredits=credits;
      return record;
    });
    // Repeated application replaces only this module's static examples.
    // User records, other examples, and the existing three records keep identity.
    for(let i=examples.length-1;i>=0;i--)if(owns(examples[i]))examples.splice(i,1);
    examples.push(...records);
    return {added:records.length,totalSampleNodes:3+records.length,firstAddedId:ids[0],lastAddedId:ids.at(-1),sourceNode:SOURCE_NODE,scope:'calendar-relay-log'};
  }
  window.MorogadoCalendarRelaySamples={apply};
})();
