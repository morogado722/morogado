/* 바톤 노트: 글 속 [라벨]을 칩처럼 보여줘요.
 * textarea는 그대로 두고(편집·저장 방식 변화 없음), 뒤에 같은 글을 그린 층을 깔아요.
 * textarea 글자는 투명, 커서만 보이고, 뒤층에서 [라벨] 자리에 칩을 그려요.
 * 칩은 원래 "[라벨]" 글자 폭을 그대로 차지해서 줄바꿈·커서 위치가 어긋나지 않아요. */
(() => {
  const init = () => {
    const area = document.getElementById('baton-note');
    if (!area || area.dataset.chips) return;
    area.dataset.chips = '1';

    const wrap = document.createElement('div');
    wrap.className = 'note-chip-wrap';
    area.parentNode.insertBefore(wrap, area);
    const mirror = document.createElement('div');
    mirror.className = 'note-chip-mirror';
    mirror.setAttribute('aria-hidden', 'true');
    wrap.append(mirror, area);
    area.classList.add('has-chips');

    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const LABEL = /\[([^\[\]\n]{1,24})\]/g;
    const paint = () => {
      const v = area.value;
      let html = '', last = 0, m;
      LABEL.lastIndex = 0;
      while ((m = LABEL.exec(v))) {
        html += esc(v.slice(last, m.index));
        html += `<span class="note-chip"><span class="note-chip-raw">${esc(m[0])}</span><span class="note-chip-face">${esc(m[1].trim())}</span></span>`;
        last = m.index + m[0].length;
      }
      html += esc(v.slice(last));
      // 끝이 줄바꿈이면 마지막 빈 줄 높이를 맞춰요
      mirror.innerHTML = html + '​';
      fit();
      syncPick();
    };
    const COPY = ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','wordSpacing','wordBreak','tabSize','textIndent','paddingTop','paddingLeft','paddingRight'];
    const fit = () => {
      const cs = getComputedStyle(area);
      for (const k of COPY) mirror.style[k] = cs[k];
      mirror.style.width = area.clientWidth + 'px';
      mirror.style.transform = `translateY(${-area.scrollTop}px)`;
    };

    // 다른 코드가 area.value = ... 로 바꿔도 다시 그려요
    const desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    Object.defineProperty(area, 'value', {
      configurable: true,
      get() { return desc.get.call(this); },
      set(v) { desc.set.call(this, v); paint(); }
    });

    /* 글 상자 아래 칩 고르기 (피그마 '업로드 페이지 3 · 노트 칩')
     * 안 넣은 이야기(+)를 누르면 글 끝에 [라벨] 문단을 붙이고,
     * 이미 넣은 이야기(✓)를 누르면 그 문단으로 커서를 옮겨요. 글은 지우지 않아요. */
    const TOPICS = ['누구를 위한 건가요','어떤 느낌을 원했나요','어디서 막혔나요','왜 그만뒀나요','하다가 알게 된 점이 있나요','조심해야 할 점이 있나요','어디부터 이어가면 좋을까요'];
    const PLUS = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2.5v7M2.5 6h7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>';
    const CHECK = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2 5 8.6 9.6 3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    const box = area.closest('.note-box');
    const pick = document.createElement('div');
    pick.className = 'note-pick';
    pick.innerHTML = '<p class="note-pick-head"><strong>어떤 이야기를 남길까요?</strong><span>누르면 글 상자에 칩이 들어가요. 하나만 골라도 괜찮아요</span></p><div class="note-pick-list"></div>';
    const list = pick.querySelector('.note-pick-list');
    const chips = TOPICS.map(label => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'note-pick-chip'; b.dataset.label = label;
      b.innerHTML = '<span class="note-pick-icon"></span><span></span>';
      b.lastChild.textContent = label;
      b.addEventListener('click', () => choose(label));
      list.append(b);
      return b;
    });
    (box || area).insertAdjacentElement('afterend', pick);
    function syncPick() {
      const v = area.value;
      for (const b of chips) {
        const on = v.includes(`[${b.dataset.label}]`);
        if (b.classList.contains('is-on') === on && b.firstChild.innerHTML) continue;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
        b.firstChild.innerHTML = on ? CHECK : PLUS;
      }
    }
    function scrollToCaret(index) {
      const at = area.value.slice(0, index);
      const probe = document.createElement('span');
      mirror.textContent = at; mirror.append(probe);
      const top = probe.offsetTop;
      paint();
      area.scrollTop = Math.max(0, top - area.clientHeight / 2);
      fit();
    }
    function choose(label) {
      const tag = `[${label}]`, v = area.value;
      let i = v.indexOf(tag), caret;
      if (i >= 0) {
        const rest = v.slice(i);
        const end = rest.search(/\n\s*\n|\n\[/);
        caret = end < 0 ? v.length : i + end;
      } else {
        const base = v.replace(/\s+$/, '');
        const next = (base ? base + '\n\n' : '') + tag + ' ';
        area.value = next;
        area.dispatchEvent(new Event('input', { bubbles: true }));
        caret = next.length;
      }
      area.focus({ preventScroll: true });
      area.setSelectionRange(caret, caret);
      scrollToCaret(caret);
    }

    area.addEventListener('input', paint);
    area.addEventListener('scroll', fit, { passive: true });
    new ResizeObserver(fit).observe(area);
    paint();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
