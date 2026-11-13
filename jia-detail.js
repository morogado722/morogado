/* 바톤 상세 = 지아 상세페이지(baton/) 연결 (10/16)
 * 사이트의 #/baton/아이디 화면을 팀원 상세(detail.js) 대신 지아가 만든 v10 상세페이지로 열어요.
 *  - 상세페이지는 iframe으로 화면 전체를 채워요. 상세페이지 자체 헤더(접히는 헤더)를 그대로 쓰고,
 *    그 헤더의 메뉴·검색·저장·알림 버튼은 사이트 기능으로 이어 줘요.
 *  - 사이트 저장소의 바톤 기록을 메이커 기록 모양으로 바꿔 상세페이지에 보내요(baton-render.js 메시지 형식).
 *  - 파일 받기·저장(북마크)·이어달리기(계승)·수정하기는 사이트 저장소와 업로드 화면으로 연결돼요.
 */
(() => {
  'use strict';
  const STAGES = ['seeding', 'planting', 'growing', 'blooming'];
  const abs = url => { try { return new URL(url, location.href).href; } catch { return ''; } };
  const text = v => (typeof v === 'string' ? v.trim() : '');
  const lines = v => String(v || '').split(/\n+/).map(s => s.trim()).filter(Boolean);

  function toMakerRecord(r, { bookmarked, owner }) {
    const note = r.note || {};
    const noteText = text(r.noteText) || [note.intent, note.done, note.remaining].map(text).filter(Boolean).join('\n\n') || text(r.summary);
    const ideas = (Array.isArray(r.nextIdeas) && r.nextIdeas.length ? r.nextIdeas : lines(note.help))
      .map(x => (typeof x === 'string' ? x : x?.text || x?.title || '')).filter(Boolean);
    const stageKey = [...(r.artifacts || [])].filter(a => STAGES.includes(a)).sort((a, b) => STAGES.indexOf(a) - STAGES.indexOf(b)).pop();
    /* 11/12 예시 바톤: 탐색 카드와 같은 진척도를 보여 주고, 미리보기 이미지를 파일 목록에 넣어요(figma-home.js exampleArts와 같은 규칙) */
    const exStage = !stageKey && r.example ? ['seeding', 'planting', 'growing'][[...String(r.id)].reduce((n, c) => n + c.charCodeAt(0), 0) % 3] : null;
    /* 11/13 예시 파일 목록은 PNG(이미지 한 장씩)와 PDF(모든 장을 한 파일로)로 보여줘요. 받을 때 baton-render.js가 실제로 바꿔 내려줘요 */
    const exUrls = r.example && !(r.files || []).length ? (r.thumbnails || []).filter(t => t?.url).map(t => abs(t.url)) : null;
    const exPdf = exUrls && (r.category || []).some(c => /편집|출판|그래픽|타이포|브랜딩|패키지|UI|일러스트|기획/.test(c));
    const exName = String(r.title || '바톤').replace(/[\\/:*?"<>|]/g, ' ').trim();
    const exFiles = exUrls ? [
      ...(exPdf ? [{ name: `${exName}.pdf`, size: 0, fileId: 'ex-pdf', url: exUrls[0], pages: exUrls, convert: true }] : []),
      ...exUrls.map((u, i) => ({ name: `${exName}${exUrls.length > 1 ? '_' + String(i + 1).padStart(2, '0') : ''}.png`, size: 0, fileId: 'ex-' + i, url: u, convert: true })),
    ] : null;
    const thumbs = (r.thumbnails || []).filter(t => t?.url).map(t => ({ dataUrl: abs(t.url), label: t.label || r.title }));
    const refs = (r.referenceImages || []).map(x => (typeof x === 'string' ? x : x?.url || x?.src || x?.image)).filter(Boolean).map((u, i) => ({ dataUrl: abs(u), label: `레퍼런스 이미지 ${i + 1}` }));
    const urls = [...(r.references || []).filter(x => typeof x === 'string' && /^https?:/i.test(x)), ...(r.fileLinks || []).map(l => l?.url).filter(Boolean)];
    return {
      id: r.id, preview: false, bookmarked,
      siteOwner: owner, authorName: r.author || '', authorMessage: r.authorMessage || '',
      data: {
        title: r.title,
        categories: r.displayCategories || r.category || [],
        // 홈 카드 예시는 표시용 도구·태그(displayTools/displayTags)만 있어서 그 값을 그대로 보여줘요.
        tags: r.tags?.length ? r.tags : r.displayTags || [], tools: r.tools?.length ? r.tools : r.displayTools || [],
        batonNote: noteText, nextIdeas: ideas,
        selectedThumbnails: thumbs, references: refs,
        palette: r.palette || [], colorMode: r.paletteMode || r.colorMode || 'rgb',
        dimensions: r.dimensions || null,
        fonts: r.fonts || [], materials: r.materials || '', lessons: r.lessons || '',
        startDate: r.startDate || '', endDate: r.endDate || '',
        stage: (stageKey || exStage) ? (stageKey || exStage)[0].toUpperCase() + (stageKey || exStage).slice(1) : null,
        urls, provenance: r.provenance?.manualFields ? r.provenance : {}, sources: r.provenance?.sources || [],
      },
      // 11/13 url도 같이 넘겨요: 상세(iframe)가 클릭 순간 바로 열어야 사파리가 막지 않아요
      files: exFiles || (r.files || []).map(f => ({ name: f.name || f.originalName || '파일', size: Number(f.size) || 0, fileId: f.id, url: f.download || f.url || '' })),
      folderUrl: r.folderUrl || '',
    };
  }

  /* 11/13 '이 바톤도 마음에 드실 거예요': 탐색 탭과 같은 바톤(서버+예시) 중 10개. 같은 분야·태그를 먼저, 나머지는 아이디로 정한 순서로 채워요 */
  async function relatedFor(record) {
    try {
      const all = (await window.Morogado.store.list()).filter(r => (r.example || r.remote) && r.id !== record.id && !r.id.startsWith('feature-') && !['calendar-red', 'calendar-peach'].includes(r.id) && !r.demoRelay && r.thumbnails?.[0]?.url && r.title !== record.title);
      const cats = new Set(record.category || []), tags = new Set([...(record.tags || []), ...(record.displayTags || [])]);
      const seed = [...String(record.id)].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
      const rank = r => [...String(r.id)].reduce((n, c) => (n * 33 + c.charCodeAt(0)) >>> 0, seed) % 1000;
      const why = r => {
        const c = (r.category || []).find(x => cats.has(x)); if (c) return `같은 ${c} 바톤이에요`;
        const t = [...(r.tags || []), ...(r.displayTags || [])].find(x => tags.has(x)); if (t) return `'${t}' 태그가 같아요`;
        return ['이어달릴 러너를 기다려요', '파일 구성이 비슷해요', '발표 자료가 아직 없어요'][rank(r) % 3];
      };
      const score = r => ((r.category || []).some(x => cats.has(x)) ? 2 : 0) + ([...(r.tags || []), ...(r.displayTags || [])].some(x => tags.has(x)) ? 1 : 0);
      const seen = new Set();
      const uniq = all.filter(r => !seen.has(r.title) && seen.add(r.title));
      const near = uniq.filter(r => score(r) > 0).sort((a, b) => score(b) - score(a) || rank(a) - rank(b)).slice(0, 6);
      const rest = uniq.filter(r => !near.includes(r)).sort((a, b) => rank(a) - rank(b)).slice(0, 10 - near.length);
      return [...near, ...rest].sort((a, b) => rank(a) - rank(b))
        .map(r => [why(r), Math.max(1, Math.min(4, (r.artifacts || []).length || 1)), { id: r.id, title: r.title, src: abs(r.thumbnails[0].url) }]);
    } catch { return []; }
  }

  async function render(container, record) {
    const M = window.Morogado;
    const body = document.body;
    const nickname = (await M.store.setting('nickname').catch(() => null)) || '방문자';
    const owner = !record.example && (!record.remote || record.mine);
    const bookmarked = await M.store.isBookmarked(record.id).catch(() => false);

    const frame = document.createElement('iframe');
    frame.className = 'jia-detail-frame';
    frame.title = `${record.title} 상세`;
    frame.src = 'baton/index.html?embed=1&site=1&v=1113f';
    container.classList.add('jia-detail-host');
    container.replaceChildren(frame);
    body.classList.add('is-jia-detail');

    const send = message => frame.contentWindow?.postMessage(message, location.origin);
    const clickParent = action => document.querySelector(`[data-action="${action}"]`)?.click();
    const onMessage = async event => {
      if (event.source !== frame.contentWindow) return;
      const m = event.data || {};
      try {
        switch (m.type) {
          case 'morogaro:baton-ready':
            send({ type: 'morogaro:baton', record: { ...toMakerRecord(record, { bookmarked, owner }), related: await relatedFor(record) }, ownerName: record.author || nickname, viewerName: document.getElementById('runner-name')?.textContent?.trim() || nickname, site: true });
            break;
          case 'morogaro:baton-bookmark': {
            const now = await M.store.isBookmarked(record.id);
            if (now !== Boolean(m.value)) await M.store.toggleBookmark(record.id);
            M.toast(m.value ? '바톤을 저장했어요.' : '저장을 해제했어요.');
            break;
          }
          case 'morogaro:baton-edit': M.navigate('/upload'); break;
          case 'morogaro:baton-inherit': M.navigate('/upload?parent=' + encodeURIComponent(record.id)); break;
          case 'morogaro:baton-download': {
            const file = record.files?.[m.index];
            if (record.example && !(record.files || []).length) {   // 예시 바톤은 미리보기 이미지를 그대로 받아요
              const conv = toMakerRecord(record, {}), list = m.all || !conv.files[m.index] ? conv.files : [conv.files[m.index]];
              for (const f of list) { const a = document.createElement('a'); a.href = f.url; a.download = f.name; document.body.append(a); a.click(); a.remove(); }
              break;
            }
            if (m.all || !file) await M.store.download(record.id); else await M.store.download(record.id, file.id);
            break;
          }
          case 'morogaro:site-nav':
            if (m.action === 'filter' && window.MorogadoFilterModal) window.MorogadoFilterModal.open();
            else if (m.action) clickParent(m.action);
            else if (m.search !== undefined) {
              const input = document.getElementById('site-search'); input.value = m.search;
              document.getElementById('search-form').requestSubmit();
            } else if (m.to) M.navigate(m.to);
            break;
        }
      } catch (error) { M.toast(error?.message || '요청을 처리하지 못했어요.'); }
    };
    addEventListener('message', onMessage);
    return () => {
      removeEventListener('message', onMessage);
      container.classList.remove('jia-detail-host');
      body.classList.remove('is-jia-detail');
      frame.remove();
      return true;
    };
  }

  window.MorogadoDetail = Object.freeze({ render });
})();
