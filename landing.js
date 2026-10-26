/* 10/26 랜딩(첫 화면) — 피그마 HOME(4006:10070)
 * 주소 #/ 는 이 랜딩, 바톤 탐색 피드는 #/explore 로 옮겼어요(site.js renderRoute).
 * 1440 기준 좌표를 --hu(header-v2.css)로 화면 폭에 맞춰 같이 줄여요. */
(function () {
  'use strict';
  const A = 'assets/landing/';
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* 검색창에서 차례로 타이핑되는 문구 → 눌렀을 때 탐색에서 찾을 말. 위 셋은 실제 샘플 바톤이 있어요.
     마지막 하나는 결과가 없어서 '없으면 넘기면 돼요' 장면이 돼요. */
  const PHRASES = [
    { text: '렌더 질감 다듬다 멈춘 오토바이', query: '모터사이클' },
    { text: '복숭아까지 그린 과일 달력', query: '달력' },
    { text: '렌더까지 끝낸 스마트 안경', query: '안경' },
    { text: '기획서만 쓰고 접은 게임', query: '게임' }
  ];
  /* 이어받기 카드 줄에 흐르는 바톤(피그마 시안의 오토바이·작업실·식기 순서부터) */
  const CAROUSEL = ['example-11', 'example-15', 'example-18', 'calendar', 'example-17', 'example-3', 'example-7', 'example-8', 'example-19', 'example-5'];
  /* 10/26: 'Ai' 자리는 툴 아이콘이 차례로 바뀌고(피그마 4003:10053~10057), 러너 칩은 위로 밀려 올라오며 바뀌어요(4003:10029~10045) */
  const TOOLS = ['ai.png', 'tool-blender.png', 'tool-figma.png', 'tool-rhino.png', 'tool-ps.png'];
  const RUNNERS = [['avatar-seed.svg', '새싹 2019'], ['avatar-cyan.svg', '씨앗 4431'], ['avatar-yellow.svg', '줄기 5493'], ['avatar-orange.svg', '이파리 6943']];
  const STAGE = '다음 단계를 이어서 완성해줄 러너를 기다려요.';

  const check = (strong, light, boldFirst = true) => `<li><img src="${A}check.svg" width="28" height="28" alt="">
    <p>${boldFirst ? `<b>${strong}</b> — ${light}` : `${light}<b>${strong}</b>`}</p></li>`;

  function card(r, saved) {
    const img = r.thumbnails?.[0]?.url;
    const tools = (r.displayTools?.length ? r.displayTools : [...new Set(r.tools || [])]).slice(0, 3);
    const tags = (r.displayTags?.length ? r.displayTags : [...new Set(r.tags?.length ? r.tags : (r.category || []))]);
    const uniq = [...new Set(tags)].slice(0, 4);
    const about = (r.summary || r.note?.remaining || '').trim();
    const desc = about ? (about.includes('러너') ? about : `${about.replace(/[.。]\s*$/, '')}. ${STAGE}`) : STAGE;
    const author = typeof r.author === 'object' ? r.author?.name : r.author;
    const likes = r.displayStats?.comments ?? r.commentCount ?? 0;
    const relay = r.displayStats?.relay ?? r.relayCount ?? 0;
    return `<article class="ld-card" data-baton="${E(r.id)}">
      <a class="ld-card-link" href="#/baton/${encodeURIComponent(r.id)}" aria-label="${E(r.title)} 상세 보기">
        <span class="ld-card-img">${img ? `<img src="${E(img)}" alt="" loading="lazy" decoding="async">` : ''}</span>
        <span class="ld-card-cover" aria-hidden="true">${img ? `<img src="${E(img)}" alt="" loading="lazy" decoding="async">` : ''}</span>
        <span class="ld-card-frost" aria-hidden="true"></span>
        <span class="ld-card-info" aria-hidden="true">
          <strong>${E(r.title)}</strong>
          <span class="ld-card-desc">${E(desc)}</span>
          ${tools.length ? `<span class="ld-chips">${tools.map(t => `<span>${E(t)}</span>`).join('')}</span>` : ''}
          ${uniq.length ? `<span class="ld-chips">${uniq.map(t => `<span>${E(t)}</span>`).join('')}</span>` : ''}
          ${author ? `<span class="ld-card-by">by. ${E(author)}</span>` : ''}
          <span class="ld-card-stats"><span><img src="${A}bookmark.svg" width="15" height="15" alt="">${likes}</span><span><img src="${A}relay.svg" width="15" height="15" alt="">${relay}</span></span>
        </span>
      </a>
      <button class="ld-card-save" type="button" data-save-baton="${E(r.id)}" aria-pressed="${saved}" aria-label="${E(r.title)} ${saved ? '저장 해제' : '저장'}">저장 <img src="${A}bookmark.svg" width="15" height="15" alt=""></button>
    </article>`;
  }

  function markup(items, bookmarks) {
    const list = CAROUSEL.map(id => items.find(r => r.id === id)).filter(r => r?.thumbnails?.[0]?.url);
    const cards = list.map(r => card(r, bookmarks?.has?.(r.id))).join('');
    return `<section class="ld" aria-label="모로가도 소개">
    <div class="ld-canvas">
      <img class="ld-road" src="${A}road.svg" alt="" aria-hidden="true">
      <img class="ld-deco ld-deco-yellow" src="${A}path-yellow.png" alt="" aria-hidden="true">
      <img class="ld-deco ld-deco-mint" src="${A}path-mint.png" alt="" aria-hidden="true">

      <h1 class="ld-hero">
        <span class="ld-row ld-row1"><span>멈춘</span><span class="ld-tools" role="img" aria-label="일러스트레이터·블렌더·피그마·라이노·포토샵 작업">${TOOLS.map((t, i) => `<img class="ld-tool${i ? '' : ' is-on'}" src="${A}${t}" width="78" height="78" alt="">`).join('')}</span><span>작업이</span></span>
        <span class="ld-row ld-row2"><span class="ld-chipbox" aria-label="새싹 2019 같은 다음 러너">${RUNNERS.map(([a, n], i) => `<span class="ld-runner-chip${i ? '' : ' is-on'}"${i ? ' aria-hidden="true"' : ''}><img src="${A}${a}" width="40" height="40" alt=""><span class="ld-chip-name">${n}</span></span>`).join('')}</span><span>다음 디자이너와</span></span>
        <span class="ld-row ld-row3"><span>다시 출발하는 곳</span><img class="ld-runner" src="${A}runner.png" width="110" height="79" alt=""></span>
      </h1>
      <p class="ld-sub ld-sub1">디자인 전공자 2명 중 1명은 멈춘 작업을 갖고 있어요.</p>
      <p class="ld-sub ld-sub2"><img src="${A}logo.svg" width="140" height="19" alt="모로가도"><span>에서 멈춘 작업을 <b>바톤처럼 넘기고</b>, <b>이어받아요.</b></span></p>
      <div class="ld-cta">
        <a class="ld-btn ld-btn-dark" href="#/upload">내 멈춘 작업 되살리기</a>
        <a class="ld-btn ld-btn-soft" href="#/explore">영감 찾으러 가기<img src="${A}arrow-right.svg" width="24" height="24" alt=""></a>
      </div>

      <h2 class="ld-q"><span class="ld-q1">어디서 출발해야 할 지 모르겠다면?</span><span class="ld-q2"><i>찾으면 </i>이어받고, <i>없으면 </i>넘기면 돼요.</span></h2>
      <button class="ld-search" type="button" aria-label="이 검색어로 바톤 찾아보기">
        <img src="${A}search-big.svg" width="36" height="36" alt="">
        <span class="ld-search-text" aria-live="off">${E(PHRASES[0].text)}</span><i class="ld-caret" aria-hidden="true"></i>
      </button>

      <article class="ld-panel ld-panel-take">
        <img class="ld-panel-shape" src="${A}card-shape.svg" alt="" aria-hidden="true">
        <span class="ld-pill">바톤 이어받기</span>
        <div class="ld-copy"><h3>누군가 남긴 바톤,<br>내 다음 작업의 영감이 될지도 몰라요.</h3><p>마음에 드는 바톤을 눌러 보세요. 원본 파일을 받아 바로 이어서 작업할 수 있어요 :)</p></div>
        <div class="ld-rail"><div class="ld-track">${cards}${cards.replace(/<article /g, '<article aria-hidden="true" inert ')}</div></div>
        <ul class="ld-checks">
          ${check('원본 파일째 받아요', 'AI · PSD · OBJ 등 원작 레이어 그대로!')}
          ${check('다른 디자이너의 과정까지 배워요', '어디서 왜 멈췄는지 알 수 있어요!')}
          ${check('마음 놓고 이어 써요', '원작자가 직접 넘긴 바톤이에요!')}
        </ul>
        <a class="ld-glow" href="#/explore"><img src="${A}button-glow.svg" alt="" aria-hidden="true"><span>이어받을 바톤 찾아보기</span></a>
      </article>

      <article class="ld-panel ld-panel-give">
        <img class="ld-panel-shape" src="${A}card-shape.svg" alt="" aria-hidden="true">
        <span class="ld-pill">바톤 올리기</span>
        <div class="ld-copy"><h3>내가 하다 멈춘 작업,<br>누군가에겐 출발점이 돼요.</h3><p>여기 두고 가세요. 파일만 넣으면 AI와 함께 정리해요.</p></div>
        <div class="ld-desk">
          <button class="ld-drop" type="button" aria-label="파일을 끌어다 놓거나 눌러서 바톤 올리기 시작하기">
            <img src="${A}upload.svg" width="62" height="62" alt="">
            <span class="ld-drop-text">Drag&amp;Drop으로 업로드 시작하기</span>
            <span class="ld-drop-hint">PDF/JPG/AI/PSD 어떤 파일이든 올려보세요 :)</span>
          </button>
          <img class="ld-finder" src="${A}finder.png" width="404" height="195" alt="" aria-hidden="true">
          <input class="ld-file" type="file" multiple hidden>
        </div>
        <ul class="ld-checks">
          ${check('3분이면 끝나요', '제목 · 설명 · 진척도 등 10개 항목을 AI와 함께 채워요!')}
          ${check('멈춘 그대로 괜찮아요', '멈춘 지점이 누군가의 출발점이 돼요!')}
          ${check('나도 잊은 작업 의도까지', '정리 과정에서 또 다른 영감을 얻어요!')}
        </ul>
        <a class="ld-glow" href="#/upload"><img src="${A}button-glow.svg" alt="" aria-hidden="true"><span>내 작업 올리기</span></a>
      </article>
    </div>
  </section>`;
  }

  let stop = [];
  function teardown() { stop.forEach(f => { try { f(); } catch { /* 이미 정리됨 */ } }); stop = []; }

  /* 검색창 타이핑: 지우고 → 다음 문구를 한 글자씩 */
  function typing(root, M) {
    const box = root.querySelector('.ld-search'), out = root.querySelector('.ld-search-text');
    let i = 0, timer = 0, alive = true;
    const wait = ms => new Promise(r => { timer = setTimeout(r, ms); });
    const go = () => { const p = PHRASES[i]; const input = document.getElementById('site-search'); const form = document.getElementById('search-form');
      if (input && form) { input.value = p.query; form.requestSubmit(); } else M?.navigate?.('/explore'); };
    box.addEventListener('click', go);
    if (!reduce.matches) (async () => {
      while (alive) {
        await wait(2600); if (!alive) return;
        const cur = out.textContent;
        for (let n = cur.length; n >= 0 && alive; n--) { out.textContent = cur.slice(0, n); await wait(34); }
        i = (i + 1) % PHRASES.length; const next = PHRASES[i].text;
        await wait(260);
        for (let n = 1; n <= next.length && alive; n++) { out.textContent = next.slice(0, n); await wait(80); }
      }
    })();
    stop.push(() => { alive = false; clearTimeout(timer); });
  }

  /* 툴 아이콘은 톡 튀어나오며, 러너 칩은 아래에서 위로 밀려 올라오며 바뀌어요. 칩은 툴보다 살짝 늦게 */
  function cycle(root) {
    if (reduce.matches) return;
    const timers = [];
    const rotate = (sel, ms, delay) => {
      const items = [...root.querySelectorAll(sel)]; if (items.length < 2) return;
      let i = 0;
      const tick = () => {
        const cur = items[i], next = items[(i + 1) % items.length];
        cur.classList.remove('is-on'); cur.classList.add('is-off'); cur.setAttribute('aria-hidden', 'true');
        next.classList.remove('is-off'); void next.offsetWidth; next.classList.add('is-on'); next.removeAttribute('aria-hidden');
        setTimeout(() => cur.classList.remove('is-off'), 700);
        i = (i + 1) % items.length;
      };
      timers.push(setTimeout(() => { tick(); timers.push(setInterval(tick, ms)); }, delay));
    };
    rotate('.ld-tool', 2400, 1800);
    rotate('.ld-runner-chip', 2400, 2400);
    stop.push(() => timers.forEach(t => { clearTimeout(t); clearInterval(t); }));
  }

  /* 이어받기 줄: 천천히 왼쪽으로 흐르고, 카드에 올리면 멈춰요 */
  function rail(root) {
    const railEl = root.querySelector('.ld-rail'), track = root.querySelector('.ld-track');
    if (!track.children.length) return;
    let x = 0, last = 0, raf = 0, paused = false, half = 0;
    const measure = () => { half = track.scrollWidth / 2; };
    measure();
    const step = t => {
      const dt = last ? Math.min(64, t - last) : 16; last = t;
      if (!paused && half) { x -= dt * 0.028; if (-x >= half) x += half; track.style.transform = `translate3d(${x}px,0,0)`; }
      raf = requestAnimationFrame(step);
    };
    /* 처음엔 시안처럼 둘째 칸(오토바이)이 정보를 보여 주는 자리에 오도록 살짝 왼쪽에서 시작 */
    const first = track.querySelector('.ld-card');
    if (first) { const w = first.getBoundingClientRect().width; x = -w * 0.6; track.style.transform = `translate3d(${x}px,0,0)`; }
    const on = () => { paused = true; }, off = () => { paused = false; };
    railEl.addEventListener('pointerenter', on); railEl.addEventListener('pointerleave', off);
    railEl.addEventListener('focusin', on); railEl.addEventListener('focusout', off);
    addEventListener('resize', measure);
    if (!reduce.matches) raf = requestAnimationFrame(step);
    stop.push(() => { cancelAnimationFrame(raf); removeEventListener('resize', measure); });
  }

  /* 올리기 칸: 파일을 끌어다 놓거나 누르면 바로 메이커 1단계로(독 플러스와 같은 방식) */
  function drop(root, M) {
    const zone = root.querySelector('.ld-desk'), btn = root.querySelector('.ld-drop'), input = root.querySelector('.ld-file');
    const hand = files => { if (files?.length && window.Morogado) window.Morogado.pendingFiles = [...files]; M?.navigate ? M.navigate('/upload') : (location.hash = '/upload'); };
    btn.addEventListener('click', () => input.click());
    input.addEventListener('change', () => hand(input.files));
    const over = e => { e.preventDefault(); zone.classList.add('is-over'); };
    const leave = e => { if (!zone.contains(e.relatedTarget)) zone.classList.remove('is-over'); };
    zone.addEventListener('dragenter', over); zone.addEventListener('dragover', over); zone.addEventListener('dragleave', leave);
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('is-over'); hand(e.dataTransfer?.files); });
  }

  /* 아래 두 카드는 화면에 들어올 때 살짝 떠올라요 */
  function reveal(root) {
    const items = root.querySelectorAll('.ld-q, .ld-search, .ld-panel');
    if (reduce.matches || !('IntersectionObserver' in window)) return;
    items.forEach(el => el.classList.add('ld-pre'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('ld-pre'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    items.forEach(el => io.observe(el));
    stop.push(() => io.disconnect());
  }

  function render({ main, items = [], bookmarks }) {
    teardown();
    main.innerHTML = markup(items, bookmarks);
    const root = main.querySelector('.ld'), M = window.Morogado;
    typing(root, M); cycle(root); rail(root); drop(root, M); reveal(root);
  }

  window.MorogadoLanding = { render, teardown };
})();
