/* 전시장 자동 새로고침 (11/13)
 * 1분마다 index.html을 새로 받아 보고, 새 버전이 올라왔으면 알아서 새로고침해요.
 * 관람객이 쓰는 중에는 기다려요: 랜딩(#/)에 있고 30초 넘게 아무 움직임이 없을 때만 새로고침해요.
 * (idle-reset.js가 30초 뒤 랜딩으로 보내 주니까, 사람이 떠나면 곧 새 버전이 떠요)
 * 오래 켜 둔 화면이 무거워지지 않게, 같은 조건에서 3시간마다 한 번씩도 새로고침해요.
 * 끄기: 주소에 ?noupdate */
(() => {
  'use strict';
  if (/[?&]noupdate\b/.test(location.search)) return;
  const CHECK_MS = 60000, QUIET_MS = 30000, MAX_AGE_MS = 3 * 60 * 60 * 1000;
  const started = Date.now();
  let last = Date.now(), base = null, pending = false;

  const touch = () => { last = Date.now(); };
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'scroll', 'touchstart', 'input']
    .forEach(t => addEventListener(t, touch, { passive: true, capture: true }));
  // 업로드·상세 화면(iframe) 안의 움직임도 같이 봐요
  setInterval(() => document.querySelectorAll('iframe').forEach(f => {
    try { const w = f.contentWindow; if (w && !w.__mgUpd) { w.__mgUpd = true; ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'input'].forEach(t => w.addEventListener(t, touch, { passive: true, capture: true })); } } catch { /* 다른 주소 */ }
  }), 5000);

  const onLanding = () => location.hash === '' || location.hash === '#' || location.hash === '#/';
  const quiet = () => Date.now() - last > QUIET_MS && !document.querySelector('dialog[open], [aria-busy="true"]');

  async function latest() {
    const res = await fetch('index.html?check=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    return res.text();
  }

  async function tick() {
    let ok = false;   // 서버에 닿았을 때만 새로고침해요(인터넷이 끊긴 채 새로고침하면 화면이 사라져요)
    try {
      const html = await latest(); ok = true;
      if (base === null) base = html;
      else if (html !== base) pending = true;
    } catch { /* 인터넷이 잠깐 끊겨도 다음에 다시 봐요 */ }
    if ((pending || Date.now() - started > MAX_AGE_MS) && onLanding() && quiet() && ok) location.reload();
  }

  tick();
  setInterval(tick, CHECK_MS);
})();
