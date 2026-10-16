(() => {
  'use strict';
  const entrancesSeen = new Set();
  const icons = {
    left:'<path d="m15 5-7 7 7 7"/>', right:'<path d="m9 5 7 7-7 7"/>', up:'<path d="m5 15 7-7 7 7"/>', down:'<path d="m5 9 7 7 7-7"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>', fit:'<path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5"/>', reset:'<path d="M4 9V4m0 0h5M4 4l4 4a7 7 0 1 1-1 9"/>'
  };
  const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.right}</svg>`;
  const nameOf = value => typeof value === 'object' && value ? value.name || value.displayName || '러너' : value || '러너';
  const dateOf = value => { const date = new Date(value); return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}) : ''; };
  const firstImage = record => {
    const image=record.thumbnails?.[0];const url=typeof image==='string'?image:image?.url;
    return /^(?:https?:\/\/|blob:|data:image\/(?:png|jpeg|jpg|webp|gif|avif|svg\+xml);|\.?\.?\/|assets\/)/i.test(url||'')?url:'';
  };
  function geometry(records, currentId) {
    const byId=new Map(records.map(record=>[String(record.id),record]));
    const children=new Map();
    for(const record of records){const parent=String(record.parentId||'');if(parent&&byId.has(parent)&&parent!==String(record.id)){if(!children.has(parent))children.set(parent,[]);children.get(parent).push(record)}}
    for(const list of children.values())list.sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||''))||String(a.id).localeCompare(String(b.id)));
    let root=byId.get(String(currentId));const ancestry=new Set();
    while(root?.parentId&&byId.has(String(root.parentId))&&!ancestry.has(String(root.parentId))){ancestry.add(String(root.id));root=byId.get(String(root.parentId))}
    if(!root)return {nodes:[],edges:[],children,byId,width:0,height:0};
    const positions=new Map();const visited=new Set();let row=0;
    function place(record,depth){
      const id=String(record.id);if(visited.has(id))return null;visited.add(id);
      const descendants=(children.get(id)||[]).filter(child=>!visited.has(String(child.id)));
      const ys=descendants.map(child=>place(child,depth+1)).filter(value=>value!==null);
      const y=ys.length?ys.reduce((sum,value)=>sum+value,0)/ys.length:row++*190+105;
      positions.set(id,{x:depth*210+50,y,depth,record});return y;
    }
    place(root,0);
    const nodes=Array.from(positions.values()).sort((a,b)=>a.depth-b.depth||a.y-b.y);
    const edges=nodes.filter(node=>node.record.parentId&&positions.has(String(node.record.parentId))&&positions.get(String(node.record.parentId)).depth<node.depth).map(node=>({from:positions.get(String(node.record.parentId)),to:node}));
    return {nodes,edges,children,byId,positions,width:Math.max(...nodes.map(n=>n.x))+240,height:Math.max(...nodes.map(n=>n.y))+200};
  }
  // Attachment points are the visible button border boxes, not the 160px wrappers.
  function connectorPath(fx,fy,tx,ty) {
    if(Math.abs(ty-fy)<.001)return `M ${fx} ${fy} H ${tx}`;
    const mx=(fx+tx)/2,sx=Math.sign(tx-fx)||1,sy=Math.sign(ty-fy);
    const radius=Math.min(10,Math.abs(ty-fy)/2,Math.abs(tx-fx)/4);
    return `M ${fx} ${fy} H ${mx-radius*sx} Q ${mx} ${fy} ${mx} ${fy+radius*sy} V ${ty-radius*sy} Q ${mx} ${ty} ${mx+radius*sx} ${ty} H ${tx}`;
  }
  async function mountMap(container,record,options={}) {
    const M=window.Morogado;const e=M.escape;
    const controller=new AbortController();const signal=controller.signal;
    const cleanupCallbacks=[];
    let records;
    try{records=await M.store.list()}catch{container.innerHTML='<p class="log-error">바톤 로그를 불러오지 못했어요. 페이지를 다시 열어 주세요.</p>';return()=>controller.abort()}
    if(!Array.isArray(records))records=[];
    if(!records.some(r=>String(r.id)===String(record.id)))records.push(record);
    const graph=geometry(records,record.id);
    let selectedId=String(record.id);
    let camera={x:0,y:0,z:1};
    let drag=null;
    let suppressClickUntil=0;
    let revealTimer=null;
    let frame1=null,frame2=null;
    let showAll=false;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const thumbMarkup=rec=>firstImage(rec)?`<img src="${e(firstImage(rec))}" alt="" draggable="false">`:`<span class="log-node-placeholder" aria-hidden="true">${e(String(rec.title||'바톤').slice(0,1))}</span>`;
    const nodesMarkup=graph.nodes.map((node,index)=>{
      const id=String(node.record.id);const current=id===String(record.id);const side=current?152:84;
      return `<div class="log-node-wrap" style="left:${node.x}px;top:${node.y-76}px"><button class="log-node ${current?'is-current':''}" data-log-node="${e(id)}" aria-label="${e(node.record.title||'제목 없는 바톤')}, ${e(nameOf(node.record.author))}${current?', 지금 보고 있는 바톤':''}" aria-pressed="${current}" style="margin-top:${(152-side)/2}px;transition-delay:${graph.nodes.length>1?0:0}ms">${current?'<span class="log-current-tag">지금 보고 있는 바톤</span>':''}${thumbMarkup(node.record)}</button><p class="log-node-title" style="transition-delay:${graph.nodes.length>1?0:0}ms">${e(node.record.title||'제목 없는 바톤')}</p>${node.record.flowering?'<span class="log-node-current">이 갈래의 완성작</span>':''}</div>`;
    }).join('');
    const edgesMarkup=graph.edges.map(({from,to})=>{
      const fromSize=String(from.record.id)===String(record.id)?152:84;
      const toSize=String(to.record.id)===String(record.id)?152:84;
      const fx=from.x+80+fromSize/2,fy=from.y,tx=to.x+80-toSize/2,ty=to.y;
      return `<path data-from="${e(from.record.id)}" data-to="${e(to.record.id)}" d="${connectorPath(fx,fy,tx,ty)}"/>`;
    }).join('');
    container.innerHTML=`<div class="relay-log ${options.embedded?'log-embedded':''}"><div class="log-canvas" tabindex="0" role="group" aria-label="바톤 계승 지도. 방향키로 바톤 선택, 더하기와 빼기 키로 확대와 축소할 수 있어요."><div class="log-world" style="width:${graph.width}px;height:${graph.height}px"><svg class="log-edges" width="${graph.width}" height="${graph.height}" aria-hidden="true">${edgesMarkup}</svg>${nodesMarkup}</div>${graph.nodes.length===1?'<p class="log-empty-hint">아직 다음 바톤이 없어요.<br>이 작업의 다음 러너가 되어보세요.</p>':''}</div><div class="log-controls"><div class="log-control-group"><button class="log-control log-control-icon" data-log-action="zoom-out" aria-label="로그 축소">${svg('minus')}</button><span class="log-zoom-label" aria-live="polite">100%</span><button class="log-control log-control-icon" data-log-action="zoom-in" aria-label="로그 확대">${svg('plus')}</button><button class="log-control" data-log-action="fit">${svg('fit')}전체 보기</button><button class="log-control" data-log-action="reset">${svg('reset')}현재 바톤</button></div></div><div class="log-bottom"><div class="log-selection" aria-live="polite"></div><div class="log-relations"><h3>이어달리기 탐색</h3><div class="log-relation-controls"><button class="log-control" data-log-action="parent">${svg('up')}이전 바톤</button><button class="log-control" data-log-action="child">${svg('down')}다음 계승</button><button class="log-control" data-log-action="previous">${svg('left')}옆 바톤</button><button class="log-control" data-log-action="next">${svg('right')}옆 바톤</button></div></div></div><div class="log-status" role="status"></div><details class="log-list-details"><summary>계승 기록을 목록으로 보기 (${graph.nodes.length}개)</summary><ol class="log-accessible-list">${graph.nodes.map(node=>`<li><button data-log-list="${e(node.record.id)}" aria-pressed="${String(node.record.id)===selectedId}" ${String(node.record.id)===String(record.id)?'aria-current="page"':''}><strong>${e(node.record.title)}</strong><small>${e(nameOf(node.record.author))}${dateOf(node.record.createdAt)?' · '+e(dateOf(node.record.createdAt)):''}${node.record.parentId&&graph.byId.has(String(node.record.parentId))?`<br>${e(graph.byId.get(String(node.record.parentId)).title)}에서 이어받음`:''}</small></button></li>`).join('')}</ol></details></div>`;
    const root=container.querySelector('.relay-log');const canvas=root.querySelector('.log-canvas');const world=root.querySelector('.log-world');
    function listen(node,type,fn,opts={}){node?.addEventListener(type,fn,{...opts,signal})}
    function updateCamera(instant=false){canvas.classList.toggle('is-dragging',instant||!!drag);world.style.transform=`translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`;root.querySelector('.log-zoom-label').textContent=`${Math.round(camera.z*100)}%`;root.querySelector('[data-log-action=zoom-out]').disabled=camera.z<=.4;root.querySelector('[data-log-action=zoom-in]').disabled=camera.z>=3;}
    function focusNode(id,instant=false){const node=graph.positions.get(String(id));if(!node)return;const width=canvas.clientWidth;const height=canvas.clientHeight;camera.x=(graph.nodes.length===1?Math.min(width*.38,240):width*.35)-(node.x+80)*camera.z;camera.y=height*.48-node.y*camera.z;showAll=false;updateCamera(instant)}
    function interruptEntrance(){if(revealTimer!==null){clearTimeout(revealTimer);revealTimer=null}if(frame1!==null){cancelAnimationFrame(frame1);frame1=null}if(frame2!==null){cancelAnimationFrame(frame2);frame2=null}canvas.classList.remove('is-entering','is-ready');root.querySelectorAll('.log-node,.log-node-title,.log-node-current').forEach(node=>node.style.transitionDelay='0ms');}
    function choose(id,{move=true,keyboard=false}={}){
      id=String(id);if(!graph.positions.has(id))return;interruptEntrance();selectedId=id;
      const rec=graph.byId.get(id);const parent=graph.byId.get(String(rec.parentId||''));const children=graph.children.get(id)||[];
      const note=typeof rec.note==='string'?{done:rec.note}:rec.note||{};
      const relation=parent?`${parent.title}에서 이어받음${children.length?` · 여기서 ${children.length}갈래`:''}`:children.length?`이 갈래의 시작 · 여기서 ${children.length}갈래`:'이 갈래의 시작';
      const special=id===String(record.id)?'지금 보고 있는 바톤':rec.flowering?'이 갈래의 완성작 · 개별 구매':'';
      const artifact=M.artifactMarkup?M.artifactMarkup(rec.artifacts||[]):'';
      root.querySelector('.log-selection').innerHTML=`<div class="log-selection-thumbnail">${thumbMarkup(rec)}</div><div><h3>${e(rec.title||'제목 없는 바톤')}</h3><p class="log-selection-meta">by. ${e(nameOf(rec.author))}${dateOf(rec.createdAt)?' · '+e(dateOf(rec.createdAt)):''}${special?`<br>${e(special)}`:''}</p><p class="log-selection-work">${e(note.done||note.intent||rec.summary||'이어달린 작업의 노트가 아직 없어요.')}</p><p class="log-selection-relation">${e(relation)}</p>${artifact}<div class="log-selection-actions"><button class="log-open-detail" data-log-action="detail">이 바톤 자세히 보기</button>${children.length?`<button class="log-control" data-log-action="child">다음 계승 ${children.length}개 ${svg('down')}</button>`:''}</div></div>`;
      root.querySelectorAll('[data-log-node]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.logNode===id)));
      root.querySelectorAll('[data-log-list]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.logList===id)));
      root.querySelector('[data-log-action=parent]').disabled=!parent;
      root.querySelectorAll('[data-log-action=child]').forEach(button=>button.disabled=!children.length);
      const index=graph.nodes.findIndex(node=>String(node.record.id)===id);
      root.querySelector('[data-log-action=previous]').disabled=index<=0;
      root.querySelector('[data-log-action=next]').disabled=index>=graph.nodes.length-1;
      if(move)focusNode(id,keyboard||reduced.matches);
    }
    function relationAction(action,keyboard=false){
      const rec=graph.byId.get(selectedId);const children=graph.children.get(selectedId)||[];const index=graph.nodes.findIndex(node=>String(node.record.id)===selectedId);
      if(action==='parent'&&graph.positions.has(String(rec.parentId)))choose(rec.parentId,{keyboard});
      else if(action==='child'&&children[0])choose(children[0].id,{keyboard});
      else if(action==='previous'&&index>0)choose(graph.nodes[index-1].record.id,{keyboard});
      else if(action==='next'&&index<graph.nodes.length-1)choose(graph.nodes[index+1].record.id,{keyboard});
    }
    function zoom(multiplier,point={x:canvas.clientWidth/2,y:canvas.clientHeight/2},instant=false){interruptEntrance();const before=camera.z;camera.z=Math.max(.4,Math.min(3,camera.z*multiplier));const ratio=camera.z/before;camera.x=point.x-(point.x-camera.x)*ratio;camera.y=point.y-(point.y-camera.y)*ratio;updateCamera(instant||reduced.matches)}
    function fit(instant=false){interruptEntrance();const availableWidth=Math.max(100,canvas.clientWidth-80),availableHeight=Math.max(100,canvas.clientHeight-60);camera.z=Math.min(1.3,Math.max(.4,Math.min(availableWidth/graph.width,availableHeight/graph.height)));camera.x=(canvas.clientWidth-graph.width*camera.z)/2;camera.y=(canvas.clientHeight-graph.height*camera.z)/2;showAll=true;updateCamera(instant||reduced.matches)}
    choose(selectedId,{move:false});focusNode(selectedId,true);
    // First entry reveals the connected space together in 300ms; input reveals it immediately.
    if(graph.nodes.length>1&&!reduced.matches&&!entrancesSeen.has(String(record.id))){
      entrancesSeen.add(String(record.id));
      root.querySelectorAll('.log-node-wrap').forEach((wrap,index)=>wrap.querySelectorAll('.log-node,.log-node-title,.log-node-current').forEach(node=>node.style.transitionDelay=`${0}ms`));
      canvas.classList.add('is-entering');
      frame1=requestAnimationFrame(()=>{frame1=null;frame2=requestAnimationFrame(()=>{frame2=null;if(!signal.aborted){canvas.classList.add('is-ready');revealTimer=setTimeout(interruptEntrance,350)}})});
    }
    listen(root,'click',ev=>{
      if(performance.now()<suppressClickUntil){ev.preventDefault();return}
      const keyboard=ev.detail===0;
      const node=ev.target.closest('[data-log-node],[data-log-list]');if(node){choose(node.dataset.logNode||node.dataset.logList,{keyboard});return}
      const button=ev.target.closest('[data-log-action]');if(!button||button.disabled)return;const action=button.dataset.logAction;
      if(action==='zoom-in')zoom(1.2,undefined,keyboard);
      else if(action==='zoom-out')zoom(1/1.2,undefined,keyboard);
      else if(action==='fit')fit(keyboard);
      else if(action==='reset'){camera.z=1;choose(record.id,{keyboard})}
      else if(action==='detail')M.navigate(`/baton/${encodeURIComponent(selectedId)}`);
      else relationAction(action,keyboard);
    });
    listen(canvas,'keydown',ev=>{
      const map={ArrowLeft:'previous',ArrowRight:'next',ArrowUp:'parent',ArrowDown:'child'};
      if(map[ev.key]){ev.preventDefault();relationAction(map[ev.key],true)}
      else if(ev.key==='+'||ev.key==='='){ev.preventDefault();zoom(1.2,undefined,true)}
      else if(ev.key==='-'){ev.preventDefault();zoom(1/1.2,undefined,true)}
      else if(ev.key==='Home'){ev.preventDefault();camera.z=1;choose(record.id,{keyboard:true})}
      else if(ev.key==='Escape'){interruptEntrance();drag=null;canvas.classList.remove('is-dragging')}
    });
    listen(canvas,'focusin',()=>interruptEntrance());
    const pointers=new Map();let pinch=null;
    listen(canvas,'pointerdown',ev=>{
      interruptEntrance();
      if(ev.button!==0)return;
      if(ev.target.closest('button')&&pointers.size===0)return;
      pointers.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
      if(pointers.size===2){const p=Array.from(pointers.values());pinch={distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),zoom:camera.z};drag=null;canvas.setPointerCapture(ev.pointerId);return}
      if(ev.target.closest('button'))return;
      drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY,cx:camera.x,cy:camera.y,moved:false};canvas.setPointerCapture(ev.pointerId);canvas.classList.add('is-dragging');
    });
    listen(canvas,'pointermove',ev=>{
      if(pointers.has(ev.pointerId))pointers.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
      if(pinch&&pointers.size===2){const p=Array.from(pointers.values());const distance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);const rect=canvas.getBoundingClientRect();const target=Math.max(.4,Math.min(3,pinch.zoom*distance/Math.max(1,pinch.distance)));zoom(target/camera.z,{x:(p[0].x+p[1].x)/2-rect.left,y:(p[0].y+p[1].y)/2-rect.top},true);return}
      if(!drag||drag.id!==ev.pointerId)return;const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;if(Math.hypot(dx,dy)>4)drag.moved=true;camera.x=drag.cx+dx;camera.y=drag.cy+dy;updateCamera(true);
    });
    const endPointer=ev=>{pointers.delete(ev.pointerId);if(pointers.size<2)pinch=null;if(drag?.id===ev.pointerId){if(drag.moved)suppressClickUntil=performance.now()+180;drag=null;canvas.classList.remove('is-dragging');if(canvas.hasPointerCapture(ev.pointerId))canvas.releasePointerCapture(ev.pointerId)}};
    listen(canvas,'pointerup',endPointer);listen(canvas,'pointercancel',endPointer);listen(canvas,'lostpointercapture',endPointer);
    listen(canvas,'wheel',ev=>{
      if(ev.ctrlKey||ev.metaKey){ev.preventDefault();const rect=canvas.getBoundingClientRect();zoom(Math.exp(-ev.deltaY*.008),{x:ev.clientX-rect.left,y:ev.clientY-rect.top},true)}
      else if(Math.abs(ev.deltaX)>Math.abs(ev.deltaY)||ev.shiftKey){ev.preventDefault();interruptEntrance();camera.x-=ev.deltaX||ev.deltaY;updateCamera(true)}
    },{passive:false});
    const motionChange=()=>{if(reduced.matches)interruptEntrance()};reduced.addEventListener('change',motionChange);cleanupCallbacks.push(()=>reduced.removeEventListener('change',motionChange));
    if(window.ResizeObserver){let width=canvas.clientWidth;const observer=new ResizeObserver(()=>{if(canvas.clientWidth!==width){width=canvas.clientWidth;if(showAll)fit();else focusNode(selectedId,true)}});observer.observe(canvas);cleanupCallbacks.push(()=>observer.disconnect())}
    return()=>{controller.abort();interruptEntrance();cleanupCallbacks.forEach(fn=>fn());pointers.clear();drag=null;pinch=null};
  }
  // A fixed main baton and a linear rail are the default Figma view.
  // Size follows continuous distance from the selection point; branches are entered vertically.
  function carouselLayout(count,position=null,anchor=94) {
    const neutral=position===null;
    const p=neutral?0:Math.max(0,Math.min(Math.max(0,count-1),position));
    const scales=Array.from({length:count},(_,i)=>neutral?1:1+.8*Math.exp(-Math.abs(i-p)*.9));
    const centers=[];
    for(let i=0;i<count;i++)centers[i]=i?centers[i-1]+33*(scales[i-1]+scales[i])+12:33*scales[i];
    const floor=Math.floor(p),fraction=p-floor;
    const selectedCenter=count?(centers[floor]||0)+fraction*((centers[Math.min(floor+1,count-1)]||0)-(centers[floor]||0)):0;
    return scales.map((scale,i)=>({scale,x:neutral?i*78:centers[i]-selectedCenter+anchor-33}));
  }
  async function mountLinear(container,record,options={}) {
    const M=window.Morogado,e=M.escape,controller=new AbortController(),signal=controller.signal;
    let records;
    try{records=await M.store.list()}catch{container.innerHTML='<p class="log-error">이어달린 기록을 불러오지 못했어요. 페이지를 다시 열어 주세요.</p>';return()=>controller.abort()}
    if(!Array.isArray(records))records=[];
    if(!records.some(r=>String(r.id)===String(record.id)))records.push(record);
    const graph=geometry(records,record.id),reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let branchId=String(record.id),selectedId=branchId,position=null,railRecords=[],drag=null,clickBlockedUntil=0;
    let entranceTimer=null,frame1=null,frame2=null,mapCleanup=null,mapMountPromise=null,wheelTimer=null;
    const branchStack=[],timers=new Set();
    const thumb=rec=>firstImage(rec)?`<img src="${e(firstImage(rec))}" alt="" draggable="false">`:`<span class="log-node-placeholder" aria-hidden="true">${e(String(rec.title||'바톤').slice(0,1))}</span>`;
    const idOf=rec=>String(rec.id);
    container.innerHTML=`<div class="relay-log linear-log ${options.embedded?'log-embedded':''}"><div class="linear-canvas" tabindex="0" role="group" aria-label="바톤이 이어진 과정. 좌우로 관련 바톤을 탐색하고 아래 방향키로 다음 계승을 볼 수 있어요."><svg class="linear-edge-layer" aria-hidden="true" focusable="false"></svg><div class="linear-main"><span class="linear-main-tag" data-linear-main-tag></span><button class="linear-main-button" data-linear-main aria-pressed="true"></button><p class="linear-main-title"></p></div><div class="linear-rail" aria-label="관련 바톤"><div class="linear-track"></div><div class="linear-end-fade" aria-hidden="true"></div></div><div class="linear-peek" role="tooltip" hidden></div><p class="linear-empty" hidden>아직 다음 바톤이 없어요.<br>이 작업에서 새롭게 시작해 보세요.</p></div><div class="linear-controls"><div class="log-control-group"><button class="log-control log-control-icon" data-linear-action="previous" aria-label="이전 관련 바톤">${svg('left')}</button><button class="log-control log-control-icon" data-linear-action="next" aria-label="다음 관련 바톤">${svg('right')}</button><span class="linear-count" aria-live="polite"></span></div><button class="log-control" data-linear-action="map">계승 지도 보기</button></div><div class="log-bottom"><div class="log-selection" aria-live="polite"></div><div class="log-relations"><h3>다음 갈래로 이어가요</h3><div class="log-relation-controls"><button class="log-control" data-linear-action="up">${svg('up')}이전 갈래</button><button class="log-control" data-linear-action="down">${svg('down')}다음 계승</button><button class="log-control" data-linear-action="reset">${svg('reset')}처음 바톤</button><button class="log-control" data-linear-action="detail">상세 보기</button></div></div></div><div class="log-status" role="status"></div><details class="log-list-details"><summary>계승 기록을 목록으로 보기 (${graph.nodes.length}개)</summary><ol class="log-accessible-list">${graph.nodes.map(node=>`<li><button data-linear-list="${e(node.record.id)}" aria-pressed="${idOf(node.record)===selectedId}" ${idOf(node.record)===String(record.id)?'aria-current="page"':''}><strong>${e(node.record.title)}</strong><small>${e(nameOf(node.record.author))}${dateOf(node.record.createdAt)?' · '+e(dateOf(node.record.createdAt)):''}</small></button></li>`).join('')}</ol></details><div class="linear-map-mount" hidden></div></div>`;
    const root=container.querySelector('.linear-log'),canvas=root.querySelector('.linear-canvas'),rail=root.querySelector('.linear-rail'),track=root.querySelector('.linear-track');
    const links=root.querySelector('.linear-edge-layer');
    const totalRecords=graph.nodes.map(node=>node.record),total=totalRecords.length;
    root.dataset.logTotal=String(total);
    const heading=container.closest('.detail-section,.log-page')?.querySelector('#detail-relay-title,.log-main-title');
    if(heading){
      let count=heading.querySelector('[data-log-total]');
      if(!count){count=document.createElement('span');count.className='log-title-count';count.dataset.logTotal='';heading.append(count)}
      count.textContent=String(total);count.setAttribute('aria-label',`전체 계승 기록 ${total}개, 현재 바톤 포함`);
    }
    let edgeFrame=null,edgeUntil=0;
    function drawLinearConnections(){
      if(signal.aborted)return;
      const box=links.getBoundingClientRect(),width=links.clientWidth,height=links.clientHeight;
      if(!width||!height||!box.width||!box.height)return;
      const sx=width/box.width,sy=height/box.height,rects=new Map();
      const main=root.querySelector('[data-linear-main]');
      const buttons=[main,...track.querySelectorAll('[data-linear-node]')];
      // Read every rectangle and opacity before writing the SVG once.
      for(const button of buttons){
        const id=button===main?branchId:button.dataset.linearNode,r=button.getBoundingClientRect();
        const entry=button.closest('.linear-entry');
        rects.set(String(id),{x:(r.left+r.width/2-box.left)*sx,top:(r.top-box.top)*sy,opacity:entry?Number(getComputedStyle(entry).opacity):1});
      }
      const paths=graph.edges.flatMap(({from,to},index)=>{
        const fromId=idOf(from.record),toId=idOf(to.record),a=rects.get(fromId),b=rects.get(toId);
        if(!a||!b)return [];
        // Each real parentId connection gets an upper lane so it does not imply
        // an invented adjacent-node chain underneath unrelated card images.
        const lane=Math.max(16,Math.min(a.top,b.top)-18-(index%4)*8);
        const d=`M ${a.x} ${a.top} V ${lane} H ${b.x} V ${b.top}`;
        const highlighted=fromId===selectedId||toId===selectedId;
        return [`<path data-from="${e(fromId)}" data-to="${e(toId)}" class="${highlighted?'is-selection-link':''}" style="opacity:${Math.min(a.opacity,b.opacity)}" d="${d}"/>`];
      });
      links.setAttribute('viewBox',`0 0 ${width} ${height}`);links.innerHTML=paths.join('');
    }
    function redrawEdgesFor(duration=0){
      edgeUntil=Math.max(edgeUntil,performance.now()+duration);
      if(edgeFrame!==null)return;
      const tick=()=>{edgeFrame=null;drawLinearConnections();if(!signal.aborted&&performance.now()<edgeUntil)edgeFrame=requestAnimationFrame(tick)};
      edgeFrame=requestAnimationFrame(tick);
    }
    const resizeObserver=new ResizeObserver(()=>updateRail(true));resizeObserver.observe(canvas);
    const listen=(node,type,fn,opts={})=>node?.addEventListener(type,fn,{...opts,signal});
    const descendants=id=>{const seen=new Set([String(id)]),result=[];const visit=key=>{for(const child of graph.children.get(String(key))||[]){const childId=idOf(child);if(seen.has(childId))continue;seen.add(childId);result.push(child);visit(childId)}};visit(id);return result;};
    function interrupt(){
      if(wheelTimer!==null){clearTimeout(wheelTimer);wheelTimer=null;}edgeUntil=0;if(entranceTimer!==null){clearTimeout(entranceTimer);entranceTimer=null}if(frame1!==null)cancelAnimationFrame(frame1);if(frame2!==null)cancelAnimationFrame(frame2);frame1=frame2=null;canvas.classList.add('linear-interrupted');canvas.classList.remove('linear-entering','linear-ready');track.querySelectorAll('.linear-entry').forEach(el=>el.style.transitionDelay='0ms')}
    function updateRail(instant=false){
      canvas.classList.toggle('linear-dragging',instant||!!drag);
      const layout=carouselLayout(railRecords.length,position,Math.min(94,Math.max(36,rail.clientWidth/2)));
      track.querySelectorAll('.linear-item').forEach((node,i)=>{node.style.transform=`translateX(${layout[i].x}px)`;const button=node.querySelector('.linear-node');button.style.transform=`scale(${layout[i].scale})`;button.setAttribute('aria-pressed',String(idOf(railRecords[i])===selectedId));node.classList.toggle('is-selected',idOf(railRecords[i])===selectedId)});
      const index=railRecords.findIndex(r=>idOf(r)===selectedId);
      const overallIndex=totalRecords.findIndex(rec=>idOf(rec)===selectedId);
      root.querySelector('.linear-count').textContent=`계승 기록 ${total}개 · ${Math.max(1,overallIndex+1)} / ${total}`;
      root.querySelector('.linear-count').setAttribute('aria-label',`전체 계승 기록 ${total}개, 현재 바톤 포함. 선택한 기록 ${Math.max(1,overallIndex+1)}번째`);
      redrawEdgesFor(instant||reduced.matches?0:280);
      root.querySelector('[data-linear-action=previous]').disabled=index<0||index===0;
      root.querySelector('[data-linear-action=next]').disabled=!railRecords.length||index===railRecords.length-1;
    }
    function metadata(id){
      const rec=graph.byId.get(String(id));if(!rec)return;const parent=graph.byId.get(String(rec.parentId||'')),children=graph.children.get(String(id))||[];const note=typeof rec.note==='string'?{done:rec.note}:rec.note||{};
      return {rec,children,work:note.done||note.intent||rec.summary||'이어달린 작업의 노트가 아직 없어요.',relation:parent?`${parent.title}에서 이어받음${children.length?` · 여기서 ${children.length}갈래`:''}`:children.length?`이 갈래의 시작 · 여기서 ${children.length}갈래`:'이 갈래의 시작',special:String(id)===String(record.id)?'지금 보고 있는 바톤':rec.flowering?'이 갈래의 완성작 · 개별 구매':''};
    }
    function updateSelection(){
      const data=metadata(selectedId);if(!data)return;const {rec,children,work,relation,special}=data;
      root.querySelector('.log-selection').innerHTML=`<div class="log-selection-thumbnail">${thumb(rec)}</div><div><h3>${e(rec.title)}</h3><p class="log-selection-meta">by. ${e(nameOf(rec.author))}${dateOf(rec.createdAt)?' · '+e(dateOf(rec.createdAt)):''}${special?`<br>${e(special)}`:''}</p><p class="log-selection-work">${e(work)}</p><p class="log-selection-relation">${e(relation)}</p>${M.artifactMarkup?M.artifactMarkup(rec.artifacts||[]):''}<div class="log-selection-actions"><button class="log-open-detail" data-linear-action="detail">이 바톤 자세히 보기</button>${children.length?`<button class="log-control" data-linear-action="down">다음 계승 ${children.length}개 ${svg('down')}</button>`:''}</div></div>`;
      root.querySelectorAll('[data-linear-action=down]').forEach(button=>button.disabled=!children.length);
      root.querySelector('[data-linear-action=up]').disabled=!branchStack.length&&!(graph.byId.get(branchId)?.parentId&&graph.byId.has(String(graph.byId.get(branchId).parentId)));
      root.querySelector('[data-linear-main]').setAttribute('aria-pressed',String(selectedId===branchId));
      redrawEdgesFor(reduced.matches?0:280);
      root.querySelectorAll('[data-linear-list]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.linearList===selectedId)));
    }
    function select(id,{keyboard=false}={}){
      interrupt();id=String(id);if(!graph.byId.has(id))return;
      if(id!==branchId&&!railRecords.some(r=>idOf(r)===id)){branchId=id;position=null;selectedId=id;buildBranch(false);return}
      selectedId=id;position=id===branchId?null:railRecords.findIndex(r=>idOf(r)===id);updateRail(keyboard||reduced.matches);updateSelection();root.querySelector('.linear-peek').hidden=true;
    }
    function buildBranch(animate=false){
      root.querySelector('.linear-peek').hidden=true;
      interrupt();const main=graph.byId.get(branchId);selectedId=branchId;position=null;
      railRecords=branchId===String(record.id)?graph.nodes.map(n=>n.record).filter(r=>idOf(r)!==branchId):descendants(branchId);
      const mainButton=root.querySelector('[data-linear-main]');mainButton.innerHTML=thumb(main);
      const mainIsCurrent=branchId===String(record.id);
      mainButton.setAttribute('aria-label',`${main.title}, ${nameOf(main.author)}${mainIsCurrent?', 지금 보고 있는 바톤':', 이 갈래의 시작'}`);
      if(mainIsCurrent)mainButton.setAttribute('aria-current','page');else mainButton.removeAttribute('aria-current');
      root.querySelector('[data-linear-main-tag]').textContent=mainIsCurrent?'지금 보고 있는 바톤':'이 갈래의 시작';
      root.querySelector('.linear-main-title').textContent=main.title;
      track.innerHTML=railRecords.map(rec=>{const current=idOf(rec)===String(record.id);return `<div class="linear-item"><div class="linear-entry">${current?'<span class="linear-current-badge">지금 보고 있는 바톤</span>':''}<button class="linear-node ${current?'is-current-record':''}" data-linear-node="${e(rec.id)}" aria-label="${e(rec.title)}, ${e(nameOf(rec.author))}${current?', 지금 보고 있는 바톤':''}" ${current?'aria-current="page"':''} aria-pressed="false">${thumb(rec)}</button><p class="linear-node-title">${e(rec.title)}</p></div></div>`}).join('');
      root.querySelector('.linear-empty').hidden=railRecords.length>0;updateRail(true);updateSelection();
      if(animate&&railRecords.length&&!reduced.matches&&!entrancesSeen.has('linear-'+record.id)){
        redrawEdgesFor(350);entrancesSeen.add('linear-'+record.id);canvas.classList.remove('linear-interrupted');canvas.classList.add('linear-entering');track.querySelectorAll('.linear-entry').forEach((el,i)=>el.style.transitionDelay=`${railRecords.length===1?0:0}ms`);
        frame1=requestAnimationFrame(()=>{frame1=null;frame2=requestAnimationFrame(()=>{frame2=null;if(!signal.aborted){canvas.classList.add('linear-ready');entranceTimer=setTimeout(interrupt,350)}})});
      }
    }
    function move(direction,keyboard=false){const index=railRecords.findIndex(r=>idOf(r)===selectedId),next=index+direction;if(next>=0&&next<railRecords.length)select(railRecords[next].id,{keyboard});else if(direction<0)select(branchId,{keyboard})}
    function vertical(direction,keyboard=false){
      interrupt();
      if(direction==='down'){
        const children=graph.children.get(selectedId)||[];if(!children.length)return;
        branchStack.push({branchId,selectedId,position});branchId=selectedId;buildBranch(false);select(children[0].id,{keyboard});root.querySelector('.log-status').textContent=`${graph.byId.get(branchId).title}의 다음 계승 ${children.length}개를 보고 있어요.`;
      }else if(branchStack.length){const previous=branchStack.pop();branchId=previous.branchId;buildBranch(false);select(previous.selectedId,{keyboard});}
      else {const parent=graph.byId.get(String(graph.byId.get(branchId)?.parentId||''));if(parent){branchId=idOf(parent);buildBranch(false)}}
      if(keyboard)canvas.focus({preventScroll:true});
    }
    buildBranch(true);
    listen(root,'click',async ev=>{
      if(performance.now()<clickBlockedUntil){ev.preventDefault();return}
      const keyboard=ev.detail===0;
      const node=ev.target.closest('[data-linear-node],[data-linear-list]');if(node){select(node.dataset.linearNode||node.dataset.linearList,{keyboard});return}
      if(ev.target.closest('[data-linear-main]')){select(branchId,{keyboard});return}
      const button=ev.target.closest('[data-linear-action]');if(!button||button.disabled)return;const action=button.dataset.linearAction;
      if(action==='previous')move(-1,keyboard);else if(action==='next')move(1,keyboard);else if(action==='down'||action==='up')vertical(action,keyboard);else if(action==='reset'){branchStack.length=0;branchId=String(record.id);buildBranch(false)}else if(action==='detail')M.navigate(`/baton/${encodeURIComponent(selectedId)}`);
      else if(action==='map'){
        interrupt();const map=root.querySelector('.linear-map-mount');map.hidden=!map.hidden;button.textContent=map.hidden?'계승 지도 보기':'계승 지도 접기';
        if(!map.hidden&&!mapCleanup&&!mapMountPromise){
          mapMountPromise=mountMap(map,record,{embedded:true}).then(cleanup=>{
            if(signal.aborted)cleanup?.();else mapCleanup=cleanup;
          }).catch(error=>{
            if(!signal.aborted){map.hidden=true;button.textContent='계승 지도 보기';M.toast(error.message||'계승 지도를 불러오지 못했어요.')}
          }).finally(()=>{mapMountPromise=null});
          await mapMountPromise;
        }
      }
    });
    listen(canvas,'keydown',ev=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(ev.key)){ev.preventDefault();if(ev.key==='ArrowLeft')move(-1,true);if(ev.key==='ArrowRight')move(1,true);if(ev.key==='ArrowUp')vertical('up',true);if(ev.key==='ArrowDown')vertical('down',true);if(ev.key==='Home'){branchId=String(record.id);branchStack.length=0;buildBranch(false)}}});
    listen(canvas,'focusin',interrupt);
    listen(rail,'pointerdown',ev=>{if(drag)return;interrupt();if(ev.button!==0||!railRecords.length)return;drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY,start:position??0,moved:false,clickedId:ev.target.closest('[data-linear-node]')?.dataset.linearNode};rail.setPointerCapture(ev.pointerId);canvas.classList.add('linear-dragging')});
    listen(rail,'pointermove',ev=>{if(!drag||drag.id!==ev.pointerId)return;const dx=ev.clientX-drag.x;if(Math.abs(dx)>4)drag.moved=true;if(!drag.moved)return;position=Math.max(0,Math.min(railRecords.length-1,drag.start-dx/100));const nextId=idOf(railRecords[Math.round(position)]),changed=selectedId!==nextId;selectedId=nextId;updateRail(true);if(changed)updateSelection()});
    const end=ev=>{if(!drag||drag.id!==ev.pointerId)return;const moved=drag.moved,clickedId=drag.clickedId;drag=null;canvas.classList.remove('linear-dragging');if(rail.hasPointerCapture(ev.pointerId))rail.releasePointerCapture(ev.pointerId);if(moved){clickBlockedUntil=performance.now()+150;position=Math.round(position??0);selectedId=idOf(railRecords[position]);updateRail(reduced.matches);updateSelection()}else if(clickedId&&ev.type==='pointerup'){select(clickedId);clickBlockedUntil=performance.now()+150}};
    listen(rail,'pointerup',end);listen(rail,'pointercancel',end);listen(rail,'lostpointercapture',end);
    listen(rail,'wheel',ev=>{if(!railRecords.length)return;if(Math.abs(ev.deltaX)<Math.abs(ev.deltaY)&&!ev.shiftKey)return;ev.preventDefault();interrupt();position=Math.max(0,Math.min(railRecords.length-1,(position??0)+(ev.deltaX||ev.deltaY)/120));const nextId=idOf(railRecords[Math.round(position)]),changed=selectedId!==nextId;selectedId=nextId;updateRail(true);if(changed)updateSelection();if(wheelTimer)clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{wheelTimer=null;position=Math.round(position);updateRail(reduced.matches)},140)},{passive:false});
    const peek=root.querySelector('.linear-peek');
    listen(track,'pointerover',ev=>{const node=ev.target.closest('[data-linear-node]');if(!node||ev.pointerType==='touch'||drag)return;const data=metadata(node.dataset.linearNode);peek.innerHTML=`<strong>${e(data.rec.title)}</strong><small>by. ${e(nameOf(data.rec.author))} · ${e(dateOf(data.rec.createdAt))}</small><p>${e(data.work)}</p><small>${e(data.relation)}</small>`;peek.hidden=false});
    listen(track,'pointerout',ev=>{if(!ev.relatedTarget?.closest?.('[data-linear-node]'))peek.hidden=true});
    const motionChanged=()=>{if(reduced.matches)interrupt()};reduced.addEventListener('change',motionChanged);
    return()=>{controller.abort();interrupt();if(edgeFrame!==null)cancelAnimationFrame(edgeFrame);edgeFrame=null;resizeObserver.disconnect();if(wheelTimer)clearTimeout(wheelTimer);timers.forEach(clearTimeout);reduced.removeEventListener('change',motionChanged);mapCleanup?.();drag=null};
  }

  async function render(container,record){
    const M=window.Morogado,e=M.escape;
    container.innerHTML=`<article class="log-page"><div class="log-page-heading"><button class="log-page-back" aria-label="바톤 상세로 돌아가기" data-log-back>${svg('left')}</button><div><h1>${e(record.title)}</h1><p>${e(record.summary||'이 바톤이 이어달려 온 작업과 다음 갈래를 살펴보세요.')}</p></div></div><div class="log-topline"><h2 class="log-main-title">이 바톤의 릴레이 로그</h2><button class="log-help" aria-label="릴레이 로그 안내">?</button></div><div class="log-page-mount"></div></article>`;
    const back=container.querySelector('[data-log-back]');back.onclick=()=>M.navigate(`/baton/${encodeURIComponent(record.id)}`);
    const help=container.querySelector('.log-help');help.onclick=()=>M.modal({title:'릴레이 로그를 살펴보는 법',html:'<div class="detail-modal-body"><p>왼쪽의 검은 바톤은 지금 살펴보는 갈래의 출발점이에요. 오른쪽의 관련 바톤을 누르면 누가 무엇을 이어서 했는지 확인할 수 있어요.</p><p>좌우로 드래그하거나 가로로 스크롤해 관련 바톤을 둘러보세요. 좌우 방향키로도 이동할 수 있어요.</p><p>아래 방향키나 ‘다음 계승’ 버튼으로 하위 갈래를 보고, 위 방향키나 ‘이전 갈래’로 돌아와요.</p><p>전체 연결선을 살펴보고 싶다면 ‘계승 지도 보기’를 선택하세요. 계승 기록 목록으로도 모든 바톤을 확인할 수 있어요.</p></div>'});
    const cleanup=await mountLinear(container.querySelector('.log-page-mount'),record);
    return()=>{back.onclick=null;help.onclick=null;cleanup?.()};
  }
  window.MorogadoLog={render,mount:mountLinear,mountMap,geometry,carouselLayout};
})();
