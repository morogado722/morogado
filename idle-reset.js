/* 전시용 자동 처음으로 (11/12)
 * 1분 30초 동안 마우스·키보드·스크롤·터치가 없으면 열린 창을 모두 닫고 랜딩(#/)으로 돌아가요.
 * 업로드·상세 화면은 iframe 안이라 그 안의 움직임도 같이 지켜봐요(같은 주소라 들여다볼 수 있어요).
 * 바톤 분석 로딩·노트 AI 작성·바톤 만드는 중(aria-busy)에는 기다려요. 끝나고 1분 30초 뒤에 돌아가요.
 * 돌아갈 때 업로드에 쓰다 만 내용(메이커 임시 저장)을 지워서 다음 관람객이 처음부터 시작해요.
 * 끄기: 주소에 ?noidle 을 붙이면 작동하지 않아요(작업·확인용). */
(() => {
  'use strict';
  if (/[?&]noidle\b/.test(location.search)) return;
  const IDLE_MS = 90000;   // 11/13 1분 30초로 늘림
  const EVENTS = ['pointermove', 'pointerdown', 'mousemove', 'mousedown', 'keydown', 'wheel', 'scroll', 'touchstart', 'input'];
  let timer = 0;

  /* 업로드 화면이 일하는 중인지: 분석 로딩창, '바톤 만드는 중', 노트 AI 작성 */
  function busy() {
    for (const f of document.querySelectorAll('iframe')) {
      try {
        const w = f.contentWindow, d = w?.document;
        if (!d) continue;
        if (w.MorogaroLoading?.isOpen?.()) return true;
        if (d.querySelector('[aria-busy="true"], #generate-note:disabled, #suggest-ideas:disabled')) return true;
      } catch { /* 다른 주소 */ }
    }
    return !!document.querySelector('[aria-busy="true"]');
  }

  /* 메이커 임시 저장 지우기(fresh-start.js와 같은 범위). 사이트 바톤·이름·저장 목록은 그대로 */
  function clearDraft() {
    // 업로드 화면을 먼저 내려요. 화면이 남아 있으면 떠날 때 임시 저장을 다시 해 버려요.
    document.querySelectorAll('iframe.maker-frame').forEach(f => f.remove());
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (/^morogaro/i.test(k) || k === 'upload-step-one')) localStorage.removeItem(k);
      }
    } catch { /* 저장 공간을 못 써도 괜찮아요 */ }
    try { ['morogaro-baton-maker', 'morogaro-baton-results'].forEach(n => indexedDB.deleteDatabase(n)); } catch { /* */ }
  }

  function goHome() {
    if (busy()) { reset(); return; }
    clearDraft();
    // 열린 창(다이얼로그)을 모두 닫아요
    document.querySelectorAll('dialog[open]').forEach(d => { try { d.close(); } catch { /* 이미 닫혔어요 */ } });
    document.documentElement.classList.remove('wp-open');
    const home = location.hash === '' || location.hash === '#/' || location.hash === '#';
    if (!home) location.hash = '#/';
    window.scrollTo({ top: 0, behavior: home ? 'smooth' : 'instant' });
  }
  function reset() { clearTimeout(timer); timer = setTimeout(goHome, IDLE_MS); }

  function watch(win) {
    if (!win || win.__mgIdle) return;
    try { win.__mgIdle = true; } catch { return; }   // 다른 주소의 iframe은 건너뛰어요
    EVENTS.forEach(type => win.addEventListener(type, reset, { passive: true, capture: true }));
  }
  function watchFrames() {
    document.querySelectorAll('iframe').forEach(f => {
      try { watch(f.contentWindow); } catch { /* 다른 주소 */ }
      if (!f.__mgIdleLoad) { f.__mgIdleLoad = true; f.addEventListener('load', () => { try { watch(f.contentWindow); } catch { /* 다른 주소 */ } reset(); }); }
    });
  }

  watch(window);
  watchFrames();
  let queued = false;
  new MutationObserver(() => { if (queued) return; queued = true; setTimeout(() => { queued = false; watchFrames(); }, 500); }).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('hashchange', reset);
  reset();
})();
