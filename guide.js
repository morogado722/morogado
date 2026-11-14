/* 11/15 모로가도 가이드 (피그마 '가이드' 4233:8)
 * #/guide            가이드 홈(4247:680)
 * #/guide/basic      바톤의 기본(4242:19)
 * #/guide/stages     진척도 5단계(4243:228)
 * #/guide/note       바톤 노트(4244:399)
 * #/guide/relay      이어달리기 시작하기(4245:539)
 * 시안이 없는 글(모로가도란?, 바톤로그의 기본 등)은 사이트에서 가장 가까운 화면으로 이어져요. */
(() => {
  'use strict';
  const A = 'assets/landing/';
  const E = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const STAGE_COLOR = { Seeding: '#00FFEE', Planting: '#00F998', Growing: '#E3EA2D', Blooming: '#F9B200', Flowering: '#FF4093' };
  let uid = 0;
  const avatar = (color, size = 40) => {
    const id = 'gdav' + (++uid);
    return `<svg class="gd-avatar" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="${color}"/><mask id="${id}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40"><circle cx="20" cy="20" r="20" fill="#000"/></mask><g mask="url(#${id})"><circle opacity=".5" cx="20.6" cy="38.1" r="14.4" fill="#fff"/></g><path d="M24.97 8.37c.86-.35 1.88.68 1.54 1.54-.6 1.53-1.2 3.41-1.2 4.96 0 1.56.6 3.44 1.2 4.97.34.86-.68 1.88-1.54 1.54-1.53-.6-3.41-1.2-4.97-1.2-1.55 0-3.43.6-4.96 1.2-.86.34-1.89-.68-1.55-1.54.61-1.53 1.2-3.41 1.2-4.97 0-1.55-.59-3.43-1.2-4.96-.34-.86.69-1.89 1.55-1.55 1.53.61 3.41 1.2 4.96 1.2 1.56 0 3.44-.59 4.97-1.2z" fill="#fff"/></svg>`;
  };
  const CHECK = `<img class="gd-check" src="${A}check.svg" width="28" height="28" alt="">`;
  // "굵은 말 — 나머지" 를 체크 줄로
  const checks = list => `<ul class="gd-checks">${list.map(t => { const [b, ...r] = t.split(' — '); return `<li>${CHECK}<p>${r.length ? `<b>${E(b)}</b> — ${E(r.join(' — '))}` : E(t)}</p></li>`; }).join('')}</ul>`;
  const glow = (href, text) => `<a class="gd-glow" href="${href}"><img src="${A}button-glow.svg" alt="" aria-hidden="true"><span>${E(text)}</span></a>`;
  const note = t => `<p class="gd-note">※ ${E(t)}</p>`;
  const card = (id, pill, title, desc, body) => `<section class="gd-card" id="${id}" data-toc="${E(pill)}"><span class="gd-pill">${E(pill)}</span><h2>${E(title)}</h2><p class="gd-desc">${E(desc)}</p>${body}</section>`;
  const band = html => `<div class="gd-band">${html}</div>`;

  /* 왼쪽 목차 — 시안 없는 글은 가까운 화면으로 */
  const BASIC_NAV = [
    ['모로가도', [['모로가도란?', '#/'], ['넘기기 → 이어받기 → 완성하기', '#/guide']]],
    ['바톤', [['바톤의 기본', '#/guide/basic', 'basic'], ['진척도 5단계', '#/guide/stages', 'stages'], ['바톤 노트', '#/guide/note', 'note']]],
    ['바톤로그', [['바톤로그의 기본', '#/community'], ['크레딧이 남는 방식', '#/guide/basic#gd-log']]],
  ];
  const RELAY_NAV = [
    ['찾기', [['탐색과 검색', '#/explore'], ['지난 주 TOP5', '#/explore']]],
    ['살펴보기', [['상세페이지 읽는 법', '#/guide/relay#gd-steps'], ['파일 목록 보기', '#/guide/relay#gd-steps']]],
    ['이어달리기', [['파일 받기', '#/guide/relay#gd-steps'], ['이어달리기 시작하기', '#/guide/relay', 'relay'], ['바톤 문의하기', '#/guide/relay#gd-ask']]],
  ];

  const PAGES = {
    basic: {
      nav: BASIC_NAV, crumb: '가이드 › 기본 안내 › 바톤', title: '바톤의 기본',
      lead: '모로가도에서는 멈춘 작업 하나를 <b>바톤</b>이라고 불러요.<br>무엇이 담기는지 알면, <b>넘길 때도 이어받을 때도</b> 헤매지 않아요.',
      prev: ['넘기기 → 이어받기 → 완성하기', '#/guide'], next: ['진척도 5단계', '#/guide/stages'],
      body: () => [
        card('gd-baton', '바톤', '멈춘 작업을 한데 묶은 꾸러미예요', '모로가도는 완성품을 파는 곳이 아니라서, 바톤엔 가격 대신 어디까지 했고 어디서 멈췄는지가 적혀 있어요.',
          band(`<ol class="gd-tiles">${[['원본 파일', 'AI · PSD · Figma · OBJ'], ['썸네일', '최대 10장, 첫 장이 대표'], ['진척도', 'Seeding ~ Flowering'], ['바톤 노트', '멈춘 지점과 다음 할 일']].map(([t, s], i) => `<li><em>0${i + 1}</em><b>${t}</b><span>${s}</span></li>`).join('')}</ol>`)
          + checks(['하나의 바톤엔 하나의 작업 — 여러 프로젝트를 섞으면 진척도와 노트가 흐려져요!'])),
        card('gd-file', '원본 파일', '작업하던 파일 그대로 올려요', '레이어와 설정이 살아 있어야 다음 사람이 이어서 손댈 수 있어요.',
          band(`<ul class="gd-files"><li><i>Ai.</i><div><b>참외, 자두, 복숭아 달력_ai</b><span>ai 파일 · 8.2MB</span></div></li><li><i>docx.</i><div><b>과일 기획_docx</b><span>docx 파일 · 1.4MB</span></div></li></ul>`)
          + checks(['최대 20개까지 — 한 바톤에 파일을 20개까지 올릴 수 있어요!', '파일당 50MB — AI · PSD는 150MB까지 괜찮아요!', '이미지만 올리면 아쉬워요 — 원본이 있어야 고쳐 쓸 수 있어요!'])
          + note('폰트를 아웃라인 처리했거나 링크 이미지가 빠져 있다면 바톤 노트에 꼭 적어 주세요.')),
        card('gd-stage', '진척도', '지금 어디쯤인지 다섯 단계로 알려줘요', 'Seeding부터 Blooming까지는 직접 고르고, Flowering은 서비스가 선정해요.',
          band(`<ol class="gd-stagetiles">${Object.entries(STAGE_COLOR).map(([k, c]) => `<li>${avatar(c, 28)}<b>${k}</b><span>${k === 'Flowering' ? '서비스가 골라요' : '직접 골라요'}</span></li>`).join('')}</ol>`)
          + `<div class="gd-cta">${glow('#/guide/stages', '진척도 5단계 자세히 보기')}</div>`),
        card('gd-note', '바톤 노트', '파일에 없는 이야기를 건네요', '파일을 올리면 AI가 초안을 먼저 써 줘요. 내 말로 다듬기만 해도 충분해요.',
          checks(['누구를 위한 작업인지 — 방향을 잃지 않게 도와줘요!', '어디서, 왜 멈췄는지 — 가장 중요한 한 줄이에요!', '어디부터 이어가면 좋을지 — 다음 러너의 출발점이 돼요!'])
          + `<div class="gd-cta">${glow('#/guide/note', '바톤 노트 쓰는 법 보기')}</div>`),
        card('gd-log', '바톤로그', '이어받은 길이 모두 남아요', '누군가 바톤을 이어받아 다시 올리면 새 바톤이 생기고, 원래 바톤과 줄로 이어져요.',
          band(`<ol class="gd-chain">${[['#00F998', '레고 1891', '원작자 · 참외, 자두, 복숭아 달력'], ['#00FFEE', '씨앗 4431', '과일 달력 · 색의 변주'], ['#E3EA2D', '줄기 5493', '과일 달력 · 복숭아']].map(([c, n, s]) => `<li>${avatar(c, 32)}<div><b>${n}</b><span>${s}</span></div></li>`).join('<li class="gd-chain-line" aria-hidden="true"></li>')}</ol>`)
          + checks(['처음 시작한 사람부터 — 마지막 러너까지 이름이 모두 남아요!', '댓글은 가볍게 — 반응이라서 바톤로그에는 이어지지 않아요!'])),
      ],
    },
    stages: {
      nav: BASIC_NAV, crumb: '가이드 › 기본 안내 › 바톤', title: '진척도 5단계',
      lead: '진척도는 작업이 <b>지금 어디쯤 와 있는지</b> 알려주는 표시예요.<br>이어받을 사람은 진척도를 보고 <b>내가 손댈 수 있는 바톤인지</b> 먼저 가늠해요.',
      prev: ['바톤의 기본', '#/guide/basic'], next: ['바톤 노트', '#/guide/note'],
      body: () => [
        card('gd-five', '다섯 단계', '씨앗이 꽃이 되기까지', '앞의 네 단계는 올리는 사람이 고르고, 마지막 Flowering만 서비스가 정해요.',
          band(`<ol class="gd-stagerows">${[
            ['Seeding', '아이디어와 방향만 잡혀 있어요', '기획 메모 · 레퍼런스 · 러프 스케치'],
            ['Planting', '형태를 잡기 시작했어요', '초안 · 와이어프레임 · 기본 모델링'],
            ['Growing', '대부분 만들고 다듬는 중이에요', '시안 · 컬러 작업 · 렌더 질감'],
            ['Blooming', '마감이나 발표 바로 앞이에요', '최종 시안 · 목업 · 인쇄 전 파일'],
            ['Flowering', '완성도를 인정받아 선정됐어요', '서비스가 따로 골라요'],
          ].map(([k, t, s]) => `<li>${avatar(STAGE_COLOR[k], 40)}<div class="gd-stagename"><b>${k}</b><span${k === 'Flowering' ? ' class="is-pink"' : ''}>${k === 'Flowering' ? '서비스가 골라요' : '직접 골라요'}</span></div><div><b>${t}</b><span>${s}</span></div></li>`).join('')}</ol>`)
          + note('예로 든 파일은 참고용이에요. 같은 렌더 파일이라도 얼마나 다듬었는지에 따라 단계가 달라질 수 있어요.')),
        card('gd-how', '정하는 법', 'AI가 먼저 제안하고, 내가 골라요', '파일을 올리면 AI가 내용을 보고 진척도를 먼저 제안해요.',
          band(`<div class="gd-flow"><span>파일 올리기</span><i>→</i><span class="is-mint">AI가 단계 제안</span><i>→</i><span>근거 확인</span><i>→</i><span class="is-dark">그대로 두거나 직접 고르기</span></div><div class="gd-flow-sub"><span class="is-mint">AI가 판단한 진척도 · 근거 보기</span><span>AI 판단과 달라요 · 근거 보기</span></div>`)
          + checks(['근거 보기 — 왜 그렇게 판단했는지 볼 수 있어요!', '직접 고르기 — Seeding부터 Blooming까지 바꿀 수 있어요!'])),
        card('gd-flowering', 'Flowering', 'Flowering은 서비스가 골라요', '직접 고르거나 AI가 정할 수 없어요. 서비스가 완성도를 보고 따로 선정해요.',
          checks(['선정되면 — 바톤을 올린 사람이 리워드를 받아요!', '받거나 이어받을 땐 — 리워드 재화를 써요. 현금 결제가 아니에요!', 'Seeding ~ Blooming — 모두 무료예요!', 'Flowering도 끝이 아니에요 — 누군가 이어받으면 바톤로그는 계속 이어져요!'])
          + note('선정 기준과 리워드 양은 서비스를 운영하며 정해질 예정이에요.')),
        card('gd-ready', '준비율과 달라요', '100% 채운 Seeding 바톤도 좋은 바톤이에요', '메이커 위쪽 퍼센트는 바톤을 얼마나 채웠는지, 진척도는 작업이 어디까지 왔는지예요.',
          band(`<div class="gd-ready"><b>업로드 준비율</b><div class="gd-bar"><i></i></div><ol><li>파일 올리면 50%</li><li>분석 끝나면 70%</li><li>단계마다 +5%</li><li>노트·아이디어까지 100%</li></ol></div>`)
          + checks(['진척도 — 작업 자체가 어디까지 왔는지예요. 내가 골라요!', '업로드 준비율 — 바톤을 얼마나 채웠는지예요. 자동으로 계산돼요!'])),
      ],
    },
    note: {
      nav: BASIC_NAV, crumb: '가이드 › 기본 안내 › 바톤', title: '바톤 노트',
      lead: '파일에 담기지 않은 이야기를 <b>다음 사람에게 건네는 메모</b>예요.<br>잘 쓴 노트 한 장이 <b>이어받고 싶은 마음</b>을 만들어요.',
      prev: ['진척도 5단계', '#/guide/stages'], next: ['바톤로그의 기본', '#/community'],
      body: () => [
        card('gd-why', '왜 쓰나요', '파일은 무엇을 했는지만, 노트는 왜까지 알려줘요', '노트가 있으면 이어받는 사람이 파일을 처음부터 다시 해석하지 않아도 돼요.',
          checks(['같은 실수를 피해요 — 먼저 해 본 사람의 힌트가 남아요!', '의도를 지켜요 — 원래 방향에서 너무 멀어지지 않아요!'])),
        card('gd-seven', '일곱 가지 질문', '다 답하지 않아도 괜찮아요', '노트 옆 가이드가 일곱 가지를 물어봐요. 노트에 적은 항목은 가이드에 자동으로 체크돼요.',
          band([
            ['작업의 의도', [['누구를 위한 건가요', '제철 과일을 챙겨 먹고 싶은 자취생'], ['어떤 느낌을 원했나요', '손으로 만진 듯 따뜻하고 통통 튀는 느낌']]],
            ['멈춘 이야기', [['어디서 막혔나요', '뒷면에 넣을 제철 정보를 어떻게 정리할지 정하지 못했어요'], ['왜 그만뒀나요', '학기가 끝나서 인쇄 테스트까지 가지 못했어요']]],
            ['다음 사람에게', [['하다가 알게 된 점이 있나요', '형광 별색은 모니터와 인쇄 색이 꽤 달라요'], ['조심해야 할 점이 있나요', '원본 파일의 일부 글자는 아웃라인 처리돼 있어요'], ['어디부터 이어가면 좋을까요', '복숭아 버전 컬러부터 다듬어 주세요']]],
          ].reduce((h, [g, qs]) => { h.s += `<div class="gd-qgroup"><p>${g}</p><ol>${qs.map(([q, ex]) => { h.n++; return `<li${h.n === 3 ? ' class="is-key"' : ''}><i>${h.n}</i><b>${q}</b><span>예) ${ex}</span></li>`; }).join('')}</ol></div>`; return h; }, { s: '', n: 0 }).s)
          + checks(['3번이 제일 중요해요 — 멈춘 지점이 구체적일수록 이어받는 사람이 바로 시작할 수 있어요!'])
          + note("예시는 샘플 바톤 '참외, 자두, 복숭아 달력'의 노트에서 가져왔어요.")),
        card('gd-ai', 'AI 초안', 'AI 초안을 내 말로 다듬어요', '초안은 질문마다 [라벨]이 붙은 문단으로 나뉘어 있어요. 사실과 다른 부분만 고쳐도 충분해요.',
          checks(['AI 초안 — 올린 파일을 보고 노트를 먼저 써 줘요!', '다음 버튼 — AI가 쓰는 동안엔 잠깐 잠겨요!', '다시 생각해보기 — 다음 방향 제안을 새로 받아볼 수 있어요!', '한두 문장만 보태기 — 어디서, 왜 멈췄는지는 직접 적어 주세요!'])),
        card('gd-example', '예시', '좋은 노트, 아쉬운 노트', '같은 작업이라도 노트에 따라 이어받고 싶은 마음이 달라져요.',
          band(`<div class="gd-compare"><div class="gd-bad"><span>아쉬운 노트</span><q>거의 다 했는데 시간이 없어서 멈췄어요. 알아서 이어가 주세요.</q><p>어디까지 했는지, 무엇이 남았는지 알 수 없어요.</p></div><div class="gd-good"><span>좋은 노트</span><q>참외·자두·복숭아까지 세 달을 그렸어요. 뒷면 제철 정보 정리에서 막혔고, 형광 별색은 인쇄 색이 달라 테스트가 필요해요. 복숭아 버전 컬러부터 이어가 주세요.</q><p>한 일 · 막힌 곳 · 주의할 점 · 시작할 곳이 다 보여요.</p></div></div>`)),
      ],
    },
    relay: {
      nav: RELAY_NAV, crumb: '가이드 › 이어받기 가이드 › 이어달리기', title: '이어달리기 시작하기',
      lead: '마음에 드는 바톤을 찾았다면, <b>파일을 받아 내 방식대로</b> 이어가 보세요.<br>다시 올리면 <b>새 바톤</b>이 되고, 바톤로그로 이어져요.',
      prev: ['파일 받기', '#/guide/relay#gd-steps'], next: ['바톤 문의하기', '#/guide/relay#gd-ask'],
      body: () => [
        card('gd-relay', '이어달리기', '원작을 대신 끝내는 게 아니에요', '누군가 멈춘 지점에서 출발해, 다음 구간을 내 작업으로 달리는 거예요.',
          checks(['똑같이 끝내지 않아도 — 괜찮아요. 색을 바꾸거나 다른 형식으로 옮겨도 돼요!', '일부만 가져와도 — 모두 이어달리기예요!'])),
        card('gd-steps', '다섯 걸음', '노트 읽기부터 바톤로그까지', '상세페이지에서 시작해 바톤 메이커로 다시 올리면 끝이에요.',
          band(`<ol class="gd-steps">${[
            ['바톤 노트부터 읽어요', '어디서 막혔는지, 조심할 점이 무엇인지 확인해요.', '바톤 정보'],
            ['파일을 받아요', '필요한 파일만 받거나 한 번에 받아요. 받은 묶음에는 원작자 크레딧이 함께 들어 있어요.', '파일 목록 · 전체다운'],
            ['이어서 작업해요', "원본 레이어 그대로 열어요. '어디부터 이어가면 좋을까요'를 참고하면 출발이 쉬워요.", '내 작업 도구'],
            ['지금 바로 이어달리기', '버튼을 누르면 바톤 메이커가 열리고, 원래 바톤이 이전 바톤으로 자동 연결돼요.', '지금 바로 이어달리기 🏃'],
            ['바톤로그에 이름이 남아요', '새 바톤은 원래 바톤 아래로 이어지고, 원작자와 내 이름이 크레딧에 함께 남아요.', '바톤로그'],
          ].map(([t, d, tag], i) => `<li${i === 3 ? ' class="is-key"' : ''}><i>${i + 1}</i><div><b>${t}</b><p>${E(d)}</p><span>${tag.replace(' 🏃', '')}</span></div></li>`).join('')}</ol>`)
          + `<div class="gd-cta">${glow('#/explore', '이어받을 바톤 찾아보기')}</div>`),
        card('gd-ask', '바톤 문의하기', '궁금한 건 원작자에게 먼저 물어보세요', '파일 크기나 쓰인 폰트처럼 노트에 없는 게 궁금하다면, 상세페이지의 바톤 문의하기를 눌러요.',
          checks(['댓글부터 훑어보기 — 다른 러너가 이미 물어본 걸 수도 있어요!'])),
        card('gd-promise', '지켜 주세요', '함께 달리는 약속', '바톤을 올리고 이어받기 전에 한 번만 확인해 주세요.',
          checks(['제공 조건 확인 — 다른 사람의 작품·사진·폰트·상표가 들어 있다면 먼저 확인해요!', '계승 관계 남기기 — 크레딧은 새 바톤과 다운로드 묶음에 자동으로 이어져요!', '원작자 이름 지키기 — 지우거나 내 것처럼 다시 올리지 않아요!'])
          + note('전시 버전의 안내는 실제 서비스 이용약관이나 법률 검토를 대신하지 않아요.')),
      ],
    },
  };

  const decos = () => `<img class="gd-deco gd-deco-y" src="${A}path-yellow.png" alt="" aria-hidden="true"><img class="gd-deco gd-deco-m" src="${A}path-mint.png" alt="" aria-hidden="true">`;

  function articleHTML(slug) {
    const p = PAGES[slug];
    const sections = p.body();
    const toc = sections.map(s => { const id = s.match(/id="([^"]+)"/)[1], label = s.match(/data-toc="([^"]+)"/)[1]; return `<li><a href="#/guide/${slug}#${id}" data-target="${id}">${label}</a></li>`; }).join('');
    return `<div class="gd gd-article" data-slug="${slug}">${decos()}
      <div class="gd-wrap">
        <nav class="gd-side" aria-label="가이드 목차"><a class="gd-side-title" href="#/guide">모로가도 가이드</a>${p.nav.map(([g, items]) => `<div class="gd-side-group"><p>${g}</p><ul>${items.map(([t, h, s]) => `<li><a href="${h}"${s === slug ? ' aria-current="page"' : ''}>${E(t)}</a></li>`).join('')}</ul></div>`).join('')}</nav>
        <article class="gd-main">
          <p class="gd-crumb">${E(p.crumb)}</p>
          <h1>${E(p.title)}</h1>
          <p class="gd-lead">${p.lead}</p>
          ${sections.join('')}
          <nav class="gd-pager" aria-label="이전·다음 글">
            <div><small>이전 글</small><a class="gd-prev" href="${p.prev[1]}"><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M12 5l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>${E(p.prev[0])}</a></div>
            <div class="gd-next-wrap"><small>다음 글</small><a class="gd-glow gd-next" href="${p.next[1]}"><img src="${A}button-glow.svg" alt="" aria-hidden="true"><span>${E(p.next[0])}  →</span></a></div>
          </nav>
        </article>
        <aside class="gd-toc" aria-label="이 페이지에서"><p>이 페이지에서</p><ul>${toc}</ul></aside>
      </div></div>`;
  }

  function homeHTML() {
    const give = ['파일 올리기', '썸네일 설정', '소스 확인', '프로젝트 정보', '파일 정보', '바톤 노트 작성'];
    return `<div class="gd gd-home">${decos()}
      <section class="gdh-hero">
        <h1><span class="gdh-row">처음 달리는 <span class="gdh-chip">${avatar('#00F998', 40)}<span>새싹 2019</span></span> 러너를 위한</span><span class="gdh-row">모로가도 가이드 <img class="gdh-runner" src="${A}runner.png" width="110" height="79" alt=""></span></h1>
        <p class="gdh-sub">넘기는 법부터 이어받는 법까지, 차근차근 알려드릴게요.</p>
        <form class="gdh-search" role="search"><img src="${A}search-big.svg" width="36" height="36" alt=""><input type="search" placeholder="진척도는 어떻게 고르나요?" aria-label="가이드 검색"></form>
        <div class="gdh-cta"><a class="gdh-btn gdh-btn-dark" href="#/guide/basic">처음부터 읽어보기</a><a class="gdh-btn gdh-btn-soft" href="#/guide/basic">용어집 보러 가기<img src="${A}arrow-right.svg" width="24" height="24" alt=""></a></div>
      </section>
      <section class="gdh-where">
        <h2>어디서 출발해야 할 지 모르겠다면?<span>넘길 땐 <b>넘기기 가이드</b>, 이어받을 땐 <b>이어받기 가이드</b>.</span></h2>
        <div class="gdh-mains">
          <article class="gdh-main">
            <div class="gdh-main-head"><span class="gd-pill">넘기기 가이드</span><h3>내가 하다 멈춘 작업,<br>바톤으로 넘기는 법</h3><p>파일 준비부터 바톤 노트까지, 글 10편이에요.</p></div>
            ${band(`<ol class="gdh-list">${give.map((t, i) => `<li><a href="#/guide/basic"><i>${i + 1}</i><b>${t}</b><span>바톤 메이커</span></a></li>`).join('')}</ol>`)}
            ${checks(['3분이면 끝나요 — 제목 · 설명 · 진척도 등 10개 항목을 AI와 함께 채워요!', '멈춘 그대로 괜찮아요 — 멈춘 지점이 누군가의 출발점이 돼요!'])}
            <div class="gd-cta">${glow('#/guide/basic', '넘기기 가이드 보기')}</div>
          </article>
          <article class="gdh-main gdh-main-take">
            <div class="gdh-main-head"><span class="gd-pill">이어받기 가이드</span><h3>누군가 남긴 바톤,<br>이어받는 법</h3><p>바톤 찾기부터 이어달리기까지, 글 7편이에요.</p></div>
            ${band(`<ol class="gdh-list gdh-list-take">${[['찾기', '탐색과 검색 · 지난 주 TOP5', '#/explore'], ['살펴보기', '상세페이지 읽는 법 · 파일 목록 보기', '#/guide/relay#gd-steps'], ['이어달리기', '파일 받기 · 이어달리기 시작하기 · 바톤 문의하기', '#/guide/relay']].map(([k, t, h]) => `<li><a href="${h}"><em>${k}</em><span>${t}</span></a></li>`).join('')}</ol>`)}
            ${checks(['원본 파일째 받아요 — AI · PSD · OBJ 등 원작 레이어 그대로!', '마음 놓고 이어 써요 — 원작자가 직접 넘긴 바톤이에요!'])}
            <div class="gd-cta">${glow('#/guide/relay', '이어받기 가이드 보기')}</div>
          </article>
        </div>
      </section>
      <section class="gdh-more">${[
        ['기본 안내', '바톤, 진척도, 바톤로그', '꼭 알아야 할 개념을 모았어요.', '#00FFEE', '글 7편', '#/guide/basic'],
        ['권리와 크레딧', '함께 달리는 약속', '올려도 되는 파일, 폰트·이미지 조건이에요.', '#F9B200', '글 4편', '#/guide/relay#gd-promise'],
        ['용어집', '모로가도에서 쓰는 말', '바톤, 러너, 이어달리기… 한곳에 정리했어요.', '#FF4093', '단어 14개', '#/guide/basic'],
      ].map(([p, t, d, c, n, h]) => `<a class="gdh-more-card" href="${h}"><span class="gd-pill">${p}</span><h3>${t}</h3><p>${d}</p><span class="gdh-more-foot">${avatar(c, 32)}<b>${n}</b><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a>`).join('')}</section>
    </div>`;
  }

  // 검색어로 가장 가까운 글 찾기
  function searchTo(q) {
    q = q.trim(); if (!q) return '#/guide/basic';
    const rules = [[/진척|단계|seed|plant|grow|bloom|flower|준비율|퍼센트/i, '#/guide/stages'], [/노트|메모|라벨|ai|초안|질문/i, '#/guide/note'], [/이어|받|다운|문의|약속|크레딧|권리|저작|폰트/i, '#/guide/relay'], [/로그|기록/i, '#/community'], [/찾|탐색|검색|top/i, '#/explore']];
    return (rules.find(([re]) => re.test(q)) || [, '#/guide/basic'])[1];
  }

  let scaleOff = null, spyOff = null;
  function fit(root) {
    const set = () => { const z = Math.min(1, Math.max(0.72, innerWidth / 1440)); root.style.zoom = z; };
    set(); addEventListener('resize', set); return () => removeEventListener('resize', set);
  }
  function spy(root) {
    const links = [...root.querySelectorAll('.gd-toc a')];
    if (!links.length) return () => {};
    const cards = links.map(a => root.querySelector('#' + a.dataset.target));
    const on = () => {
      const line = innerHeight * 0.35; let cur = 0;
      cards.forEach((c, i) => { if (c && c.getBoundingClientRect().top < line) cur = i; });
      links.forEach((a, i) => a.toggleAttribute('aria-current', i === cur));
    };
    on(); addEventListener('scroll', on, { passive: true }); return () => removeEventListener('scroll', on);
  }

  function render(main, slug, anchor) {
    teardown();
    const page = slug && PAGES[slug] ? slug : null;
    main.innerHTML = page ? articleHTML(page) : homeHTML();
    const root = main.querySelector('.gd');
    scaleOff = fit(root); spyOff = spy(root);
    // 목차·페이지 안 링크는 해시 라우터를 건드리지 않고 그 칸으로 부드럽게
    root.addEventListener('click', e => {
      const a = e.target.closest('a[href*="#gd-"]'); if (!a) return;
      const [, path, id] = a.getAttribute('href').split('#');
      if (path !== location.hash.split('#')[1]) return;   // 다른 글이면 라우터가 열고 그 칸으로 내려가요
      const el = root.querySelector('#' + id); if (!el) return;
      e.preventDefault(); scrollToEl(el);
    });
    root.querySelector('.gdh-search')?.addEventListener('submit', e => { e.preventDefault(); location.hash = searchTo(e.target.querySelector('input').value); });
    document.title = (page ? PAGES[page].title + ' · ' : '') + '모로가도 가이드';
    if (anchor) setTimeout(() => { const el = root.querySelector('#' + anchor); if (el) scrollToEl(el, 'instant'); }, 80);   // 라우터가 맨 위로 올린 뒤에
  }
  function scrollToEl(el, behavior = 'smooth') {
    const head = document.getElementById('site-header')?.offsetHeight || 0;
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - head + 60, behavior });
  }
  function teardown() { scaleOff?.(); spyOff?.(); scaleOff = spyOff = null; }

  window.MorogadoGuide = { render, teardown };
})();
