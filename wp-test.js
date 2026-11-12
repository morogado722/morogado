/* 내 작업성향은? — 작업성향 검사 (11/12, 피그마 'wp 테스트' 4231:12426 흐름을 웹 다이얼로그로)
 * 흐름: 시작 → 검사 안내 → 질문 12개 → 유형 분석 중 → 결과 카드 → 내 유형 자세히 보기
 * 유형: 11/5에 16개를 8개로 줄인 구조(완성하기/시작하기 × 설계 먼저/손 먼저 × 혼자/함께).
 * 응답은 이 창 안에서만 쓰고 어디에도 보내거나 저장하지 않아요.
 * 공유 주소: ?test (검사 열기) · ?test=EPC (그 유형 설명 열기) */
(() => {
  'use strict';
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 축 세 개: 첫 글자가 왼쪽(점수 -) · 둘째 글자가 오른쪽(점수 +) */
  const AXES = [
    { key: 'EL', name: '힘이 나는 순간', poles: { E: '완성하기', L: '시작하기' } },
    { key: 'PR', name: '출발하는 방식', poles: { P: '설계 먼저', R: '손 먼저' } },
    { key: 'CO', name: '달리는 방식', poles: { C: '혼자', O: '함께' } }
  ];
  /* 질문 12개(축마다 4개). to: 그렇다고 답할수록 기우는 쪽 */
  const QUESTIONS = [
    { axis: 'EL', to: 'L', text: '새 작업을 시작하는 첫날은 걱정되기보다 가장 설레는 순간이다.' },
    { axis: 'PR', to: 'P', text: '처음 다뤄 보는 매체나 형식이라면 기본 규칙부터 익히고 시작한다.' },
    { axis: 'CO', to: 'O', text: '작업 중간에 누군가에게 보여 주고, 반응을 보며 방향을 고치는 편이다.' },
    { axis: 'EL', to: 'E', text: '완성 직전, 디테일을 다듬는 시간이 지루하지 않고 오히려 즐겁다.' },
    { axis: 'PR', to: 'R', text: '머릿속으로 정리하기보다 손을 먼저 움직이다 보면 방향이 잡힌다.' },
    { axis: 'CO', to: 'C', text: '보는 사람을 의식하지 않고 만들 때 결과물이 더 좋다.' },
    { axis: 'EL', to: 'L', text: '진행 중인 작업이 보통 두 개 이상이고, 하나가 막히면 다른 작업으로 넘어갔다 돌아오는 게 자연스럽다.' },
    { axis: 'PR', to: 'P', text: '작업의 콘셉트를 남에게 설명할 수 있을 때 시작할 준비가 됐다고 느낀다.' },
    { axis: 'CO', to: 'O', text: '혼자 고민하는 것보다 누군가와 이야기하다 보면 방향이 잡힌다.' },
    { axis: 'EL', to: 'E', text: '친구나 동료가 하다 만 작업을 보면, 내가 마무리해 보고 싶다는 생각이 든다.' },
    { axis: 'PR', to: 'R', text: '만들다 보면 처음 의도와 다르게 흘러가고, 그렇게 우연히 나온 결과가 더 마음에 들 때가 많다.' },
    { axis: 'CO', to: 'C', text: '아직 덜 됐다고 느끼면 피드백을 받으려는 중간 공유도 꺼려진다.' }
  ];
  const SCALE = ['전혀 아니에요', '아닌 편이에요', '보통이에요', '그런 편이에요', '매우 그래요'];
  const STAGES = { Seeding: '#00FFEE', Planting: '#00F998', Growing: '#E3EA2D', Blooming: '#F9B200', Flowering: '#FF4093' };

  /* 8유형 */
  const TYPES = {
    EPC: {
      emoji: '🧘', name: '묵묵한 계승자', runner: '완성하는 러너', stages: ['Growing', 'Blooming'],
      line: '누군가 멈춘 자리에서 <b>조용히 이어받아</b>, 형식 안에서 <b>끝까지 완성</b>하는 사람이에요.',
      short: '시작보다 마무리에서 힘이 나고, 혼자 몰입할 때 가장 단단한 결과물을 만들어요.',
      body: ['당신은 마지막 디테일을 다듬는 시간에 가장 깊어지는 창작자예요. 장르와 형식의 문법을 먼저 익히고, 그 안에서 완성도를 끝까지 끌어올려요.',
        '외부 반응보다 스스로 세운 기준이 나침반이라, 누가 봐주지 않아도 묵묵히 끝을 봐요. 대신 미완성 상태를 남에게 보여 주는 건 조금 어색할 수 있어요.'],
      role: '바톤을 이어받아 결승선까지 가져가는 러너예요. 구조가 잡힌 Growing·Blooming 바톤을 받아 Flowering으로 피워 내는 일이 가장 잘 맞아요.',
      synergy: [['LRC', '방화범이 실험적인 불씨를 바톤으로 넘기면, 당신이 구조를 세워 완성해요. 시작과 마무리의 가장 깔끔한 분업이에요.'],
        ['LPO', '보부상이 여러 방향으로 열어 둔 바톤을, 당신이 하나씩 단단하게 닫아 줘요.'],
        ['EPO', '같은 완성형이지만 DJ가 바깥과의 접점을 만들면, 당신은 안에서 완성도를 책임져요.']],
      jobs: '편집 디자이너, 북 디자이너, 후반 작업 전문가, 아트 디렉터, 기술 감수자, 리터칭·마스터링 전문가'
    },
    EPO: {
      emoji: '🎧', name: '완성 전문 DJ', runner: '완성하는 러너', stages: ['Growing', 'Blooming'],
      line: '남이 남긴 트랙을 받아 <b>완성도 있게 믹스</b>하고, <b>함께 듣는 자리</b>까지 만드는 사람이에요.',
      short: '끝을 보는 힘과 나누는 힘을 함께 가졌어요. 반응이 다음 작업의 연료가 돼요.',
      body: ['당신은 작업의 마무리 단계에서 에너지가 올라오고, 완성된 순간의 성취감을 가장 크게 느끼는 창작자예요. 형식과 문법 안에서 자기 색을 찾는 데 능숙해요.',
        '공개 전까지는 꼼꼼하게 다듬고, 공개한 뒤에는 반응을 세심하게 살펴요. 혼자 만들되 혼자 끝내지 않는, 함께 결실을 맺는 쪽을 좋아해요.'],
      role: '이어받은 바톤을 완성해 바톤로그에 기록을 남기는 러너예요. 당신이 피워 낸 Flowering 바톤은 다른 러너에게 \'이렇게도 이어 갈 수 있구나\' 하는 예시가 돼요.',
      synergy: [['LRO', '문어가 빠르게 퍼뜨린 실험을, 당신이 방향을 잡아 완성해요. 에너지와 완성도의 균형이에요.'],
        ['LPO', '보부상이 새 바톤을 열면 당신이 받아서 끝을 맺어요. 속도와 깊이의 조합이에요.'],
        ['EPC', '같은 완성형끼리, 당신은 바깥을 열고 계승자는 안을 다져요.']],
      jobs: '크리에이티브 디렉터, 콘텐츠 프로듀서, 브랜드 디자이너, 출판 편집자, 영상 감독, 커뮤니케이션 디자이너'
    },
    ERC: {
      emoji: '🪄', name: '숨겨진 연금술사', runner: '완성하는 러너', stages: ['Planting', 'Growing'],
      line: '넘겨받은 재료를 <b>예상 못 한 방향</b>으로 바꿔, <b>혼자 조용히</b> 완성해 내는 사람이에요.',
      short: '실험에서 출발하지만 허술하게 끝내진 않아요. 혼자 깊이 몰입할 때 가장 독창적이에요.',
      body: ['당신은 감각과 이미지에서 작업이 출발하고, 만들면서 방향을 찾아가는 창작자예요. 그러면서도 마지막 단계에서는 디테일을 끝까지 붙잡아요.',
        '세상에 없던 걸 만들고 싶은 마음과, 허술하게 내보내기 싫은 마음이 함께 있어요. 그 사이의 긴장이 가장 독창적인 결과물을 만드는 힘이 돼요.'],
      role: '다른 러너가 상상하지 못한 결말을 만드는 러너예요. 방향이 열려 있는 Planting·Growing 바톤을 받아 전혀 다른 꽃으로 피워 낼 때, 바톤로그가 가장 흥미로워져요.',
      synergy: [['LPO', '보부상의 빠른 시작과 당신의 깊은 마무리가 만나면, 독창적이면서도 단단한 결과가 나와요.'],
        ['LRO', '둘 다 실험적이지만, 문어의 가벼움이 당신의 높은 기준을 한결 풀어 줘요.'],
        ['EPO', 'DJ가 당신이 혼자 쌓아 둔 실험을 세상과 이어 주는 다리가 돼요.']],
      jobs: '타이포그래퍼, 인터랙티브 아티스트, 실험 영상 작가, 독립 출판 작가, 개념 미술가, 크리에이티브 연구원'
    },
    ERO: {
      emoji: '🌊', name: '예측 불가 서퍼', runner: '완성하는 러너', stages: ['Growing', 'Blooming'],
      line: '실험적인 바톤을 받아 <b>흐름을 타며 완성</b>하고, <b>세상에 내보이는</b> 사람이에요.',
      short: '실험과 완성도, 나누고 싶은 마음이 함께 있는 복합적인 유형이에요.',
      body: ['당신은 형식을 깨고 본 적 없는 걸 만들고 싶어 하면서도, 마무리 단계에서 집중력이 올라오는 창작자예요.',
        '유행을 따라가기보다 새로운 방향을 먼저 보여 주고 싶어 하고, 내 실험이 누군가에게 닿을 때 가장 큰 보람을 느껴요.'],
      role: '다른 러너의 실험을 이어받아 파도처럼 넓게 퍼뜨리는 러너예요. 당신이 완성해 공개한 바톤은 다른 사람에게 새로운 출발점이 돼요.',
      synergy: [['LPC', '정원사가 조용히 가꿔 둔 구조 위에 당신의 실험이 얹히면, 새로운 장르가 생겨요.'],
        ['ERC', '같은 실험·완성형이지만, 연금술사의 깊이가 당신의 속도를 보완해요.'],
        ['LRO', '문어가 던진 아이디어를 당신이 받아 결과로 만들어요. 함께라면 흐름이 끊기지 않아요.']],
      jobs: '브랜드 경험 디자이너, 뮤직비디오 감독, 전시 기획자, 미디어 아티스트, 크리에이티브 전략가'
    },
    LPC: {
      emoji: '🌷', name: '1인 정원사', runner: '넘기는 러너', stages: ['Seeding', 'Planting'],
      line: '구조가 또렷한 씨앗을 <b>혼자 차근차근 심어 두는</b> 사람이에요.',
      short: '시작할 때 가장 설레고, 충분히 준비한 뒤 첫발을 내디뎌요.',
      body: ['당신은 새로운 것을 시작하는 순간 가장 힘이 나는 창작자예요. 그렇다고 무작정 뛰어들진 않아요. 레퍼런스를 모으고 구조를 잡은 뒤 출발해요.',
        '여러 작업을 동시에 열어 두는 습관 때문에 미완성이 쌓이기도 하지만, 그 하나하나가 방향이 분명한 씨앗이에요.'],
      role: '바톤을 넘기는 러너예요. 폴더 속에 멈춰 있는 Seeding·Planting 작업을 바톤으로 넘기면, 구조가 분명해서 다른 러너가 가장 이어받기 쉬운 바톤이 돼요.',
      synergy: [['EPC', '당신이 심어 둔 씨앗을 계승자가 이어받아 단단하게 완성해요. 가장 자연스러운 분업이에요.'],
        ['ERO', '당신의 구조 위에 서퍼의 실험이 얹히면 예상 못 한 결과가 나와요.'],
        ['LRC', '둘 다 혼자 시작하지만, 방화범의 실험이 당신의 정원에 새 품종을 들여와요.']],
      jobs: '프로젝트 기획자, 브랜드 아이덴티티 디자이너, 콘텐츠 전략가, 교육 콘텐츠 개발자, 시나리오 작가'
    },
    LPO: {
      emoji: '🧳', name: '씨앗 보부상', runner: '넘기는 러너', stages: ['Seeding', 'Planting'],
      line: '방향이 뚜렷한 씨앗을 <b>빠르게 꺼내</b> <b>여기저기 나눠 주는</b> 사람이에요.',
      short: '선언하듯 시작하고, 그 작업이 세상과 연결되길 바라요.',
      body: ['당신은 아이디어가 떠오르면 빠르게 행동으로 옮기고, 형식과 구조 안에서 탄탄하게 만들어 가는 창작자예요. 시작부터 방향이 뚜렷해요.',
        '작업이 누군가에게 닿았을 때의 반응을 떠올리며 만들어요. 유행을 살피되 자기 형식으로 소화하는 힘이 있어요.'],
      role: '바톤을 가장 많이 넘기는 러너예요. 방향이 분명한 바톤을 여러 개 넘겨 두면, 다른 러너들이 골라 이어받으며 바톤로그가 여러 갈래로 자라요.',
      synergy: [['EPO', '당신이 새 바톤을 열면 DJ가 받아 끝을 맺어요. 속도와 깊이의 조합이에요.'],
        ['EPC', '여러 방향으로 열어 둔 바톤을, 계승자가 하나씩 단단하게 닫아 줘요.'],
        ['ERC', '당신의 빠른 시작이 연금술사의 손에서 전혀 다른 결말을 맞아요.']],
      jobs: '크리에이티브 디렉터, 브랜드 전략가, 콘텐츠 크리에이터, 창업가, 미디어 기획자'
    },
    LRC: {
      emoji: '🔥', name: '고요한 방화범', runner: '넘기는 러너', stages: ['Seeding', 'Planting'],
      line: '아무도 모르게 <b>실험적인 불씨</b>를 피워 두는, <b>가장 강력한 바톤 공급자</b>예요.',
      short: '형식을 깨는 시작에 가장 신이 나고, 혼자 깊이 몰입할 때 독창적인 게 나와요.',
      body: ['당신은 새로운 작업을 시작하는 순간 에너지가 넘치고, 본 적 없는 걸 만들고 싶은 마음이 강한 창작자예요. 감각에서 출발해 만들면서 방향을 찾아요.',
        '여러 작업을 오가다 보니 미완성이 쌓이기도 하지만, 그 하나하나가 강렬한 가능성을 품고 있어요.'],
      role: '당신의 미완성 작업은 가장 이어받고 싶은 바톤이 돼요. Seeding 단계의 불씨라도 괜찮아요. 넘겨 두면 다른 러너가 전혀 다른 방향으로 이어 달리며 가장 흥미로운 바톤로그가 생겨요.',
      synergy: [['EPC', '당신이 피운 불씨를 계승자가 정밀하게 다듬어 완성해요. 실험과 완성도의 가장 강한 조합이에요.'],
        ['ERO', '서퍼가 당신의 실험을 이어받아 세상에 내보여 줘요.'],
        ['LPC', '둘 다 혼자 시작하지만, 정원사의 구조가 당신의 아이디어에 뼈대를 세워 줘요.']],
      jobs: '개념 미술가, 게임 아트 디렉터, 인터랙티브 아티스트, 실험 음악가, 독립 영화 감독, 크리에이티브 연구원'
    },
    LRO: {
      emoji: '🐙', name: '창작 생태계의 문어', runner: '넘기는 러너', stages: ['Seeding', 'Planting'],
      line: '여러 다리로 <b>실험을 동시에 벌이고</b>, <b>빠르게 나누는</b> 생태계의 중심이에요.',
      short: '시작과 실험, 나눔이 모두 에너지가 되는 유형이에요.',
      body: ['당신은 새로운 걸 시작하는 순간이 가장 즐겁고, 형식에 얽매이지 않고 손이 먼저 움직이는 창작자예요.',
        '여러 작업을 동시에 열어 두고, 만드는 과정을 사람들과 나누며 방향을 찾아요. 반응이 곧 다음 실험의 재료가 돼요.'],
      role: '바톤로그를 가장 넓게 뻗게 하는 러너예요. 실험적인 바톤을 빠르게 넘기면, 여러 러너가 각자 다른 방향으로 이어 달려요.',
      synergy: [['EPO', '당신이 퍼뜨린 실험을 DJ가 방향을 잡아 완성해요.'],
        ['ERC', '연금술사가 당신의 아이디어 하나를 깊이 파고들어 결과로 만들어요.'],
        ['LPC', '정원사의 차분한 구조가 당신의 속도에 리듬을 더해요.']],
      jobs: '크로스오버 아티스트, 미디어 아티스트, 문화 기획자, 실험적 브랜드 기획자, 커뮤니티 크리에이터'
    }
  };
  const ORDER = ['EPC', 'EPO', 'ERC', 'ERO', 'LPC', 'LPO', 'LRC', 'LRO'];
  const polesOf = code => AXES.map((a, i) => a.poles[code[i]]);

  /* 채점: 축마다 (답-3)을 기우는 쪽 부호로 더해요(-8~+8). 0이면 가장 세게 답한 문항 쪽, 그래도 같으면 왼쪽 */
  function score(answers) {
    const sums = {}, peak = {};
    QUESTIONS.forEach((q, i) => {
      const a = AXES.find(x => x.key === q.axis), sign = q.to === a.key[0] ? -1 : 1, v = (answers[i] - 3) * sign;
      sums[q.axis] = (sums[q.axis] || 0) + v;
      if (Math.abs(v) > Math.abs(peak[q.axis] || 0)) peak[q.axis] = v;
    });
    const code = AXES.map(a => { const s = sums[a.key] || peak[a.key] || -1; return s < 0 ? a.key[0] : a.key[1]; }).join('');
    return { code, sums };
  }

  let dialog, stage, answers, cursor, mine = null, mineSums = null, swapTimer = 0;

  function build() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'wp-dialog';
    dialog.setAttribute('aria-label', '내 작업성향 검사');
    dialog.innerHTML = `<button type="button" class="wp-close" aria-label="검사 닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button><div class="wp-stage" aria-live="polite"></div><p class="wp-toast" role="status"></p>`;
    document.body.append(dialog);
    stage = dialog.querySelector('.wp-stage');
    dialog.querySelector('.wp-close').onclick = close;
    dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
    dialog.addEventListener('close', () => { document.documentElement.classList.remove('wp-open'); clearTimeout(swapTimer); });
    dialog.addEventListener('keydown', onKey);
  }
  function close() { if (dialog?.open) dialog.close(); }

  /* 화면 바꾸기: 지금 화면이 살짝 사라지고 새 화면이 천천히 올라와요 */
  function show(html, { light = false, mount } = {}) {
    clearTimeout(swapTimer);
    const old = stage.firstElementChild;
    const put = () => {
      const screen = document.createElement('section');
      screen.className = 'wp-screen';
      screen.innerHTML = html;
      stage.replaceChildren(screen);
      dialog.classList.toggle('is-light', light);
      screen.scrollTop = 0;
      mount?.(screen);
      requestAnimationFrame(() => requestAnimationFrame(() => screen.classList.add('is-in')));
      const focus = screen.querySelector('[data-focus]') || screen.querySelector('h2, h3');
      focus?.focus?.({ preventScroll: true });
    };
    if (old && !reduce) { old.classList.remove('is-in'); old.classList.add('is-out'); swapTimer = setTimeout(put, 260); }
    else put();
  }

  const brand = `<p class="wp-brand">작업성향 검사</p>`;
  const arrow = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const backArrow = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const circles = (sel, demo) => `<div class="wp-scale${demo ? ' is-demo' : ''}" role="radiogroup" aria-label="얼마나 그런가요?">${SCALE.map((label, i) => `<button type="button" class="wp-dot wp-dot-${i + 1}" role="radio" aria-checked="${sel === i + 1}" aria-label="${label}" data-v="${i + 1}"${demo ? ' tabindex="-1"' : ''}><span></span></button>`).join('')}</div><div class="wp-scale-ends" aria-hidden="true"><span>${SCALE[0]}</span><span>${SCALE[4]}</span></div>`;
  const progress = n => `<div class="wp-progress"><p><b>${n}</b>/${QUESTIONS.length}</p><div class="wp-track"><i style="width:${(n / QUESTIONS.length) * 100}%"></i></div></div>`;

  function intro() {
    show(`<div class="wp-intro">
      <div class="wp-intro-head"><span class="wp-emoji" aria-hidden="true">🎨</span><p class="wp-kicker">★ 모로가도 러너 유형 검사</p><h2 tabindex="-1">나는 어떻게 작업할까?</h2></div>
      <ul class="wp-intro-types" aria-label="8가지 러너 유형">${ORDER.map(c => `<li title="${E(TYPES[c].name)}">${TYPES[c].emoji}</li>`).join('')}</ul>
      <div class="wp-foot"><p class="wp-meta">질문 <b>${QUESTIONS.length}개</b><span></span>걸리는 시간 <b>3분</b></p><button type="button" class="wp-btn" data-go="guide" data-focus>검사 시작하기</button></div>
    </div>`, { mount: s => s.querySelector('[data-go]').onclick = guide });
  }

  function guide() {
    show(`<div class="wp-guide">
      <div class="wp-top"><button type="button" class="wp-back" aria-label="처음으로">${backArrow}</button></div>
      ${progress(0)}
      <section><h3 tabindex="-1">검사 안내</h3><p>평소 작업할 때의 나를 떠올리며 솔직하게 골라 주세요. 정답은 없어요 :)</p></section>
      <section><h3>답하는 방법</h3><div class="wp-demo"><p>새 작업을 시작하는 첫날은 걱정되기보다 가장 설레는 순간이다.</p>${circles(0, true)}</div></section>
      <section><h3>검사가 끝나면,</h3><ul class="wp-bullets"><li>나의 <b>작업 방식</b>과 <b>러너 유형</b>을 알려 줘요.</li><li>바톤을 <b>함께 이어 달리면 좋은 유형</b>을 추천해요.</li><li>모로가도에서 <b>넘기는 러너</b>인지 <b>이어받는 러너</b>인지 알려 줘요.</li></ul></section>
      <div class="wp-foot"><button type="button" class="wp-btn" data-focus>검사 시작하기</button></div>
    </div>`, { mount: s => { s.querySelector('.wp-back').onclick = intro; s.querySelector('.wp-btn').onclick = () => { answers = Array(QUESTIONS.length).fill(0); cursor = 0; question(); }; } });
  }

  function question() {
    const q = QUESTIONS[cursor], last = cursor === QUESTIONS.length - 1;
    show(`<div class="wp-question">
      ${brand}
      ${progress(cursor + 1)}
      <h3 class="wp-q" tabindex="-1" data-focus>${E(q.text)}</h3>
      <div class="wp-answer">${circles(answers[cursor])}</div>
      <div class="wp-foot wp-row"><button type="button" class="wp-back-pill" aria-label="${cursor ? '이전 질문' : '검사 안내로'}">${backArrow}</button><button type="button" class="wp-btn wp-next" ${answers[cursor] ? '' : 'disabled'}>${last ? '결과 보기' : '다음'}</button></div>
    </div>`, {
      mount: s => {
        const next = s.querySelector('.wp-next');
        s.querySelectorAll('.wp-dot').forEach(b => b.onclick = () => pick(s, Number(b.dataset.v)));
        s.querySelector('.wp-back-pill').onclick = () => { if (cursor) { cursor--; question(); } else guide(); };
        next.onclick = advance;
      }
    });
  }
  function pick(s, v) {
    answers[cursor] = v;
    s.querySelectorAll('.wp-dot').forEach(b => b.setAttribute('aria-checked', String(Number(b.dataset.v) === v)));
    s.querySelector('.wp-next').disabled = false;
  }
  function advance() {
    if (!answers[cursor]) return;
    if (cursor < QUESTIONS.length - 1) { cursor++; question(); return; }
    const r = score(answers); mine = r.code; mineSums = r.sums;
    analyzing();
  }
  function onKey(e) {
    const s = stage.querySelector('.wp-question');
    if (!s) return;
    if (/^[1-5]$/.test(e.key)) { pick(s, Number(e.key)); e.preventDefault(); }
    else if (e.key === 'Enter' && answers[cursor] && !e.target.closest('.wp-back-pill')) { advance(); e.preventDefault(); }
  }

  function analyzing() {
    show(`<div class="wp-loading">${brand}<p class="wp-spin" role="status"><i aria-hidden="true"></i>유형 분석 중…</p></div>`);
    swapTimer = setTimeout(() => result(mine), reduce ? 400 : 2000);
  }

  const bars = (code, sums) => `<ul class="wp-bars">${AXES.map((a, i) => { const s = sums ? sums[a.key] : (code[i] === a.key[0] ? -5 : 5); const pct = 50 + Math.max(-8, Math.min(8, s)) / 8 * 44; return `<li><span>${a.name}</span><div class="wp-bar"><i style="--to:${pct}%"></i></div><b>${a.poles[code[i]]}</b></li>`; }).join('')}</ul>`;

  function result(code) {
    const t = TYPES[code];
    show(`<div class="wp-result">
      ${brand}
      <h3 tabindex="-1">나의 러너 유형은-?</h3>
      <div class="wp-stack"><article class="wp-card">
        <header><span class="wp-emoji" aria-hidden="true">${t.emoji}</span><div><h2>${E(t.name)}</h2><p>${polesOf(code).join(' · ')}</p></div></header>
        <p class="wp-line">${t.line}</p>
        ${bars(code, mineSums)}
        <div class="wp-what"><p>이 유형은?</p><p>${E(t.short)} 모로가도에서는 <b>${E(t.runner)}</b>예요.</p></div>
        <button type="button" class="wp-dark-pill" data-detail>내 유형 자세히 보기 ${arrow}</button>
      </article></div>
      <div class="wp-foot"><button type="button" class="wp-btn" data-share-test>검사 링크 공유하기</button><button type="button" class="wp-btn wp-btn-gray" data-again>다시 검사하기</button></div>
    </div>`, {
      mount: s => {
        s.querySelector('[data-detail]').onclick = () => detail(code, true);
        s.querySelector('[data-share-test]').onclick = () => share('', '검사 주소를 복사했어요. 친구에게 보내 보세요!');
        s.querySelector('[data-again]').onclick = () => { answers = Array(QUESTIONS.length).fill(0); cursor = 0; question(); };
      }
    });
  }

  function detail(code, own) {
    const t = TYPES[code], give = code[0] === 'L';
    const cta = give ? ['#/upload', '멈춘 작업 바톤으로 넘기기'] : ['#/explore', '이어받을 바톤 찾아보기'];
    show(`<div class="wp-detail">
      <div class="wp-detail-top"><button type="button" class="wp-crumb">${backArrow}<span>${mine ? '내 결과로' : '검사 처음으로'}</span></button><button type="button" class="wp-icon" data-share-type aria-label="이 유형 공유하기"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.2M8.3 13.2l7.4 4.2"/></svg></button></div>
      <h3 tabindex="-1">${own ? '내 유형 자세히 보기' : '이런 유형이에요'}</h3>
      <div class="wp-hero"><span class="wp-emoji" aria-hidden="true">${t.emoji}</span><div><h2>${E(t.name)}</h2><ul>${polesOf(code).map(p => `<li>${p}</li>`).join('')}</ul></div></div>
      <section><h4>이 유형은?</h4>${t.body.map(p => `<p>${E(p)}</p>`).join('')}</section>
      <section><h4>모로가도에서는 ${E(t.runner)}</h4><p>${E(t.role)}</p><ul class="wp-stages" aria-label="잘 맞는 진척도">${Object.keys(STAGES).map(k => `<li class="${t.stages.includes(k) ? 'is-on' : ''}" style="--c:${STAGES[k]}"><i></i>${k}</li>`).join('')}</ul></section>
      <section><h4>함께 이어 달리면 좋은 유형</h4><div class="wp-mates">${t.synergy.map(([c, why]) => `<button type="button" class="wp-mate" data-type="${c}"><span class="wp-emoji" aria-hidden="true">${TYPES[c].emoji}</span><span><b>${E(TYPES[c].name)}</b><small>${polesOf(c).join(' · ')}</small><span>${E(why)}</span></span></button>`).join('')}</div></section>
      <section><h4>이런 일이 잘 어울려요</h4><p>${E(t.jobs)}</p></section>
      <div class="wp-detail-actions"><a class="wp-btn" href="${cta[0]}">${cta[1]} ${arrow}</a><button type="button" class="wp-btn wp-btn-line" data-share-type>결과 공유하기</button>${mine ? '' : '<button type="button" class="wp-btn wp-btn-line" data-start>나도 검사해 보기</button>'}</div>
      <section class="wp-others"><h4>다른 유형도 둘러보세요</h4><div class="wp-grid">${ORDER.filter(c => c !== code).map(c => `<button type="button" class="wp-chip-type" data-type="${c}"><span aria-hidden="true">${TYPES[c].emoji}</span>${E(TYPES[c].name)}</button>`).join('')}</div></section>
    </div>`, {
      light: true,
      mount: s => {
        s.querySelector('.wp-crumb').onclick = () => mine ? result(mine) : intro();
        s.querySelectorAll('[data-share-type]').forEach(b => b.onclick = () => share(code, '이 유형 주소를 복사했어요.'));
        s.querySelectorAll('[data-type]').forEach(b => b.onclick = () => detail(b.dataset.type, b.dataset.type === mine));
        s.querySelector('a.wp-btn').onclick = close;
        s.querySelector('[data-start]')?.addEventListener('click', guide);
      }
    });
  }

  async function share(code, msg) {
    const url = `${location.origin}${location.pathname}?test${code ? '=' + code : ''}#/explore`;
    try { await navigator.clipboard.writeText(url); toast(msg); }
    catch { toast('주소: ' + url); }
  }
  let toastTimer = 0;
  function toast(msg) {
    const el = dialog.querySelector('.wp-toast');
    el.textContent = msg; el.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  function open(code) {
    build();
    stage.replaceChildren();
    if (!dialog.open) { dialog.showModal(); document.documentElement.classList.add('wp-open'); }
    if (code && TYPES[code]) detail(code, code === mine);
    else if (mine) result(mine);
    else intro();
  }

  window.MorogadoWP = { open, TYPES, QUESTIONS, score };

  /* 공유 주소로 들어오면 바로 열어요(주소의 ?test는 지워요) */
  const params = new URLSearchParams(location.search);
  if (params.has('test')) {
    const code = (params.get('test') || '').toUpperCase();
    params.delete('test');
    history.replaceState(null, '', location.pathname + (params.toString() ? '?' + params : '') + location.hash);
    const go = () => setTimeout(() => open(TYPES[code] ? code : ''), 500);
    if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
  }
})();
