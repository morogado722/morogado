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

    area.addEventListener('input', paint);
    area.addEventListener('scroll', fit, { passive: true });
    new ResizeObserver(fit).observe(area);
    paint();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
