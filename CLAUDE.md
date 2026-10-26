# 모로가도 졸전 사이트 — 인수인계 (Claude용)

> 이 저장소(`morogado722/morogado`)는 **실제 졸전에 올릴 사이트**예요. 사용성 평가 사이트 `ut.upload`를 복사해서 시작했어요(2026-10-16).
> **`ut.upload` 저장소는 사용성 평가가 진행 중이라 절대 수정하지 마세요.** 모든 작업은 이 저장소에서만 해요.
>
> - 라이브 주소: https://morogado722.github.io/morogado/ (GitHub Pages, `main` 루트)
> - 구성(10/16 반영): 루트 `index.html` = 팀원 홈 사이트(아티팩트 JoShtS3VWTggDs8ueGuhcr) → `#/upload`는 지아 메이커(`upload.html`) → `#/baton/아이디`는 지아 상세페이지(`baton/`)
>   - 홈·커뮤니티·바톤센터·저장·작업성향은 팀원 코드: `site.js`·`site.css`·`store.js`(IndexedDB)·`figma-home.*`·`figma-log.*`·`log.*`·`*-samples.js`·`assets/previews|figma|director-*|ui`·`maker/`(팀원 사이트가 쓰는 파일 3개만).
>   - 업로드: `upload.js`가 `upload.html?embedded=1`을 iframe으로 띄워요. 임베드일 땐 `site-embed.css`로 메이커 헤더를 숨기고, `site-bridge.js`가 "바톤 만들기" 결과를 사이트 저장소에 올린 뒤 `#/baton/아이디`로 보내요(`detail.js` finish). 임베드에선 사용성 평가 설문(`research.js`)은 꺼요(`MOROGARO_EMBEDDED`).
>   - 상세: `jia-detail.js`·`jia-detail.css`가 `baton/index.html?embed=1&site=1`을 화면 전체 iframe으로 띄우고, 사이트 기록을 메이커 기록 모양으로 바꿔 보내요. 상세 헤더 메뉴·검색·저장·알림, 북마크, 파일 받기, 이어달리기(`#/upload?parent=`), 수정하기는 postMessage로 사이트에 연결돼요(`baton-render.js`의 `siteHost`). 헤더 "매거진"은 사이트에 맞춰 "바톤센터"로 표시해요.
>   - 팀원의 원래 상세(`detail.js`)는 쓰지 않아서 가져오지 않았고, 팀원 `detail.css`는 `site-detail.css`로 이름을 바꿨어요(메이커 `detail.css`와 겹쳐서).
>   - `assets/figma/`의 고화질 원본 이미지는 화면에 안 쓰여서 빼고 SVG·manifest만 뒀어요.
> - 헤더(10/18): `header-figma.css`가 피그마 Sticky Header(3824:1266)를 1440 기준 px 그대로 맞춰요(`--hu`). 메뉴 순서 탐색·바톤센터·커뮤니티·내 작업성향은?. 플러스 버튼 빛 번짐은 `hf-breathe` 4.8초 깜빡임.
> - 상세 헤더(10/18): 사이트 안에선 `baton-live.css`의 `html.is-site-host` 규칙으로 홈 헤더와 같은 좌표·크기·순서, 플러스 버튼·보는 사람 이름 추가(`baton-render.js`). "내 작업성향은?" 민트는 홈(`body[data-route=home]`)에서만.
> - 업로드 진입(10/18, `dock-upload.js`·`.css`): 헤더 플러스 → 바로 `#/upload`. 아래 독 플러스 → 독 위로 업로드 첫 칸(피그마 3829:2459)이 펼쳐지고, 파일을 넣거나 칸을 누르면 `#/upload`로 이동(파일은 `pendingFiles`로 1단계에 들어감). 예전 `fh-upload` 모달은 안 써요.
> - 바톤 서버(10/18): 같은 Apps Script에 `batonUpload`·`batonPublish`(POST)·`?action=batons`(GET) 추가. 드라이브 '모로가도 졸전 바톤' 폴더·시트에 저장(시트 '공개' 체크 끄면 숨김). 사이트는 `store-remote.js`가 store.js를 감싸 서버 바톤을 함께 보여주고, 올릴 때 서버 우선·실패 시 브라우저 저장. 서버 아이디는 `r-`로 시작, 이 브라우저에서 올린 것만 `mine`. 댓글·북마크는 아직 브라우저에만.
> - 랜딩·헤더 v2(10/26, 피그마 HOME 4006:10070): `#/`는 랜딩(`landing.js`·`landing.css`, 에셋 `assets/landing/`), 바톤 탐색 피드는 `#/explore`로 옮김(`site.js` renderRoute에서 `explore`를 떼고 예전 홈처럼 그려요, `data-route`는 그대로 `home`). 헤더는 `header-v2.css` + `index.html`의 `hd-*` 마크업(워드마크 로고 · 탐색/커뮤니티/내 작업성향은? · 525 검색 · 검정 '바톤 올리기' · 회원 가입|로그인 → 이름 정하면 '이름 님 | 내 바톤'). 상세 iframe은 `baton-render.js`(`is-header-v2`)와 `baton-live.css` 맨 아래 블록에서 같은 모양으로 바꿔요. 바톤센터는 메뉴에서 빠졌고 모바일 메뉴(☰)에만 있어요.
> - 헤더·필터 모달(10/27): 헤더 아래 그림자 선 없앰(`header-shape.svg` 필터 제거 + `figma-home.css`의 site-header drop-shadow를 `header-v2.css`에서 `filter:none`). 홈(`data-route=landing`) 말고는 심볼 로고 헤더(피그마 4010:10602: 심볼 41×28 · 저장/알림 아이콘 · '이름 님' + 아바타) — `header-v2.css`의 `body:not([data-route=landing])` 블록, 상세 iframe은 `baton-render.js`·`baton-live.css` 맨 아래. 헤더 검색창을 누르면 필터 모달(`filter-modal.js`·`.css`, 피그마 3989:2489)이 떠요. '검색'을 누르면 `window.MorogadoSite.apply(검색어, 조건)` → `#/explore`, 조건은 `filter.adv`로 `renderHome`에서 `MorogadoFilterModal.match`로 걸러요. 상세 iframe 검색창은 `site-nav {action:'filter'}`로 같은 모달을 열어요.
> - 주의: `config.js`의 Apps Script URL은 아직 사용성 평가와 **같은 서버·시트**를 써요. 졸전용으로 분리할지 사용자에게 확인 필요.
>
> 아래는 ut.upload에서 이어받은 내용이에요. "ut.upload" 주소·저장소 언급은 이 저장소(morogado)로 바꿔 읽으세요.

