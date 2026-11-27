/* =========================================================
   واجهات «مسابقة الدرس»: شاشة المعلم + شاشة الطالب
   النقل (transport) نوعان:
   - ServerTransport: خادم حقيقي (الطلاب على هواتفهم عبر الشبكة)
   - LocalTransport: كل شيء في متصفح واحد (العرض التجريبي) مع طلاب افتراضيين
   ========================================================= */
(function () {
  const E = window.QuizEngine;
  const AVATARS = ['📚', '🕌', '🖋️', '🌙', '⭐', '🕰️', '🌴', '🐪', '🏛️', '📜', '🧭', '🫖'];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const h = (el, html) => { el.innerHTML = html; return el; };

  /* ---------- الصوت: ملفات النطق الجاهزة من الموقع ---------- */
  let player;
  function playSay(text) {
    const map = window.AUDIO_MAP || {}, src = map[String(text).trim()];
    if (!src) return;
    if (player) player.pause();
    player = new Audio((window.AUDIO_BASE || '../') + src); player.play().catch(() => {});
  }

  /* ================= النقل عبر الخادم ================= */
  class ServerTransport {
    constructor() { this.listeners = []; }
    async post(path, body) {
      const r = await fetch('/api/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      return r.json();
    }
    listen(qs) {
      if (this.es) this.es.close();
      this.es = new EventSource('/api/stream?' + new URLSearchParams(qs));
      this.es.onmessage = e => { const v = JSON.parse(e.data); v._at = Date.now(); this.listeners.forEach(f => f(v)); };
    }
    subscribe(f) { this.listeners.push(f); }
    async create(quizId, mode) { const r = await this.post('create', { quizId, mode }); if (r.pin) { this.pin = r.pin; this.token = r.token; this.listen({ pin: r.pin, token: r.token }); } return r; }
    action(a) { return this.post('action', { pin: this.pin, token: this.token, action: a }); }
    async join(pin, name, avatar) { const r = await this.post('join', { pin, name, avatar }); if (r.id) { this.pin = pin; this.id = r.id; this.listen({ pin, id: r.id }); } return r; }
    answer(v) { return this.post('answer', { pin: this.pin, id: this.id, value: v }); }
    async info() { try { return await (await fetch('/api/info')).json(); } catch (e) { return null; } }
  }

  /* ================= النقل المحلي (عرض تجريبي) ================= */
  const BOT_NAMES = ['عبد الله', 'أحمد', 'محمد', 'عمر', 'إبراهيم', 'مصطفى', 'بلال', 'حمزة', 'أنس', 'زيد', 'إسماعيل', 'سليمان'];
  class LocalHub {
    constructor() { this.game = null; this.subs = []; this.bots = []; setInterval(() => this.loop(), 250); }
    emit() { this.subs.forEach(s => s()); }
    loop() {
      const g = this.game; if (!g) return;
      const now = Date.now();
      if (E.tick(g, now)) this.emit();
      if (g.phase === 'question') this.bots.forEach(b => {
        if (g.players[b.id].answers[g.qi] || now - g.qStart < b.delay[g.qi]) return;
        const q = g.questions[g.qi], right = Math.random() < b.skill;
        let v;
        if (q.type === 'mcq' || q.type === 'listen') v = right ? q.a : (q.a + 1 + Math.floor(Math.random() * (q.options.length - 1))) % q.options.length;
        else if (q.type === 'tf') v = right ? q.a : !q.a;
        else if (q.type === 'type') v = right ? q.answers[0] : '—';
        else v = right ? q.words.map((w, i) => i) : [1, 0];
        E.answer(g, b.id, v, now); this.emit();
      });
    }
    addBots(n) {
      const g = this.game; if (!g) return;
      for (let i = 0; i < n; i++) {
        const name = BOT_NAMES[(this.bots.length) % BOT_NAMES.length] + (this.bots.length >= BOT_NAMES.length ? ' ' + (this.bots.length + 1) : '');
        const r = E.join(g, name, AVATARS[Math.floor(Math.random() * AVATARS.length)]); if (!r.player) continue;
        this.bots.push({ id: r.player.id, skill: .45 + Math.random() * .45, delay: g.questions.map(q => 2500 + Math.random() * ((q.time || 20) * 600)) });
      }
      this.emit();
    }
  }
  class LocalTransport {
    constructor(hub, role) { this.hub = hub; this.role = role; this.listeners = []; hub.subs.push(() => this.push()); setInterval(() => this.push(), 1000); }
    push() {
      const g = this.hub.game; if (!g) return;
      const v = this.role === 'host' ? E.hostView(g, Date.now()) : (this.id ? E.playerView(g, this.id, Date.now()) : null);
      if (!v) return; v._at = Date.now(); this.listeners.forEach(f => f(v));
    }
    subscribe(f) { this.listeners.push(f); }
    async create(quizId, mode) { const quiz = window.QUIZZES.find(q => q.id === quizId); this.hub.game = E.createGame(quiz, { mode }); this.hub.bots = []; this.push(); return { pin: this.hub.game.pin }; }
    async action(a) { const g = this.hub.game, now = Date.now(); if (a === 'start') E.start(g, now); else if (a === 'reveal') E.reveal(g); else if (a === 'next') E.next(g, now); else if (a === 'end') E.end(g); else if (a === 'bots') this.hub.addBots(6); this.hub.emit(); return { ok: true }; }
    async join(pin, name, avatar) { const g = this.hub.game; if (!g || g.pin !== String(pin).trim()) return { error: 'رمز المسابقة غير صحيح' }; const r = E.join(g, name, avatar); if (r.error) return r; this.id = r.player.id; this.hub.emit(); return { id: this.id }; }
    async answer(v) { const r = E.answer(this.hub.game, this.id, v, Date.now()); this.hub.emit(); return r; }
  }

  /* ================= أدوات العرض ================= */
  const remain = v => Math.max(0, Math.ceil((v.remaining - (Date.now() - v._at)) / 1000));
  const OPT_CLASS = (o, i) => o.i === 'true' ? 'oT' : o.i === 'false' ? 'oF' : 'o' + (i % 4);
  const qText = q => (q.icon ? '<span class="icon">' + q.icon + '</span>' : '') + esc(q.q) + (q.tr ? '<span class="tr">' + esc(q.tr) + '</span>' : '');

  /* ================= شاشة المعلم ================= */
  function HostApp(root, tr, opts = {}) {
    let view = null, timerI = null, lastQ = -1, joinUrl = opts.joinUrl || '';
    const state = { mode: 'speed', quizId: window.QUIZZES[0].id, showTr: true };
    // لا نعيد الرسم إلا إذا تغيّرت حالة اللعبة فعلاً
    tr.subscribe(v => { if (view && v.version === view.version && v.phase === view.phase) return; view = v; render(); });

    function setup() {
      h(root, '<div class="host pattern"><div class="host-top"><span class="ttl">🎯 مسابقة الدرس</span><span class="sub">العربية بين يدي طالب العلم</span></div>' +
        '<div class="host-main"><div class="setup-card"><h2>ابدأ مسابقة جديدة</h2><p class="small" style="color:#4a5655;margin:0 0 12px">اختر مسابقة الدرس وطريقة الحساب، ثم يدخل الطلاب بالرمز من هواتفهم.</p>' +
        '<label class="small">المسابقة</label><select class="inp" id="qz">' + window.QUIZZES.map(q => '<option value="' + q.id + '">' + esc(q.title) + ' — ' + esc(q.subtitle) + ' (' + q.questions.length + ' سؤالاً)</option>').join('') + '</select>' +
        '<div class="modes"><button class="mode on" data-m="speed"><b>⚡ السرعة والدقة</b><span>الإجابة الصحيحة الأسرع تأخذ نقاطاً أكثر، ومكافأة للإجابات المتتالية.</span></button>' +
        '<button class="mode" data-m="calm"><b>🌿 التأنّي</b><span>كل إجابة صحيحة 1000 نقطة، ووقت أطول. مناسب للمبتدئين ولمراجعة القواعد.</span></button></div>' +
        '<label style="display:flex;gap:8px;align-items:center;color:#4a5655"><input type="checkbox" id="trc" checked> إظهار الترجمة التركية تحت الأسئلة</label>' +
        '<div style="margin-top:18px;text-align:center"><button class="btn big" id="go">إنشاء المسابقة ←</button></div></div></div></div>');
      root.querySelectorAll('.mode').forEach(b => b.onclick = () => { state.mode = b.dataset.m; root.querySelectorAll('.mode').forEach(x => x.classList.toggle('on', x === b)); });
      root.querySelector('#go').onclick = async () => { state.quizId = root.querySelector('#qz').value; state.showTr = root.querySelector('#trc').checked; await tr.create(state.quizId, state.mode); };
    }

    function top(v) {
      return '<div class="host-top"><span class="ttl">🎯 ' + esc(v.title) + '</span><span class="sub">' + esc(v.subtitle) + ' · ' + (v.mode === 'calm' ? '🌿 التأنّي' : '⚡ السرعة والدقة') + '</span><span class="sp"></span>' +
        '<span class="sub lat">PIN ' + v.pin + '</span><span class="sub">👥 ' + v.players.length + '</span></div>';
    }

    function render() {
      clearInterval(timerI);
      const v = view; if (!v) return setup();
      const cls = 'host pattern' + (state.showTr ? '' : ' hidden-tr');
      if (v.phase === 'lobby') {
        h(root, '<div class="' + cls + '">' + top(v) + '<div class="host-main">' +
          '<div class="join-box"><div class="how">1) افتح على هاتفك:<br><span class="url">' + esc(joinUrl || 'صفحة الطالب') + '</span><br>2) اكتب رمز المسابقة:</div><div class="pin">' + v.pin + '</div>' + (joinUrl ? '<div class="qr" id="qr"></div>' : '') + '</div>' +
          '<div class="count">' + (v.players.length ? 'دخل ' + v.players.length + ' طالباً' : 'بانتظار دخول الطلاب<span class="wait-dots"></span>') + '</div>' +
          '<div class="chips">' + v.players.map(p => '<span class="chip">' + p.avatar + ' ' + esc(p.name) + '</span>').join('') + '</div>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' + (opts.demo ? '<button class="btn ghost" data-a="bots">+ أضف 6 طلاب افتراضيين (للتجربة)</button>' : '') +
          '<button class="btn big" data-a="start"' + (v.players.length ? '' : ' disabled') + '>ابدأ المسابقة ←</button></div></div></div>');
        if (joinUrl && window.QRCode) { try { new QRCode(root.querySelector('#qr'), { text: joinUrl, width: 150, height: 150 }); } catch (e) {} }
      } else if (v.phase === 'question') {
        const q = v.question;
        if (lastQ !== v.qi) { lastQ = v.qi; if (q.say) setTimeout(() => playSay(q.say), 400); }
        h(root, '<div class="' + cls + '">' + top(v) + '<div class="host-main"><div class="q-wrap">' +
          '<div class="q-head"><span class="q-num lat">' + (v.qi + 1) + ' / ' + v.total + '</span>' + (q.type === 'listen' ? '<button class="btn ghost" id="say">🔊 أعد الاستماع</button>' : '') + '<span class="sp"></span>' +
          '<div class="answered"><b>' + v.stats.answered + '</b><span class="small">أجابوا</span></div><div class="timer" id="tm" style="--p:100"><span>' + remain(v) + '</span></div></div>' +
          '<div class="q-box">' + (q.type === 'listen' ? '<span class="icon">🎧</span>' : '') + qText(q) + '</div>' + hostOptions(q, v, false) +
          '<div><button class="btn ghost" data-a="reveal">إظهار الإجابة الآن</button></div></div></div></div>');
        if (q.say && root.querySelector('#say')) root.querySelector('#say').onclick = () => playSay(q.say);
        const tick = () => { const s = remain(v), el = root.querySelector('#tm'); if (!el) return; el.querySelector('span').textContent = s; el.style.setProperty('--p', Math.round(s * 1000 / v.limit * 100)); };
        tick(); timerI = setInterval(tick, 250);
      } else if (v.phase === 'reveal') {
        const q = v.question;
        h(root, '<div class="' + cls + '">' + top(v) + '<div class="host-main"><div class="q-wrap">' +
          '<div class="q-head"><span class="q-num lat">' + (v.qi + 1) + ' / ' + v.total + '</span><span class="sp"></span><span class="q-skill">✓ ' + v.stats.correct + ' من ' + v.stats.total + ' أجابوا صواباً</span></div>' +
          '<div class="q-box">' + qText(q) + '</div>' + hostOptions(q, v, true) +
          '<div class="explain"><b>💡 ' + esc(v.answer.explain) + '</b>' + (v.answer.explainTr ? '<span class="tr">' + esc(v.answer.explainTr) + '</span>' : '') + '</div>' +
          '<div><button class="btn big" data-a="next">لوحة الصدارة ←</button></div></div></div></div>');
      } else if (v.phase === 'board') {
        h(root, '<div class="' + cls + '">' + top(v) + '<div class="host-main"><h2 style="margin:0">🏅 لوحة الصدارة</h2><div class="board">' +
          v.ranking.map(r => '<div class="row"><span class="rk">' + r.rank + '</span><span class="av">' + r.avatar + '</span><span class="nm">' + esc(r.name) + (r.streak >= 2 ? ' <span class="small" title="إجابات صحيحة متتالية">🔥' + r.streak + '</span>' : '') + '</span>' +
            (r.last ? '<span class="dl">+' + r.last + '</span>' : '') + '<span class="sc">' + r.score + '</span></div>').join('') + '</div>' +
          '<button class="btn big" data-a="next">' + (v.qi + 1 < v.total ? 'السؤال التالي ←' : 'النتيجة النهائية 🏆') + '</button></div></div>');
      } else if (v.phase === 'end') {
        const r = v.ranking, pod = [r[1], r[0], r[2]];
        const weak = v.report.slice().sort((a, b) => a.correct / (a.total || 1) - b.correct / (b.total || 1))[0];
        h(root, '<div class="' + cls + '">' + top(v) + '<div class="host-main"><h2 style="margin:0">🏆 بارك الله فيكم جميعاً</h2>' +
          '<div class="podium">' + pod.map((p, i) => p ? '<div class="pod p' + [2, 1, 3][i] + '"><div class="av">' + p.avatar + '</div><div class="nm">' + esc(p.name) + '</div><div class="small lat">' + p.score + '</div><div class="blk">' + [2, 1, 3][i] + '</div></div>' : '').join('') + '</div>' +
          '<div class="report"><b>📊 تقرير المعلم: ما الذي يحتاج إلى مراجعة؟</b>' + (weak ? '<p class="small" style="margin:6px 0 10px">أصعب سؤال: <b>' + esc(weak.q) + '</b> (' + esc(weak.skill) + ') — أجاب عنه صواباً ' + weak.correct + ' من ' + weak.total + '.</p>' : '') +
          '<table><tr><th>#</th><th>السؤال</th><th>المهارة</th><th>نسبة الصواب</th><th>متوسط الوقت</th></tr>' +
          v.report.map(x => { const p = x.total ? Math.round(x.correct / x.total * 100) : 0; return '<tr><td class="lat">' + (x.i + 1) + '</td><td class="book">' + esc(x.q) + '</td><td>' + esc(x.skill) + '</td><td><div class="meter"><i style="width:' + p + '%;background:' + (p >= 70 ? '#1d9a55' : p >= 40 ? '#b48a3c' : '#c0392b') + '"></i></div><span class="small lat">' + p + '%</span></td><td class="lat small">' + x.avgT + 's</td></tr>'; }).join('') + '</table></div>' +
          '<button class="btn white" id="again">مسابقة جديدة</button></div></div>');
        root.querySelector('#again').onclick = () => { view = null; lastQ = -1; setup(); };
      }
      root.querySelectorAll('[data-a]').forEach(b => b.onclick = () => tr.action(b.dataset.a));
    }

    function hostOptions(q, v, revealed) {
      if (q.type === 'type' || q.type === 'order') {
        if (!revealed) return '<div class="explain" style="text-align:center">' + (q.type === 'type' ? '✍️ يكتب الطلاب الإجابة على هواتفهم' : '🔀 يرتّب الطلاب الكلمات على هواتفهم: <span class="book">' + q.words.map(w => esc(w.t)).join(' · ') + '</span>') + '</div>';
        const ok = v.stats.counts.ok || 0, no = v.stats.counts.no || 0, mx = Math.max(1, ok, no);
        return '<div class="explain" style="text-align:center;font-size:1.6rem" class="book">✔ <span class="book">' + esc(v.answer.text) + '</span></div>' +
          '<div class="bars"><div class="bar"><b>' + ok + '</b><i style="height:' + ok / mx * 100 + '%;background:var(--ok)"></i>صواب</div><div class="bar"><b>' + no + '</b><i style="height:' + no / mx * 100 + '%;background:var(--bad)"></i>خطأ</div></div>';
      }
      const mx = Math.max(1, ...q.options.map(o => v.stats.counts[String(o.i)] || 0));
      return (revealed ? '<div class="bars">' + q.options.map((o, i) => { const n = v.stats.counts[String(o.i)] || 0; return '<div class="bar"><b>' + n + '</b><i class="' + OPT_CLASS(o, i) + '" style="height:' + n / mx * 100 + '%"></i><span class="lat">' + o.s + (String(o.i) === String(v.answer.a) ? ' ✓' : '') + '</span></div>'; }).join('') + '</div>' : '') +
        '<div class="opts">' + q.options.map((o, i) => { const right = revealed && String(o.i) === String(v.answer.a);
          return '<div class="opt ' + OPT_CLASS(o, i) + (revealed ? (right ? ' right' : ' dim') : '') + '"><span class="shape">' + o.s + '</span><span>' + esc(o.t) + '</span>' + (right ? '<span class="mark">✓</span>' : '') + '</div>'; }).join('') + '</div>';
    }
    render();
  }

  /* ================= شاشة الطالب ================= */
  function PlayerApp(root, tr, opts = {}) {
    let view = null, avatar = AVATARS[0], timerI = null, order = [], typed = '', lastQ = -1;
    tr.subscribe(v => {
      // يكفي إعادة الرسم عند تغيّر ما يخص الطالب: المرحلة أو السؤال أو إجابته أو نقاطه
      const k = x => x.phase + '|' + x.qi + '|' + x.answered + '|' + (x.me && x.me.score);
      if (view && k(v) === k(view)) return; view = v; render();
    });

    function joinForm(err, pin, name) {
      h(root, '<div class="player pattern"><div class="p-top"><b>🎯 مسابقة الدرس</b></div><div class="p-main"><div class="p-card"><h2>ادخل المسابقة</h2>' +
        '<label>رمز المسابقة (PIN)</label><input class="inp pin-in" id="pin" inputmode="numeric" maxlength="6" placeholder="000000" value="' + esc(pin || opts.pin || '') + '">' +
        '<label>اسمك</label><input class="inp" id="nm" maxlength="24" placeholder="مثال: يوسف" value="' + esc(name || '') + '">' +
        '<label>اختر رمزك</label><div class="avatars">' + AVATARS.map(a => '<button data-av="' + a + '" class="' + (a === avatar ? 'on' : '') + '">' + a + '</button>').join('') + '</div>' +
        '<div class="err">' + esc(err || '') + '</div><button class="btn big" id="go" style="width:100%;margin-top:6px">ادخل ←</button></div></div></div>');
      root.querySelectorAll('[data-av]').forEach(b => b.onclick = () => { avatar = b.dataset.av; root.querySelectorAll('[data-av]').forEach(x => x.classList.toggle('on', x === b)); });
      root.querySelector('#go').onclick = async () => {
        const pin = root.querySelector('#pin').value.trim(), name = root.querySelector('#nm').value.trim();
        if (!/^\d{6}$/.test(pin)) return joinForm('الرمز 6 أرقام', pin, name);
        const r = await tr.join(pin, name, avatar); if (r.error) joinForm(r.error, pin, name);
      };
    }
    const topBar = v => '<div class="p-top"><span>' + v.me.avatar + ' ' + esc(v.me.name) + '</span><span class="sp"></span>' + (v.me.streak >= 2 ? '<span>🔥' + v.me.streak + '</span>' : '') + '<span class="sc">' + v.me.score + '</span></div>';

    function render() {
      clearInterval(timerI);
      const v = view; if (!v) return joinForm();
      if (v.phase === 'gone') return joinForm('انتهت الجلسة، ادخل من جديد');
      const wrap = inner => h(root, '<div class="player pattern">' + topBar(v) + '<div class="p-main">' + inner + '</div></div>');
      if (v.phase === 'lobby') wrap('<div class="big-icon">' + v.me.avatar + '</div><h2 style="margin:0">أهلاً ' + esc(v.me.name) + '!</h2><p>أنت داخل المسابقة. انظر إلى شاشة المعلم<span class="wait-dots"></span></p>');
      else if (v.phase === 'question') {
        const q = v.question;
        if (lastQ !== v.qi) { lastQ = v.qi; order = []; typed = ''; }
        if (v.answered) return wrap('<div class="big-icon">⏳</div><h2 style="margin:0">أُرسلت إجابتك</h2><p class="muted">ننتظر بقية الزملاء<span class="wait-dots"></span></p>');
        const head = '<div style="display:flex;justify-content:space-between" class="small lat"><span>' + (v.qi + 1) + ' / ' + v.total + '</span><span id="tm">' + remain(v) + 's</span></div><div class="p-q">' + (q.icon ? q.icon + ' ' : '') + esc(q.q) + '</div>';
        if (q.type === 'mcq' || q.type === 'listen' || q.type === 'tf')
          wrap(head + (q.type === 'listen' ? '<p class="small">🎧 استمع من شاشة المعلم</p>' : '') + '<div class="p-opts' + (q.type === 'tf' ? ' tf' : '') + '">' +
            q.options.map((o, i) => '<button class="opt ' + OPT_CLASS(o, i) + '" data-v="' + o.i + '"><span class="shape">' + o.s + '</span><span class="book">' + esc(o.t) + '</span></button>').join('') + '</div>');
        else if (q.type === 'type')
          wrap(head + '<input class="inp book" id="ty" style="font-size:1.4rem;text-align:center" placeholder="اكتب هنا" value="' + esc(typed) + '"><button class="btn big" id="send">أرسل</button>');
        else if (q.type === 'order')
          wrap(head + '<p class="small">اضغط الكلمات بالترتيب الصحيح</p><div class="wordbank target" id="tg">' + order.map(i => '<button class="word" data-back="' + i + '">' + esc(q.words.find(w => w.i === i).t) + '</button>').join('') + '</div>' +
            '<div class="wordbank" id="bk">' + q.words.filter(w => !order.includes(w.i)).map(w => '<button class="word" data-w="' + w.i + '">' + esc(w.t) + '</button>').join('') + '</div><button class="btn big" id="send"' + (order.length === q.words.length ? '' : ' disabled') + '>أرسل</button>');
        root.querySelectorAll('[data-v]').forEach(b => b.onclick = () => tr.answer(q.type === 'tf' ? b.dataset.v === 'true' : Number(b.dataset.v)));
        root.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { order.push(Number(b.dataset.w)); render(); });
        root.querySelectorAll('[data-back]').forEach(b => b.onclick = () => { order = order.filter(i => i !== Number(b.dataset.back)); render(); });
        const ty = root.querySelector('#ty'); if (ty) { ty.oninput = () => typed = ty.value; ty.focus(); ty.onkeydown = e => { if (e.key === 'Enter') tr.answer(ty.value); }; }
        const send = root.querySelector('#send'); if (send) send.onclick = () => tr.answer(q.type === 'order' ? order : root.querySelector('#ty').value);
        timerI = setInterval(() => { const el = root.querySelector('#tm'); if (el) el.textContent = remain(v) + 's'; }, 250);
      } else if (v.phase === 'reveal' || v.phase === 'board') {
        const r = v.result;
        wrap('<div class="res ' + (r.missed ? 'miss' : r.ok ? 'ok' : 'no') + '"><div class="big-icon">' + (r.missed ? '⌛' : r.ok ? '✅' : '❌') + '</div><h2>' + (r.missed ? 'انتهى الوقت' : r.ok ? 'أحسنت!' : 'ليست هذه') + '</h2>' +
          (r.ok ? '<div class="pts">+' + r.pts + '</div>' + (r.bonus ? '<div class="small">منها 🔥 ' + r.bonus + ' مكافأة التتابع</div>' : '') : '<div>الإجابة الصحيحة: <b class="book">' + esc(r.correct) + '</b></div>') +
          '<p style="margin:10px 0 0">ترتيبك: <b class="lat">' + r.rank + '</b> من <span class="lat">' + r.of + '</span></p></div>' +
          (r.explain ? '<div class="p-explain">💡 ' + esc(r.explain) + (r.explainTr ? '<span class="tr">' + esc(r.explainTr) + '</span>' : '') + '</div>' : ''));
      } else if (v.phase === 'end') {
        const f = v.final;
        wrap('<div class="big-icon">' + (f.rank === 1 ? '🥇' : f.rank === 2 ? '🥈' : f.rank === 3 ? '🥉' : '🌟') + '</div><h2 style="margin:0">ترتيبك ' + f.rank + ' من ' + f.of + '</h2><div class="lat" style="font-size:1.6rem;font-weight:800">' + f.score + '</div>' +
          (f.review.length ? '<div class="review"><b style="color:#fff">📝 راجع أخطاءك:</b>' + f.review.map(x => '<div><span class="book">' + esc(x.q) + '</span><br>✔ <b class="book">' + esc(x.correct) + '</b>' + (x.explain ? '<br><span class="small">' + esc(x.explain) + '</span>' : '') + '</div>').join('') + '</div>' : '<p>ما شاء الله! لا أخطاء 🌿</p>'));
      }
    }
    render();
  }

  window.QuizUI = { HostApp, PlayerApp, ServerTransport, LocalHub, LocalTransport };
})();
