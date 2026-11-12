/* 전시용 자동 처음으로 (11/12)
 * 30초 동안 마우스·키보드·스크롤·터치가 없으면 열린 창을 모두 닫고 랜딩(#/)으로 돌아가요.
 * 업로드·상세 화면은 iframe 안이라 그 안의 움직임도 같이 지켜봐요(같은 주소라 들여다볼 수 있어요).
 * 끄기: 주소에 ?noidle 을 붙이면 작동하지 않아요(작업·확인용). */
(() => {
  'use strict';
  if (/[?&]noidle\b/.test(location.search)) return;
  const IDLE_MS = 30000;
  const EVENTS = ['pointermove', 'pointerdown', 'mousemove', 'mousedown', 'keydown', 'wheel', 'scroll', 'touchstart', 'input'];
  let timer = 0;

  function goHome() {
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
