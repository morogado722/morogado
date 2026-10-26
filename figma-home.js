/* 모로가도 홈: Figma 3423:4960 섹션(4961 기본·5361 피드 호버·5133 배너 호버·5573 업로드 모달) 기준 구현 */
(() => {
  'use strict';
  const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  const ic = n => window.Morogado?.icon ? window.Morogado.icon(n) : '';
  const ICON = {
    get relay() { return ic('relay'); },
    get download() { return ic('download'); },
    get bookmark() { return ic('bookmark'); },
    get user() { return ic('user-spark'); },
    get filter() { return ic('filter'); },
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V4m-4.5 4.5L12 4l4.5 4.5M5 14v5h14v-5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>',
  };

  /* 배너 호버 카드 정보 (Figma 5133 형식: 확장자 · 제목 · 소개 · 러너 · 태그 2줄 · 계승/댓글) */
  const HERO_INFO = {
    'feature-0': { tools: ['.blend', '.psd'], title: '스마트 안경 DreamWalk', desc: '걸으면서 쓰는 안경형 기기를 렌더링까지 해 둔 상태예요. 착용 장면과 패키지는 아직 비어 있어서, 생활 속 장면을 이어서 그려 줄 사람을 찾아요.', author: 'jihoon kang.', followers: '팔로워 820', posts: '게시물 34', tags: ['제품 디자인', '3D', '렌더링', '웨어러블', '브랜딩', '패키지', '공예', '오브제'], relay: 2, comments: 18 },
    'feature-1': { tools: ['.psd', '.psd'], title: '인물 화보 AI 프로젝트', desc: '읽힐 아주 작은 여지가 있어요. 3문단의 "자주 함께 시키는 메뉴를 묶어 → 화면의 선택지가 손님 응대를 대신"이 그걸 "고객이 이미 원하던 조합을 찾기로 해요', author: 'chanwoo kim.', followers: '팔로워 1k', posts: '게시물99+', tags: ['제품 디자인', '공예', '오브제', '3D', '브랜딩', '브랜딩', '공예', '오브제', '3D', '제품 디자인'], relay: 1, comments: 34 },
    'feature-2': { tools: ['.ai', '.pdf'], title: '안경테 설계 도면', desc: '치수와 단면까지 정리한 안경테 도면이에요. 3D 모델로 옮기는 단계에서 멈췄어요. 도면을 그대로 모델링해 줄 러너를 기다려요.', author: 'jahyun park.', followers: '팔로워 540', posts: '게시물 21', tags: ['제품 디자인', '도면', 'CAD', '아이웨어', '3D', '공예', '오브제', '브랜딩'], relay: 0, comments: 9 },
    'feature-3': { tools: ['.psd', '.mp4'], title: '몸의 움직임 포스터', desc: '점프하는 순간을 흑백으로 잘라낸 포스터 시리즈예요. 세 장 중 한 장만 완성했어요. 같은 톤으로 나머지 두 장을 이어 주세요.', author: 'jia choi.', followers: '팔로워 2.3k', posts: '게시물 88', tags: ['그래픽', '포스터', '사진', '모션', '타이포', '편집', '브랜딩', '캠페인'], relay: 3, comments: 29 },
    'feature-4': { tools: ['.blend', '.zbr'], title: '캐릭터의 표정', desc: '표정 연구용 3D 캐릭터예요. 얼굴은 끝냈고 몸과 의상이 남았어요. 같은 질감으로 전신을 이어서 만들어 볼 분을 찾아요.', author: 'chanwoo kim.', followers: '팔로워 1k', posts: '게시물99+', tags: ['3D', '캐릭터', '모델링', '텍스처', '애니메이션', '오브제', '공예', '그래픽'], relay: 1, comments: 27 }
  };

  /* 피드 카드 추가 정보 (호버 때 살짝 더 보여주는 값) */
  const pick = (arr, i) => arr[i % arr.length];
  const RUNNERS = ['레고 1891', '씨앗 4412', '원석 1203', '과즙 2087', '모래 0730', '바람 5521', '소금 3304'];
  const STAGE_LINES = ['렌더링까지 했어요', '인쇄 직전에 멈췄어요', '형태만 잡았어요', '발표 자료가 비어 있어요', '원본 정리만 남았어요', '컬러 변주가 남았어요', '모델링이 절반 남았어요'];

  let state = null;

  function heroInfo(r, i) {
    const base = HERO_INFO[r.id];
    if (base) return base;
    const tools = r.displayTools?.length ? r.displayTools : (r.tools?.length ? r.tools : ['.psd']);
    const tags = (r.displayTags?.length ? r.displayTags : r.tags?.length ? r.tags : r.category) || [];
    return { tools: tools.slice(0, 2), title: r.title, desc: r.summary || `${pick(STAGE_LINES, i)}. 다음 단계를 이어서 완성해 줄 러너를 기다려요.`, author: pick(['chanwoo kim.', 'jia choi.', 'jahyun park.', 'jihoon kang.'], i), followers: '팔로워 ' + (300 + i * 170), posts: '게시물 ' + (12 + i * 7), tags: [...tags, ...r.category || []].slice(0, 8), relay: r.relayCount ?? 0, comments: r.commentCount ?? 0 };
  }

  function heroCard(r, i, rank = 0) {
    const info = heroInfo(r, i);
    const img = r.thumbnails?.[0]?.url;
    return `<a class="fh-hero-card" href="#/baton/${encodeURIComponent(r.id)}" data-hero="${E(r.id)}" aria-label="${rank ? `지난 주 이어받은 바톤 TOP ${rank}, ${info.comments}명이 이어받음. ` : ''}${E(info.title)} 상세 보기">
      <span class="fh-hero-inner">
        ${img ? `<img src="${E(img)}" alt="" loading="eager" decoding="async">` : ''}
        <span class="fh-hero-shade" aria-hidden="true"></span>
        ${rank ? `<span class="fh-hero-rank" aria-hidden="true"><b>TOP ${rank}</b><span>지난 주,<br><em>${info.comments}명</em>이 이어 받았어요.</span></span>` : ''}
        <span class="fh-hero-info" aria-hidden="true">
          <span class="fh-hero-tools">${info.tools.map(t => `<span>${E(t)}</span>`).join('')}</span>
          <strong class="fh-hero-title">${E(info.title)}</strong>
          <span class="fh-hero-desc">${E(info.desc)}</span>
          <span class="fh-hero-author"><i class="fh-hero-avatar"></i><span><b>${E(info.author)}</b><small>${E(info.followers)}<em>${E(info.posts)}</em></small></span></span>
          <span class="fh-hero-tags">${info.tags.map(t => `<span>${E(t)}</span>`).join('')}</span>
          <span class="fh-hero-foot"><span class="fh-count">${ICON.relay}<span>${info.relay}</span></span><i class="fh-sep"></i><span class="fh-count">${ICON.download}<span>${info.comments}</span></span><span class="fh-hero-bm">${ICON.bookmark}</span></span>
        </span>
      </span>
    </a>`;
  }

  function feedCard(r, i, ctx, keySuffix = '') {
    const t = r.thumbnails?.[0];
    const tools = (r.displayTools?.length ? r.displayTools : [...new Set(r.tools || [])]).slice(0, 3);
    const tags = (r.displayTags?.length ? r.displayTags : [...new Set(r.tags?.length ? r.tags : (r.category || []))]).slice(0, 4);
    const relay = r.displayStats?.relay ?? r.relayCount ?? 0;
    const comments = r.displayStats?.comments ?? r.commentCount ?? 0;
    const runner = typeof r.author === 'object' ? r.author?.name : (r.author && r.author !== '러너' ? r.author : pick(RUNNERS, i));
    const stage = r.note?.remaining ? r.note.remaining.split(/[.。]/)[0] : pick(STAGE_LINES, i + 3);
    const arts = ['seeding', 'planting', 'growing', 'blooming'];
    const artLabel = { seeding: '방향', planting: '형태', growing: '마감', blooming: '발표' };
    const have = r.artifacts?.length ? r.artifacts : arts.slice(0, 1 + (i % 3));
    const saved = ctx.bookmarks.has(r.id);
    const img = t?.url ? `<img src="${E(t.url)}" alt="" loading="lazy" decoding="async">` : `<span class="fh-empty">미리보기 이미지 없음</span>`;
    const desc = r.note?.remaining ? r.note.remaining.split(/[.。]/)[0] : (r.summary || stage);
    const about = (r.summary || r.note?.intent || r.note?.done || r.note?.remaining || `${stage}. 다음 단계를 이어서 완성해 줄 러너를 기다려요.`).trim();
    const thumb = t?.url ? `<img src="${E(t.url)}" alt="" loading="lazy" decoding="async">` : '';
    /* 뒤집기 카드 (시안 2-B): 앞면은 이미지, 커서를 올리면 제자리에서 천천히 뒤집혀 뒷면에 정보 */
    return `<article class="fh-card" data-baton="${E(r.id)}" data-key="${E(r.id + keySuffix)}" style="--i:${i % 10}">
      <a class="fh-card-link" href="#/baton/${encodeURIComponent(r.id)}" aria-label="${E(r.title)} 상세 보기. 계승 ${relay}개, 다운로드 ${comments}회.">
        <span class="fh-flip">
          <span class="fh-card-base fh-face fh-front"><span class="fh-card-img">${img}</span></span>
          <span class="fh-face fh-back" aria-hidden="true">
            <span class="fh-back-bg">${thumb}</span><span class="fh-back-veil"></span>
            <span class="fh-back-in">
              <strong class="fh-card-title">${E(r.title)}</strong>
              <span class="fh-back-text">${E(about)}</span>
              <span class="fh-back-chips">${[...tools.slice(0, 2), ...tags.slice(0, 3)].map(x => `<span>${E(x)}</span>`).join('')}</span>
              <span class="fh-back-runner">by ${E(runner)}</span>
              <span class="fh-back-stats"><span>${ICON.relay}${relay}</span><span>${ICON.download}${comments}</span></span>
            </span>
          </span>
        </span>
      </a>
      <button class="fh-card-bm" data-save-baton="${E(r.id)}" aria-pressed="${saved}" aria-label="${E(r.title)} ${saved ? '저장 해제' : '저장'}">${ICON.bookmark}</button>
    </article>`;
  }

  /* ---------- 렌더 ---------- */
  function render(ctx) {
    teardown();
    const { main, items, hero, nickname, filter, query, defaultFeed, all } = ctx;
    const chips = [['all', `${ICON.user}<span>For ${E(nickname)}</span>`], ['deadline', '기한 있는 바톤'], ['first', '첫 계승을 기다리는 바톤'], ['deep', '족보 깊은 바톤'], ['reborn', '다시 태어난 바톤']];
    main.innerHTML = `<div class="fh-home">
      <div class="fh-deco" aria-hidden="true"><svg viewBox="0 0 1440 1100" preserveAspectRatio="none"><image href="assets/director-reference/home-vector-0.svg" x="713" y="708" width="357" height="544"/><image href="assets/director-reference/home-vector-1.svg" x="0" y="637" width="262" height="189"/><image href="assets/director-reference/home-vector-2.svg" x="996" y="0" width="444" height="204"/><image href="assets/director-reference/home-vector-3.svg" x="1137" y="558" width="303" height="239"/><image href="assets/director-reference/home-vector-4.svg" x="0" y="48" width="609" height="273"/></svg></div>
      <section class="fh-hero" aria-labelledby="fh-hero-title">
        <h1 class="fh-h1" id="fh-hero-title">지난 주,<br>가장 많이 이어받은 바톤&nbsp; TOP5</h1>
        <div class="fh-hero-strip" data-count="5"></div>
        <a class="fh-more" href="#/saved"><span>전체 보기</span>${ICON.arrow}</a>
      </section>
      <section class="fh-feed${defaultFeed ? '' : ' is-filtered'}" aria-labelledby="fh-feed-title">
        <div class="fh-feed-tab" aria-hidden="true"></div>
        <h2 class="fh-h2" id="fh-feed-title">${query ? `‘${E(query)}’ 검색 결과` : `<u>${E(nickname)}님</u>이 마음에 들어하실 만한 바톤`}</h2>
        <div class="fh-chips">${chips.map(([k, label]) => `<button class="fh-chip${k === 'all' ? ' fh-chip-for' : ''}" data-feed-filter="${k}" aria-pressed="${filter.kind === k}">${label}</button>`).join('')}<button class="fh-chip fh-chip-filter" data-action="filter" aria-label="분야·산출물·정렬 필터">${ICON.filter}</button></div>
        <div class="fh-grid" role="list"></div>
        <div class="fh-sentinel" aria-hidden="true"><span></span><span></span><span></span></div>
      </section>
    </div>`;

    const grid = main.querySelector('.fh-grid');
    const strip = main.querySelector('.fh-hero-strip');
    const infinite = !!defaultFeed;
    rand = seeded(FEED_SEED);
    const pool = uniqueByImage(infinite ? shuffle(items) : items);
    state = { ctx, main, grid, strip, page: 0, pool, queue: pool.slice(), infinite, round: 0, all, observer: null, active: null, timer: null, closeTimers: new Map(), heroActive: null, heroTimer: null, cols: 0, loading: false };

    if (!items.length) {
      grid.outerHTML = `<div class="fh-empty-state"><h3>아직 맞는 바톤이 없어요.</h3><p>검색어나 필터를 바꾸면 다른 바톤을 찾을 수 있어요.</p><button class="fh-btn" data-action="reset-search">전체 바톤 보기</button></div>`;
      main.querySelector('.fh-sentinel').remove();
    } else {
      layoutHero();
      /* 배너에 나온 이미지는 피드에서 빼서 화면 안에 같은 그림이 두 번 나오지 않게 */
      if (state.heroKeys) { state.pool = state.pool.filter(r => !state.heroKeys.has(imageKey(r))); state.queue = state.pool.slice(); }
      appendPage(true);
      setupInfinite();
    }
    layoutHero();
    bind();
  }

  function columns() {
    const g = state?.grid; if (!g || !g.isConnected) return 5;
    const n = getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length;
    return Math.max(2, n || 5);
  }

  function layoutHero() {
    if (!state) return;
    const cols = columns();
    if (cols === state.cols && state.strip.children.length) return;
    state.cols = cols;
    const { hero, all } = state.ctx;
    const extra = all.filter(r => r.example && !r.id.startsWith('feature-') && r.thumbnails?.[0]?.url && !r.demoRelay && !['calendar-red', 'calendar-peach'].includes(r.id));
    /* 10/26: 지난 주 이어받은 수(다운로드 수) 많은 순으로 TOP5 */
    const list = [...hero].sort((a, b) => heroInfo(b, 0).comments - heroInfo(a, 0).comments);
    const ranked = list.length;
    if (!state.heroExtra) state.heroExtra = shuffle(extra);
    for (let i = 0; list.length < cols && i < state.heroExtra.length; i++) list.push(state.heroExtra[i]);
    state.heroKeys = new Set(list.map(imageKey));
    state.strip.style.setProperty('--cols', cols);
    state.strip.innerHTML = list.slice(0, cols).map((r, i) => heroCard(r, i, i < ranked ? i + 1 : 0)).join('');
  }

  /* 피드: 매번 무작위 순서, 같은 이미지는 한 번만. 다 보여 주면 새로 섞되 방금 본 것과 이어지지 않게 */
  /* 섞는 순서는 페이지를 열 때 한 번 정한 씨앗을 따라요. 상세에 갔다가 뒤로 와도 같은 순서라 방금 누른 카드가 그 자리에 있어요 (10/16) */
  const FEED_SEED = (Math.random() * 4294967296) >>> 0;
  const seeded = seed => () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let rand = seeded(FEED_SEED);
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function imageKey(r) { return (r.thumbnails?.[0]?.url || r.id).split('?')[0]; }
  function uniqueByImage(list) {
    const seen = new Set();
    return list.filter(r => { const k = imageKey(r); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  function nextItem(recent) {
    if (!state.queue.length) {
      if (!state.infinite) return null;
      state.round++;
      let q = shuffle(state.pool);
      const avoid = new Set(recent.map(imageKey));
      const head = q.filter(r => !avoid.has(imageKey(r))), tail = q.filter(r => avoid.has(imageKey(r)));
      state.queue = [...head, ...tail];
    }
    return state.queue.shift();
  }
  function appendPage(first = false) {
    const { pool, grid } = state; if (!pool.length) return;
    const cols = columns();
    const shown = grid.children.length;
    let size = first ? Math.max(cols, Math.ceil(Math.min(pool.length, cols * 4) / cols) * cols) : cols * 3;
    if (!state.infinite) size = Math.min(size, state.queue.length);
    const html = [];
    const recent = [...grid.querySelectorAll('.fh-card')].slice(-cols * 2).map(el => state.pool.find(r => r.id === el.dataset.baton)).filter(Boolean);
    for (let k = 0; k < size; k++) {
      const r = nextItem(recent); if (!r) break;
      recent.push(r); if (recent.length > cols * 2) recent.shift();
      html.push(feedCard(r, shown + k, state.ctx, state.round ? '#' + state.round : ''));
    }
    if (!state.infinite && !state.queue.length) state.main.querySelector('.fh-sentinel')?.classList.add('is-done');
    const frag = document.createRange().createContextualFragment(html.join(''));
    const added = [...frag.children];
    if (!first) added.forEach(el => el.classList.add('fh-enter'));
    grid.append(frag);
    if (!first) requestAnimationFrame(() => requestAnimationFrame(() => added.forEach(el => el.classList.remove('fh-enter'))));
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 300));
    idle(() => added.forEach(el => el.querySelector('img')?.decode?.().catch(() => {})));
    state.page++;
  }

  function setupInfinite() {
    const sentinel = state.main.querySelector('.fh-sentinel');
    if (!sentinel) return;
    const check = () => {
      if (!state || state.loading || !sentinel.isConnected || sentinel.classList.contains('is-done')) return;
      if (sentinel.getBoundingClientRect().top > innerHeight + 700) return;
      state.loading = true; sentinel.classList.add('is-loading');
      setTimeout(() => {
        if (!state) return;
        appendPage(); state.loading = false; sentinel.classList.remove('is-loading');
        requestAnimationFrame(check);
      }, reduce.matches ? 0 : 420);
    };
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(check); };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    state.observer = { disconnect() { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf); } };
    requestAnimationFrame(check);
  }

  /* ---------- 피드 카드 호버: 느리고 부드럽게 두 칸으로 펼침 ---------- */
  function openCard(card) {
    if (!state || state.active === card) return;
    if (state.active) closeCard(state.active);
    clearTimeout(state.closeTimers.get(card));
    card.classList.remove('fh-closing');
    fitBack(card);
    card.classList.add('fh-open');
    state.active = card;
  }

  /* 펼친 카드가 화면 밖으로 잘리면, 다 보일 만큼만 천천히 화면을 옮긴다.
     연쇄 방지: 옮기는 동안과 옮긴 뒤 마우스를 실제로 움직이기 전까지는 다른 카드를 열지 않고, 1.5초 안에는 다시 옮기지 않는다 */
  function alignCard(card) {
    if (reduce.matches || state.autoScroll) return;
    if (performance.now() - (state.lastAlign || 0) < 1500) return;
    const r = card.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(state.grid).rowGap) || 10;
    const top = r.top, bottom = r.top + r.height * 2 + gap;
    const header = document.getElementById('site-header')?.getBoundingClientRect();
    const dock = document.querySelector('.floating-dock:not([hidden])')?.getBoundingClientRect();
    const zoneTop = Math.max(0, header ? header.bottom : 0) + 16;
    const zoneBottom = (dock && dock.height ? dock.top : innerHeight) - 16;
    let delta = 0;
    if (bottom > zoneBottom) delta = Math.min(bottom - zoneBottom, top - zoneTop);
    else if (top < zoneTop) delta = top - zoneTop;
    if (Math.abs(delta) < 8) return;
    state.lastAlign = performance.now();
    smoothScrollBy(delta, Math.min(1200, 650 + Math.abs(delta) * 1.3));
  }
  function smoothScrollBy(delta, dur) {
    cancelAnimationFrame(state.scrollRaf);
    const root = document.documentElement, from = scrollY, t0 = performance.now();
    const ease = t => -(Math.cos(Math.PI * t) - 1) / 2;
    root.style.scrollBehavior = 'auto'; /* 사이트의 부드러운 스크롤이 프레임마다 겹치지 않게 */
    state.autoScroll = true; state.hold = true; state.holdAt = null;
    const step = now => {
      if (!state) { root.style.scrollBehavior = ''; return; }
      const k = Math.min(1, (now - t0) / dur);
      scrollTo(0, from + delta * ease(k));
      if (k < 1) { state.scrollRaf = requestAnimationFrame(step); return; }
      root.style.scrollBehavior = '';
      setTimeout(() => { if (state) { state.autoScroll = false; state.holdAt = state.lastPointer || null; } }, 120);
    };
    state.scrollRaf = requestAnimationFrame(step);
    /* 사용자가 직접 스크롤하면 자동 정렬은 즉시 양보 */
    const yieldToUser = () => {
      if (!state || !state.autoScroll) return;
      cancelAnimationFrame(state.scrollRaf); root.style.scrollBehavior = '';
      state.autoScroll = false; state.hold = false;
    };
    addEventListener('wheel', yieldToUser, { passive: true, once: true });
    addEventListener('touchstart', yieldToUser, { passive: true, once: true });
    addEventListener('keydown', yieldToUser, { once: true });
  }

  /* 처음 여는 큰 이미지는 그리는 데 시간이 걸려 끊김 → 커서가 닿는 순간(열기 0.22초 전) 미리 풀고 레이어를 준비 */
  function warm(card) {
    if (card.classList.contains('fh-warm')) return;
    card.classList.add('fh-warm');
    card.querySelectorAll('img').forEach(img => { if (img.decode) img.decode().catch(() => {}); });
  }
  /* 뒷면 글 맞추기: 카드 크기에 맞춰 설명 줄 수(0~3)·제목 줄 수(1~2)를 정해서 겹치거나 줄 중간이 잘리지 않게.
     잘릴 때는 마지막 줄 끝이 '…'로 끝나요. 칩은 줄 단위로만 보이고(반쯤 잘린 칩 없음), 그래도 모자라면 한 줄로 */
  function fitBack(card) {
    const inner = card.querySelector('.fh-back-in'); if (!inner) return;
    const title = inner.querySelector('.fh-card-title'), text = inner.querySelector('.fh-back-text'), chips = inner.querySelector('.fh-back-chips');
    const runner = inner.querySelector('.fh-back-runner'), stats = inner.querySelector('.fh-back-stats');
    [title, text].forEach(el => { if (el) { el.style.webkitLineClamp = ''; el.style.display = ''; } });
    if (chips) chips.style.maxHeight = '';
    const cs = getComputedStyle(inner), gap = parseFloat(cs.rowGap) || 0;
    const room = inner.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 2; /* 반올림 여유 */
    const h = el => el && el.style.display !== 'none' ? el.offsetHeight : 0;
    const line = el => parseFloat(getComputedStyle(el).lineHeight) || 18;
    const visible = () => [title, text, chips, runner, stats].filter(el => el && el.style.display !== 'none');
    const used = () => visible().reduce((sum, el) => sum + h(el), 0) + gap * (visible().length - 1);
    if (text) {
      text.style.webkitLineClamp = '3';
      for (let n = 3; n >= 0 && used() > room; n--) { if (n === 0) text.style.display = 'none'; else text.style.webkitLineClamp = String(n); }
    }
    if (used() > room && runner) runner.style.display = 'none';
    if (used() > room && chips) { const one = chips.firstElementChild?.offsetHeight || 0; chips.style.maxHeight = one + 'px'; }
    if (used() > room && title) title.style.webkitLineClamp = '1';
  }
  function closeCard(card) {
    if (!card) return;
    card.classList.remove('fh-open');
    card.classList.add('fh-closing');
    clearTimeout(state.closeTimers.get(card));
    state.closeTimers.set(card, setTimeout(() => { card.classList.remove('fh-closing', 'fh-warm'); }, reduce.matches ? 0 : 1000));
    if (state.active === card) state.active = null;
  }

  /* ---------- 배너 호버: 커지면서 정보 카드로, 나머지는 물러남 ---------- */
  function openHero(card) {
    if (!state) return;
    state.strip.classList.add('has-active');
    state.strip.querySelectorAll('.fh-hero-card').forEach(c => c.classList.toggle('is-active', c === card));
    state.heroActive = card;
  }
  function closeHero() {
    if (!state) return;
    state.strip.classList.remove('has-active');
    state.strip.querySelectorAll('.fh-hero-card.is-active').forEach(c => c.classList.remove('is-active'));
    state.heroActive = null;
  }

  function bind() {
    const { main } = state;
    const onOver = e => {
      if (!finePointer.matches || state.autoScroll || state.hold) return;
      const card = e.target.closest('.fh-card');
      if (card && !card.contains(e.relatedTarget)) {
        warm(card);
        clearTimeout(state.timer);
        state.timer = setTimeout(() => { if (card.matches(':hover')) openCard(card); }, 220);
      }
      const hero = e.target.closest('.fh-hero-card');
      if (hero && !hero.contains(e.relatedTarget)) {
        hero.querySelectorAll('img').forEach(img => img.decode?.().catch(() => {}));
        clearTimeout(state.heroTimer);
        state.heroTimer = setTimeout(() => { if (hero.matches(':hover')) openHero(hero); }, 140);
      }
    };
    const onOut = e => {
      if (state.autoScroll || state.hold) return;
      const card = e.target.closest('.fh-card');
      if (card && !card.contains(e.relatedTarget)) { clearTimeout(state.timer); closeCard(card); }
      const hero = e.target.closest('.fh-hero-card');
      if (hero && !hero.contains(e.relatedTarget)) {
        clearTimeout(state.heroTimer);
        const next = e.relatedTarget?.closest?.('.fh-hero-card');
        if (!next) state.heroTimer = setTimeout(closeHero, 120);
      }
    };
    const onFocus = e => {
      const card = e.target.closest('.fh-card'); if (card && e.target.matches(':focus-visible')) openCard(card);
      const hero = e.target.closest('.fh-hero-card'); if (hero && e.target.matches(':focus-visible')) openHero(hero);
    };
    const onBlur = e => {
      const card = e.target.closest('.fh-card'); if (card && !card.contains(e.relatedTarget) && !card.matches(':hover')) closeCard(card);
      const hero = e.target.closest('.fh-hero-card'); if (hero && !e.relatedTarget?.closest?.('.fh-hero-card')) closeHero();
    };
    const onKey = e => { if (e.key === 'Escape') { if (state?.active) closeCard(state.active); closeHero(); } };
    let raf = 0;
    const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (state) { state.cols = 0; layoutHero(); } }); };
    /* 화면이 옮겨진 뒤에는 마우스를 6px 이상 실제로 움직였을 때만 다시 판단 */
    const onMove = e => {
      if (!state) return;
      state.lastPointer = { x: e.clientX, y: e.clientY };
      if (!state.hold || state.autoScroll) return;
      const a = state.holdAt;
      if (a && Math.hypot(e.clientX - a.x, e.clientY - a.y) < 6) return;
      if (!a) { state.holdAt = state.lastPointer; return; }
      state.hold = false;
      const under = document.elementFromPoint(e.clientX, e.clientY)?.closest('.fh-card');
      if (state.active && under !== state.active) closeCard(state.active);
      if (under && under !== state.active) { warm(under); clearTimeout(state.timer); state.timer = setTimeout(() => { if (under.matches(':hover')) openCard(under); }, 260); }
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    main.addEventListener('pointerover', onOver);
    main.addEventListener('pointerout', onOut);
    main.addEventListener('focusin', onFocus);
    main.addEventListener('focusout', onBlur);
    document.addEventListener('keydown', onKey);
    addEventListener('resize', onResize);
    state.unbind = () => {
      main.removeEventListener('pointerover', onOver); main.removeEventListener('pointerout', onOut); document.removeEventListener('pointermove', onMove);
      main.removeEventListener('focusin', onFocus); main.removeEventListener('focusout', onBlur);
      document.removeEventListener('keydown', onKey); removeEventListener('resize', onResize);
    };
  }

  function teardown() {
    if (!state) return;
    state.observer?.disconnect(); state.unbind?.();
    clearTimeout(state.timer); clearTimeout(state.heroTimer);
    state.closeTimers.forEach(t => clearTimeout(t));
    cancelAnimationFrame(state.scrollRaf); document.documentElement.style.scrollBehavior = '';
    state = null;
  }

  /* ---------- + 버튼 → 업로드 모달 (Figma 5573) ---------- */
  function uploadModal() {
    let dlg = document.getElementById('fh-upload');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'fh-upload'; dlg.className = 'fh-upload';
      dlg.setAttribute('aria-labelledby', 'fh-upload-title');
      dlg.innerHTML = `<div class="fh-upload-panel"><button class="fh-upload-close" type="button" aria-label="닫기">${ICON.close}</button>
        <label class="fh-upload-drop"><input type="file" multiple hidden><span class="fh-upload-en">Upload your file here</span><span class="fh-upload-icon">${ICON.upload}</span><strong id="fh-upload-title">프로젝트 파일을 클릭해서 올리세요</strong><small>여러 파일을 한 번에 올리거나 이곳으로 끌어다 놓아도 돼요.</small></label></div>`;
      document.body.append(dlg);
      const input = dlg.querySelector('input'), drop = dlg.querySelector('.fh-upload-drop');
      const close = () => { dlg.classList.add('is-closing'); setTimeout(() => { dlg.classList.remove('is-closing'); dlg.close(); }, reduce.matches ? 0 : 260); };
      dlg.querySelector('.fh-upload-close').onclick = close;
      dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
      dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
      /* 이미 업로드 화면이면 주소가 그대로라 hashchange 가 안 오니 바로 넘김 */
      const hand = files => { if (!files?.length) return; window.Morogado.pendingFiles = [...files]; close(); setTimeout(() => { if (location.hash.startsWith('#/upload')) deliverPending(); else location.hash = '/upload'; }, 200); };
      input.onchange = () => hand(input.files);
      ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('is-over'); }));
      ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
      drop.addEventListener('drop', e => hand(e.dataTransfer?.files));
    }
    dlg.querySelector('input').value = '';
    if (!dlg.open) dlg.showModal();
  }

  /* 업로드 화면이 열리면 모달에서 고른 파일을 업로드 1단계에 그대로 넘긴다 */
  function deliverPending() {
    const files = window.Morogado?.pendingFiles; if (!files?.length) return;
    let tries = 0;
    const tick = () => {
      const frame = document.querySelector('#upload-root iframe');
      const doc = frame?.contentDocument, win = frame?.contentWindow;
      /* 새 바톤 메이커(maker2): 파일 입력(#file-input)에 그대로 넣어 1단계를 시작.
         메이커가 임시 저장본을 다 불러온 뒤(makerReady)에 넣어야 해요. 그 전에 넣으면 불러오기가 덮어써서 0개가 돼요 */
      const input = doc?.getElementById('file-input');
      if (input && win.DataTransfer && win.MorogaroMaker && doc.documentElement.dataset.makerReady === 'true') {
        const dt = new win.DataTransfer();
        files.forEach(f => dt.items.add(new win.File([f], f.name, { type: f.type })));
        input.files = dt.files;
        input.dispatchEvent(new win.Event('change', { bubbles: true }));
        window.Morogado.pendingFiles = [];
        return;
      }
      if (++tries < 160) setTimeout(tick, 150);
    };
    tick();
  }

  document.addEventListener('click', e => {
    const plus = e.target.closest('.add-baton, .dock-plus');
    if (!plus) return;
    e.preventDefault(); e.stopPropagation();
    plus.classList.remove('is-pressed'); void plus.offsetWidth; plus.classList.add('is-pressed');
    uploadModal();
  }, true);
  addEventListener('hashchange', () => { if (location.hash.startsWith('#/upload')) setTimeout(deliverPending, 50); });

  /* 로고: 뒤틀림 대신 반짝이가 천천히 돌며 빛남 (이미지를 인라인 SVG로 바꿔 반짝이만 움직임) */
  function inlineBrand() {
    const img = document.querySelector('.site-header .brand img');
    if (!img || img.dataset.inlined) return;
    fetch(img.getAttribute('src')).then(r => r.text()).then(svg => {
      const wrap = document.createElement('span');
      wrap.className = 'brand-mark'; wrap.innerHTML = svg;
      const el = wrap.querySelector('svg'); if (!el) return;
      el.setAttribute('aria-hidden', 'true'); el.removeAttribute('width'); el.removeAttribute('height');
      const paths = el.querySelectorAll('path');
      paths[0]?.classList.add('brand-m'); paths[1]?.classList.add('brand-spark');
      img.dataset.inlined = '1'; img.replaceWith(wrap);
    }).catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inlineBrand); else inlineBrand();

  /* 카드를 누르면 그 이미지가 상세 화면의 큰 이미지로 이어지며 커짐 (View Transitions, 지원 브라우저만) */
  document.addEventListener('click', e => {
    const link = e.target.closest?.('.fh-card-link, .fh-hero-card');
    if (!link || !document.startViewTransition || reduce.matches) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#/baton/')) return;
    const card = link.closest('.fh-card');
    const img = (card?.classList.contains('fh-open') ? link.querySelector('.fh-back-thumb img') : null) || link.querySelector('img');
    if (!img) return;
    e.preventDefault();
    img.style.viewTransitionName = 'mg-baton';
    document.documentElement.classList.add('mg-vt');
    let target = null;
    const vt = document.startViewTransition(async () => {
      img.style.viewTransitionName = '';
      location.hash = href.slice(1);
      const t0 = performance.now();
      while (performance.now() - t0 < 900) {
        target = document.querySelector('.detail-main-image img');
        if (target && target.complete) break;
        await new Promise(r => setTimeout(r, 16)); /* 전환 준비 중에는 화면 프레임이 멈춰 rAF가 돌지 않음 */
      }
      if (target) target.style.viewTransitionName = 'mg-baton';
    });
    vt.finished.finally(() => { if (target) target.style.viewTransitionName = ''; document.documentElement.classList.remove('mg-vt'); });
  });

  /* 상세 아래쪽 정리: 1줄 = 다음 사람에게 | 여기서 시작해볼까요?, 그다음 릴레이 로그 → 비슷한 바톤, 댓글은 맨 아래 홀로 */
  function arrangeDetail() {
    const beyond = document.querySelector('.detail-beyond');
    if (!beyond || beyond.dataset.arranged) return;
    const secs = [...beyond.querySelectorAll(':scope > section.detail-section')];
    const find = sel => secs.find(x => x.querySelector(sel));
    const note = find('.detail-note-grid'), log = find('.detail-log-mount'), comments = find('.detail-comments-layout'), recs = find('.detail-recommendations');
    const aside = comments?.querySelector('.detail-suggestion');
    if (!log || !comments) return;
    beyond.dataset.arranged = '1';
    aside?.remove(); /* 위쪽 '지금 바로 이어달리기'와 같은 동작이라 중복 버튼은 뺌 */
    if (recs) log.after(recs);
    beyond.append(comments);
    comments.classList.add('mg-comments');
  }
  /* 첫 화면에 '지금 바로 이어달리기'까지 들어오게: 노트북처럼 낮은 화면이면 오른쪽 정보 판만 줄이고 판 안에서 스크롤 (10/16) */
  function fitDetail() {
    const panel = document.querySelector('.detail-info-panel'), act = document.querySelector('.detail-actions');
    if (!panel || !act) return;
    if (!panel.dataset.natural) { panel.style.maxHeight = panel.style.minHeight = ''; panel.dataset.natural = panel.offsetHeight; }
    const natural = +panel.dataset.natural;
    if (innerWidth >= 1051) {
      const pr = panel.getBoundingClientRect(), below = act.getBoundingClientRect().bottom - pr.bottom;
      const room = Math.floor(innerHeight - (pr.top + scrollY) - below - Math.max(12, 16 * Math.min(1, innerWidth / 1700)));
      if (room < natural) { panel.style.maxHeight = panel.style.minHeight = Math.max(300, room) + 'px'; return; }
    }
    panel.style.maxHeight = ''; panel.style.minHeight = natural + 'px'; /* smoothTabs 와 같은 뜻: 탭을 바꿔도 판 높이 그대로 */
  }
  addEventListener('resize', () => { if (location.hash.startsWith('#/baton/')) fitDetail(); });
  /* 바톤 정보 ↔ 파일 목록: 판 높이를 고정해 아래가 들썩이지 않게, 새 내용은 천천히 떠오름 */
  function smoothTabs() {
    const panel = document.querySelector('.detail-info-panel');
    if (!panel || panel.dataset.smooth) return;
    panel.dataset.smooth = '1';
    panel.style.minHeight = panel.offsetHeight + 'px';
    new MutationObserver(ms => ms.forEach(m => {
      const el = m.target;
      if (m.attributeName === 'hidden' && !el.hidden && el.animate && !reduce.matches) {
        el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 460, easing: 'cubic-bezier(.32,.08,.18,1)' });
      }
    })).observe(panel, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
  }
  /* 상세 아래 '다른 러너의 바톤'도 홈과 같은 뒤집기 카드로 */
  let recsBusy = false;
  async function flipRecs() {
    const wraps = [...document.querySelectorAll('.detail-recommendation[data-related-id]:not([data-flip])')];
    if (!wraps.length || recsBusy || !window.Morogado?.store) return;
    recsBusy = true;
    try {
      const all = await window.Morogado.store.list();
      const marks = new Set(await window.Morogado.store.bookmarks?.() || []);
      wraps.forEach((w, i) => {
        const r = all.find(x => x.id === w.dataset.relatedId); if (!r) return;
        w.dataset.flip = '1';
        w.innerHTML = feedCard({ ...r, relayCount: all.filter(x => x.parentId === r.id).length }, i, { bookmarks: marks });
      });
    } finally { recsBusy = false; }
  }
  /* 홈 밖(상세 등)의 뒤집기 카드 호버 */
  let looseTimer = 0, looseActive = null;
  const looseClose = c => { if (!c) return; c.classList.remove('fh-open'); c.classList.add('fh-closing'); setTimeout(() => c.classList.remove('fh-closing', 'fh-warm'), 900); if (looseActive === c) looseActive = null; };
  document.addEventListener('pointerover', e => {
    const c = e.target.closest?.('.detail-recommendation .fh-card'); if (!c || c.contains(e.relatedTarget) || !finePointer.matches) return;
    warm(c); clearTimeout(looseTimer);
    looseTimer = setTimeout(() => { if (!c.matches(':hover')) return; if (looseActive && looseActive !== c) looseClose(looseActive); fitBack(c); c.classList.remove('fh-closing'); c.classList.add('fh-open'); looseActive = c; }, 220);
  });
  document.addEventListener('pointerout', e => {
    const c = e.target.closest?.('.detail-recommendation .fh-card'); if (!c || c.contains(e.relatedTarget)) return;
    clearTimeout(looseTimer); looseClose(c);
  });
  const detailObserver = new MutationObserver(() => { if (location.hash.startsWith('#/baton/')) { arrangeDetail(); fitDetail(); smoothTabs(); flipRecs(); } });
  const startDetailObserver = () => { const m = document.getElementById('main'); if (m) detailObserver.observe(m, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startDetailObserver); else startDetailObserver();

  window.MorogadoHome = { render, teardown, uploadModal };
})();
