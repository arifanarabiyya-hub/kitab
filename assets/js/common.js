/* أدوات مشتركة: الترويسة، التذييل، النطق الآلي، تطبيع النص العربي، التنبيهات */
(function () {
  const LOGO = '<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke-width="2"><rect x="8" y="8" width="24" height="24" rx="3" stroke="#0f4c45"/><rect x="8" y="8" width="24" height="24" rx="3" stroke="#b48a3c" transform="rotate(45 20 20)"/></g><path d="M14 23 q6 -7 12 0" stroke="#0f4c45" stroke-width="2" fill="none"/><circle cx="20" cy="15" r="1.8" fill="#b48a3c"/></svg>';
  const PAGES = [
    ['index.html', 'الرئيسية'], ['curriculum.html', 'المستويات والوحدات'], ['unit.html', 'نموذج الوحدة'],
    ['kitab.html', 'الكتاب التفاعلي'], ['lesson.html', 'نموذج الدرس'],['interactive.html', 'التجربة التفاعلية'], ['index.html#method', 'المنهجية'],
    ['presentation.html', 'العرض التقديمي']
  ];
  const here = location.pathname.split('/').pop() || 'index.html';

  window.renderChrome = function () {
    const top = document.getElementById('topbar');
    if (top) {
      top.className = 'topbar';
      top.innerHTML = '<div class="wrap"><a class="logo" href="index.html">' + LOGO + '<span>العربية بين يدي طالب العلم</span></a>' +
        '<button class="menu-btn" aria-label="القائمة">☰</button><nav class="nav">' +
        PAGES.map(p => '<a href="' + p[0] + '"' + (p[0] === here ? ' class="active"' : '') + '>' + p[1] + '</a>').join('') + '</nav></div>';
      top.querySelector('.menu-btn').onclick = () => top.querySelector('.nav').classList.toggle('open');
    }
    const foot = document.getElementById('footer');
    if (foot) {
      foot.className = 'footer';
      foot.innerHTML = '<div class="wrap"><b style="color:#fff;font-family:var(--f-display);font-size:1.1rem">العربية بين يدي طالب العلم</b> — نموذج تعريفي تفاعلي (Concept Website) لعرض التصور العلمي والتصميمي للسلسلة على الإدارة.<br>' +
        '<span class="small">الاسم والمحتوى والتصميم مقترحات قابلة للتعديل. التسجيلات الصوتية في هذا النموذج مولّدة آلياً بصوت رجل عربي للتوضيح، وستُستبدل بتسجيلات بشرية معتمدة. الأيقونات رموز مؤقتة ستحل محلها رسوم السلسلة الملتزمة بالضوابط.</span></div>';
    }
  };

  /* ---------- النطق الآلي (تجريبي) ---------- */
  let arVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    arVoice = vs.find(v => /^ar/i.test(v.lang) && /male|Naayf|Hamed|Shakir|Majed|Tarik/i.test(v.name)) || vs.find(v => /^ar/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  window.hasArabicVoice = () => !!arVoice;
  /* الأولوية لملفات الصوت الجاهزة (تعمل على كل جهاز)، ثم النطق الآلي للمتصفح احتياطاً */
  let player = null;
  const normKey = t => String(t).replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
  function playFile(src, opts) {
    return new Promise(resolve => {
      if (player) { const p = player; player = null; p.pause(); if (p.onended) p.onended(); }
      player = new Audio(src);
      player.playbackRate = opts.rate ? Math.max(0.7, opts.rate / 0.85) : 1;
      player.onended = () => resolve(true);
      player.onerror = () => resolve(false);
      player.play().catch(() => resolve(false));
    });
  }
  window.speak = async function (text, opts = {}) {
    // آيات القرآن لا تُقرأ بصوت آلي؛ تُضاف تلاوة مجوَّدة بصوت قارئ
    if (/﴿/.test(text)) { toast('الآيات تُضاف بتلاوة مجوَّدة بصوت قارئ، لا بصوت آلي'); return; }
    const src = window.AUDIO_MAP && window.AUDIO_MAP[normKey(text)];
    if (src && await playFile(src, opts)) return;
    return speakTTS(text, opts);
  };
  function speakTTS(text, opts = {}) {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) { toast('المتصفح لا يدعم النطق الآلي'); return resolve(); }
      if (!opts.queue) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA'; if (arVoice) u.voice = arVoice;
      u.rate = opts.rate || 0.85;
      u.onend = u.onerror = () => resolve();
      speechSynthesis.speak(u);
      if (!arVoice && !window._voiceWarned) { window._voiceWarned = true; toast('لم يُعثر على صوت عربي في هذا الجهاز؛ النطق تجريبي'); }
    });
  }
  window.stopSpeak = () => {
    if (player) { player.pause(); const p = player; player = null; p.onended && p.onended(); }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  };
  /* أي زر يحمل data-say ينطق نصه */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-say]');
    if (!b) return;
    e.stopPropagation();
    b.classList.add('playing');
    speak(b.dataset.say).then(() => b.classList.remove('playing'));
  });
  window.sayBtn = (t, label) => '<button class="say" data-say="' + t.replace(/"/g, '&quot;') + '" title="استمع" aria-label="استمع">' + (label || '▶') + '</button>';

  /* ---------- تطبيع العربية للمقارنة ---------- */
  window.normAr = s => (s || '').replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^ء-ي ]/g, '').replace(/\s+/g, ' ').trim()
    .replace(/(^|\s)ال/g, '$1').replace(/ا(\s|$)/g, '$1');
  window.arEq = (a, b) => normAr(a) === normAr(b);

  /* ---------- تنبيه ---------- */
  let tEl;
  window.toast = function (msg) {
    if (!tEl) { tEl = document.createElement('div'); tEl.className = 'toast'; document.body.appendChild(tEl); }
    tEl.textContent = msg; tEl.classList.add('on');
    clearTimeout(tEl._t); tEl._t = setTimeout(() => tEl.classList.remove('on'), 2600);
  };

  /* ---------- تخزين محلي آمن ---------- */
  window.store = {
    get(k, d) { try { const v = localStorage.getItem('arabic-series:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('arabic-series:' + k, JSON.stringify(v)); } catch (e) {} }
  };

  window.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  window.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  document.addEventListener('DOMContentLoaded', () => window.renderChrome());
})();
