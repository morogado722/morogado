/* 모로가도 사이트 연결 (10/11)
 * 이 메이커가 모로가도 사이트(홈·상세) 안에 iframe으로 열렸을 때만 동작해요.
 *  - 메이커 자체 헤더를 숨기고 사이트 헤더를 그대로 써요(embedded=1).
 *  - "바톤 만들기"를 누르면 메이커 기록을 사이트 바톤 형식으로 바꿔 사이트 저장소에 올리고,
 *    사이트의 상세 화면(#/baton/아이디)으로 이동해요. 사이트 밖에서 단독으로 열면 원래대로 v10 상세를 띄워요.
 */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const embedded = params.get('embedded') === '1';
  const parentId = params.get('parentId') || null;
  document.documentElement.classList.toggle('is-site-embedded', embedded);
  /* 10/11 훈램님: 업로드 화면은 지아가 만든 메이커 그대로(크기·마진 손대지 않음). 사이트 헤더 아래에 붙이기만 해요. */
  const host = () => { try { return window.parent !== window ? window.parent.Morogado : null; } catch { return null; } };
  const STAGES = ['seeding', 'planting', 'growing', 'blooming'];

  function toSiteRecord(value, payload, author) {
    const d = value.data || {};
    const stage = String(d.stage || '').toLowerCase();
    const note = String(d.batonNote || '').trim();
    const ideas = (d.nextIdeas || []).map(x => typeof x === 'string' ? x : (x?.text || x?.title || '')).filter(Boolean);
    const files = payload?.files || [];
    return {
      title: (d.title || '새 바톤').trim(),
      summary: note.split(/\n+/)[0].slice(0, 90),
      author, category: d.categories || [], tags: d.tags || [], tools: d.tools || [],
      artifacts: STAGES.includes(stage) ? STAGES.slice(0, STAGES.indexOf(stage) + 1) : [],
      flowering: stage === 'flowering',
      thumbnails: (d.selectedThumbnails || []).filter(t => t?.dataUrl).map(t => ({ url: t.dataUrl, label: t.label || d.title || '대표 이미지', sourceId: t.sourceId || null, source: t.label || '업로드 자료' })),
      files: files.map((f, i) => ({ id: 'f' + i, name: f.name, size: f.size, kind: 'unclassified' })),
      note: { intent: note, done: '', remaining: '', help: ideas.join('\n') },
      noteText: note, nextIdeas: ideas,
      references: [...new Set([...(d.urls || []), ...((d.references || []).filter(x => typeof x === 'string'))])],
      parentId, createdAt: new Date().toISOString(),
      projectType: d.projectType || null, physical: d.physical ?? null, materials: d.materials || '', lessons: d.lessons || '',
      dimensions: d.dimensions || null, palette: d.palette || [], fonts: d.fonts || [], startDate: d.startDate || null, endDate: d.endDate || null,
      stage: d.stage || null,
      provenance: { mode: d.provenance?.mode || 'browser', manualFields: d.provenance?.manualFields || [], evidence: d.provenance?.evidence || [], sources: d.sources || [] },
      license: { sharingConfirmed: true, creditRequired: true, mode: 'exhibition' },
      makerVersion: 'jia-upload'
    };
  }

  async function publish(value, payload) {
    const h = host();
    if (!embedded || !h?.store?.publish) return false;
    let author = '김찬우';
    try { const n = await h.store.setting?.('nickname'); if (n && n !== '찬우') author = n; } catch { /* 기본 이름 */ }
    const files = (payload?.files || []).map(file => new window.parent.File([file], file.name, { type: file.type, lastModified: file.lastModified }));
    const saved = await h.store.publish(toSiteRecord(value, payload, author), files);
    if (!saved?.id) throw new Error('저장 응답을 확인하지 못했어요.');
    try { await window.MorogaroMaker?.clearDraft?.(); } catch { /* 초안 정리는 실패해도 괜찮아요 */ }
    h.toast?.('바톤을 저장했어요. 다음 러너를 기다려볼까요?');
    h.navigate?.('/baton/' + saved.id);
    return true;
  }

  window.MorogaroSiteBridge = Object.freeze({ embedded, publish });
})();