---


이 파일을 먼저 읽고 바로 작업을 이어가세요. 사용자(지아)는 졸전 프로젝트 **모로가도**의 디자이너예요. 요청은 "이거 한 줄로", "좀 더 느리게"처럼 러프하게 와요. 되묻지 말고, 아래 맥락으로 의도를 해석해 **바로 고치고 → 확인하고 → 푸시**하면 돼요.

## 1. 기본 정보

- **라이브 사이트:** https://morogado722.github.io/ut.upload/ (GitHub Pages, `main` 브랜치 루트가 그대로 배포됨)
- **저장소:** github.com/morogado722/ut.upload (`main`에 바로 커밋·푸시. PR 없음)
- **용도:** 공개 사용성 평가(UT)
  - 참가자가 작업 파일을 올리면 AI가 바톤(작업 카드)을 채워줘요.
  - 노트·아이디어를 쓰면 상세페이지로 넘어가요.
  - 끝나면 구글 폼 설문(커피 기프티콘)으로 이어져요.
- **피그마:** 파일 키 `FZXlQEh3aOOazKfZSfIYZA`
  - 사용자가 `...?node-id=3756-485` 같은 링크를 주면 Figma MCP로 `get_screenshot` / `get_design_context`를 확인한 뒤 구현해요.
  - 에셋은 `use_figma`의 exportAsync(SVG/PNG)로 받아요. 컨테이너에서 figma.com으로 curl은 막혀 있어요.
- **스택:** 순수 HTML/CSS/JS(빌드 없음)
  - 폰트는 Spoqa Han Sans Neo예요(`fonts.css`).
  - 기본 색: 배경 `#FAFAFA`, 글자 `#262626`, 보조 글자 `#8A8A8A`/`#626262`, 브랜드 민트 `#00F998`.

## 2. 작업 방식 (중요)

1. **캐시 버스팅:** CSS/JS를 고치면 `index.html`(상세페이지는 `baton/index.html`)에서 해당 태그의 `?v=` 값을 꼭 올려요. 형식은 `MMDD+알파벳`, 예: `?v=1014a` → `?v=1014b`.
2. **눈으로 확인:** Playwright로 스크린샷을 찍어 확인해요.
   - 로컬 서버: `python3 -m http.server <포트>`. 백그라운드로 띄울 땐 `setsid nohup ... &`.
   - Chromium 경로: `executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'`
   - 모바일은 `devices['iPhone 13']`, 390×844(Safari 체감 높이 664~740도 확인).
   - 데스크톱에서 모바일 게이트를 우회하려면 `?desktop`.
