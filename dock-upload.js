/* 10/18 업로드 진입 정리
 *  - 헤더 플러스(.add-baton): 누르면 바로 업로드 화면(#/upload)으로 가요.
 *  - 아래 독 플러스(.dock-plus): 그 자리에서 업로드 첫 칸(피그마 3829:2459, FILE 덤핑 섹션)이 위로 펼쳐져요.
 *    파일을 하나라도 끌어 놓거나 고르면, 또는 칸을 누르면 업로드 화면으로 넘어가요(고른 파일은 그대로 1단계에 들어가요).
 *  figma-home.js 의 예전 업로드 모달보다 먼저 클릭을 받아요(window 캡처 단계). */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const EASE_OPEN = 'cubic-bezier(.22,.9,.24,1)', EASE_CLOSE = 'cubic-bezier(.4,0,.6,1)';
  let panel = null, backdrop = null, open = false, busy = false;

  const goUpload = files => {
    if (files?.length && window.Morogado) window.Morogado.pendingFiles = [...files];
    location.hash = '/upload';
  };

  function build() {
    backdrop = document.createElement('div');
    backdrop.className = 'dock-drop-backdrop';
    panel = document.createElement('div');
    panel.className = 'dock-drop';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '파일 올리기');
    panel.innerHTML = `<div class="dock-drop-in">
        <div class="dock-drop-head"><strong>FILE</strong><span class="dock-drop-count">0</span></div>
        <button type="button" class="dock-drop-zone" aria-label="업로드 화면으로 가서 파일 올리기">
          <img src="assets/upload.svg" alt="" width="77" height="77">
          <span>끌어다 놓기만 하면 바로 시작돼요!<br>완성하고 싶은 파일을 여기에 올려 주세요:)</span>
        </button>
        <input type="file" multiple hidden>
      </div>`;
    document.body.append(backdrop, panel);
    const zone = panel.querySelector('.dock-drop-zone'), input = panel.querySelector('input');
    zone.addEventListener('click', () => close(() => goUpload()));
    input.addEventListener('change', () => { if (input.files.length) close(() => goUpload(input.files)); });
    ['dragenter', 'dragover'].forEach(t => panel.addEventListener(t, e => { e.preventDefault(); zone.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(t => panel.addEventListener(t, e => { e.preventDefault(); if (t === 'drop' || !panel.contains(e.relatedTarget)) zone.classList.remove('is-over'); }));
    panel.addEventListener('drop', e => { const f = e.dataTransfer?.files; if (f?.length) { panel.querySelector('.dock-drop-count').textContent = f.length; close(() => goUpload(f)); } });
    backdrop.addEventListener('click', () => close());
    addEventListener('keydown', e => { if (open && e.key === 'Escape') close(); });
    addEventListener('hashchange', () => { if (open) close(null, true); });
  }

  /* 플러스 버튼 자리에서 칸 크기로 자라나는 변환 */
  function fromPlus(plus) {
    const a = plus.getBoundingClientRect(), b = panel.getBoundingClientRect();
    const dx = (a.left + a.width / 2) - (b.left + b.width / 2), dy = (a.top + a.height / 2) - (b.top + b.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  }

  function show(plus) {
    if (!panel) build();
    if (open || busy) return;
    open = true; busy = true;
    panel.querySelector('.dock-drop-count').textContent = '0';
    document.body.classList.add('is-dock-drop');
    panel.classList.add('is-open'); backdrop.classList.add('is-open');
    plus.setAttribute('aria-expanded', 'true');
    if (reduce.matches) { busy = false; panel.querySelector('.dock-drop-zone').focus({ preventScroll: true }); return; }
    const t = fromPlus(plus);
    panel.animate([{ transform: t, borderRadius: '44px', opacity: .6 }, { transform: 'none', borderRadius: getComputedStyle(panel).borderRadius, opacity: 1 }], { duration: 560, easing: EASE_OPEN });
    panel.querySelector('.dock-drop-in').animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 260, easing: 'ease-out', fill: 'backwards' });
    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: 'ease-out' });
    setTimeout(() => { busy = false; panel.querySelector('.dock-drop-zone').focus({ preventScroll: true }); }, 560);
  }

  function close(after, instant) {
    if (!open) { after?.(); return; }
    const plus = document.querySelector('.floating-dock .dock-plus');
    const done = () => {
      panel.classList.remove('is-open'); backdrop.classList.remove('is-open');
      document.body.classList.remove('is-dock-drop'); plus?.setAttribute('aria-expanded', 'false');
      open = false; busy = false; after?.();
    };
    if (instant || reduce.matches || !plus || plus.offsetParent === null) { done(); return; }
    busy = true;
    /* 파일을 넣었거나 칸을 누른 경우엔 접히는 걸 기다리지 않고 바로 넘어가요 */
    if (after) { panel.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(.98)' }], { duration: 160, easing: EASE_CLOSE, fill: 'forwards' }).onfinish = () => { done(); panel.getAnimations().forEach(a => a.cancel()); }; return; }
    panel.querySelector('.dock-drop-in').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-in', fill: 'forwards' });
    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, easing: EASE_CLOSE, fill: 'forwards' });
    panel.animate([{ transform: 'none', opacity: 1 }, { transform: fromPlus(plus), borderRadius: '44px', opacity: .4 }], { duration: 420, easing: EASE_CLOSE, fill: 'forwards' })
      .onfinish = () => { done(); panel.getAnimations().forEach(a => a.cancel()); panel.querySelector('.dock-drop-in').getAnimations().forEach(a => a.cancel()); backdrop.getAnimations().forEach(a => a.cancel()); };
  }

  addEventListener('click', e => {
    const head = e.target.closest('.site-header .add-baton');
    if (head) { e.preventDefault(); e.stopImmediatePropagation(); if (location.hash.startsWith('#/upload')) return; location.hash = '/upload'; return; }
    const dock = e.target.closest('.floating-dock .dock-plus');
    if (dock) { e.preventDefault(); e.stopImmediatePropagation(); if (open) close(); else show(dock); }
  }, true);
})();
