/* 11/5 바톤 기록(#/community) — 피그마 '바톤 기록 · 바톤 로그'(4303:455) / '주니어 디자이너 커뮤니티'(4315:466)
 * 탭: #/community = 바톤 로그, #/community/talk = 주니어 디자이너 커뮤니티 (헤더 아래 hd-sub에서 바꿔요)
 * 바톤 로그: 평소엔 상세페이지 릴레이 로그처럼 흰 칸, 블록에 마우스를 올리면 첫 칸이 지아가 디자인한 카드로 커지고
 *            '나도 이어달리기'가 원 → 알약으로 펼쳐져요. 썸네일에 올리면 살짝 떠오르며 "○○ 상세" 라벨.
 * 커뮤니티: 노트폴리오 커뮤니티 구조. 글·댓글·좋아요는 이 브라우저(localStorage)에 저장돼요. */
(function () {
  const A = 'assets/relay/', V = '?v=1106f';
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const AV = ['avatar-cyan', 'avatar-seed', 'avatar-orange', 'avatar-yellow', 'avatar-cyan'];
  const BATONS = [
    { id: 'a', title: '부착형 스마트글래스 AppleSight', meta: '스케치 한 장에서 브랜드 장표까지', cheer: 128,
      steps: ['미래형 안경 스케치', '측면 바 모델링', '안경 기능 발전 및 장표', '스마트 글래스 화면 UI디자인', '부착형 스마트글래스 AppleSight'] },
    { id: 'c', title: 'Cupid-Tape delivery', meta: '기획 한 장이 렌더링으로 피어났어요', cheer: 96,
      steps: ['테이프 디스펜서 기획', '테이프 디스펜서 스케치', '큐피드 테이프 디스펜서', '테이프 디스펜서 재질 렌더', 'Cupid-Tape delivery'] },
    { id: 'b', title: '스마트폰 악세서리 브랜드, BELLICK', meta: '기획 · 브랜딩 · 모델링 · 만화, 다섯 갈래로 뻗었어요', cheer: 74,
      steps: ['스마트폰 악세서리 기획', '스마트폰 악세서리 브랜딩', '케이스, 그립톡, 태그홀더 모델링', '브랜딩 설명 만화', '스마트폰 악세서리 브랜드, BELLICK'] }
  ];
  const ICON = {
    chev: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M8 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M4 11h14M12 5l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    eye: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M1.8 10S5 4.5 10 4.5 18.2 10 18.2 10 15 15.5 10 15.5 1.8 10 1.8 10Z" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="2.6" stroke="currentColor" stroke-width="1.5"/></svg>',
    talk: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 4.5h13v9H9l-4 3v-3H3.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 16.5S3 12.4 3 7.6A3.6 3.6 0 0 1 10 6a3.6 3.6 0 0 1 7 1.6c0 4.8-7 8.9-7 8.9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.6"/><path d="m13.2 13.2 3.6 3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    pen: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M12.8 3.7l3.5 3.5L7.5 16H4v-3.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  const hero = () => `<nav class="rl-mtabs" aria-label="바톤 기록 메뉴"><a href="#/community"${current && current.tab === 'talk' ? '' : ' aria-current="page"'}>바톤 로그</a><a href="#/community/talk"${current && current.tab === 'talk' ? ' aria-current="page"' : ''}>주니어 디자이너 커뮤니티</a></nav><header class="rl-hero"><h1><b>멈췄던 작업,</b> 그 뒤로<br><b>어디까지 달렸을까요?</b></h1></header>`;

  function block(b) {
    const nodes = b.steps.map((s, i) => { const n = i + 1, img = i ? `${A}${b.id}${n}.webp${V}` : `${A}${b.id}1.webp${V}`, card = i ? `${A}card-${b.id}${n}.webp${V}` : `${A}card-${b.id}.webp${V}`;
      return `<span class="rl-node" data-i="${i}" tabindex="0" aria-label="${n}번째 러너 · ${E(s)}"><span class="rl-face"><img src="${img}" alt="" ${i > 1 ? 'loading="lazy"' : ''}></span><img class="rl-card" src="${card}" alt="" aria-hidden="true" ${i > 1 ? 'loading="lazy"' : ''}></span>`; }).join('');
    return `<article class="rl-block" tabindex="-1">
      <div class="rl-info">
        <div class="rl-name"><h3>${E(b.title)}</h3><p>${E(b.meta)}</p></div>
        <div class="rl-foot">
          <div class="rl-runners"><span class="rl-avs">${AV.map(a => `<img src="assets/landing/${a}.svg" alt="">`).join('')}</span><span><b>chanwoo kim.</b> 외 4명이 함께 이어달렸어요.</span></div>
          <div class="rl-pills"><span>러너 <b>5명</b></span><span>이어받기 <b>4번</b></span><span>응원 <b>👏 ${b.cheer}</b></span></div>
          <a class="rl-join" href="#/upload"><span class="rl-join-bg" aria-hidden="true"></span><span class="rl-join-ic" aria-hidden="true"><i class="rl-chev">${ICON.chev}</i><i class="rl-arrow">${ICON.arrow}</i></span><span class="rl-join-tx">나도 이어달리기</span></a>
        </div>
      </div>
      <div class="rl-panel" aria-label="${E(b.title)} 릴레이 로그"><div class="rl-rail">${nodes}</div></div>
    </article>`;
  }

  function renderLog(root) {
    root.innerHTML = `<section class="rl-page">${hero()}
      <section class="rl-sec">
        <div class="rl-sec-head"><div><h2><span>지난 주,</span><b>주목받았던 릴레이 로그</b></h2><p>다음 디자이너의 손을 거칠 때마다 바톤은 조금씩 자라요.</p></div><a class="rl-more" href="#/explore">더 많은 바톤 로그 보러가기 ${ICON.arrow}</a></div>
        ${block(BATONS[0])}${block(BATONS[1])}
      </section>
      <section class="rl-sec">
        <div class="rl-sec-head"><div><h2><span>다양한 아이디어가</span><b>가장 많이 쏟아진 바톤</b></h2></div></div>
        ${block(BATONS[2])}
      </section></section>`;
    root.querySelectorAll('.rl-panel').forEach(setupPanel);
  }

  /* ===== 주니어 디자이너 커뮤니티 ===== */
  const KEY = 'mg-talk-v1';
  const TOPICS = [['막힌 지점', '#F9B200'], ['피드백 부탁해요', '#00C97F'], ['툴 질문', '#7C8CFF'], ['바톤 이야기', '#00D5E0'], ['완성했어요!', '#FF4093']];
  const color = t => (TOPICS.find(x => x[0] === t) || [, '#BDBDBD'])[1];
  const H = 3600e3, D = 24 * H, now = Date.now();
  const SEED = [
    { id: 's1', topic: '피드백 부탁해요', title: '포스터 위계가 잘 읽히는지 봐주실 수 있을까요…?', body: '졸업전시 포스터인데 제목이랑 날짜가 서로 싸우는 느낌이에요. 바톤으로도 올려뒀는데, 어디부터 손보면 좋을지 한마디씩 남겨주시면 이어서 다듬어볼게요…!', author: 'runner_04', views: 42, likes: 3, at: now - 40 * 60e3, comments: [{ author: 'pinscherr', text: '날짜를 제목 아래로 내리고 크기를 반으로 줄여보세요!', at: now - 20 * 60e3 }] },
    { id: 's2', topic: '바톤 이야기', title: '측면 바, 2mm 줄여봤더니 착용감이 확 달라졌어요', body: '미래형 안경 스케치를 이어받아서 모델링했는데요, 스케치 그대로 두께를 잡았더니 너무 투박해서 2mm 줄였어요. 다음 러너분이 장표로 이어가 주시면 좋겠어요.', author: 'Jahyun Park.', views: 88, likes: 19, at: now - 2 * H, link: '측면 바 모델링', comments: [{ author: 'Jihoon Kang', text: '제가 장표로 이어받을게요! 기능 렌더까지 해볼게요.', at: now - H }] },
    { id: 's3', topic: '막힌 지점', title: '3D 렌더링이 자꾸 플라스틱처럼 보여요', body: '재질은 다 넣었는데 조명이 문제인 걸까요? 키샷 쓰고 있고 HDRI는 기본값이에요. 비슷한 고민 해보신 분 계신가요?', author: '방문자', views: 31, likes: 1, at: now - 3 * H, comments: [] },
    { id: 's4', topic: '완성했어요!', title: '멈췄던 테이프 디스펜서, 드디어 패키지까지 나왔어요', body: '반 년 넘게 폴더에만 있던 기획이었는데 세 분이 이어받아 주셔서 끝까지 왔어요. 최종 렌더 공유해요 🙌', author: '4ientist', views: 156, likes: 47, at: now - D, link: 'Cupid-Tape delivery', comments: [] }
  ];
  const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.posts)) return s; } catch { /* 저장소가 없어도 괜찮아요 */ } return { posts: [], extra: {}, liked: [] }; };
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* 저장 공간이 없어도 화면은 그대로 */ } };
  const ago = t => { const m = Math.max(1, Math.round((Date.now() - t) / 60e3)); return m < 60 ? m + '분 전' : m < 1440 ? Math.round(m / 60) + '시간 전' : Math.round(m / 1440) + '일 전'; };
  const me = () => (document.getElementById('runner-name')?.textContent || '방문자').trim() || '방문자';
  let ui = { topic: '전체', sort: 'new', q: '', open: null, compose: false };

  function posts(st) {
    return [...st.posts, ...SEED].map(p => { const x = st.extra[p.id] || {}; return { ...p, comments: [...(p.comments || []), ...(x.comments || [])], likes: (p.likes || 0) + (st.liked.includes(p.id) ? 1 : 0), views: (p.views || 0) + (x.views || 0) }; });
  }

  function renderTalk(root) {
    const st = load(), all = posts(st), name = me();
    let list = all.filter(p => ui.topic === '전체' || p.topic === ui.topic);
    if (ui.q) { const q = ui.q.toLowerCase(); list = list.filter(p => [p.title, p.body, p.author, p.topic].join(' ').toLowerCase().includes(q)); }
    list.sort(ui.sort === 'hot' ? (a, b) => b.likes - a.likes : ui.sort === 'talk' ? (a, b) => b.comments.length - a.comments.length : (a, b) => b.at - a.at);
    const minePosts = st.posts.length, mineComments = Object.values(st.extra).reduce((n, x) => n + (x.comments || []).filter(c => c.mine).length, 0);
    const post = p => {
      const open = ui.open === p.id, liked = st.liked.includes(p.id);
      return `<article class="tk-post${open ? ' is-open' : ''}" data-id="${E(p.id)}">
        <span class="tk-chip"><i style="background:${color(p.topic)}"></i>${E(p.topic)}</span>
        <button class="tk-title" type="button" data-open="${E(p.id)}">${E(p.title)}</button>
        <p class="tk-body">${E(p.body)}</p>
        ${p.link ? `<a class="tk-link" href="#/community">↳ ${E(p.link)}</a>` : ''}
        <p class="tk-author">${E(p.author)}</p>
        <div class="tk-stats"><span>${ICON.eye}${p.views}</span><button type="button" data-open="${E(p.id)}">${ICON.talk}${p.comments.length}</button><button type="button" class="tk-like${liked ? ' is-on' : ''}" data-like="${E(p.id)}" aria-pressed="${liked}">${ICON.heart}${p.likes}</button><time>${ago(p.at)}</time></div>
        ${open ? `<div class="tk-comments">${p.comments.map(c => `<div class="tk-c"><b>${E(c.author)}</b><p>${E(c.text)}</p><time>${ago(c.at)}</time></div>`).join('') || '<p class="tk-empty">아직 댓글이 없어요. 첫 마디를 건네 보세요.</p>'}
          <form class="tk-cform" data-comment="${E(p.id)}"><input name="t" maxlength="300" placeholder="${E(name)} 님, 따뜻한 한마디를 남겨 주세요" required><button>남기기</button></form></div>` : ''}
      </article>`;
    };
    root.innerHTML = `<section class="rl-page">${hero()}
      <section class="tk">
        <aside class="tk-side">
          <p class="tk-mylabel">나의 커뮤니티</p><p class="tk-me">${E(name)}</p>
          <p class="tk-mine">작성글 ${minePosts}<i></i>댓글 ${mineComments}</p>
          <button class="tk-write" type="button" data-compose>${ICON.pen}고민 나누기</button>
          <p class="tk-toplabel">토픽</p>
          <ul class="tk-topics">${['전체', ...TOPICS.map(t => t[0])].map(t => `<li><button type="button" data-topic="${E(t)}"${ui.topic === t ? ' aria-current="true"' : ''}>${E(t)}</button></li>`).join('')}</ul>
        </aside>
        <div class="tk-main">
          <div class="tk-bar"><div class="tk-sort">${[['new', '최신글'], ['hot', '인기글'], ['talk', '댓글 많은 글']].map(([k, l]) => `<button type="button" data-sort="${k}"${ui.sort === k ? ' aria-current="true"' : ''}>${ui.sort === k ? ICON.check : ''}${l}</button>`).join('<i></i>')}</div>
            <label class="tk-search">${ICON.search}<input type="search" placeholder="제목, 내용, 작성자, 태그 검색" value="${E(ui.q)}" data-q></label></div>
          ${ui.compose ? `<form class="tk-compose" data-new><div class="tk-pick">${TOPICS.map(([t], i) => `<label><input type="radio" name="topic" value="${E(t)}"${i ? '' : ' checked'}><span>${E(t)}</span></label>`).join('')}</div>
            <input name="title" maxlength="80" placeholder="제목을 적어 주세요" required><textarea name="body" rows="4" maxlength="2000" placeholder="막힌 곳, 받고 싶은 피드백, 완성 소식까지 편하게 적어 주세요." required></textarea>
            <div class="tk-compose-act"><button type="button" data-cancel>취소</button><button class="tk-submit">올리기</button></div></form>` : ''}
          ${list.map(post).join('') || '<p class="tk-none">조건에 맞는 글이 없어요.</p>'}
        </div>
      </section></section>`;
  }

  let current = null;
  function draw() { if (!current) return; current.tab === 'talk' ? renderTalk(current.main) : renderLog(current.main); }

  function onClick(e) {
    if (!current || current.tab !== 'talk') return;
    const t = e.target.closest('[data-topic],[data-sort],[data-open],[data-like],[data-compose],[data-cancel]');
    if (!t || !current.main.contains(t)) return;
    const st = load();
    if (t.dataset.topic) ui.topic = t.dataset.topic;
    else if (t.dataset.sort) ui.sort = t.dataset.sort;
    else if (t.dataset.open) { const id = t.dataset.open; ui.open = ui.open === id ? null : id; if (ui.open) { const x = st.extra[id] || (st.extra[id] = {}); x.views = (x.views || 0) + 1; save(st); } }
    else if (t.dataset.like) { const id = t.dataset.like; st.liked = st.liked.includes(id) ? st.liked.filter(x => x !== id) : [...st.liked, id]; save(st); }
    else if ('compose' in t.dataset) { ui.compose = true; }
    else if ('cancel' in t.dataset) { ui.compose = false; }
    draw();
    if ('compose' in t.dataset) current.main.querySelector('.tk-compose input[name=title]')?.focus();
  }
  function onSubmit(e) {
    if (!current || current.tab !== 'talk') return;
    const f = e.target; if (!current.main.contains(f)) return;
    e.preventDefault();
    const st = load(), fd = new FormData(f);
    if ('new' in f.dataset) {
      const title = String(fd.get('title') || '').trim(), body = String(fd.get('body') || '').trim(); if (!title || !body) return;
      const id = 'p' + Date.now().toString(36); st.posts.unshift({ id, topic: fd.get('topic'), title, body, author: me(), views: 0, likes: 0, at: Date.now(), comments: [], mine: true });
      save(st); ui.compose = false; ui.topic = '전체'; ui.sort = 'new'; ui.open = id;
    } else if (f.dataset.comment) {
      const text = String(fd.get('t') || '').trim(); if (!text) return;
      const x = st.extra[f.dataset.comment] || (st.extra[f.dataset.comment] = {}); (x.comments || (x.comments = [])).push({ author: me(), text, at: Date.now(), mine: true }); save(st);
    }
    draw();
  }
  let qTimer = 0;
  function onInput(e) {
    if (!current || current.tab !== 'talk' || !e.target.matches('[data-q]')) return;
    clearTimeout(qTimer); const v = e.target.value; qTimer = setTimeout(() => { ui.q = v; draw(); const i = current.main.querySelector('[data-q]'); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } }, 220);
  }
  /* 로그 엔진 — 상세페이지 릴레이 로그(figma-log.js)와 같은 방식.
     칸마다 --x/--y/--w/--h로 자리를 잡고 transform 560ms(.16,1,.3,1)로 움직여요.
     마우스 x에 가장 가까운 칸이 카드로 커지고 바로 옆 칸도 조금 커져요(돋보기). 넘기기는 offset을 0.12씩 따라가는 lerp.
     블록에 처음 들어오면 1번부터 천천히 한 칸씩 훑고, 휠·끌기·마우스를 움직이면 바로 자유롭게. 패널 양 끝에 두면 그쪽으로 스르륵. */
  const S = { base: 156, near: 156, cw: 232, ch: 267, gap: 18, left: 48, right: 96, H: 380 };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function setupPanel(panel) {
    const rail = panel.querySelector('.rl-rail'), nodes = [...rail.querySelectorAll('.rl-node')], block = panel.closest('.rl-block');
    const st = { offset: 0, target: 0, hover: -1, raf: 0, drag: null, auto: null, edge: 0, edgeRaf: 0, timer: 0 };
    const u = () => panel.clientWidth / 736;
    const size = i => st.hover < 0 ? S.base : Math.abs(i - st.hover) === 0 ? null : Math.abs(i - st.hover) === 1 ? S.near : S.base;
    const widthOf = i => size(i) === null ? S.cw : size(i);
    const total = () => nodes.reduce((t, _, i) => t + widthOf(i) + S.gap, S.left - S.gap) + S.right;
    const maxOff = () => Math.max(0, total() - 736);
    function layout() {
      const k = u(); let x = S.left;
      nodes.forEach((n, i) => {
        const sz = size(i), w = sz === null ? S.cw : sz, h = sz === null ? S.ch : sz;
        n.style.cssText = `--x:${x * k}px;--y:${(S.H - h) / 2 * k}px;--w:${w * k}px;--h:${h * k}px;--z:${st.hover === i ? 5 : Math.abs(i - st.hover) === 1 ? 3 : 1}`;
        n.classList.toggle('is-on', sz === null);
        x += w + S.gap;
      });
      rail.style.transform = `translate3d(${-st.offset * k}px,0,0)`;
      panel.classList.toggle('is-scrolled', st.offset > 4);
      panel.classList.toggle('is-end', st.offset >= maxOff() - 4);
    }
    function moveRail() { rail.style.transform = `translate3d(${-st.offset * u()}px,0,0)`; panel.classList.toggle('is-scrolled', st.offset > 4); panel.classList.toggle('is-end', st.offset >= maxOff() - 4); }
    function animate() {
      if (st.raf) return;
      const step = () => {
        const d = st.target - st.offset; st.offset += reduce.matches ? d : d * (st.auto || st.slow ? 0.05 : 0.1); if (Math.abs(d) < 0.4) st.slow = false;
        if (Math.abs(d) < 0.4) st.offset = st.target;
        moveRail(); st.raf = st.offset !== st.target ? requestAnimationFrame(step) : 0;
      };
      st.raf = requestAnimationFrame(step);
    }
    const scrollTo = t => { st.target = Math.max(0, Math.min(maxOff(), t)); animate(); };
    const setHover = i => { if (i === st.hover) return; st.hover = i; st.target = Math.min(st.target, maxOff()); layout(); animate(); };
    const centerOn = i => { let x = S.left; for (let k = 0; k < i; k++) x += widthOf(k) + S.gap; scrollTo(x + S.cw / 2 - 736 / 2); };
    function nodeAt(clientX) {
      const r = panel.getBoundingClientRect(), k = u(), px = (clientX - r.left) / k + st.offset; let x = S.left, best = -1, dist = Infinity;
      nodes.forEach((_, i) => { const w = widthOf(i), c = x + w / 2, d = Math.abs(px - c); if (d < dist) { dist = d; best = i; } x += w + S.gap; });
      return dist < S.cw * .75 ? best : -1;
    }
    // 훑어보기
    function stopAuto() { if (!st.auto) return; st.auto.forEach(clearTimeout); st.auto = null; panel.classList.remove('is-auto'); }
    function playAuto() {
      if (st.auto || reduce.matches) return;
      st.moved = 0; panel.classList.add('is-auto');
      const FIRST = 300, STEP = 1500; st.auto = [];
      nodes.forEach((_, i) => st.auto.push(setTimeout(() => { setHover(i); if (i) centerOn(i); }, FIRST + i * STEP)));
      st.auto.push(setTimeout(() => { stopAuto(); st.hover = -1; layout(); st.target = 0; st.slow = true; animate(); }, FIRST + nodes.length * STEP + 300));
    }
    // 양 끝 호버로 넘기기
    const ZONE = 150, MAXV = 6;
    function edgeLoop() { st.edgeRaf = 0; if (!st.edge || st.auto) return; scrollTo(st.target + st.edge); st.edgeRaf = requestAnimationFrame(edgeLoop); }
    let enteredAt = 0;
    block.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { enteredAt = performance.now(); playAuto(); } });
    block.addEventListener('pointerleave', () => { stopAuto(); clearTimeout(st.timer); st.edge = 0; st.hover = -1; layout(); animate(); });
    panel.addEventListener('pointermove', e => {
      if (st.drag) { const dx = e.clientX - st.drag.x; if (Math.abs(dx) > 4) { st.drag.moved = true; panel.classList.add('is-drag'); } st.target = Math.max(0, Math.min(maxOff(), st.drag.o - dx / u())); st.offset = st.target; moveRail(); return; }
      if (e.pointerType !== 'mouse') return;
      if (st.auto) { st.moved = (st.moved || 0) + Math.abs(e.movementX) + Math.abs(e.movementY); if (performance.now() - enteredAt < 900 || st.moved < 40) return; stopAuto(); }
      st.slow = false;
      const r = panel.getBoundingClientRect(), x = e.clientX - r.left, w = r.width, k = u();
      st.edge = x > w - ZONE * k ? Math.pow((x - (w - ZONE * k)) / (ZONE * k), 2) * MAXV : x < ZONE * k && st.target > 0 ? -Math.pow((ZONE * k - x) / (ZONE * k), 2) * MAXV : 0;
      if (st.edge && !st.edgeRaf) st.edgeRaf = requestAnimationFrame(edgeLoop);
      clearTimeout(st.timer); const cx = e.clientX; st.timer = setTimeout(() => setHover(nodeAt(cx)), 60);
    });
    panel.addEventListener('pointerdown', e => { if (e.button !== 0) return; stopAuto(); st.drag = { x: e.clientX, o: st.target, moved: false }; });
    addEventListener('pointerup', () => { if (st.drag) { st.drag = null; panel.classList.remove('is-drag'); } });
    panel.addEventListener('wheel', e => {
      stopAuto();
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if ((st.target <= 0 && dx < 0) || (st.target >= maxOff() && dx > 0)) return;
      e.preventDefault(); scrollTo(st.target + dx * 0.9 / u());
      clearTimeout(st.timer); const cx = e.clientX; st.timer = setTimeout(() => setHover(nodeAt(cx)), 120);
    }, { passive: false });
    nodes.forEach((n, i) => n.addEventListener('focus', () => { stopAuto(); setHover(i); centerOn(i); }));
    panel.addEventListener('focusout', e => { if (!panel.contains(e.relatedTarget)) { st.hover = -1; layout(); } });
    new ResizeObserver(() => layout()).observe(panel);
    layout();
  }
  addEventListener('scroll', () => { document.body.classList.toggle('rl-scrolled', scrollY > 40); }, { passive: true });
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('input', onInput);

  function syncSub(tab) {
    document.querySelectorAll('.hd-sub [data-sub]').forEach(a => { const on = a.dataset.sub === tab; a.toggleAttribute('aria-current', on); if (on) a.setAttribute('aria-current', 'page'); });
    placeSub();
  }
  // 하위 메뉴 글자를 위 메뉴 '바톤 기록' 글자와 같은 x에서 시작하고, '바톤 올리기' 버튼과 같은 높이 가운데에 놓아요
  function placeSub() {
    const sub = document.querySelector('.site-header .hd-sub'), head = document.getElementById('site-header');
    const nav = document.querySelector('.site-header .hd-nav [data-nav="community"]'), up = document.querySelector('.site-header .hd-upload');
    if (!sub || !head || !nav || !up || getComputedStyle(sub).display === 'none') return;
    const h = (sub.offsetParent || head).getBoundingClientRect(), n = nav.getBoundingClientRect(), u = up.getBoundingClientRect(), first = sub.querySelector('a');
    sub.style.left = '0px'; const lead = first.getBoundingClientRect().left - sub.getBoundingClientRect().left;
    sub.style.left = Math.round(n.left - h.left - lead) + 'px';
    sub.style.top = Math.round(u.top - h.top + u.height / 2 - sub.offsetHeight / 2 + 10 * Math.min(1, Math.max(.72, innerWidth / 1440))) + 'px';
  }
  addEventListener('resize', () => { if (current) placeSub(); });
  document.fonts?.ready?.then(() => { if (current) placeSub(); });

  window.MorogadoRelay = {
    render(main, { tab = 'log' } = {}) {
      current = { main, tab: tab === 'talk' ? 'talk' : 'log' };
      if (current.tab === 'log') ui.open = null;
      syncSub(current.tab); draw();
      document.title = (current.tab === 'talk' ? '주니어 디자이너 커뮤니티' : '바톤 로그') + ' · 바톤 기록 · 모로가도';
    },
    teardown() { current = null; }
  };
})();
