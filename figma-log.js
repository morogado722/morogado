/* 모로가도 · 상세의 '이 바톤의 릴레이 로그' (Figma 3423:14299 바톤 로그 페이지 7단계)
   1 안내 오버레이 → 2 노드가 모이며 등장 → 3 가로 탐색·커서 확대(114/78/66)
   4 아래로 갈래 펼침(44) → 5·6 위아래로 갈래 이동 → 7 114×252 정보 카드 */
(() => {
  'use strict';
  const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const S = { base: 66, near: 78, focus: 114, branch: 44, gap: 12, center: 175, railX: 224, origin: 152, card: 252 };
  const HINT_KEY = 'morogado-log-hint-seen';

  function unit(el) {
    let probe = el.querySelector(':scope > .fl-probe');
    if (!probe) { probe = document.createElement('i'); probe.className = 'fl-probe'; probe.setAttribute('aria-hidden', 'true'); el.append(probe); }
    return (probe.getBoundingClientRect().width / 100) || 1;
  }

  function buildTree(record, all) {
    const kids = new Map();
    for (const r of all) if (r.parentId) { if (!kids.has(r.parentId)) kids.set(r.parentId, []); kids.get(r.parentId).push(r); }
    for (const list of kids.values()) list.sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
    const row = [], branch = new Map();
    const flatten = node => { const out = []; const q = [...(kids.get(node.id) || [])]; while (q.length) { const n = q.shift(); out.push(n); q.push(...(kids.get(n.id) || [])); } return out; };
    let cur = record;
    const seen = new Set([record.id]);
    while (cur) {
      const ch = (kids.get(cur.id) || []).filter(c => !seen.has(c.id));
      if (!ch.length) break;
      const [first, ...rest] = ch;
      if (cur !== record && rest.length) branch.set(cur.id, rest.flatMap(r => [r, ...flatten(r)]));
      else if (cur === record && rest.length) rest.forEach(r => { row.push(r); seen.add(r.id); flatten(r).forEach(x => { row.push(x); seen.add(x.id); }); });
      row.push(first); seen.add(first.id); cur = first;
    }
    /* 갈래가 하나도 없으면 줄 중간 노드에 뒤쪽 계승을 갈래로 보여준다(시연 데이터 한정) */
    if (!branch.size && row.length > 8) {
      const mid = Math.floor(row.length / 2);
      branch.set(row[mid].id, row.splice(row.length - 2, 2));
    }
    return { row, branch };
  }

  async function mount(root, record, opts = {}) {
    if (!root) return () => {};
    const M = window.Morogado;
    const all = await M.store.list();
    const { row, branch } = buildTree(record, all);
    const thumb = r => r.thumbnails?.[0]?.url || '';
    root.innerHTML = `<div class="fl-panel" tabindex="0" aria-label="릴레이 로그. 좌우 화살표로 이동하고 위아래 화살표로 갈래를 살펴봐요. 엔터로 바톤 정보를 열어요.">
      <div class="fl-rail" role="list"></div>
      <div class="fl-fade fl-fade-r" aria-hidden="true"></div>
      <div class="fl-fade fl-fade-l" aria-hidden="true"></div>
      <a class="fl-origin" href="#/baton/${encodeURIComponent(record.id)}" aria-label="지금 보고 있는 바톤: ${E(record.title)}"><span class="fl-origin-img">${thumb(record) ? `<img src="${E(thumb(record))}" alt="">` : ''}</span><span class="fl-origin-label">지금 보고 있는 바톤</span></a>
      <div class="fl-hint" aria-hidden="true"><p>좌우로 움직여<br>전체 로그를 확인할 수 있어요!</p><svg viewBox="0 0 48 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8h44M8 2 2 8l6 6M40 2l6 6-6 6"/></svg></div>
      ${row.length ? '' : '<p class="fl-empty">아직 이어달린 바톤이 없어요. 첫 계승을 기다리고 있어요.</p>'}
    </div>`;
    const panel = root.querySelector('.fl-panel'), rail = root.querySelector('.fl-rail'), hint = root.querySelector('.fl-hint');
    const nodes = row.map((r, i) => {
      const b = branch.get(r.id) || [];
      const el = document.createElement('div');
      el.className = 'fl-node'; el.setAttribute('role', 'listitem'); el.dataset.index = i;
      el.innerHTML = `<button class="fl-tile" type="button" data-id="${E(r.id)}" aria-label="${E(r.title)}${b.length ? `, 갈래 ${b.length}개` : ''}" tabindex="-1"><span class="fl-img">${thumb(r) ? `<img src="${E(thumb(r))}" alt="" loading="lazy">` : ''}</span><span class="fl-card" aria-hidden="true"><span class="fl-card-tag">Tag.</span><strong>${E(r.title)}</strong><span class="fl-card-tags">${[...(r.tags || []), ...(r.category || [])].slice(0, 6).map(t => `<span>${E(t)}</span>`).join('')}</span><span class="fl-card-foot"><span>계승 ${all.filter(x => x.parentId === r.id).length}</span><i></i><span>${E(typeof r.author === 'object' ? r.author?.name : r.author || '러너')}</span></span></span></button>${b.length ? `<span class="fl-branch-dot" aria-hidden="true">${b.length}</span>` : ''}`;
      rail.append(el);
      const branchEls = b.map((c, j) => {
        const be = document.createElement('button');
        be.type = 'button'; be.className = 'fl-tile fl-branch'; be.dataset.id = c.id; be.tabIndex = -1;
        be.setAttribute('aria-label', `${r.title}의 갈래: ${c.title}`);
        be.innerHTML = `<span class="fl-img">${thumb(c) ? `<img src="${E(thumb(c))}" alt="" loading="lazy">` : ''}</span><span class="fl-card" aria-hidden="true"><span class="fl-card-tag">Tag.</span><strong>${E(c.title)}</strong><span class="fl-card-tags">${[...(c.tags || []), ...(c.category || [])].slice(0, 6).map(t => `<span>${E(t)}</span>`).join('')}</span><span class="fl-card-foot"><span>계승 ${all.filter(x => x.parentId === c.id).length}</span><i></i><span>${E(typeof c.author === 'object' ? c.author?.name : c.author || '러너')}</span></span></span>`;
        rail.append(be);
        return be;
      });
      return { el, tile: el.querySelector('.fl-tile'), record: r, branch: b, branchEls };
    });

    const st = { offset: 0, target: 0, hover: -1, v: 0, open: null, entering: !reduce.matches, raf: 0, drag: null, branchTimer: 0, hoverTimer: 0, keyboard: false };

    function maxOffset(u) {
      if (!nodes.length) return 0;
      const width = panel.clientWidth;
      const total = nodes.length * (S.base + S.gap) * u + (S.focus - S.base + 2 * (S.near - S.base)) * u;
      return Math.max(0, S.railX * u + total - width + 120 * u);
    }

    function sizeOf(i) {
      if (st.open && st.open.row === i && st.v === 0) return S.focus;
      if (st.hover < 0) return S.base;
      const d = Math.abs(i - st.hover);
      return d === 0 ? S.focus : d === 1 ? S.near : S.base;
    }

    function layout() {
      const u = unit(panel);
      let x = S.railX;
      nodes.forEach((n, i) => {
        const slot = sizeOf(i);
        const vert = st.hover === i && st.v > 0;
        const enterShift = st.entering ? i * (S.base + S.gap) * 0.55 * Math.min(1, i / 6) : 0;
        const left = x - st.offset / u + enterShift;
        const rowOpen = st.open && st.open.row === i && st.open.branch === -1;
        let w, h, top;
        if (rowOpen) { w = S.focus; h = S.card; top = S.center - S.card / 2; }
        else if (vert) { w = h = S.branch; top = S.center - (S.focus / 2 + S.gap + S.branch / 2) - (st.v - 1) * (S.branch + S.gap) - S.branch / 2; }
        else { w = h = slot; top = S.center - slot / 2; }
        const nx = left + (slot - w) / 2;
        n.el.style.cssText = `--x:${nx * u}px;--y:${top * u}px;--w:${w * u}px;--h:${h * u}px;--z:${st.hover === i ? 5 : 1};--o:${vert && st.v > 1 ? .45 : 1}`;
        n.el.classList.toggle('is-hover', st.hover === i);
        n.el.classList.toggle('is-open', !!rowOpen);
        n.el.classList.toggle('is-up', vert);
        const show = st.hover === i && (st.branchOpen || st.v > 0);
        n.branchEls.forEach((be, j) => {
          const rel = (j + 1) - st.v;
          const bOpen = !!(st.open && st.open.row === i && st.open.branch === j);
          const sz = rel === 0 ? S.focus : S.branch;
          const cy = rel === 0 ? S.center : S.center + Math.sign(rel) * (S.focus / 2 + S.gap + S.branch / 2 + (Math.abs(rel) - 1) * (S.branch + S.gap));
          const bw = bOpen ? S.focus : sz, bh = bOpen ? S.card : sz;
          const by = bOpen ? S.center - S.card / 2 : cy - sz / 2;
          const op = show ? (Math.abs(rel) > 2 ? 0 : Math.abs(rel) === 2 ? .45 : 1) : 0;
          be.style.cssText = `--x:${(left + slot / 2 - bw / 2) * u}px;--y:${(show ? by : S.center - S.branch / 2) * u}px;--w:${bw * u}px;--h:${bh * u}px;--z:${rel === 0 ? 6 : 4};--o:${op};--d:${show ? j * 70 : 0}ms`;
          be.classList.toggle('is-show', show && op > 0);
          be.classList.toggle('is-focus', show && rel === 0);
          be.classList.toggle('is-open', bOpen);
          be.tabIndex = show && op > 0 ? 0 : -1;
        });
        x += slot + S.gap;
      });
      panel.classList.toggle('is-scrolled', st.offset > 4);
      panel.classList.toggle('has-hover', st.hover >= 0);
    }

    function animate() {
      cancelAnimationFrame(st.raf);
      const step = () => {
        const d = st.target - st.offset;
        st.offset += reduce.matches ? d : d * 0.12;
        if (Math.abs(d) < 0.4) st.offset = st.target;
        layout();
        if (st.offset !== st.target) st.raf = requestAnimationFrame(step);
      };
      st.raf = requestAnimationFrame(step);
    }
    const scrollTo = t => { st.target = Math.max(0, Math.min(maxOffset(unit(panel)), t)); animate(); };

    function setHover(i) {
      if (i === st.hover) return;
      clearTimeout(st.branchTimer);
      st.hover = i; st.v = 0; st.branchOpen = false; st.open = null;
      layout();
      const n = nodes[i];
      if (n?.branch.length) st.branchTimer = setTimeout(() => { if (st.hover === i) { st.branchOpen = true; layout(); } }, reduce.matches ? 0 : 380);
    }
    function nodeAtX(clientX) {
      const r = panel.getBoundingClientRect();
      let best = -1, dist = Infinity;
      nodes.forEach((n, i) => { const b = n.tile.getBoundingClientRect(); const c = (b.left + b.right) / 2; const d = Math.abs(clientX - c); if (d < dist && b.right > r.left + 212 * unit(panel)) { dist = d; best = i; } });
      return dist < (S.near * unit(panel)) ? best : -1;
    }

    const hideHint = () => { if (hint.classList.contains('is-gone')) return; hint.classList.add('is-gone'); try { sessionStorage.setItem(HINT_KEY, '1'); } catch {} };
    let seen = false; try { seen = sessionStorage.getItem(HINT_KEY) === '1'; } catch {}
    if (seen || !nodes.length) hint.classList.add('is-gone');

    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); return () => el.removeEventListener(ev, fn, o); };
    const offs = [];
    offs.push(on(panel, 'pointermove', e => {
      if (st.drag) { const dx = e.clientX - st.drag.x; if (Math.abs(dx) > 4) st.drag.moved = true; st.target = Math.max(0, Math.min(maxOffset(unit(panel)), st.drag.o - dx)); st.offset = st.target; layout(); return; }
      if (e.pointerType !== 'mouse') return;
      if (e.target.closest('.fl-branch.is-show,.fl-node.is-hover')) return;
      clearTimeout(st.hoverTimer);
      const i = nodeAtX(e.clientX);
      st.hoverTimer = setTimeout(() => setHover(i), 60);
    }));
    offs.push(on(panel, 'pointerenter', () => setTimeout(hideHint, 900)));
    offs.push(on(panel, 'pointerleave', () => { clearTimeout(st.hoverTimer); clearTimeout(st.branchTimer); if (!st.open) { st.hover = -1; st.v = 0; st.branchOpen = false; layout(); } }));
    offs.push(on(panel, 'pointerdown', e => { if (e.button !== 0) return; st.drag = { x: e.clientX, o: st.target, moved: false }; hideHint(); }));
    offs.push(on(window, 'pointerup', () => { if (st.drag) { const moved = st.drag.moved; st.drag = null; if (moved) { st.suppressClick = true; setTimeout(() => { st.suppressClick = false; }, 0); } } }));
    offs.push(on(panel, 'wheel', e => {
      hideHint();
      const n = nodes[st.hover];
      const overColumn = n && (st.branchOpen || st.v > 0) && Math.abs(e.deltaY) > Math.abs(e.deltaX);
      if (overColumn && n.branch.length) {
        e.preventDefault();
        const now = performance.now(); if (now - (st.lastV || 0) < 260) return; st.lastV = now;
        st.v = Math.max(0, Math.min(n.branch.length, st.v + Math.sign(e.deltaY)));
        st.open = null; layout(); return;
      }
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (st.target <= 0 && dx < 0 || st.target >= maxOffset(unit(panel)) && dx > 0) return;
      e.preventDefault(); scrollTo(st.target + dx * 0.9);
    }, { passive: false }));
    offs.push(on(panel, 'click', e => {
      if (st.suppressClick) return;
      const tile = e.target.closest('.fl-tile'); if (!tile) { if (st.open) { st.open = null; layout(); } return; }
      const node = tile.closest('.fl-node');
      const i = node ? +node.dataset.index : nodes.findIndex(n => n.branchEls.includes(tile));
      const j = node ? -1 : nodes[i].branchEls.indexOf(tile);
      if (j >= 0 && st.v !== j + 1) { st.v = j + 1; st.open = null; layout(); return; }
      if (st.open && st.open.row === i && st.open.branch === j) { location.hash = '/baton/' + encodeURIComponent(tile.dataset.id); return; }
      if (st.hover !== i) { st.hover = i; st.v = j + 1; }
      st.open = { row: i, branch: j }; layout();
    }));
    offs.push(on(panel, 'keydown', e => {
      if (!nodes.length) return;
      const k = e.key;
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(k)) return;
      e.preventDefault(); hideHint();
      if (k === 'Escape') { st.open = null; st.hover = -1; st.v = 0; layout(); return; }
      if (k === 'ArrowRight' || k === 'ArrowLeft') {
        const i = Math.max(0, Math.min(nodes.length - 1, (st.hover < 0 ? -1 : st.hover) + (k === 'ArrowRight' ? 1 : -1)));
        setHover(i);
        const u = unit(panel); const want = (S.railX + i * (S.base + S.gap)) * u - panel.clientWidth * 0.45;
        scrollTo(want);
        return;
      }
      const n = nodes[st.hover]; if (!n) return;
      if (k === 'ArrowDown' || k === 'ArrowUp') { if (!n.branch.length) return; st.branchOpen = true; st.v = Math.max(0, Math.min(n.branch.length, st.v + (k === 'ArrowDown' ? 1 : -1))); st.open = null; layout(); return; }
      if (k === 'Enter') {
        const j = st.v - 1;
        const id = j >= 0 ? n.branch[j].id : n.record.id;
        if (st.open && st.open.row === st.hover && st.open.branch === j) location.hash = '/baton/' + encodeURIComponent(id);
        else { st.open = { row: st.hover, branch: j }; layout(); }
      }
    }));
    offs.push(on(window, 'resize', () => { st.target = Math.min(st.target, maxOffset(unit(panel))); st.offset = st.target; layout(); }));

    layout();
    if (st.entering) {
      panel.classList.add('is-entering');
      requestAnimationFrame(() => requestAnimationFrame(() => { st.entering = false; layout(); setTimeout(() => panel.classList.remove('is-entering'), 1100); }));
    }
    if (!hint.classList.contains('is-gone')) setTimeout(hideHint, 4200);
    return () => { cancelAnimationFrame(st.raf); clearTimeout(st.branchTimer); clearTimeout(st.hoverTimer); offs.forEach(f => f()); };
  }

  const wait = () => {
    if (window.MorogadoLog) { window.MorogadoLog.mount = mount; window.MorogadoLog.mountFigma = mount; }
    else setTimeout(wait, 30);
  };
  wait();
})();