3. **커밋·푸시:** 커밋 메시지 끝에 세션 attribution 줄을 붙이고 `git push origin main`.
4. **사용자에게 답하기:**
   - 한국어로, 바뀐 점만 짧게 말해요.
   - 반영까지 몇 분 걸리니 "주소 뒤에 `?v=숫자`를 붙여 열어보세요"라고 안내해요.
   - 시안에 없는 걸 임의로 넣었으면 "빼고 싶으면 말해 주세요"라고 짚어요.
5. **문구 톤:** 사이트 문구는 다정한 해요체예요. "AI스러운" 딱딱한 문구는 싫어해요.
6. **고정 문구:** "저희의 무사졸업을 위해…" 문구는 사용자가 직접 정한 거라 유지해요(피그마에 "저희 무사 졸업"으로 돼 있어도).

## 3. 파일 지도

**바톤 메이커 (업로드 페이지, 루트 `index.html`)**

| 파일 | 역할 |
|---|---|
| `mobile-gate.js` | 휴대폰·태블릿 차단 안내 화면(아래 4절) |
| `fresh-start.js` | 새 탭이면 처음 업로드 단계부터 시작 |
| `config.js` | Apps Script 웹앱 URL(`appsScriptUrl`) |
| `app.js` | 메인 흐름. 업로드 진행률은 `getUploadProgress` + `progress-boost.js`(파일 50% → 분석 70% → 단계마다 +5% → 노트·아이디어 다 채우면 100%) |
| `file-analysis.js` | 파일 읽기 |
| `size-warning.js` | 용량 경고 |
| `review.js` / `review.css` | 파일 정보 단계(아래 참고) |
| `note.js` / `note.css` | 바톤 노트(아래 참고) |
| `note-snap.js` | 파일정보 → 노트 전환 스크롤. 노트 textarea는 따로 스크롤 |
| `ambient.js` / `ambient.css` | 진척도 단계 색. `accents`가 있고, `assets/tint/<Stage>/`의 색 바뀐 아이콘을 `TINTED` 세트로 교체해요 |
| `header.css` / `header.js` | 헤더 |
| `refinement.css` | 잡다한 다듬기 |
| `research.js` / `research.css` | 끝난 뒤 설문 카드 |
| `detail.js` | 메이커 → 상세페이지 연결 |
| `stepper.*` | 단계 표시 |
| `loading.*` | 로딩 화면 |

- **`file-analysis.js` 세부:**
  - PDF·AI는 pdf.js로, PSD는 `vendor/ag-psd`(지연 로드)로 읽어요.
  - 제한: 파일당 50MB(AI·PSD 150MB), 최대 20개. 넘는 파일은 건너뛰고 합계에서도 빼요.
  - 업로드 칸의 안내 문구는 `index.html`의 `#drop-limit`예요.
- **`review.js` / `review.css`(파일 정보 단계):**
  - AI가 사진 한 장만 받아도 모든 칸을 채워요: 제목, 진척도, 키컬러, 폰트+다운로드 링크, 툴(기본 Illustrator/Figma).
  - 진척도 말풍선 문구는 "AI가 판단한 진척도 · 근거 보기"예요. 사용자가 다르게 고르면 "AI 판단과 달라요 · 근거 보기"로 바뀌어요.
  - 선택된 단계 그림은 불투명도 100%(`stage-*-on.svg`)로 보여요.
- **`note.js` / `note.css`(바톤 노트):**
  - AI가 쓰는 동안 '다음' 버튼을 잠가요.
  - 노트는 가이드 항목별 문단 `[라벨] …`으로 써요.
  - 가이드 체크박스는 내용에서 자동으로 체크돼요.
  - 아이디어 쪽에 "다시 생각해보기" 버튼과 추가 버튼이 있어요.

**상세페이지 (`baton/`)**

| 파일 | 역할 |
|---|---|
| `baton-render.js` | 렌더링. 넓은 화면에선 확대하지 않고 가운데 정렬, 헤더만 꽉 차게 |
| `baton-live.css` | 상세페이지 스타일 |
| `baton-data.js` | 상세페이지 데이터 |
| `app.js` | 상세페이지 동작 |

- 정보 패널은 피그마 3625:3658 기준이에요.
- 폰트 칩에는 다운로드 아이콘이 붙어요.
- 팔레트는 "+N"을 누르면 펼쳐져요.
- 태그는 칩으로 보여요.
- "나도 제안하기" 모달이 있어요.
- 로그 페이지는 흰 배경에 `#FAFAFA` 로그 박스예요.

