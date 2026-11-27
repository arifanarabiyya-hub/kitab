/* =========================================================
   طبقة الترجمة التركية للدرس النموذجي — منفصلة عن المحتوى العربي
   (تسمح مستقبلاً بإضافة لغات أخرى بالطريقة نفسها)
   ========================================================= */
(function () {
  const T = {
    sections: { s1: 'Kelimeler ve kalıplar', s2: 'Diyalog', s3: 'Diyaloğu anlama', s4: 'Dil bilgisi: sıfat ve nitelenen isim', s5: 'Dil bilgisi alıştırmaları', s6: 'Beceri etkinlikleri' },
    objectives: [
      'Kütüphanedeki yerleri, kitap türlerini ve ders araçlarını adlandırır.',
      'Bir kitabı ve yerini sorar, kibarca ödünç almak ister.',
      'Ödünç alma ile ilgili dinlediği bir diyaloğu anlar ve bilgileri çıkarır.',
      'Nitelenen isme uyan sıfatı kullanarak nesneleri tanımlar.',
      'Ödünç kartını doldurur ve üç tanımlayıcı cümle yazar.'
    ],
    scene: 'Yusuf enstitüde yeni bir Türk öğrencidir. Kütüphaneye ilk kez girer ve kütüphane görevlisi Hâlid Hoca ile konuşur.',
    dialogue: [
      'Esselâmü aleyküm ve rahmetullah.',
      'Ve aleyküm selâm ve rahmetullahi ve berekâtüh. Hoş geldiniz.',
      'Enstitüde yeni bir öğrenciyim. Adım Yusuf, Türkiye’denim.',
      'Hoş geldin Yusuf. Ben Hâlid, kütüphane görevlisiyim. Sana nasıl yardım edebilirim?',
      'Maşallah! Kütüphane büyük. Okuma salonu nerede?',
      'Okuma salonu orada, büyük rafların yanında.',
      'Nahiv hakkında kolay bir kitap istiyorum. Sizde var mı?',
      'Evet, yeni ve faydalı bir kitabımız var. Üçüncü rafta.',
      'Kitabı ödünç alabilir miyim?',
      'Evet, tabii. Kütüphane kartın var mı?',
      'Evet, buyurun. Kitabı kaç günlüğüne ödünç alıyorum?',
      'Bir haftalığına. Onu gelecek perşembe iade et.',
      'Allah razı olsun.',
      'Sizden de razı olsun. Allah’a emanet ol.'
    ],
    ex: {
      tf: 'Doğru mu, yanlış mı?', mcq: 'Doğru cevabı seç', open: 'Soruları cevapla', order: 'Diyalogdaki cümleleri sıraya koy',
      gchoice: 'Doğru biçimi seç', gshahid: 'Ayet ve hadislerde kuralı bul', gfill: 'Uygun sıfatla tamamla', gfix: 'Hatayı düzelt (önce düşün, sonra kontrol et)', gmake: 'Bir cümle kur ve arkadaşınla kısa bir diyalogda kullan',
      sounds: 'Dinle ve duyduğun kelimeyi seç', gap: 'Cümleyi dinle ve eksik kelimeyi yaz', speak: 'Konuşma', reading: 'Okuma', writing: 'Yazma'
    },
    trueFalse: ['Yusuf enstitüde eski bir öğrencidir.', 'Hâlid Hoca kütüphane görevlisidir.', 'Okuma salonu büyük rafların yanındadır.', 'Nahiv kitabı birinci raftadır.'],
    mcq: [
      { q: 'Yusuf nerelidir?', o: ['Mısır’dan', 'Türkiye’den', 'Suriye’den'] },
      { q: 'Yusuf ne istiyor?', o: ['Yeni bir dergi', 'Büyük bir sözlük', 'Nahiv hakkında kolay bir kitap'] },
      { q: 'Ödünç süresi ne kadar?', o: ['Bir gün', 'Bir hafta', 'Bir ay'] }
    ],
    openQ: ['Kütüphane görevlisinin adı nedir?', 'Yusuf kitabı ne zaman iade ediyor?'],
    order: ['Kütüphane kartın var mı?', 'Okuma salonu nerede?', 'Nahiv hakkında kolay bir kitap istiyorum.', 'Allah razı olsun.'],
    shawahid: [
      'Bizi dosdoğru yola ilet. (Meal)',
      'Rabbim! Burayı güvenli bir şehir kıl. (Meal)',
      'Ve şu güvenli şehre (andolsun). (Meal)',
      'Güzel bir söz, güzel bir ağaç gibidir. (Meal)',
      'Onlarda dosdoğru hükümler bulunan yazılar vardır. (Meal)',
      'Güzel söz sadakadır.',
      'Güçlü mümin, Allah katında zayıf müminden daha hayırlı ve daha sevimlidir.'
    ],
    athar: 'Bu ilim dindir; dininizi kimden aldığınıza dikkat edin.',
    shahidIntro: 'Kuralı bildiğin ayet ve hadislerle öğren; hem dil bilgisi hem de ahlâkî bir ders.',
    grammarShahid: ['Hangisi sıfattır?', 'Nitelenen belirsiz; sıfat da:', 'Kitaplar eril iken sıfat neden dişil geldi?', 'Sıfat hangisidir?'],
    grammarChoice: ['Bu, büyük bir kütüphanedir.', 'Büyük sözlük nerede?', 'Bunlar faydalı kitaplardır.', 'Sakin salonda oturdum.'],
    grammarFill: ['Bu yeni bir kalem, bu da yeni bir kâğıt.', 'Bu faydalı bir sözlük, bu da faydalı bir dergi.', 'Küçük defter üçüncü rafta.'],
    grammarFix: ['Bu büyük bir salondur.', 'Yeni bir kitabım var.', 'Bu yeni bir dergidir.'],
    sounds: [['kalp', 'köpek'], ['kılıç', 'yaz (mevsim)'], ['acı', 'bayrak / işaret'], ['harem (kutsal alan)', 'piramit']],
    gap: ['Nahiv hakkında kolay bir kitap istiyorum.', 'Okuma salonu rafların yanında.'],
    roleplay: [
      'Yeni bir öğrencisin. Arapça–Türkçe bir sözlük arıyorsun. Kütüphane görevlisine yerini sor, ödünç almak iste ve süresini sor.',
      'Kütüphane görevlisisin. Öğrenciyi karşıla, rafı göster, kütüphane kartını iste ve ödünç süresini belirt.'
    ],
    describe: 'Enstitünün kütüphanesini veya evdeki kütüphaneni arkadaşına üç cümleyle anlat; en az iki sıfat kullan.',
    prompts: ['En sevdiğin kitabın adı ne?', 'Enstitündeki kütüphane büyük mü?', 'Bu hafta ne okuyorsun?'],
    reading: {
      title: 'Enstitümüzün kütüphanesi',
      text: 'Enstitümüzde büyük ve güzel bir kütüphane var. İçinde birçok raf ve nahiv, tefsir ve hadis alanında faydalı kitaplar var. Ayrıca sakin bir okuma salonu var. İkindi namazından sonra kütüphaneye gidiyorum ve bir saat okuyorum. Kütüphane görevlisi cömert bir adamdır, öğrencilere her zaman yardım eder. Her hafta yeni bir kitap ödünç alıyorum.',
      q: ['Yazar kütüphaneye ne zaman gidiyor?', 'Metinden üç sıfat çıkar.', '“يُسَاعِدُ” ne demektir? Bağlamdan tahmin et.']
    },
    writing: { form: ['Ad', 'Kitabın adı', 'Ödünç alma tarihi', 'İade tarihi'], task: 'Bildiğin bir kütüphane hakkında üç cümle yaz; her cümlede uyumlu bir sıfat kullan.' },
    grammarIntro: 'Diyalogdaki şu ifadelere dikkat et. Renkli kelime, kendinden önceki ismi niteleyen sıfattır.',
    rules: [
      'Sıfat her zaman nitelediği isimden SONRA gelir.',
      'Sıfat, ismin eril/dişil olmasına uyar.',
      'Sıfat, ismin belirli/belirsiz olmasına uyar.',
      'Akılsız varlıkların çoğulu tekil dişil sıfatla nitelenir.'
    ],
    labels: { vocab: 'Kelimenin üzerine tıkla: telaffuzunu dinle ve anlamını gör.', phrases: 'Konuşmada faydalı kalıplar', cloze: 'Hatırlama modunda kelimeyi görmek için boşluğa tıkla.' }
  };

  const L = window.SAMPLE_UNIT.lesson1;
  L.trData = T;
  L.dialogue.lines.forEach((l, i) => { l.tr = T.dialogue[i]; });
  L.trueFalse.forEach((t, i) => { t.tr = T.trueFalse[i]; });
  L.mcq.forEach((m, i) => { m.tr = T.mcq[i].q; m.otr = T.mcq[i].o; });
  L.openQ.forEach((o, i) => { o.tr = T.openQ[i]; });
  L.grammarChoice.forEach((g, i) => { g.tr = T.grammarChoice[i]; });
  L.shawahid.forEach((s, i) => { s.tr = T.shawahid[i]; });
  L.athar.tr = T.athar;
  L.grammarShahid.forEach((g, i) => { g.tr = T.grammarShahid[i]; });
  L.grammarFill.forEach((g, i) => { g.tr = T.grammarFill[i]; });
  L.grammarFix.forEach((g, i) => { g.tr = T.grammarFix[i]; });
  L.listening.sounds.items.forEach((s, i) => { s.otr = T.sounds[i]; });
  L.listening.gap.items.forEach((g, i) => { g.tr = T.gap[i]; });
  L.speaking.roleplay.forEach((r, i) => { r.tr = T.roleplay[i]; });
  L.reading.q.forEach((q, i) => { q.tr = T.reading.q[i]; });
  L.writing.form.forEach((f, i) => { f.tr = T.writing.form[i]; });
})();
