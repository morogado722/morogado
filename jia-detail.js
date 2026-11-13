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
    const exFiles = r.example && !(r.files || []).length ? (r.thumbnails || []).filter(t => t?.url).map((t, i) => { const u = abs(t.url), ext = (u.split('?')[0].match(/\.(\w{2,5})$/) || [, 'png'])[1]; return { name: `${r.title}${i ? ' ' + (i + 1) : ''}.${ext}`, size: 0, fileId: 'ex-' + i, url: u }; }) : null;
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

  async function render(container, record) {
    const M = window.Morogado;
    const body = document.body;
    const nickname = (await M.store.setting('nickname').catch(() => null)) || '방문자';
    const owner = !record.example && (!record.remote || record.mine);
    const bookmarked = await M.store.isBookmarked(record.id).catch(() => false);

    const frame = document.createElement('iframe');
    frame.className = 'jia-detail-frame';
    frame.title = `${record.title} 상세`;
    frame.src = 'baton/index.html?embed=1&site=1&v=1113c';
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
            send({ type: 'morogaro:baton', record: toMakerRecord(record, { bookmarked, owner }), ownerName: record.author || nickname, viewerName: document.getElementById('runner-name')?.textContent?.trim() || nickname, site: true });
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