**기타**

| 파일 | 역할 |
|---|---|
| `assets/` | 아이콘. `og-image.png`(공유 미리보기), favicon, `seed-character.svg`(모바일 씨앗 캐릭터) |
| `deploy/apps-script/Code.gs` | 서버 쪽(아래 5절) |
| `server.py`, `*.py`, `tests/`, `QA*.md`, `verification*.json` | 예전 로컬용. 지금 배포에선 안 써요 |

## 4. 모바일 게이트 (`mobile-gate.js`) — 최근 작업

- **차단 조건:** 터치 기기나 모바일 UA면 PC로 열라는 안내를 띄우고, `document.write('<plaintext>')`로 무거운 앱 로딩을 멈춰요.
- **카톡 인앱 브라우저:** `kakaotalk://web/openExternal`로 기본 브라우저로 넘겨요(sessionStorage `mg-ext`로 1회만).
- **레이아웃(피그마 3756:485), 위에서부터:**
  1. 애니메이션 로고(2.6초)
  2. 24px 굵은 제목 "노트북·PC에서 / 열어주세요!"와 오른쪽 씨앗 캐릭터(살랑 흔들림)
  3. `#EEE` 카드: "? 이게 뭔가요?" + 소개 3문단
  4. 민트 그라데이션 버튼 "카톡으로 나에게 링크 보내기...🏃"
  5. "주소 복사하기"
- **로고 모션 뒤 자동 스크롤:**
  - 2.6초 동안 easeInOutQuart로 천천히 내려가요.
  - 멈추면 콘텐츠(캐릭터 머리 ~ 주소 복사하기 글자)가 위:아래 여백 약 68:32로 살짝 아래쪽에 앉아요(`* .68`).
  - 아래 공간이 모자라면 아래 패딩을 자동으로 늘려요.
  - 도중에 사용자가 터치하거나 스크롤하면 멈춰요.
  - 화면 위로 잘리는 로고는 잘리는 만큼 흐려져요.

## 5. Apps Script (서버) — `deploy/apps-script/Code.gs`

- **웹앱 URL:** `config.js`의 `appsScriptUrl`(배포 ID `AKfycbyysPImMz…W031S`). 코드를 고치면 사용자가 직접 해야 하는 일:
  1. Apps Script 편집기에 붙여넣어요.
  2. **배포 관리 → 기존 배포 편집 → 새 버전**으로 배포해요. 새 배포를 만들면 URL이 바뀌니 안 돼요.
  - 사용자에게 안내할 땐 commit 고정 raw URL을 줘요(raw.githubusercontent 캐시 때문).
- **OpenAI 호출:**
  - Responses API에 json_schema를 써요.
  - 모델은 `gpt-4.1-mini`(스크립트 속성 `OPENAI_MODEL`로 바꿀 수 있어요).
  - 하루 한도는 `AI_DAILY_LIMIT`(기본 300)예요.
- **API 키:** **스크립트 속성 `OPENAI_API_KEY`에만** 있어요. 절대 코드·저장소에 넣지 마세요. 키 관리·사용량은 platform.openai.com에서 봐요.
- **저장 위치:**
  - 시트 `1NssMB5_Iwh99b-IE0uTfYXfauSxk2285ejZ4vscujPA`(로그, 세션, '한눈에 보기' 탭, 이미지 없음)
  - 드라이브 폴더 "모로가도 사용성 평가"(세션별 폴더에 캡처 저장)
  - Google Drive MCP로 저장이 되는지 확인할 수 있어요.
- **사용자가 직접 실행하는 함수:**
  - `연결_테스트`
  - `설문_만들기`
  - `설문_시트_분리`: 설문 응답을 별도 시트로
  - `설문_다듬기`: 안내문, 척도 통일, 참여번호 문항을 맨 아래 "✋ 여기는 적지 않으셔도 돼요!"로
  - `한눈에_보기_만들기`
- **설문 관련 스크립트 속성:** `FORM_URL`, `FORM_ENTRY`, `FORM_EDIT_URL`

## 6. 남은 일 / 사용자가 해야 할 일

- [ ] Apps Script에 최신 `Code.gs` 반영 → 기존 배포 새 버전 → `설문_다듬기` 실행(필요하면 `설문_시트_분리`)
- [ ] OpenAI API 키 교체(새 키를 스크립트 속성에 넣고 예전 키 삭제)
- [ ] (제안만 해둠) 데스크톱 반응형: 넓은 화면에서 메이커 확대, 아래 로그 살짝 보이기. 사용자 답 대기 중.
