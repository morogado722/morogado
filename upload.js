/* Parent application entry for the complete six-step maker. */
(() => {
  'use strict';
  function mount(container,{parentId=null}={}){
    const frame=document.createElement('iframe');frame.className='maker-frame';frame.title=parentId?'바톤 이어서 올리기':'바톤 올리기';
    const params=new URLSearchParams({embedded:'1',v:'1018b'});if(parentId)params.set('parentId',parentId);
    frame.src='upload.html?'+params;frame.setAttribute('allow','');container.classList.add('maker-host');container.replaceChildren(frame);
    frame.addEventListener('load',()=>frame.classList.add('is-loaded'),{once:true});
    /* 메이커를 내리면 사이트 헤더의 흰 띠를 접고 오른쪽 탭만 남겨요. 바깥 페이지가 끌려 올라가지 않게 0으로 고정 */
    const body=document.body;
    const pin=()=>{if(scrollY)scrollTo(0,0)};addEventListener('scroll',pin,{passive:true});
    frame.addEventListener('load',()=>{try{const w=frame.contentWindow;const on=()=>{const y=w.scrollY,max=w.document.documentElement.scrollHeight-w.innerHeight;if(max>0&&y>Math.min(24,max-1))body.classList.add('is-maker-scrolled');else if(y<=2)body.classList.remove('is-maker-scrolled')};w.addEventListener('scroll',on,{passive:true});on()}catch{}});
    return async()=>{
      const maker=frame.contentWindow?.MorogaroMaker,workflow=frame.contentWindow?.MorogadoWorkflow;
      if(maker&&!workflow?.hasCommittedRecord?.()){
        workflow?.flushPendingNotes?.();
        const state=maker.getState?.();
        if(state&&!state.isSaved){
          const saved=await maker.saveDraft();
          if(!saved){window.Morogado?.toast('변경 사항을 저장하지 못했어요. 업로드 화면에서 다시 저장해 주세요.');return false;}
        }
      }
      container.classList.remove('maker-host');body.classList.remove('is-maker-scrolled');removeEventListener('scroll',pin);frame.remove();return true;
    };
  }
  window.MorogadoUpload=Object.freeze({mount});
})();
