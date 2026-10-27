/* 10/27 검색창을 누르면 뜨는 필터 모달 — 피그마 filter(3989:2489).
 * 왼쪽 메뉴(바톤 유형·분야·파일 확장자명·진척도·바톤 로그 현황·필터)를 누르면 오른쪽 해당 칸으로 스크롤, 스크롤하면 메뉴 강조가 따라와요.
 * '검색'(또는 Enter)을 누르면 검색어 + 고른 조건으로 #/explore 결과를 보여 줘요(site.js의 MorogadoSite.apply).
 * 헤더 검색창(#site-search)과 상세페이지 iframe 헤더 검색창 둘 다 이 모달을 열어요. */
(() => {
  'use strict';
  const W = '#F5F5F5';
  const ic = (vb, body) => `<svg viewBox="${vb}" fill="none" aria-hidden="true">${body}</svg>`;
  const st = `stroke="${W}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`;
  const SEARCH = ic('0 0 27 27', `<path d="M20.4812 8.33597C20.6219 8.0091 21.1792 8.0091 21.321 8.33597C21.5726 8.91767 21.9249 9.59134 22.3482 10.0146C22.7714 10.4379 23.4451 10.7902 24.0268 11.0417C24.3548 11.1824 24.3548 11.7398 24.0268 11.8816C23.4451 12.1331 22.7714 12.4855 22.3482 12.9087C21.9249 13.332 21.5726 14.0056 21.321 14.5873C21.1803 14.9153 20.623 14.9153 20.4812 14.5873C20.2297 14.0056 19.8773 13.332 19.454 12.9087C19.0308 12.4855 18.3571 12.1331 17.7754 11.8816C17.4486 11.7409 17.4486 11.1835 17.7754 11.0417C18.3571 10.7902 19.0308 10.4379 19.454 10.0146C19.8773 9.59134 20.2297 8.91767 20.4812 8.33597Z" fill="${W}"/><path d="M18.8788 6.74234C18.8788 6.74234 17.8654 5.03503 16.2673 4.26409C14.295 3.31259 12.0432 3.1137 9.93465 3.70475C7.82609 4.29581 6.00575 5.63616 4.81537 7.4742C3.62499 9.31223 3.14642 11.5216 3.46949 13.6874C3.79257 15.8533 4.89508 17.8268 6.57005 19.2374C8.24502 20.648 10.3773 21.3988 12.5665 21.3488C14.7558 21.2987 16.8515 20.4513 18.4603 18.9656" ${st}/><path d="M18.542 19.0566L24.1607 24.6754" ${st}/>`);
  const SPARK = (x, y) => `<path transform="translate(${x} ${y})" d="M3.0636.75451C3.20969.41516 3.7883.41516 3.93554.75451C4.19666 1.35843 4.56246 2.05782 5.00189 2.49725C5.44131 2.93667 6.14071 3.30247 6.74463 3.5636C7.08512 3.70969 7.08512 4.2883 6.74463 4.43554C6.14071 4.69666 5.44131 5.06247 5.00189 5.50189C4.56246 5.94131 4.19666 6.64071 3.93554 7.24463C3.78945 7.58512 3.21084 7.58512 3.0636 7.24463C2.80247 6.64071 2.43667 5.94131 1.99725 5.50189C1.55782 5.06247.858428 4.69666.254509 4.43554C-.0848363 4.28945-.0848363 3.71084.254509 3.5636C.858428 3.30247 1.55782 2.93667 1.99725 2.49725C2.43667 2.05782 2.80247 1.35843 3.0636.75451Z" fill="${W}"/>`;
  const MENU_ICONS = [
    ic('0 0 28 28', `${SPARK(2, 1.5)}<path d="M18.9561 17.199C18.6854 17.5051 18.4014 17.8073 18.1043 18.1043C13.8086 22.4001 8.42667 23.983 6.08352 21.6399C4.47712 20.0335 4.71602 16.9988 6.40929 13.8651M8.73049 10.5661C9.0122 10.2458 9.30854 9.92957 9.61906 9.61906C13.9148 5.32329 19.2967 3.74038 21.6399 6.08352C23.2474 7.69103 23.007 10.7288 21.3106 13.8648M14.8409 13.8408C14.8409 14.3931 14.3932 14.8408 13.8409 14.8408C13.2886 14.8408 12.8409 14.3931 12.8409 13.8408C12.8409 13.2885 13.2886 12.8408 13.8409 12.8408C14.3932 12.8408 14.8409 13.2885 14.8409 13.8408Z" ${st}/><path d="M12.001 5.5708C14.0038 6.29258 16.165 7.67917 18.1047 9.61889C22.4005 13.9147 23.9834 19.2966 21.6403 21.6397C19.2971 23.9828 13.9152 22.3999 9.61944 18.1042C7.94835 16.4331 6.68779 14.5976 5.90918 12.8406" ${st}/>`),
    ic('0 0 28 28', `${SPARK(7, 10.5)}<path d="M9.75 4.84C9.75 4.546 9.75 4.399 9.808 4.287C9.858 4.188 9.939 4.108 10.038 4.057C10.151 4 10.299 4 10.594 4H18.406C18.701 4 18.849 4 18.962 4.057C19.061 4.108 19.142 4.188 19.193 4.287C19.25 4.399 19.25 4.546 19.25 4.84V7.36C19.25 7.654 19.25 7.801 19.193 7.913C19.142 8.012 19.061 8.092 18.962 8.143C18.849 8.2 18.701 8.2 18.406 8.2H10.594C10.299 8.2 10.151 8.2 10.038 8.143C9.939 8.092 9.858 8.012 9.808 7.913C9.75 7.801 9.75 7.654 9.75 7.36V4.84Z" ${st}/><path d="M21.361 19.75H7.639C7.148 19.75 6.903 19.75 6.699 19.79C5.862 19.956 5.207 20.607 5.041 21.44C5 21.643 5 21.887 5 22.375C5 22.863 5 23.107 5.041 23.31C5.207 24.143 5.862 24.794 6.699 24.96C6.903 25 7.148 25 7.639 25H21.361C21.852 25 22.097 25 22.301 24.96C23.138 24.794 23.793 24.143 23.959 23.31C24 23.107 24 22.863 24 22.375C24 21.887 24 21.643 23.959 21.44C23.793 20.607 23.138 19.956 22.301 19.79C22.097 19.75 21.852 19.75 21.361 19.75Z" ${st}/><path d="M7.5 18.001L6.449 18.608C6.361 18.659 6.316 18.684 6.273 18.713C6.235 18.737 6.196 18.765 6.16 18.792C6.118 18.823 6.081 18.854 6.007 18.916C5.695 19.177 5.518 19.337 5.385 19.525C5.242 19.726 5.137 19.951 5.072 20.188C5 20.456 5 20.746 5 21.324V21.64C5 22.816 5 23.404 5.23 23.854C5.433 24.249 5.755 24.57 6.153 24.771C6.604 25 7.195 25 8.378 25H20.622C21.805 25 22.396 25 22.847 24.771C23.245 24.57 23.568 24.249 23.77 23.854C24 23.404 24 22.816 24 21.64V21.324C24 20.746 24 20.456 23.928 20.188C23.863 19.951 23.758 19.726 23.615 19.525C23.455 19.298 23.231 19.113 22.785 18.743L18.882 15.508C18.435 15.137 18.212 14.952 18.051 14.725C17.909 14.524 17.803 14.3 17.739 14.062C17.667 13.794 17.667 13.505 17.667 12.927V8.2M11.333 10.001V8.2" ${st}/>`),
    ic('0 0 28 28', `${SPARK(0, 3)}<path d="M2.333 14.233C2.333 16.194 2.333 17.174 2.714 17.922C3.05 18.581 3.585 19.116 4.244 19.452C4.993 19.833 5.973 19.833 7.933 19.833H20.066C22.027 19.833 23.007 19.833 23.755 19.452C24.414 19.116 24.949 18.581 25.285 17.922C25.666 17.174 25.666 16.194 25.666 14.233V9.1C25.666 7.14 25.666 6.16 25.285 5.411C24.949 4.752 24.414 4.217 23.755 3.881C23.007 3.5 22.027 3.5 20.066 3.5H7.933M9.333 24.5H18.666M14 19.833V24.5" ${st}/>`),
    ic('0 0 28 28', `${SPARK(4, 3)}<path d="M13.5 7H13.934C16.982 7 18.505 7 19.084 7.547C19.584 8.02 19.805 8.717 19.67 9.392C19.514 10.173 18.27 11.053 15.782 12.813L11.718 15.688C9.23 17.447 7.986 18.327 7.83 19.108C7.695 19.783 7.916 20.48 8.416 20.953C8.995 21.5 10.518 21.5 13.566 21.5H14.5M24 21C24 22.657 22.657 24 21 24C19.343 24 18 22.657 18 21C18 19.343 19.343 18 21 18C22.657 18 24 19.343 24 21Z" ${st}/>`),
    ic('0 0 28 28', `${SPARK(16, 3.5)}<path d="M11 5L17 23L20 14H24" ${st}/><path d="M4 14H8L9.5 9.5L11 5" ${st}/>`),
    ic('0 0 28 28', `${SPARK(1, 6.5)}<path d="M9 14L12 17V25L16 22V17L22.17 10.83C22.701 10.3 23 9.58 23 8.83C23 8.08 22.702 7.36 22.171 6.829C21.64 6.298 20.921 6 20.17 6H7.83" ${st}/>`),
  ];
  const D9 = 'stroke="#D9D9D9" stroke-width="1.18" stroke-linecap="round" stroke-linejoin="round"';
  const FA = 'stroke="#FAFAFA" stroke-width="1.18" stroke-linecap="round" stroke-linejoin="round"';
  const TYPE_ICONS = {
    all: ic('0 0 48 48', `<circle cx="30.5" cy="37" r="11" fill="#D9D9D9" fill-opacity=".51"/><circle cx="41.5" cy="27" r="6" fill="#D9D9D9" fill-opacity=".51"/><circle cx="14.5" cy="15" r="6" fill="#D9D9D9" fill-opacity=".51"/><path d="M36.25 10L36.73 10.96C36.89 11.28 36.97 11.45 37.08 11.59C37.18 11.71 37.29 11.82 37.41 11.92C37.55 12.03 37.72 12.11 38.04 12.27L39 12.75L38.04 13.23C37.72 13.39 37.55 13.47 37.41 13.58C37.29 13.68 37.18 13.79 37.08 13.91C36.97 14.05 36.89 14.22 36.73 14.54L36.25 15.5L35.77 14.54C35.61 14.22 35.53 14.05 35.42 13.91C35.32 13.79 35.21 13.68 35.09 13.58C34.95 13.47 34.78 13.39 34.46 13.23L33.5 12.75L34.46 12.27C34.78 12.11 34.95 12.03 35.09 11.92C35.21 11.82 35.32 11.71 35.42 11.59C35.53 11.45 35.61 11.28 35.77 10.96L36.25 10Z" ${D9}/><path d="M12.93 38L13.68 39.49C13.88 39.91 13.99 40.12 14.13 40.3C14.25 40.46 14.4 40.61 14.56 40.73C14.74 40.87 14.95 40.97 15.36 41.18L16.86 41.93L15.36 42.68C14.95 42.88 14.74 42.99 14.56 43.13C14.4 43.25 14.25 43.4 14.13 43.56C13.99 43.74 13.88 43.95 13.68 44.36L12.93 45.86L12.18 44.36C11.97 43.95 11.87 43.74 11.73 43.56C11.61 43.4 11.46 43.25 11.3 43.13C11.12 42.99 10.91 42.88 10.49 42.68L9 41.93L10.49 41.18C10.91 40.97 11.12 40.87 11.3 40.73C11.46 40.61 11.61 40.46 11.73 40.3C11.87 40.12 11.97 39.91 12.18 39.49L12.93 38Z" ${D9}/><path d="M5.46 27.93V24M3.5 25.96H7.43M5.18 40.36V38M4 39.18H6.36" ${D9}/><path d="M11.91 28.25L10.76 31H9.24L13.95 20.11H15.38L20.11 31H18.55L17.4 28.25H11.91ZM14.66 21.68L12.39 27.03H16.92L14.66 21.68ZM22.77 20.11V29.69H28.39V31H21.31V20.11H22.77ZM31.23 20.11V29.69H36.84V31H29.76V20.11H31.23Z" fill="white"/>`),
    design: ic('0 0 48 48', `<circle cx="10" cy="22" r="8" fill="#D9D9D9" fill-opacity=".51"/><path d="M22.54 39.93C18.93 39.93 16 36.99 16 33.36C16 29.94 18.6 27.13 21.93 26.82C22.61 22.67 26.2 19.5 30.54 19.5C34.87 19.5 38.46 22.67 39.14 26.82C42.47 27.13 45.07 29.94 45.07 33.36C45.07 36.99 42.14 39.93 38.53 39.93C32.15 39.93 28.13 39.93 22.54 39.93Z" fill="#D9D9D9"/><path d="M17.37 18.93C13.3 18.93 10 15.59 10 11.46C10 7.34 13.3 4 17.37 4C20.2 4 22.66 5.62 23.89 7.99C24.01 7.98 24.12 7.98 24.24 7.98C27.22 7.98 29.64 10.43 29.64 13.45C29.64 16.48 27.22 18.93 24.24 18.93C21.74 18.93 19.94 18.93 17.37 18.93Z" fill="#D9D9D9"/><path d="M42.36 16.03L41.34 21.14C41.28 21.42 41.25 21.57 41.18 21.68C41.12 21.78 41.04 21.87 40.94 21.94C40.82 22.01 40.68 22.04 40.4 22.11L29.79 24.67L32.35 14.06C32.42 13.78 32.45 13.64 32.52 13.52C32.59 13.42 32.68 13.34 32.78 13.28C32.9 13.21 33.04 13.18 33.32 13.12L38.43 12.1M29.79 24.67L35.75 18.71M44.61 13.57L40.89 9.85C40.58 9.54 40.42 9.38 40.24 9.32C40.09 9.27 39.92 9.27 39.76 9.32C39.58 9.38 39.42 9.54 39.11 9.85L38.53 10.43C38.22 10.74 38.07 10.9 38.01 11.07C37.96 11.23 37.96 11.4 38.01 11.56C38.07 11.74 38.22 11.9 38.53 12.21L42.25 15.93C42.57 16.24 42.72 16.4 42.9 16.45C43.06 16.5 43.23 16.5 43.39 16.45C43.57 16.4 43.72 16.24 44.03 15.93L44.61 15.35C44.92 15.04 45.08 14.88 45.14 14.7C45.19 14.55 45.19 14.38 45.14 14.22C45.08 14.04 44.92 13.88 44.61 13.57ZM36.86 16.03C37.73 16.03 38.43 16.74 38.43 17.6C38.43 18.47 37.73 19.17 36.86 19.17C35.99 19.17 35.29 18.47 35.29 17.6C35.29 16.74 35.99 16.03 36.86 16.03Z" ${FA}/><path d="M18.79 35.21C18.79 39.55 22.3 43.07 26.64 43.07C27.95 43.07 29 42.02 29 40.71V40.32C29 39.96 29 39.77 29.02 39.62C29.16 38.56 29.99 37.73 31.05 37.59C31.2 37.57 31.39 37.57 31.75 37.57H32.14C33.45 37.57 34.5 36.52 34.5 35.21C34.5 30.87 30.98 27.36 26.64 27.36C22.3 27.36 18.79 30.87 18.79 35.21Z" ${FA}/><circle cx="22.71" cy="35.21" r=".79" ${FA}/><circle cx="29.79" cy="32.07" r=".79" ${FA}/><circle cx="25.07" cy="31.29" r=".79" ${FA}/><path d="M13.29 14.79H10.54C9.02 14.79 7.79 16.02 7.79 17.54C7.79 19.05 9.02 20.29 10.54 20.29M13.29 14.79V20.29M13.29 14.79H16.04C17.55 14.79 18.79 16.02 18.79 17.54C18.79 19.05 17.55 20.29 16.04 20.29M13.29 20.29H10.54M13.29 20.29V25.79M13.29 20.29H16.04M10.54 20.29C9.02 20.29 7.79 21.52 7.79 23.04C7.79 24.55 9.02 25.79 10.54 25.79M13.29 25.79H10.54M13.29 25.79V28.54C13.29 30.05 12.05 31.29 10.54 31.29C9.02 31.29 7.79 30.05 7.79 28.54C7.79 27.02 9.02 25.79 10.54 25.79M16.04 20.29C17.55 20.29 18.79 21.52 18.79 23.04C18.79 24.55 17.55 25.79 16.04 25.79C14.52 25.79 13.29 24.55 13.29 23.04C13.29 21.52 14.52 20.29 16.04 20.29Z" ${FA}/><path d="M14.46 34.43V32.07M13.29 33.25H15.64M33.32 47V43.07M31.36 45.04H35.29" ${D9}/>`),
    plan: ic('0 0 48 48', `<circle cx="30" cy="36" r="11" fill="#D9D9D9" fill-opacity=".51"/><circle cx="41" cy="26" r="6" fill="#D9D9D9" fill-opacity=".51"/><path d="M41.08 0H29.4C29.18 0 29.07 0 28.97.03C28.88.06 28.8.11 28.74.17C28.66.24 28.61.34 28.52.53L23.33 10.61C23.09 11.07 22.98 11.3 23 11.49C23.03 11.65 23.12 11.8 23.26 11.89C23.42 12 23.68 12 24.21 12H31.87L28.17 24L43.22 8.83C43.73 8.31 43.98 8.06 44 7.84C44.01 7.65 43.93 7.46 43.78 7.34C43.61 7.2 43.24 7.2 42.51 7.2H33.73L41.08 0Z" fill="#D9D9D9" fill-opacity=".58"/><path d="M8.41 11.49L13.66 22.2C13.87 22.62 13.97 22.82 14.11 22.93C14.23 23.03 14.37 23.09 14.49 23.09C14.63 23.09 14.73 22.96 14.92 22.71L17.56 19.28L23.54 24.63L18.29 13.93C18.08 13.51 17.98 13.3 17.84 13.19C17.72 13.09 17.58 13.04 17.46 13.03C17.32 13.03 17.22 13.16 17.03 13.41L14.39 16.84L8.41 11.49Z" fill="#D9D9D9" fill-opacity=".25"/><path d="M39.5 41.83H31.5M21 42.33L26.55 40.19C26.9 40.06 27.08 39.99 27.25 39.9C27.4 39.82 27.54 39.73 27.67 39.63C27.82 39.51 27.95 39.38 28.22 39.11L39.5 27.83C40.6 26.72 40.6 24.93 39.5 23.83C38.4 22.72 36.6 22.72 35.5 23.83L24.22 35.11C23.95 35.38 23.82 35.51 23.7 35.66C23.6 35.79 23.51 35.93 23.43 36.08C23.34 36.25 23.27 36.42 23.13 36.78L21 42.33Z" stroke="white" stroke-width="1.18" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 15.27V19.4C16 19.96 16 20.24 16.11 20.45C16.2 20.64 16.36 20.8 16.55 20.89C16.76 21 17.04 21 17.6 21H21.73M16 30H10M18 26H10M22 22.99V30.2C22 31.88 22 32.72 21.67 33.36C21.39 33.93 20.93 34.39 20.36 34.67C19.72 35 18.88 35 17.2 35H10.8C9.12 35 8.28 35 7.64 34.67C7.07 34.39 6.61 33.93 6.33 33.36C6 32.72 6 31.88 6 30.2V19.8C6 18.12 6 17.28 6.33 16.64C6.61 16.07 7.07 15.61 7.64 15.33C8.28 15 9.12 15 10.8 15H14.01C14.75 15 15.11 15 15.46 15.08C15.76 15.16 16.06 15.28 16.32 15.44C16.63 15.63 16.89 15.89 17.41 16.41L20.59 19.59C21.11 20.11 21.37 20.37 21.56 20.68C21.72 20.94 21.84 21.24 21.92 21.54C22 21.89 22 22.25 22 22.99Z" stroke="white" stroke-width="1.18" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.96 9.93V6M3 7.96H6.93M5.18 40.36V38M4 39.18H6.36" ${D9}/>`),
  };
  const INFO = ic('0 0 18 18', `<path d="M6.398 7.333C6.568 6.851 6.903 6.444 7.344 6.184C7.786 5.925 8.304 5.83 8.809 5.917C9.313 6.003 9.77 6.266 10.1 6.657C10.429 7.048 10.61 7.544 10.609 8.056C10.609 9.5 8.442 10.222 8.442 10.222M8.5 13.111H8.507M5.467 16H11.533C12.747 16 13.354 16 13.817 15.764C14.225 15.556 14.556 15.225 14.764 14.817C15 14.354 15 13.747 15 12.533V6.467C15 5.253 15 4.647 14.764 4.183C14.556 3.775 14.225 3.444 13.817 3.236C13.354 3 12.747 3 11.533 3H5.467C4.253 3 3.647 3 3.183 3.236C2.775 3.444 2.444 3.775 2.236 4.183C2 4.647 2 5.253 2 6.467V12.533C2 13.747 2 14.354 2.236 14.817C2.444 15.225 2.775 15.556 3.183 15.764C3.647 16 4.253 16 5.467 16Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>`);
  const THUMB = ic('0 0 15 15', `<path d="M6.565.545C6.878-.182 8.118-.182 8.433.545C8.993 1.839 9.777 3.338 10.718 4.28C11.66 5.221 13.159 6.005 14.453 6.565C15.182 6.878 15.182 8.118 14.453 8.433C13.159 8.993 11.66 9.777 10.718 10.718C9.777 11.66 8.993 13.159 8.433 14.453C8.12 15.182 6.88 15.182 6.565 14.453C6.005 13.159 5.221 11.66 4.28 10.718C3.338 9.777 1.839 8.993.545 8.433C-.182 8.12-.182 6.88.545 6.565C1.839 6.005 3.338 5.221 4.28 4.28C5.221 3.338 6.005 1.839 6.565.545Z" fill="${W}"/>`);

  /* ===== 선택지 ===== */
  const TYPES = [['all', '전체'], ['design', '디자인 프로젝트'], ['plan', '기획 프로젝트']];
  const FIELDS = {
    '그래픽·비주얼': ['그래픽', '비주얼'], '브랜딩·BI': ['브랜딩', 'BI'], 'UX·UI': ['UI', 'UX'], '3D 그래픽': ['3D'], '제품 디자인': ['제품'],
    '3D 모델링': ['3D', '모델링'], '공예': ['공예'], '타이포그래피': ['타이포', '폰트'], '편집·출판': ['편집', '출판'], '아이콘·일러스트': ['아이콘', '일러스트'], 'AI': ['AI'],
    '텍스쳐': ['텍스쳐', '텍스처', '질감'], '패키지·굿즈': ['패키지', '굿즈'], '공간·전시': ['공간', '전시', '건축'], '인터랙션·모션': ['인터랙션', '모션', '영상'], '템플릿': ['템플릿'], '플러그인': ['플러그인'],
  };
  const EXTS = ['.pdf', '.ai', '.svg', '.fig', '.xd', '.blend', '.c4d', '.png', '.jpg', '.otf', '.ttf'];
  const STAGES = [['seeding', 'Seeding · 방향'], ['planting', 'Planting · 형태'], ['growing', 'Growing · 마감'], ['blooming', 'Blooming · 발표'], ['flowering', 'Flowering']];
  const STRUCT = [['slides', '장표 포함'], ['source', '원본 파일 포함'], ['refs', '리소스 출처 포함'], ['note', '작업 노트 포함']];
  const LOG_PRESETS = [['first', '첫 계승을 기다리는 바톤', 0, 0], ['under5', '5회 미만 로그 바톤', 0, 4], ['over5', '5회 이상 로그 바톤', 5, 5]];
  const blank = () => ({ type: 'all', fields: [], exts: [], stages: [], struct: [], logMin: 0, logMax: 5, logPreset: '', deadline: false });
  const isBlank = a => !a || (a.type === 'all' && !a.fields.length && !a.exts.length && !a.stages.length && !a.struct.length && a.logMin === 0 && a.logMax === 5 && !a.deadline);

  /* ===== 바톤이 조건에 맞는지 ===== */
  const TOOL_EXT = { ai: '.ai', ps: '.psd', psd: '.psd', fig: '.fig', figma: '.fig', xd: '.xd', blend: '.blend', blender: '.blend', c4d: '.c4d' };
  function filesOf(r) { return (r.files || []).map(f => String(f?.name || f || '').toLowerCase()); }
  function extsOf(r) {
    const out = new Set(filesOf(r).map(n => (n.match(/\.[a-z0-9]+$/) || [''])[0]).filter(Boolean));
    [...(r.tools || []), ...(r.displayTools || [])].forEach(t => { const k = String(t).toLowerCase().replace(/[^a-z0-9]/g, ''); if (TOOL_EXT[k]) out.add(TOOL_EXT[k]); });
    return out;
  }
  function match(r, a, relayCount) {
    if (isBlank(a)) return true;
    const cats = r.category || [];
    if (a.type === 'plan' && !cats.includes('기획')) return false;
    if (a.type === 'design' && cats.includes('기획')) return false;
    if (a.fields.length) {
      const text = [...cats, ...(r.tags || []), ...(r.displayTags || []), ...(r.displayCategories || []), r.title || ''].join(' ');
      if (!a.fields.some(f => (FIELDS[f] || [f]).some(k => text.includes(k)))) return false;
    }
    if (a.exts.length) { const have = extsOf(r); if (!a.exts.some(x => have.has(x))) return false; }
    if (a.stages.length && !a.stages.some(s => s === 'flowering' ? Boolean(r.flowering) : (r.artifacts || []).includes(s))) return false;
    if (a.struct.length) {
      const have = extsOf(r);
      const ok = {
        slides: () => ['.pdf', '.ppt', '.pptx', '.key'].some(x => have.has(x)),
        source: () => ['.ai', '.psd', '.fig', '.xd', '.blend', '.c4d', '.sketch'].some(x => have.has(x)),
        refs: () => (r.references || []).length > 0 || (r.fileLinks || []).length > 0,
        note: () => Boolean(typeof r.note === 'string' ? r.note.trim() : r.note && Object.values(r.note).some(v => String(v || '').trim())),
      };
      if (!a.struct.every(k => ok[k]())) return false;
    }
    const n = r.displayStats?.relay ?? relayCount ?? 0;
    if (n < a.logMin || (a.logMax < 5 && n > a.logMax)) return false;
    if (a.deadline && !r.exhibitionDeadline) return false;
    return true;
  }

  /* ===== 모달 ===== */
  const SECTIONS = ['바톤 유형', '분야', '파일 확장자명', '진척도', '바톤 로그 현황', '필터'];
  let root = null, state = blank(), lastFocus = null, suppressFocus = false, spyLock = 0;
  const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const chip = (group, value, label, on) => `<button type="button" class="fm-chip" data-group="${group}" data-value="${E(value)}" aria-pressed="${on}">${E(label)}</button>`;

  function render() {
    const s = state;
    const fieldRows = [['전체', ...Object.keys(FIELDS)]];
    return `
    <div class="fm-backdrop" data-fm-close></div>
    <div class="fm-panel" role="dialog" aria-modal="true" aria-label="바톤 검색과 필터">
      <form class="fm-bar" role="search">
        <span class="fm-bar-icon">${SEARCH}</span>
        <label class="sr-only" for="fm-input">검색어</label>
        <input id="fm-input" type="search" autocomplete="off" placeholder="사랑과 관련된 프로젝트 기획서...">
        <button type="submit" class="fm-go">검색</button>
      </form>
      <div class="fm-body">
        <nav class="fm-menu" aria-label="필터 항목">${SECTIONS.map((t, i) => `<button type="button" class="fm-menu-item" data-jump="${i}" ${i === 0 ? 'aria-current="true"' : ''}>${MENU_ICONS[i]}<span>${t}</span></button>`).join('')}</nav>
        <div class="fm-content">
          <section class="fm-sec" data-sec="0" aria-label="바톤 유형"><span class="fm-sec-icon">${MENU_ICONS[0]}</span>
            <div class="fm-types">${TYPES.map(([v, l]) => `<button type="button" class="fm-type" data-group="type" data-value="${v}" aria-pressed="${s.type === v}">${TYPE_ICONS[v]}<span>${l}</span></button>`).join('')}</div>
          </section>
          <section class="fm-sec" data-sec="1" aria-label="분야"><span class="fm-sec-icon">${MENU_ICONS[1]}</span>
            <p class="fm-label">디자인</p>
            <div class="fm-chips">${fieldRows[0].map(l => chip('fields', l, l, l === '전체' ? !s.fields.length : s.fields.includes(l))).join('')}</div>
          </section>
          <section class="fm-sec" data-sec="2" aria-label="파일 확장자명"><span class="fm-sec-icon">${MENU_ICONS[2]}</span>
            <div class="fm-chips">${['전체', ...EXTS].map(l => chip('exts', l, l, l === '전체' ? !s.exts.length : s.exts.includes(l))).join('')}</div>
            <p class="fm-hint">${INFO}<span>선택한 분야별로 제공 가능한 파일 확장자명이 표시 돼요 :)</span></p>
          </section>
          <section class="fm-sec" data-sec="3" aria-label="진척도"><span class="fm-sec-icon">${MENU_ICONS[3]}</span>
            <p class="fm-label">진척도</p>
            <div class="fm-stages">${STAGES.map(([v, l]) => `<button type="button" class="fm-stage" data-group="stages" data-value="${v}" aria-pressed="${s.stages.includes(v)}" aria-label="${l}" title="${l}"><img src="assets/stage-${v}-on.svg" alt="" class="is-${v}"></button>`).join('')}</div>
            <p class="fm-label fm-label-gap">바톤 구조</p>
            <div class="fm-chips">${chip('struct', 'any', '상관없음', !s.struct.length)}${STRUCT.map(([v, l]) => chip('struct', v, l, s.struct.includes(v))).join('')}</div>
          </section>
          <section class="fm-sec" data-sec="4" aria-label="바톤 로그 현황"><span class="fm-sec-icon">${MENU_ICONS[4]}</span>
            <div class="fm-range-head"><span class="fm-label">로그 횟수</span><span class="fm-range-val"><b data-out="min">${s.logMin}</b>번 - <b data-out="max">${s.logMax}</b>번${s.logMax === 5 ? ' 이상' : ''}</span></div>
            <div class="fm-range" style="--a:${s.logMin / 5};--b:${s.logMax / 5}">
              <i class="fm-range-fill"></i>
              <input type="range" min="0" max="5" step="1" value="${s.logMin}" data-range="min" aria-label="로그 횟수 최소">
              <input type="range" min="0" max="5" step="1" value="${s.logMax}" data-range="max" aria-label="로그 횟수 최대">
              <span class="fm-thumb" data-thumb="min">${THUMB}</span><span class="fm-thumb" data-thumb="max">${THUMB}</span>
            </div>
            <div class="fm-chips fm-chips-gap">${LOG_PRESETS.map(([v, l]) => chip('log', v, l, s.logPreset === v)).join('')}</div>
            <p class="fm-label fm-label-gap">기한</p>
            <label class="fm-toggle-row"><span>기한 있는 바톤만 보기</span><input type="checkbox" class="fm-toggle" data-group="deadline" ${s.deadline ? 'checked' : ''}><i aria-hidden="true"></i></label>
          </section>
          <section class="fm-sec fm-sec-last" data-sec="5" aria-label="필터"><span class="fm-sec-icon">${MENU_ICONS[5]}</span>
            <p class="fm-label">고른 조건</p>
            <p class="fm-summary" aria-live="polite"></p>
            <div class="fm-actions"><button type="button" class="fm-chip" data-fm-reset>모두 지우기</button><button type="button" class="fm-chip fm-apply" data-fm-apply>이 조건으로 검색</button></div>
          </section>
        </div>
      </div>
    </div>`;
  }

  function summary() {
    const s = state, out = [];
    if (s.type !== 'all') out.push(TYPES.find(t => t[0] === s.type)[1]);
    out.push(...s.fields, ...s.exts);
    s.stages.forEach(v => out.push(STAGES.find(x => x[0] === v)[1]));
    s.struct.forEach(v => out.push(STRUCT.find(x => x[0] === v)[1]));
    if (s.logMin !== 0 || s.logMax !== 5) out.push(`로그 ${s.logMin}~${s.logMax}${s.logMax === 5 ? '번 이상' : '번'}`);
    if (s.deadline) out.push('기한 있는 바톤');
    return out.length ? out.join(' · ') : '아직 고른 조건이 없어요. 검색어만으로도 찾을 수 있어요.';
  }

  function sync() {
    const s = state;
    root.querySelectorAll('[data-group]').forEach(el => {
      const g = el.dataset.group, v = el.dataset.value;
      let on;
      if (g === 'type') on = s.type === v;
      else if (g === 'fields' || g === 'exts') on = v === '전체' ? !s[g].length : s[g].includes(v);
      else if (g === 'stages') on = s.stages.includes(v);
      else if (g === 'struct') on = v === 'any' ? !s.struct.length : s.struct.includes(v);
      else if (g === 'log') on = s.logPreset === v;
      else if (g === 'deadline') { el.checked = s.deadline; return; }
      el.setAttribute('aria-pressed', String(on));
    });
    const range = root.querySelector('.fm-range');
    range.style.setProperty('--a', s.logMin / 5); range.style.setProperty('--b', s.logMax / 5);
    range.querySelector('[data-range=min]').value = s.logMin; range.querySelector('[data-range=max]').value = s.logMax;
    root.querySelector('.fm-range-val').innerHTML = `<b>${s.logMin}</b>번 - <b>${s.logMax}</b>번${s.logMax === 5 ? ' 이상' : ''}`;
    root.querySelector('.fm-summary').textContent = summary();
  }

  function toggleIn(list, v) { const i = list.indexOf(v); if (i < 0) list.push(v); else list.splice(i, 1); }
  function onClick(e) {
    if (e.target.closest('[data-fm-close]')) return close();
    if (e.target.closest('[data-fm-reset]')) { state = blank(); sync(); return; }
    if (e.target.closest('[data-fm-apply]')) return apply();
    const jump = e.target.closest('[data-jump]');
    if (jump) {
      const sec = root.querySelector(`.fm-sec[data-sec="${jump.dataset.jump}"]`), box = root.querySelector('.fm-body');
      setActive(+jump.dataset.jump); spyLock = Date.now() + 700;
      box.scrollTo({ top: sec.offsetTop - box.querySelector('.fm-content').offsetTop - 0, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' });
      return;
    }
    const el = e.target.closest('button[data-group]');
    if (!el) return;
    const g = el.dataset.group, v = el.dataset.value, s = state;
    if (g === 'type') s.type = v;
    else if (g === 'fields' || g === 'exts') { if (v === '전체') s[g] = []; else toggleIn(s[g], v); }
    else if (g === 'stages') toggleIn(s.stages, v);
    else if (g === 'struct') { if (v === 'any') s.struct = []; else toggleIn(s.struct, v); }
    else if (g === 'log') {
      if (s.logPreset === v) { s.logPreset = ''; s.logMin = 0; s.logMax = 5; }
      else { const p = LOG_PRESETS.find(x => x[0] === v); s.logPreset = v; s.logMin = p[2]; s.logMax = p[3]; }
    }
    sync();
  }
  function onInput(e) {
    const r = e.target.closest('[data-range]');
    if (r) {
      let a = +root.querySelector('[data-range=min]').value, b = +root.querySelector('[data-range=max]').value;
      if (a > b) { if (r.dataset.range === 'min') a = b; else b = a; }
      state.logMin = a; state.logMax = b; state.logPreset = ''; sync(); return;
    }
    if (e.target.matches('.fm-toggle')) { state.deadline = e.target.checked; sync(); }
  }
  function setActive(i) { root.querySelectorAll('.fm-menu-item').forEach((b, k) => b.toggleAttribute('aria-current', k === i)); }
  function onScroll() {
    if (Date.now() < spyLock) return;
    const box = root.querySelector('.fm-body'), top = box.getBoundingClientRect().top + 40;
    let cur = 0;
    root.querySelectorAll('.fm-sec').forEach((sec, i) => { if (sec.getBoundingClientRect().top <= top) cur = i; });
    if (box.scrollTop + box.clientHeight >= box.scrollHeight - 2) cur = SECTIONS.length - 1;
    setActive(cur);
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const items = [...root.querySelectorAll('button,input')].filter(x => x.offsetParent !== null);
    const first = items[0], last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function apply() {
    const q = root.querySelector('#fm-input').value.trim();
    const adv = isBlank(state) ? null : JSON.parse(JSON.stringify(state));
    close(true);
    if (window.MorogadoSite?.apply) window.MorogadoSite.apply(q, adv);
  }

  function open() {
    if (root) return;
    const cur = window.MorogadoSite?.state?.() || {};
    state = cur.adv ? { ...blank(), ...JSON.parse(JSON.stringify(cur.adv)) } : blank();
    lastFocus = document.activeElement;
    root = document.createElement('div');
    root.className = 'fm-root';
    root.innerHTML = render();
    document.body.append(root);
    document.documentElement.classList.add('fm-open');
    const input = root.querySelector('#fm-input');
    input.value = cur.query || '';
    sync();
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('keydown', onKey);
    root.querySelector('.fm-bar').addEventListener('submit', e => { e.preventDefault(); apply(); });
    root.querySelector('.fm-body').addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(() => { root?.classList.add('is-in'); input.focus({ preventScroll: true }); });
  }
  function close(applied) {
    if (!root) return;
    const el = root; root = null;
    document.documentElement.classList.remove('fm-open');
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 220);
    if (!applied && lastFocus && document.contains(lastFocus)) { suppressFocus = true; lastFocus.focus({ preventScroll: true }); setTimeout(() => { suppressFocus = false; }, 50); }
  }

  /* 헤더 검색창: 누르거나 탭으로 들어오면 모달을 열어요(헤더 칸에는 직접 쓰지 않아요). */
  function wireHeader() {
    const input = document.getElementById('site-search');
    if (!input) return;
    input.readOnly = true;
    input.setAttribute('aria-haspopup', 'dialog');
    const form = input.closest('form');
    (form || input).addEventListener('mousedown', e => { e.preventDefault(); open(); });
    input.addEventListener('focus', () => { if (!suppressFocus) open(); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireHeader); else wireHeader();
  addEventListener('hashchange', () => close(true));

  /* 검색 결과 제목에 쓰는 '고른 값' 목록 */
  function labels(a) {
    if (isBlank(a)) return [];
    const out = [];
    if (a.type !== 'all') out.push(TYPES.find(t => t[0] === a.type)[1]);
    out.push(...a.fields, ...a.exts);
    a.stages.forEach(v => out.push(STAGES.find(x => x[0] === v)[1].split(' · ').pop()));
    a.struct.forEach(v => out.push(STRUCT.find(x => x[0] === v)[1]));
    if (a.logPreset) out.push(LOG_PRESETS.find(x => x[0] === a.logPreset)[1].replace(' 바톤', ''));
    else if (a.logMin !== 0 || a.logMax !== 5) out.push(`로그 ${a.logMin}~${a.logMax}${a.logMax === 5 ? '번 이상' : '번'}`);
    if (a.deadline) out.push('기한 있음');
    return out;
  }
  function extsOfRecord(r) { return [...extsOf(r)]; }
  window.MorogadoFilterModal = { open, close, match, isBlank, labels, exts: extsOfRecord };
})();
