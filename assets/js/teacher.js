/* وضع المعلم: عرض تمرين على الشاشة أمام الطلاب، مع إظهار الإجابة وإخفائها ومؤقت */
(function () {
  let el, items = [], idx = 0, revealed = false, timer = null, secs = 0;
  function build() {
    el = document.createElement('div');
    el.className = 'teacher';
    el.innerHTML = '<div class="teacher-bar"><b id="tTitle" style="font-family:var(--f-display);font-size:1.2rem"></b>' +
      '<span id="tCount" class="lat" style="opacity:.7"></span><span style="flex:1"></span>' +
      '<button class="btn sm" id="tSay">🔊 انطق</button><button class="btn sm" id="tTimer">⏱ 30 ث</button><span class="teacher-timer" id="tClock"></span>' +
      '<button class="btn sm" id="tReveal">إظهار الإجابة</button><button class="btn sm" id="tPrev">→ السابق</button><button class="btn sm" id="tNext">التالي ←</button>' +
      '<button class="btn sm" id="tClose">✕ إغلاق</button></div><div class="teacher-stage"><div><div class="teacher-q" id="tQ"></div><div class="teacher-opts" id="tO"></div>' +
      '<p style="text-align:center;opacity:.55;margin-top:40px;font-size:.9rem">اضغط على خيار لتسجيل إجابة الطلاب · المسافة = إظهار/إخفاء · الأسهم = تنقّل · Esc = خروج</p></div></div>';
    document.body.appendChild(el);
    el.querySelector('#tClose').onclick = close;
    el.querySelector('#tNext').onclick = () => go(1);
    el.querySelector('#tPrev').onclick = () => go(-1);
    el.querySelector('#tReveal').onclick = toggle;
    el.querySelector('#tSay').onclick = () => speak(items[idx].say || items[idx].q.replace(/_+/g, ' '));
    el.querySelector('#tTimer').onclick = startTimer;
    el.querySelector('#tO').onclick = e => {
      const d = e.target.closest('[data-i]'); if (!d) return;
      const ok = +d.dataset.i === items[idx].a;
      d.style.background = ok ? 'var(--ok)' : 'var(--bad)'; d.style.borderColor = 'transparent';
      if (ok) { revealed = false; toggle(); }
    };
    document.addEventListener('keydown', e => {
      if (!el.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') go(1);
      if (e.key === 'ArrowRight') go(-1);
      if (e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }
  function render() {
    const it = items[idx]; revealed = false;
    el.querySelector('#tCount').textContent = (idx + 1) + ' / ' + items.length;
    el.querySelector('#tQ').textContent = it.q;
    el.querySelector('#tO').innerHTML = it.o.map((o, i) => '<div data-i="' + i + '" style="cursor:pointer">' + o + '</div>').join('');
    el.querySelector('#tReveal').textContent = 'إظهار الإجابة';
    el.querySelector('#tReveal').classList.remove('on');
  }
  function toggle() {
    revealed = !revealed;
    el.querySelectorAll('#tO > div').forEach((d, i) => {
      d.classList.toggle('right', revealed && i === items[idx].a);
      d.classList.toggle('dim', revealed && i !== items[idx].a);
    });
    el.querySelector('#tReveal').textContent = revealed ? 'إخفاء الإجابة' : 'إظهار الإجابة';
    el.querySelector('#tReveal').classList.toggle('on', revealed);
  }
  function go(d) { idx = Math.max(0, Math.min(items.length - 1, idx + d)); render(); }
  function startTimer() {
    clearInterval(timer); secs = 30; const c = el.querySelector('#tClock'); c.textContent = secs;
    timer = setInterval(() => { secs--; c.textContent = secs > 0 ? secs : '⏰'; if (secs <= 0) clearInterval(timer); }, 1000);
  }
  function close() { el.classList.remove('open'); clearInterval(timer); el.querySelector('#tClock').textContent = ''; stopSpeak(); }
  window.Teacher = {
    open(title, list) {
      if (!el) build();
      items = list; idx = 0;
      el.querySelector('#tTitle').textContent = title;
      render(); el.classList.add('open');
    }
  };
})();
