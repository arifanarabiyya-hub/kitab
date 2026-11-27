/* محرك صفحة الدرس النموذجي — يقرأ المحتوى من SAMPLE_UNIT.lesson1 والترجمة من sample-unit-tr.js
   - زر «Türkçe» في كل قسم وكل تمرين لإظهار المعاني التركية أو إخفائها
   - زر «إظهار الإجابات» قابل للتراجع: الضغطة الثانية تعيد التمرين كما كان */
(function () {
  const L = SAMPLE_UNIT.lesson1, T = L.trData || { sections: {}, ex: {}, labels: {}, reading: {}, writing: {} };
  const $ = id => document.getElementById(id);
  const ACTS = { vocab: 's1', dialogue: 's2', tf: 's3', mcq: 's3', open: 's3', order: 's3', grammar: 's4', gshahid: 's5', gchoice: 's5', gfill: 's5', gfix: 's5', sounds: 's6', gap: 's6', speak: 's6', reading: 's6', writing: 's6' };
  const SEC = { s1: 'المفردات والتراكيب', s2: 'الحوار', s3: 'فهم الحوار', s4: 'القاعدة', s5: 'تدريبات القاعدة', s6: 'الأنشطة المهارية' };
  const NAMES = { vocab: 'المفردات', dialogue: 'الاستماع إلى الحوار', tf: 'صح أم خطأ', mcq: 'اختر الإجابة', open: 'أجب عن الأسئلة', order: 'رتّب الجمل', grammar: 'القاعدة', gshahid: 'الشواهد', gchoice: 'اختر الصيغة', gfill: 'أكمل الفراغ', gfix: 'صحّح الخطأ', sounds: 'الأصوات', gap: 'الإملاء', speak: 'المحادثة', reading: 'القراءة', writing: 'الكتابة' };
  let done = store.get('lesson-u7-1', {});
  const teach = {}, choiceData = {};
  let exN = 0;

  /* نص تركي قابل للإظهار والإخفاء */
  const tr = (t, inline) => t ? '<span class="trx' + (inline ? ' i' : '') + '" lang="tr">' + t + '</span>' : '';
  /* أيقونات Lucide (مكتبة التصميم المعتمدة) بدل الرموز التعبيرية */
  const ic = n => '<i data-lucide="' + n + '" class="lc"></i>';
  const icons = () => { try { window.lucide && lucide.createIcons(); } catch (e) {} };
  const trBtn = () => '<button class="btn ghost sm trbtn" data-trtoggle title="Türkçe anlamları göster/gizle">' + ic('languages') + ' Türkçe</button>';
  const ansBtn = id => '<button class="btn ghost sm ansbtn" data-showans="' + id + '">' + ic('eye') + ' إظهار الإجابات</button>';

  function markDone(k) {
    if (done[k]) return;
    done[k] = true; store.set('lesson-u7-1', done); updateProgress();
    toast('✓ أُنجز نشاط: ' + (NAMES[k] || k));
  }
  function updateProgress() {
    const keys = Object.keys(ACTS), n = keys.filter(k => done[k]).length;
    $('pbar').style.width = Math.round(n / keys.length * 100) + '%';
    $('ptext').textContent = n + ' من ' + keys.length + ' نشاطاً (' + Math.round(n / keys.length * 100) + '%)';
    $('toc').innerHTML = Object.keys(SEC).map(s => {
      const ks = keys.filter(k => ACTS[k] === s), all = ks.every(k => done[k]);
      return '<a href="#' + s + '" class="' + (all ? 'done' : '') + '"><span class="d"></span><span>' + SEC[s] + ' <small class="muted">(' + ks.filter(k => done[k]).length + '/' + ks.length + ')</small></span></a>';
    }).join('');
  }
  function ex(id, title, body, teacherItems, hasAnswers = true) {
    exN++;
    if (teacherItems) teach[id] = { title: title.replace(/<[^>]+>/g, '').trim(), items: teacherItems };
    return '<div class="ex" id="ex-' + id + '"><div class="ex-head"><span class="n">' + exN + '</span><div><h3>' + title + '</h3>' + tr(T.ex[id]) + '</div><div class="ex-tools">' +
      trBtn() + (teacherItems ? '<button class="btn ghost sm" data-teach="' + id + '">' + ic('presentation') + ' اعرض على الشاشة</button>' : '') +
      (hasAnswers ? ansBtn(id) : '') + '</div></div>' + body + '</div>';
  }

  /* ---------- رؤوس الأقسام: عنوان تركي + زر Türkçe ---------- */
  Object.keys(SEC).forEach(s => {
    const head = document.querySelector('#' + s + ' .sec-title');
    head.insertAdjacentHTML('beforeend', (head.querySelector('.skills') ? '' : '<span style="margin-inline-start:auto"></span>') + trBtn());
    head.querySelector('h2').insertAdjacentHTML('beforeend', tr(T.sections[s]));
  });

  /* ---------- الرأس ---------- */
  $('ltitle').textContent = L.title; $('ltr').textContent = L.tr;
  $('objectives').innerHTML = L.objectives.map((o, i) => '<li>' + o + tr((T.objectives || [])[i]) + '</li>').join('');
  $('objectives').parentNode.insertAdjacentHTML('afterbegin', trBtn().replace('class="', 'style="float:left" class="'));

  /* ---------- 1. المفردات ---------- */
  $('vocabHint').insertAdjacentHTML('beforeend', tr(T.labels.vocab));
  const seen = new Set();
  $('vocab').innerHTML = L.vocabGroups.map(g => '<div class="vgroup"><h4>◆ ' + g.title + '</h4><div class="vgrid">' +
    g.items.map(w => '<button class="vword" data-w="' + esc(w.ar.split(' / ')[0]) + '">' + (window.vocabPic ? vocabPic(w.ar, w.ic, 'ico') : '<span class="ico">' + w.ic + '</span>') + '<span class="ar">' + w.ar + '</span>' +
      '<span class="pl">' + (w.pl ? 'ج: ' + w.pl : '') + '</span><span class="tr">' + w.tr + '</span></button>').join('') + '</div></div>').join('');
  $('vocab').addEventListener('click', e => {
    const b = e.target.closest('.vword'); if (!b) return;
    b.classList.toggle('on'); speak(b.dataset.w); seen.add(b.dataset.w);
    if (seen.size >= 6) markDone('vocab');
  });
  $('phrasesHead').insertAdjacentHTML('beforeend', tr(T.labels.phrases));
  $('phrases').innerHTML = L.phrases.map(p => '<div class="phrase">' + sayBtn(p.ar.replace(/…/g, '').replace(' — ', '، ')) + '<span class="ar">' + p.ar + '</span>' + tr(p.tr) + '</div>').join('');

  /* ---------- 2. الحوار ---------- */
  const D = L.dialogue;
  $('scene').innerHTML = D.scene + tr(T.scene);
  $('clozeHint').insertAdjacentHTML('beforeend', tr(T.labels.cloze));
  const initials = { y: 'ي', k: 'خ' };
  function clozeify(t) {
    let out = t;
    // يطابق الكلمة كاملة فقط (لا داخل «وَسَهْلاً» مثلاً)
    D.clozeWords.forEach(w => { out = out.replace(new RegExp('(^|\\s)' + w + '(?=[\\s.،؟!]|$)'), '$1<span class="cloze-w">' + w + '</span>'); });
    return out;
  }
  $('dialogue').innerHTML = D.lines.map((l, i) => '<div class="line ' + l.s + '" data-i="' + i + '"><div class="avatar">' + initials[l.s] + '</div><div class="bubble"><small>' + D.speakers[l.s] + '</small>' + clozeify(l.ar) + tr(l.tr) + '</div>' + sayBtn(l.ar) + '</div>').join('');
  const played = new Set();
  $('dialogue').addEventListener('click', e => {
    const b = e.target.closest('.say'); if (b) { played.add(b.closest('.line').dataset.i); if (played.size >= 7) markDone('dialogue'); }
    const c = e.target.closest('.cloze'); if (c) c.classList.toggle('shown');
  });
  $('clozeMode').onchange = e => document.querySelectorAll('.cloze-w').forEach(s => { s.classList.toggle('cloze', e.target.checked); s.classList.remove('shown'); });
  let stopFlag = false;
  $('playAll').onclick = async () => {
    stopFlag = false;
    const lines = document.querySelectorAll('.line');
    for (let i = 0; i < D.lines.length; i++) {
      if (stopFlag) break;
      lines.forEach(x => x.classList.remove('reading'));
      lines[i].classList.add('reading'); lines[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      await speak(D.lines[i].ar, { queue: true });
    }
    lines.forEach(x => x.classList.remove('reading'));
    if (!stopFlag) markDone('dialogue');
  };
  $('stopAll').onclick = () => { stopFlag = true; stopSpeak(); document.querySelectorAll('.line').forEach(x => x.classList.remove('reading')); };

  /* ---------- أداة الاختيار العامة ---------- */
  function choiceBlock(id, items, sayIt) {
    choiceData[id] = items;
    return '<div data-choice="' + id + '">' + items.map((it, i) => '<div class="qrow" data-q="' + i + '"><div class="q">' + (i + 1) + '. ' +
      (sayIt ? sayBtn(it.say) + ' <span class="small muted">استمع ثم اختر</span>' : it.q) + tr(it.tr) + '</div><div class="opts">' +
      it.o.map((o, j) => '<button class="opt" data-j="' + j + '"' + (j === it.a ? ' data-correct' : '') + '>' + o + tr(it.otr && it.otr[j]) + '</button>').join('') + '</div><div class="fb"></div>' +
      '<div class="model">' + it.o[it.a] + (it.why ? ' — <span class="small">' + it.why + '</span>' : '') + '</div></div>').join('') + '</div>';
  }
  document.addEventListener('click', e => {
    const opt = e.target.closest('[data-choice] .opt'); if (!opt) return;
    const wrap = opt.closest('[data-choice]'), id = wrap.dataset.choice, row = opt.closest('.qrow'), it = choiceData[id][row.dataset.q];
    if (row.dataset.ok) return;
    const ok = +opt.dataset.j === it.a;
    opt.classList.add(ok ? 'right' : 'wrong');
    const fb = row.querySelector('.fb');
    fb.className = 'fb ' + (ok ? 'ok' : 'no');
    fb.textContent = ok ? '✓ أحسنت! ' + (it.why || '') : '✗ حاول مرة أخرى';
    if (ok) { row.dataset.ok = 1; if (wrap.querySelectorAll('.qrow[data-ok]').length === choiceData[id].length) markDone(id); }
  });

  /* ---------- 3. الفهم ---------- */
  const tfItems = L.trueFalse.map(t => ({ q: t.q, tr: t.tr, o: ['صح ✓', 'خطأ ✗'], otr: ['Doğru', 'Yanlış'], a: t.a ? 0 : 1, why: t.why }));
  const openHtml = L.openQ.map((o, i) => '<div class="qrow"><div class="q">' + (i + 1) + '. ' + o.q + tr(o.tr) + '</div><input class="inp" data-open="' + i + '" placeholder="اكتب إجابتك"> <button class="btn sm" data-chkopen="' + i + '">تحقق</button><div class="fb"></div><div class="model">' + o.model + '</div></div>').join('');
  const orderHtml = '<p class="small muted">اسحب الجمل أو استعمل الأسهم لترتيبها، ثم اضغط «تحقق».' + tr('Cümleleri sürükle veya oklarla sırala, sonra “تحقق”a bas.') + '</p><ul class="order-list" id="orderList">' +
    shuffle(L.order.items.map((t, i) => ({ t, i }))).map(o => '<li draggable="true" data-i="' + o.i + '"><span>' + o.t + tr((T.order || [])[o.i]) + '</span><span class="mv"><button data-mv="-1" aria-label="أعلى">▲</button><button data-mv="1" aria-label="أسفل">▼</button></span></li>').join('') +
    '</ul><div style="margin-top:10px"><button class="btn sm" id="chkOrder">تحقق</button> <span class="fb" id="orderFb"></span></div><div class="model">' + L.order.correct.map(i => L.order.items[i]).join(' ← ') + '</div>';
  $('comp').innerHTML =
    ex('tf', 'صح أم خطأ؟', choiceBlock('tf', tfItems), tfItems) +
    ex('mcq', 'اختر الإجابة الصحيحة', choiceBlock('mcq', L.mcq), L.mcq) +
    ex('open', 'أجب عن الأسئلة', openHtml) +
    ex('order', L.order.prompt, orderHtml);

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-chkopen]'); if (!b) return;
    const i = +b.dataset.chkopen, inp = document.querySelector('[data-open="' + i + '"]'), fb = b.parentNode.querySelector('.fb');
    const ok = L.openQ[i].a.some(a => normAr(inp.value).includes(normAr(a)));
    inp.className = 'inp ' + (ok ? 'right' : 'wrong'); fb.className = 'fb ' + (ok ? 'ok' : 'no');
    fb.textContent = ok ? '✓ صحيح' : '✗ راجع الحوار، أو اضغط «إظهار الإجابات»';
    if ([...document.querySelectorAll('[data-open]')].every(x => x.classList.contains('right'))) markDone('open');
  });

  // الترتيب: سحب وإفلات + أزرار
  const ol = $('orderList'); let drag;
  ol.addEventListener('dragstart', e => { drag = e.target.closest('li'); drag.classList.add('dragging'); });
  ol.addEventListener('dragend', () => drag && drag.classList.remove('dragging'));
  ol.addEventListener('dragover', e => {
    e.preventDefault(); const over = e.target.closest('li'); if (!over || over === drag) return;
    const r = over.getBoundingClientRect(); ol.insertBefore(drag, e.clientY > r.top + r.height / 2 ? over.nextSibling : over);
  });
  ol.addEventListener('click', e => {
    const b = e.target.closest('[data-mv]'); if (!b) return;
    const li = b.closest('li');
    if (b.dataset.mv === '-1' && li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling);
    if (b.dataset.mv === '1' && li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li);
  });
  $('chkOrder').onclick = () => {
    const cur = [...ol.children].map(li => +li.dataset.i), ok = cur.join() === L.order.correct.join();
    ol.classList.toggle('ok', ok); $('orderFb').className = 'fb ' + (ok ? 'ok' : 'no');
    $('orderFb').textContent = ok ? '✓ ترتيب صحيح!' : '✗ ليس بعد. استمع إلى الحوار مرة أخرى.';
    if (ok) markDone('order');
  };

  /* ---------- 4. القاعدة ---------- */
  const G = L.grammar;
  $('gtitle').textContent = G.title;
  $('grammar').innerHTML = '<b>لاحظ هذه العبارات من الحوار:</b><div class="from-text">' +
    G.fromText.map(t => { const p = t.split(' '); return '<span>' + p[0] + ' <b>' + p.slice(1).join(' ') + '</b></span>'; }).join('') + '</div>' +
    '<p class="small muted">الكلمة الملوّنة صفة تصف الكلمة التي قبلها (الموصوف).' + tr(T.grammarIntro) + '</p><div class="g-cols"><ul class="rules">' + G.rules.map((r, i) => '<li>' + r + tr((T.rules || [])[i]) + '</li>').join('') + '</ul>' +
    '<div class="table-wrap"><table class="t gtable"><thead><tr>' + G.table.head.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
    G.table.rows.map(r => '<tr>' + r.map((c, i) => '<td>' + (i ? c + ' ' + sayBtn(c) : '<b>' + c + '</b>') + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>' +
    '<div class="trnote">' + G.trNote + '</div></div>' +
    '<div class="shawahid"><h3 class="sh-title">مِن نور الوحي: القاعدة في الآيات والأحاديث' + tr(T.shahidIntro) + '</h3>' +
    '<p class="small muted" style="margin:0 0 10px">لاحظ الموصوف <span class="sh-m">بهذا اللون</span> والصفة <span class="sh-s">بهذا اللون</span>، ثم تأمّل الفائدة.</p><div class="sh-grid">' +
    L.shawahid.map(s => {
      let t = s.text.replace(s.hl[0], '<span class="sh-m">' + s.hl[0] + '</span>').replace(s.hl[1], '<span class="sh-s">' + s.hl[1] + '</span>');
      t = s.kind === 'آية' ? '﴿' + t + '﴾' : '«' + t + '»';
      return '<div class="sh-card ' + (s.kind === 'آية' ? 'ayah' : 'hadith') + '"><div class="sh-kind">' + (s.kind === 'آية' ? 'قال تعالى' : 'قال رسول الله ﷺ') + '</div>' +
        '<div class="sh-text">' + t + ' ' + (s.kind === 'آية' ? '' : sayBtn(s.text)) + '</div>' +
        (s.kind === 'آية' ? '<div class="sh-src">' + ic('headphones') + ' تُضاف التلاوة بصوت قارئ مجوِّد</div>' : '') + tr(s.tr) + '<div class="sh-src">' + s.src + '</div>' +
        '<div class="sh-g">' + ic('search') + ' ' + s.g + '</div><div class="sh-f">' + ic('sprout') + ' ' + s.f + '</div></div>';
    }).join('') + '</div><p class="small muted" style="margin:10px 0 0">تُضبط الشواهد وتُخرَّج وتُراجع من اللجنة الشرعية قبل اعتماد الكتاب.</p></div>' +
    '<div style="margin-top:14px"><button class="btn sm" id="gotIt">فهمتُ القاعدة ✓</button></div>';
  $('gotIt').onclick = () => markDone('grammar');

  /* ---------- 5. تدريبات القاعدة ---------- */
  const fillHtml = L.grammarFill.map((f, i) => '<div class="qrow"><span class="q">' + (i + 1) + '. ' + f.q + ' </span><input class="inp" data-fill="' + i + '" style="width:130px"> ' + (f.hint ? '<span class="small muted">' + f.hint + '</span> ' : '') +
    tr(f.tr) + '<div class="model">' + f.q + ' ' + f.show + '</div></div>').join('') + '<button class="btn sm" id="chkFill" style="margin-top:10px">تحقق</button> <span class="fb" id="fillFb"></span>';
  const fixHtml = L.grammarFix.map((f, i) => '<div class="qrow"><div class="fix-row"><span class="strike">' + f.wrong + '</span><button class="btn ghost sm" data-fix="' + i + '">صحّح ←</button><span class="book fixed" style="font-size:1.2rem;color:var(--ok)">' + f.right + '</span></div>' + tr(f.tr) + '<div class="small muted fixwhy">' + ic('lightbulb') + ' ' + f.why + '</div></div>').join('');
  $('gex').innerHTML =
    ex('gshahid', 'القاعدة في الآيات والأحاديث: اختر الإجابة', choiceBlock('gshahid', L.grammarShahid), L.grammarShahid) +
    ex('gchoice', 'اختر الصيغة الصحيحة', choiceBlock('gchoice', L.grammarChoice), L.grammarChoice) +
    ex('gfill', 'أكمل بالصفة المناسبة', fillHtml) +
    ex('gfix', 'صحّح الخطأ (فكّر أولاً، ثم اضغط للتحقق)', fixHtml) +
    ex('gmake', 'كوّن جملة واستعملها في حوار قصير مع زميلك', '<p>استعمل: <span class="book" style="font-size:1.2rem">مُعْجَمٌ — كَبِيرٌ / قَاعَةٌ — هَادِئَةٌ / المُصْحَفُ — الجَدِيدُ</span>' + tr('Kullan: sözlük — büyük / salon — sakin / Mushaf — yeni') + '</p><p class="small muted">مثال: — هل عندك مُعجمٌ كبيرٌ؟ — نعم، عندي معجمٌ كبيرٌ ومفيدٌ.' + tr('Örnek: — Büyük bir sözlüğün var mı? — Evet, büyük ve faydalı bir sözlüğüm var.') + '</p>', null, false);
  $('chkFill').onclick = () => {
    let all = true;
    document.querySelectorAll('[data-fill]').forEach(inp => { const ok = arEq(inp.value, L.grammarFill[inp.dataset.fill].a); inp.className = 'inp ' + (ok ? 'right' : 'wrong'); all = all && ok; });
    $('fillFb').className = 'fb ' + (all ? 'ok' : 'no'); $('fillFb').textContent = all ? '✓ ممتاز!' : '✗ انتبه إلى التذكير والتأنيث والتعريف';
    if (all) markDone('gfill');
  };
  // زر «صحّح» لكل جملة: يُظهر التصحيح ويخفيه بالتناوب
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fix]'); if (!b) return;
    const row = b.closest('.qrow'), on = row.classList.toggle('fix-on');
    b.textContent = on ? '↺ إخفاء' : 'صحّح ←';
    row.dataset.fixed = 1;
    if (document.querySelectorAll('#ex-gfix .qrow[data-fixed]').length === L.grammarFix.length) markDone('gfix');
  });

  /* ---------- 6. المهارات ---------- */
  const S = L.listening, SP = L.speaking, R = L.reading, W = L.writing;
  const gapHtml = S.gap.items.map((g, i) => '<div class="qrow"><div class="q">' + sayBtn(g.say) + ' ' + g.before + ' <input class="inp" data-gap="' + i + '" style="width:120px"> ' + g.after + tr(g.tr) + '</div><div class="model">' + g.show + '</div></div>').join('') +
    '<button class="btn sm" id="chkGap" style="margin-top:10px">تحقق</button> <span class="fb" id="gapFb"></span>';
  const speakHtml = '<h4 class="small">أ) لعب الأدوار — مثّل الموقف مع زميلك:' + tr('a) Rol yapma — durumu arkadaşınla canlandır:') + '</h4><div class="roleplay">' + SP.roleplay.map(r => '<div class="rcard"><b>' + r.role + '</b><p style="margin:6px 0 0">' + r.task + '</p>' + tr(r.tr) + '</div>').join('') + '</div>' +
    '<h4 class="small" style="margin-top:14px">ب) صِف:' + tr('b) Tanımla:') + '</h4><p>' + SP.describe + tr(T.describe) + '</p>' +
    '<h4 class="small">ج) أجب شفهياً، وسجّل صوتك ثم استمع إليه وقارنه بالنطق الصحيح:' + tr('c) Sözlü cevap ver, sesini kaydet, dinle ve doğru telaffuzla karşılaştır:') + '</h4><ul class="clean book" style="font-size:1.2rem">' + SP.prompts.map((p, i) => '<li>' + sayBtn(p) + ' ' + p + tr((T.prompts || [])[i]) + '</li>').join('') + '</ul>' +
    '<div class="rec" id="rec"><button class="btn sm" id="recBtn">' + ic('mic') + ' ابدأ التسجيل</button><span class="dot"></span><span class="small muted" id="recMsg">يُحفظ التسجيل في جهازك فقط ولا يُرسل إلى أي مكان.</span></div>' +
    '<label class="btn ghost sm" id="recFileWrap" hidden style="margin-top:8px">' + ic('smartphone') + ' سجّل بمسجّل الهاتف أو اختر ملفاً صوتياً<input type="file" id="recFile" accept="audio/*" capture="user" hidden></label>';
  const readHtml = '<h4 class="book" style="font-size:1.4rem;color:var(--lvl);text-align:center">' + R.title + ' ' + sayBtn(R.text) + tr(T.reading.title) + '</h4><div class="reading-text">' + R.text + '</div>' + tr(T.reading.text) +
    '<ol style="margin-top:12px">' + R.q.map(q => '<li class="qrow"><span class="book" style="font-size:1.15rem">' + q.q + '</span>' + tr(q.tr) + '<div class="model">' + q.model + '</div></li>').join('') + '</ol>';
  const writeHtml = '<h4 class="small">أ) املأ بطاقة الاستعارة:' + tr('a) Ödünç kartını doldur:') + '</h4><div class="form-card"><div style="grid-column:1/-1;font-family:var(--f-display);color:var(--lvl);font-size:1.1rem">' + ic('library') + ' بطاقة استعارة — مكتبة المعهد</div>' +
    W.form.map(f => '<label>' + f.label + tr(f.tr, true) + '<input class="inp" placeholder="' + f.ph + '"></label>').join('') + '</div>' +
    '<h4 class="small" style="margin-top:14px">ب) ' + W.task + tr(T.writing.task) + '</h4><textarea class="inp" id="writeBox" placeholder="فِي المَعْهَدِ مَكْتَبَةٌ…"></textarea>' +
    '<div class="small muted" id="writeCheck" style="margin-top:6px"></div><button class="btn sm" id="writeSave" style="margin-top:8px">حفظ وتحقق ذاتي</button>';
  $('skills').innerHTML =
    ex('sounds', ic('headphones') + ' ' + S.sounds.title, '<p class="small muted">' + S.sounds.note + tr('Türk öğrencinin ayırt etmekte zorlandığı yakın sesler.') + '</p>' + choiceBlock('sounds', S.sounds.items, true), S.sounds.items.map(s => ({ q: '🔊 استمع', o: s.o, a: s.a, say: s.say }))) +
    ex('gap', ic('headphones') + ' ' + S.gap.title, gapHtml) +
    ex('speak', ic('message-circle') + ' المحادثة', speakHtml, null, false) +
    ex('reading', ic('book-open') + ' القراءة', readHtml) +
    ex('writing', ic('pen-line') + ' الكتابة', writeHtml, null, false) +
    '<div class="athar"><div class="sh-kind">أثرٌ نختم به الدرس</div><div class="sh-text">«' + L.athar.text + '» ' + sayBtn(L.athar.text) + '</div>' + tr(L.athar.tr) +
    '<div class="sh-src">' + L.athar.who + ' — ' + L.athar.src + '</div><div class="sh-f">' + ic('sprout') + ' ' + L.athar.f + '</div>' +
    '<p class="small" style="margin:8px 0 0">' + ic('messages-square') + ' ناقش مع زميلك: كيف تختار كتابك وشيخك؟</p></div>';

  $('chkGap').onclick = () => {
    let all = true;
    document.querySelectorAll('[data-gap]').forEach(inp => { const ok = arEq(inp.value, S.gap.items[inp.dataset.gap].a); inp.className = 'inp ' + (ok ? 'right' : 'wrong'); all = all && ok; });
    $('gapFb').className = 'fb ' + (all ? 'ok' : 'no'); $('gapFb').textContent = all ? '✓ أحسنت الاستماع!' : '✗ استمع مرة أخرى';
    if (all) markDone('gap');
  };
  $('writeBox').value = store.get('write-u7-1', '');
  $('writeSave').onclick = () => {
    const t = $('writeBox').value; store.set('write-u7-1', t);
    const sentences = t.split(/[.!؟?\n،]+/).filter(s => s.trim().split(/\s+/).length >= 2).length;
    const adj = ['كبير', 'جديد', 'جميل', 'مفيد', 'سهل', 'هادئ', 'صغير', 'نظيف', 'واسع', 'كريم', 'قديم'].filter(a => normAr(t).includes(a)).length;
    $('writeCheck').innerHTML = 'عدد الجمل: <b>' + sentences + '</b> · صفات مستعملة: <b>' + adj + '</b> — ' + (sentences >= 3 && adj >= 2 ? '<span style="color:var(--ok)">✓ أحسنت! يراجع المعلم المطابقة.</span>' : 'اكتب ثلاث جمل على الأقل، وفيها صفتان.');
    if (sentences >= 3 && adj >= 2) markDone('writing');
  };

  // تسجيل الصوت: الميكروفون مباشرة إن سُمح، وإلا مسجّل الهاتف أو ملف صوتي (يعمل في الصفحة المنشورة)
  let mr, chunks = [];
  function playBack(blob) {
    const rec = $('rec');
    const a = rec.querySelector('audio') || rec.appendChild(document.createElement('audio'));
    a.controls = true; a.src = URL.createObjectURL(blob);
    $('recMsg').textContent = 'استمع إلى تسجيلك وقارنه بالنطق الصحيح.'; markDone('speak');
  }
  function useFileFallback(msg) {
    $('recBtn').hidden = true; $('recFileWrap').hidden = false;
    $('recMsg').textContent = msg;
  }
  $('recFile').onchange = e => { const f = e.target.files[0]; if (f) playBack(f); };
  $('recBtn').onclick = async () => {
    const rec = $('rec');
    if (mr && mr.state === 'recording') { mr.stop(); return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) { useFileFallback('سجّل صوتك بمسجّل الهاتف ثم استمع إليه هنا.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mr = new MediaRecorder(stream); chunks = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop()); rec.classList.remove('on'); $('recBtn').innerHTML = ic('mic') + ' سجّل مرة أخرى'; icons();
        playBack(new Blob(chunks, { type: mr.mimeType }));
      };
      mr.start(); rec.classList.add('on'); $('recBtn').innerHTML = ic('square') + ' أوقف التسجيل'; icons(); $('recMsg').textContent = 'جارٍ التسجيل…';
    } catch (err) { useFileFallback('الميكروفون غير متاح هنا. سجّل صوتك بمسجّل الهاتف ثم استمع إليه، أو تدرّب شفهياً مع زميلك.'); }
  };

  /* ---------- إظهار الإجابات (قابل للتراجع) ---------- */
  function setAnswers(box, on) {
    box.classList.toggle('answers-on', on);
    const b = box.querySelector('.ansbtn');
    if (b) { b.innerHTML = on ? ic('eye-off') + ' إخفاء الإجابات' : ic('eye') + ' إظهار الإجابات'; b.classList.toggle('on', on); icons(); }
    if (on && box.id === 'ex-reading') markDone('reading');
  }
  /* ---------- المعاني التركية (قابلة للتراجع) ---------- */
  function setTr(el, on) {
    el.classList.toggle('show-tr', on);
    el.querySelectorAll(':scope > .sec-title .trbtn, :scope > .ex-head .trbtn, :scope > .trbtn').forEach(b => b.classList.toggle('on', on));
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-teach]'); if (t) Teacher.open(teach[t.dataset.teach].title, teach[t.dataset.teach].items);
    const a = e.target.closest('[data-showans]'); if (a) { const box = $('ex-' + a.dataset.showans); setAnswers(box, !box.classList.contains('answers-on')); }
    const r = e.target.closest('[data-trtoggle]');
    if (r) {
      const el = r.closest('.ex') || r.closest('.book-sec') || r.closest('.objectives'), on = !el.classList.contains('show-tr');
      setTr(el, on);
      // زر القسم ينطبق على كل تمارينه أيضاً
      if (!el.classList.contains('ex')) el.querySelectorAll('.ex').forEach(x => setTr(x, on));
    }
  });
  $('optTr').onchange = e => {
    // المفتاح العام يطبّق الحالة على كل الأقسام والتمارين، ويبقى كل زر قابلاً للتغيير منفرداً
    document.querySelectorAll('.objectives, .book-sec, .ex').forEach(el => setTr(el, e.target.checked));
  };
  $('optAns').onchange = e => document.querySelectorAll('.ex').forEach(x => x.querySelector('.ansbtn') && setAnswers(x, e.target.checked));
  $('resetBtn').onclick = () => { done = {}; store.set('lesson-u7-1', done); updateProgress(); toast('أُعيد تعيين التقدم'); };
  updateProgress();
  icons();
})();
