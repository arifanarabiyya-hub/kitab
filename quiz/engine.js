/* =========================================================
   محرك «مسابقة الدرس» — يعمل في الخادم (Node) وفي المتصفح (العرض التجريبي)
   لا يعتمد على أي مكتبة خارجية.
   ========================================================= */
(function (root) {
  const SHAPES = ['◆', '●', '▲', '■'];
  const BASE_TIME = { mcq: 20, tf: 15, type: 30, order: 30, listen: 25 };

  /* تطبيع العربية لمقارنة الإجابات المكتوبة: يتجاهل الحركات والهمزات والتاء المربوطة */
  function normAr(s) {
    return String(s || '').replace(/[ً-ْٰـ]/g, '').replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^ء-يa-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
      .replace(/(^|\s)ال/g, '$1').replace(/ا(\s|$)/g, '$1');
  }
  function shuffle(a, rnd) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function seeded(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }
  const uid = () => Math.random().toString(36).slice(2, 10);

  function timeFor(q, mode) { const t = q.time || BASE_TIME[q.type] || 20; return mode === 'calm' ? Math.round(t * 1.5) : t; }

  /* ---------- إنشاء لعبة ---------- */
  function createGame(quiz, opts = {}) {
    const rnd = seeded(Date.now());
    const questions = quiz.questions.map(q => {
      const c = Object.assign({}, q);
      if (q.type === 'order') c.shuffled = shuffle(q.words.map((w, i) => i), rnd);
      return c;
    });
    return {
      pin: opts.pin || String(100000 + Math.floor(Math.random() * 900000)),
      token: uid() + uid(),
      quizId: quiz.id, title: quiz.title, subtitle: quiz.subtitle || '',
      mode: opts.mode === 'calm' ? 'calm' : 'speed',
      questions, players: {}, phase: 'lobby', qi: -1, qStart: 0, qLimit: 0, version: 0, created: Date.now()
    };
  }

  function join(g, name, avatar) {
    name = String(name || '').trim().slice(0, 24);
    if (!name) return { error: 'اكتب اسمك' };
    if (g.phase === 'end') return { error: 'انتهت المسابقة' };
    if (Object.values(g.players).some(p => p.name === name)) return { error: 'هذا الاسم مستعمل، اختر اسماً آخر' };
    const p = { id: uid(), name, avatar: avatar || '📚', score: 0, streak: 0, answers: {}, joined: Date.now() };
    g.players[p.id] = p; g.version++;
    return { player: p };
  }

  function start(g, now) { if (g.phase !== 'lobby') return; openQuestion(g, 0, now); }
  function openQuestion(g, qi, now) {
    g.qi = qi; g.phase = 'question'; g.qStart = now; g.qLimit = timeFor(g.questions[qi], g.mode) * 1000; g.version++;
  }

  function isCorrect(q, v) {
    if (q.type === 'mcq' || q.type === 'listen') return Number(v) === q.a;
    if (q.type === 'tf') return (v === true || v === 'true') === q.a;
    if (q.type === 'type') return q.answers.some(a => normAr(a) === normAr(v));
    if (q.type === 'order') return Array.isArray(v) && v.join(',') === q.words.map((w, i) => i).join(',');
    return false;
  }

  function answer(g, pid, value, now) {
    const p = g.players[pid];
    if (!p || g.phase !== 'question') return { error: 'لا يوجد سؤال مفتوح الآن' };
    if (p.answers[g.qi]) return { error: 'أجبت عن هذا السؤال' };
    const q = g.questions[g.qi], elapsed = Math.max(0, now - g.qStart);
    if (elapsed > g.qLimit + 800) return { error: 'انتهى الوقت' };
    const ok = isCorrect(q, value);
    let pts = 0, bonus = 0;
    if (ok) {
      pts = g.mode === 'calm' ? 1000 : Math.round(1000 * (1 - 0.5 * Math.min(1, elapsed / g.qLimit)));
      p.streak++;
      if (g.mode === 'speed' && p.streak >= 2) bonus = Math.min(500, 100 * (p.streak - 1));
    } else p.streak = 0;
    p.score += pts + bonus;
    p.answers[g.qi] = { v: value, ok, pts: pts + bonus, bonus, t: elapsed };
    g.version++;
    if (Object.values(g.players).every(x => x.answers[g.qi])) reveal(g); // أجاب الجميع
    return { ok: true };
  }

  function reveal(g) { if (g.phase === 'question') { g.phase = 'reveal'; Object.values(g.players).forEach(p => { if (!p.answers[g.qi]) p.streak = 0; }); g.version++; } }
  function next(g, now) {
    if (g.phase === 'reveal') { g.phase = 'board'; g.version++; return; }
    if (g.phase === 'board' || g.phase === 'reveal') {
      if (g.qi + 1 < g.questions.length) openQuestion(g, g.qi + 1, now); else { g.phase = 'end'; g.version++; }
    }
  }
  function end(g) { g.phase = 'end'; g.version++; }
  /* يُستدعى دورياً: يكشف الإجابة عند انتهاء الوقت */
  function tick(g, now) { if (g.phase === 'question' && now - g.qStart > g.qLimit) { reveal(g); return true; } return false; }

  function ranking(g) {
    return Object.values(g.players).sort((a, b) => b.score - a.score || a.joined - b.joined)
      .map((p, i) => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score, rank: i + 1, streak: p.streak, last: p.answers[g.qi] ? p.answers[g.qi].pts : 0 }));
  }

  /* ما يُعرض للسؤال دون كشف الإجابة */
  function publicQuestion(q) {
    const o = { type: q.type, q: q.q, tr: q.tr || '', audio: q.audio || '', say: q.say || '', icon: q.icon || '' };
    if (q.type === 'mcq' || q.type === 'listen') o.options = q.options.map((t, i) => ({ t, s: SHAPES[i % 4], i }));
    if (q.type === 'tf') o.options = [{ t: 'صح', s: '✓', i: 'true' }, { t: 'خطأ', s: '✗', i: 'false' }];
    if (q.type === 'order') o.words = q.shuffled.map(i => ({ t: q.words[i], i }));
    return o;
  }
  function correctText(q) {
    if (q.type === 'mcq' || q.type === 'listen') return q.options[q.a];
    if (q.type === 'tf') return q.a ? 'صح' : 'خطأ';
    if (q.type === 'type') return q.answers[0];
    if (q.type === 'order') return q.words.join(' ');
  }
  function stats(g) {
    const q = g.questions[g.qi], ps = Object.values(g.players), counts = {};
    ps.forEach(p => { const a = p.answers[g.qi]; if (!a) return; const k = q.type === 'order' || q.type === 'type' ? (a.ok ? 'ok' : 'no') : String(a.v); counts[k] = (counts[k] || 0) + 1; });
    return { counts, answered: ps.filter(p => p.answers[g.qi]).length, correct: ps.filter(p => p.answers[g.qi] && p.answers[g.qi].ok).length, total: ps.length };
  }
  function report(g) {
    const ps = Object.values(g.players);
    return g.questions.map((q, i) => {
      const ans = ps.filter(p => p.answers[i]);
      return { i, q: q.q, skill: q.skill || '', correct: ans.filter(p => p.answers[i].ok).length, total: ps.length, avgT: ans.length ? Math.round(ans.reduce((s, p) => s + p.answers[i].t, 0) / ans.length / 100) / 10 : 0 };
    });
  }

  function hostView(g, now) {
    const v = { role: 'host', pin: g.pin, title: g.title, subtitle: g.subtitle, mode: g.mode, phase: g.phase, qi: g.qi, total: g.questions.length,
      players: Object.values(g.players).map(p => ({ id: p.id, name: p.name, avatar: p.avatar })), version: g.version };
    if (g.qi >= 0 && g.phase !== 'lobby' && g.phase !== 'end') {
      const q = g.questions[g.qi];
      v.question = publicQuestion(q); v.remaining = Math.max(0, g.qLimit - (now - g.qStart)); v.limit = g.qLimit; v.stats = stats(g);
      if (g.phase !== 'question') { v.answer = { a: q.type === 'tf' ? String(q.a) : q.a, text: correctText(q), explain: q.explain || '', explainTr: q.explainTr || '' }; }
    }
    if (g.phase === 'board' || g.phase === 'end' || g.phase === 'reveal') v.ranking = ranking(g).slice(0, g.phase === 'end' ? 50 : 5);
    if (g.phase === 'end') v.report = report(g);
    return v;
  }

  function playerView(g, pid, now) {
    const p = g.players[pid];
    if (!p) return { role: 'player', phase: 'gone' };
    const v = { role: 'player', pin: g.pin, title: g.title, phase: g.phase, qi: g.qi, total: g.questions.length, me: { name: p.name, avatar: p.avatar, score: p.score, streak: p.streak }, mode: g.mode, version: g.version };
    if (g.qi >= 0 && g.phase !== 'lobby' && g.phase !== 'end') {
      const q = g.questions[g.qi], a = p.answers[g.qi];
      v.question = publicQuestion(q); v.remaining = Math.max(0, g.qLimit - (now - g.qStart)); v.limit = g.qLimit;
      v.answered = !!a;
      if (g.phase !== 'question') {
        const r = ranking(g).find(x => x.id === pid);
        v.result = { ok: a ? a.ok : false, missed: !a, pts: a ? a.pts : 0, bonus: a ? a.bonus : 0, rank: r.rank, of: Object.keys(g.players).length, correct: correctText(q), explain: q.explain || '', explainTr: q.explainTr || '' };
      }
    }
    if (g.phase === 'end') {
      const r = ranking(g); const mine = r.find(x => x.id === pid);
      v.final = { rank: mine.rank, of: r.length, score: p.score, podium: r.slice(0, 3),
        review: g.questions.map((q, i) => ({ q: q.q, ok: !!(p.answers[i] && p.answers[i].ok), correct: correctText(q), explain: q.explain || '' })).filter(x => !x.ok) };
    }
    return v;
  }

  const api = { createGame, join, start, answer, reveal, next, end, tick, hostView, playerView, normAr, SHAPES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.QuizEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
