/* صور المفردات الواقعية (من مكتبات مجانية؛ المصادر والتراخيص في assets/img/vocab/credits.json)
   المفتاح: الكلمة بلا تشكيل؛ القيمة: اسم الملف. إن لم توجد الصورة يظهر الرمز البديل. */
(function () {
  const M = {
    'مكتبة': 'library', 'قاعة المطالعة': 'reading-room', 'رف': 'shelf', 'مكتب الإعارة': 'loan-desk',
    'كتاب': 'book', 'مصحف': 'mushaf', 'معجم': 'dictionary', 'مجلة': 'magazine',
    'دفتر': 'notebook', 'قلم': 'pen', 'بطاقة المكتبة': 'library-card', 'بطاقة': 'library-card', 'حاسوب': 'computer',
    'يقرأ': 'read', 'يبحث عن': 'search', 'يستعير': 'borrow', 'يرجع': 'return',
    'كبير / كبيرة': 'big', 'جديد / جديدة': 'new','مفيد / مفيدة': 'useful', 'مفيد': 'useful',
    'متجر': 'shop', 'ثمن': 'price', 'رخيص': 'cheap', 'غال': 'expensive', 'طبعة': 'edition',
    'مؤلف': 'author', 'عنوان': 'title', 'مفضل': 'favorite', 'ممتع': 'enjoyable'
  };
  const bare = s => String(s || '').replace(/[ً-ْٰـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/\s+/g, ' ').trim();
  /* الصور المعتمدة من المراجع الشرعي فقط؛ غيرها يبقى رمزاً حتى يُعتمد بديله */
  const OK = ['shelf', 'mushaf', 'dictionary', 'notebook', 'pen', 'computer', 'read', 'search', 'book',
    'reading-room', 'loan-desk', 'magazine', 'big', 'price', 'expensive', 'author', 'title', 'useful', 'shop', 'enjoyable'];
  const idx = {}; Object.keys(M).forEach(k => { if (OK.includes(M[k])) idx[bare(k)] = M[k]; });
  window.vocabImg = ar => idx[bare(ar)] || null;
  /* صورة واقعية مربعة، وإن تعذّر تحميلها يحل محلها الرمز */
  window.vocabPic = (ar, emoji, cls) => {
    const f = window.vocabImg(ar);
    const fb = '<span class="' + (cls || 'pic') + ' emo">' + (emoji || '') + '</span>';
    if (!f) return fb;
    return '<img class="' + (cls || 'pic') + '" src="assets/img/vocab/' + f + '.jpg" alt="" onerror="this.outerHTML=this.dataset.fb" data-fb="' + fb.replace(/"/g, '&quot;') + '">';
  };
})();
