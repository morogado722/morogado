/* 11/13 '바톤 문의하기' → 작성자와 나누는 채팅창
 * 전시용이라 서버로 보내지 않고, 작성자 답장은 질문에 맞춰 미리 써 둔 말로 잠시 뒤 도착해요.
 * 대화는 이 화면에만 있어요(새로고침·처음으로 돌아가면 사라져요). */
(() => {
  'use strict';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let panel, list, input, author = '', thread = [], replyTimer = 0;

  const REPLIES = [
    [/파일|원본|레이어|psd|ai|fig|다운/i, '원본은 오른쪽 \'파일 목록\'에서 받을 수 있어요. 레이어는 단계별로 이름을 붙여 뒀으니 열어 보시고 헷갈리는 데가 있으면 또 물어봐 주세요!'],
    [/폰트|서체|글꼴/, '쓴 서체는 바톤 정보의 폰트 칸에 다 적어 뒀어요. 무료 서체 위주라 바로 받아서 쓰셔도 괜찮아요 :)'],
    [/색|컬러|팔레트/, '컬러팔레트 칸에 있는 값 그대로 쓰시면 돼요. 인쇄할 땐 살짝 어둡게 나와서 화면보다 한 톤 밝게 잡는 걸 추천해요!'],
    [/이어|이어받|이어달|계속|써도|사용/, '물론이죠! 이어받아 주시면 정말 기뻐요. 바톤 노트의 \'어디부터 이어가면 좋을까요\'부터 시작하시면 제일 수월할 거예요 🏃'],
    [/언제|기간|얼마|시간/, '저는 대략 바톤 정보에 적힌 기간 동안 작업했어요. 이어받는 분 속도대로 천천히 하셔도 괜찮아요!'],
    [/크기|사이즈|규격|종이|인쇄/, '규격은 바톤 정보에 적어 둔 크기 기준이에요. 실물로 뽑아 보실 거면 테스트 출력 한 번 먼저 해 보시길 추천해요!'],
    [/고마|감사|좋아|예뻐|멋/, '앗 감사해요 🥹 그렇게 말씀해 주시니 힘이 나요. 이어받으시면 꼭 바톤 로그로 보여주세요!'],
  ];
  const DEFAULT = '문의 고마워요! 확인하고 바로 답할게요. 이어받으면서 막히는 부분이 생기면 언제든 편하게 물어봐 주세요 :)';

  function ensure() {
    if (panel) return;
    panel = document.createElement('section');
    panel.className = 'bc-panel'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', '바톤 문의 채팅');
    panel.innerHTML = `
      <header class="bc-head"><span class="bc-avatar" aria-hidden="true"></span><div><strong class="bc-name"></strong><small>보통 30분 안에 답해요</small></div>
        <button type="button" class="bc-close" aria-label="채팅 닫기"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></header>
      <ol class="bc-list" aria-live="polite"></ol>
      <div class="bc-quick"></div>
      <form class="bc-form"><input type="text" maxlength="300" placeholder="궁금한 걸 물어보세요" aria-label="메시지"><button type="submit" aria-label="보내기"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 14V4M4.5 8.5 9 4l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>`;
    document.body.append(panel);
    list = panel.querySelector('.bc-list'); input = panel.querySelector('input');
    panel.querySelector('.bc-close').addEventListener('click', close);
    panel.querySelector('.bc-form').addEventListener('submit', e => { e.preventDefault(); send(input.value); });
    const quick = panel.querySelector('.bc-quick');
    ['원본 파일 받을 수 있나요?', '이어받아도 될까요?', '쓰신 폰트가 궁금해요'].forEach(q => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.addEventListener('click', () => send(q)); quick.append(b);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  }

  function paint() {
    list.innerHTML = thread.map(m => m.typing
      ? '<li class="bc-msg is-them is-typing"><span></span><span></span><span></span></li>'
      : `<li class="bc-msg ${m.me ? 'is-me' : 'is-them'}">${esc(m.text)}</li>`).join('');
    list.scrollTop = list.scrollHeight;
    panel.querySelector('.bc-quick').hidden = thread.some(m => m.me);
  }

  function open() {
    ensure();
    const name = document.querySelector('.author-name')?.textContent.trim() || '작성자';
    if (name !== author) {   // 다른 바톤으로 바뀌면 새 대화
      author = name; clearTimeout(replyTimer);
      const greet = document.querySelector('.author-bubble')?.textContent.trim();
      thread = [{ text: `안녕하세요, ${name.replace(/[.。]+$/, "")}예요! ${greet && !/이어받아 다음 작업을 시작해/.test(greet) ? greet : '이 바톤에 대해 궁금한 게 있으면 편하게 물어봐 주세요 :)'}` }];
    }
    panel.querySelector('.bc-name').textContent = author;
    panel.querySelector('.bc-avatar').textContent = author.replace(/[^가-힣a-zA-Z]/g, '').slice(0, 1).toUpperCase();
    paint();
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
    setTimeout(() => input.focus({ preventScroll: true }), 200);
  }
  function close() {
    panel.classList.remove('is-open');
    setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 260);
  }

  function send(raw) {
    const text = String(raw || '').trim(); if (!text) return;
    input.value = '';
    thread = thread.filter(m => !m.typing);
    thread.push({ me: true, text }, { typing: true });
    paint();
    clearTimeout(replyTimer);
    const answer = (REPLIES.find(([re]) => re.test(text)) || [, DEFAULT])[1];
    replyTimer = setTimeout(() => { thread = thread.filter(m => !m.typing); thread.push({ text: answer }); paint(); }, 1400 + Math.min(1600, answer.length * 18));
  }

  // 수정하기로 바뀐 버튼(내 바톤)은 건드리지 않아요. app.js의 '아직 연결 안 됨' 안내보다 먼저 받아요
  document.addEventListener('click', e => {
    const btn = e.target.closest?.('.contact-button');
    if (!btn || btn.id === 'edit-baton') return;
    e.preventDefault(); e.stopImmediatePropagation();
    open();
  }, true);
})();
