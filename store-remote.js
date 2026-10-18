/* 졸전 사이트 바톤 서버 연결 (10/18)
 * store.js(이 브라우저 IndexedDB)를 감싸서, 바톤을 구글 Apps Script 서버(config.js 의 appsScriptUrl)에도 올리고
 * 모두가 올린 바톤을 함께 보여줘요. 서버 코드는 deploy/apps-script/Code.gs 의 '졸전 사이트: 바톤 저장소'.
 *  - 목록: 서버 바톤 + 이 브라우저 바톤 + 예시 바톤. 서버 목록은 30초 동안 기억하고, 연결이 안 되면 마지막으로 받은 목록을 써요.
 *  - 올리기: 파일을 하나씩 서버로 보낸 뒤 기록을 저장해요. 서버가 안 되면 예전처럼 이 브라우저에만 저장해요.
 *  - 내 바톤: 이 브라우저에서 서버로 올린 바톤 아이디를 기억해 '내 바톤'에 보여줘요(record.mine).
 *  - 댓글 · 저장(북마크)은 그대로 이 브라우저에만 있어요. */
(() => {
  'use strict';
  const store = window.MorogadoStore;
  const API = (window.MOROGARO_CONFIG?.appsScriptUrl || '').trim();
  if (!store || !API || location.protocol === 'file:') return;

  const MAX_BYTES = 25 * 1024 * 1024, TTL = 30000, CACHE_KEY = 'mg-remote-batons-v1', MINE_KEY = 'mg-my-remote-v1';
  const STAGES = ['seeding', 'planting', 'growing', 'blooming'];
  const ALIASES = { '그래픽 디자인': '그래픽', '편집 디자인': '편집·출판', '편집디자인': '편집·출판', '일러스트레이션': '일러스트', '제품 디자인': '제품·산업', '산업 디자인': '제품·산업', '브랜드 디자인': '브랜딩', '3D 아트': '3D아트', 'UI/UX': 'UI·UX' };
  const ls = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 저장 공간이 없어도 괜찮아요 */ } } };
  const mine = () => new Set(ls.get(MINE_KEY, []));
  const orig = { list: store.list.bind(store), get: store.get.bind(store), publish: store.publish.bind(store), download: store.download.bind(store), remove: store.remove.bind(store) };

  let memory = null, memoryAt = 0, inflight = null;
  async function fetchRemote() {
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(API + '?action=batons&t=' + Date.now(), { signal: ctrl.signal, cache: 'no-store' });
      const out = await res.json();
      if (!out?.ok || !Array.isArray(out.batons)) throw Error('목록을 받지 못했어요.');
      memory = out.batons; memoryAt = Date.now(); ls.set(CACHE_KEY, memory);
      return memory;
    } finally { clearTimeout(timer); }
  }
  async function remoteBatons() {
    if (memory && Date.now() - memoryAt < TTL) return memory;
    if (memory) { if (!inflight) inflight = fetchRemote().catch(() => memory).finally(() => { inflight = null; }); return memory; }
    if (!inflight) inflight = fetchRemote().catch(() => (memory = ls.get(CACHE_KEY, []))).finally(() => { inflight = null; });
    return inflight;
  }
  const mark = r => ({ ...structuredClone(r), remote: true, example: false, mine: mine().has(r.id) });

  store.list = async function () {
    const [base, remote] = await Promise.all([orig.list(), remoteBatons().catch(() => [])]);
    const locals = base.filter(r => !r.example), examples = base.filter(r => r.example);
    const merged = [...locals, ...remote.map(mark)].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return [...merged, ...examples];
  };
  store.get = async function (key) {
    if (String(key).startsWith('r-')) { const r = (await remoteBatons().catch(() => [])).find(x => x.id === key) || (await fetchRemote().catch(() => [])).find(x => x.id === key); return r ? mark(r) : null; }
    return orig.get(key);
  };

  const toDataUrl = blob => new Promise((resolve, reject) => { const fr = new FileReader(); fr.onload = () => resolve(fr.result); fr.onerror = () => reject(Error('파일을 읽지 못했어요.')); fr.readAsDataURL(blob); });
  async function post(body) {
    const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
    const out = await res.json().catch(() => null);
    if (!out?.ok) throw Error(out?.error || '서버에 올리지 못했어요.');
    return out;
  }
  async function upload(uploadId, blob, name) {
    return post({ action: 'batonUpload', uploadId, name, type: blob.type || 'application/octet-stream', data: await toDataUrl(blob) });
  }

  async function publishRemote(data, files, onProgress) {
    if (!String(data.title || '').trim()) throw Error('바톤 제목을 입력해 주세요.');
    const originals = Array.from(files || []).filter(f => f instanceof Blob);
    if (!originals.length) throw Error('이어받을 원본 파일을 한 개 이상 올려주세요.');
    if (originals.length > 20) throw Error('파일은 20개까지 올릴 수 있어요.');
    const parent = data.parentId ? await store.get(data.parentId) : null;
    if (data.parentId && !parent) throw Error('이전 바톤을 찾지 못했어요. 다시 선택해 주세요.');
    const uploadId = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const thumbs = (data.thumbnails || []).slice(0, 10);
    const total = originals.length + thumbs.filter(t => /^(data:image|blob:)/.test(t?.url || '')).length;
    let done = 0; const tick = () => onProgress?.({ done: ++done, total });
    onProgress?.({ done: 0, total });

    const fileMeta = [];
    for (let i = 0; i < originals.length; i++) {
      const f = originals[i], meta = data.files?.[i] || {}, name = String(f.name || meta.name || '원본_' + (i + 1));
      const base = { id: 'f' + i, name, originalName: name, size: f.size, kind: meta.kind || 'unclassified', type: f.type || 'application/octet-stream' };
      if (f.size > MAX_BYTES) fileMeta.push({ ...base, tooBig: true });
      else { const up = await upload(uploadId, f, name); fileMeta.push({ ...base, id: up.fileId, url: up.download, download: up.download }); }
      tick();
    }
    const thumbMeta = [];
    for (const [i, t] of thumbs.entries()) {
      if (!t?.url) continue;
      const label = String(t.label || '대표 이미지'), source = String(t.source || '업로드 파일');
      const sourceIndex = /^f\d+$/.test(t.sourceId || '') ? Number(t.sourceId.slice(1)) : -1;
      const originalFileId = fileMeta[sourceIndex]?.id || null;
      if (/^(data:image|blob:)/.test(t.url)) {
        const blob = await (await fetch(t.url)).blob();
        const up = await upload(uploadId, blob, 'thumb-' + (i + 1) + '.' + ((blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg')));
        thumbMeta.push({ url: up.view, label, source, originalFileId }); tick();
      } else {
        try { const u = new URL(t.url, location.href); if (u.origin === location.origin) thumbMeta.push({ url: u.pathname.replace(/^.*?\/(assets\/)/, '$1'), label, source, originalFileId }); } catch { /* 외부 이미지는 건너뛰어요 */ }
      }
    }
    const record = structuredClone({ ...data, files: undefined, thumbnails: undefined });
    delete record.files; delete record.thumbnails; delete record.stage; delete record.pct; delete record.percent;
    record.title = String(data.title).trim().slice(0, 120);
    record.summary = String(data.summary || '').slice(0, 500);
    record.author = String(data.author || await store.setting('nickname') || '방문자').slice(0, 40);
    record.category = (Array.isArray(record.category) ? record.category : []).map(v => ALIASES[v] || v);
    record.credits = [...new Set([...(parent?.credits || []), ...(parent ? [parent.author] : []), record.author].filter(Boolean))];
    record.files = fileMeta; record.thumbnails = thumbMeta;
    record.artifacts = [...new Set([...(data.artifacts || []).filter(x => STAGES.includes(x)), ...fileMeta.map(f => f.kind).filter(k => STAGES.includes(k))])];
    const out = await post({ action: 'batonPublish', uploadId, record });
    const saved = out.record;
    ls.set(MINE_KEY, [...mine(), saved.id]);
    memory = [saved, ...(memory || ls.get(CACHE_KEY, [])).filter(r => r.id !== saved.id)]; memoryAt = Date.now(); ls.set(CACHE_KEY, memory);
    window.dispatchEvent(new CustomEvent('morogado:changed', { detail: { type: 'published', id: saved.id } }));
    return mark(saved);
  }

  store.publish = async function (data, files = []) {
    const onProgress = typeof data?.onProgress === 'function' ? data.onProgress : null;
    const clean = { ...data }; delete clean.onProgress;
    try { return await publishRemote(clean, files, onProgress); }
    catch (error) {
      if (/제목|원본 파일을|20개|이전 바톤/.test(error.message)) throw error;
      console.warn('[모로가도] 서버 저장 실패, 이 브라우저에만 저장해요:', error);
      const saved = await orig.publish(clean, files);
      setTimeout(() => window.Morogado?.toast?.('인터넷 연결이 불안정해서 이 브라우저에만 저장했어요.'), 600);
      return saved;
    }
  };
  store.download = async function (key, fileId) {
    if (!String(key).startsWith('r-')) return orig.download(key, fileId);
    const record = await store.get(key); if (!record) throw Error('바톤을 찾지 못했어요.');
    if (fileId) {
      const file = (record.files || []).find(f => f.id === fileId);
      if (!file) throw Error('파일을 찾지 못했어요.');
      if (!file.download) throw Error('이 파일은 25MB보다 커서 함께 올리지 못했어요.');
      window.open(file.download, '_blank', 'noopener');
      return;
    }
    if (record.folderUrl) window.open(record.folderUrl, '_blank', 'noopener');
    else throw Error('자료 폴더를 찾지 못했어요.');
  };
  store.remove = async function (key) {
    if (String(key).startsWith('r-')) throw Error('모두에게 공개된 바톤은 여기서 지울 수 없어요. 운영진에게 말해 주세요.');
    return orig.remove(key);
  };
  store.remoteReady = () => remoteBatons();
  remoteBatons().catch(() => {});
})();
