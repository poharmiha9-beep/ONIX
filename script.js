/* ============================================================
   ONIX — interakcije
   ============================================================ */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* preloader */
  const pre = $('#preloader');
  const done = () => pre && pre.classList.add('done');
  addEventListener('load', () => setTimeout(done, reduce ? 0 : 1300));
  setTimeout(done, 3000);

  /* year */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* cursor */
  const cur = $('#cursor');
  if (cur && matchMedia('(hover:hover)').matches) {
    let x = innerWidth / 2, yy = innerHeight / 2, tx = x, ty = yy;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      x += (tx - x) * .2; yy += (ty - yy) * .2;
      cur.style.transform = `translate(${x}px,${yy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor]');
      cur.classList.remove('hover', 'view');
      if (t) cur.classList.add(t.dataset.cursor);
    });
  }

  /* nav hide/solid */
  const nav = $('#nav'); let last = 0;
  addEventListener('scroll', () => {
    const s = scrollY;
    nav.classList.toggle('solid', s > 40);
    if (s > last && s > 420 && !menu.classList.contains('open')) nav.classList.add('hidden');
    else nav.classList.remove('hidden');
    last = s;
  }, { passive: true });

  /* mobile menu */
  const burger = $('#burger'), menu = $('#menu');
  const toggle = f => {
    const open = f ?? !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    nav.classList.toggle('open-burger', open);
    document.body.classList.toggle('lock', open);
  };
  burger?.addEventListener('click', () => toggle());
  $$('#menu a').forEach(a => a.addEventListener('click', () => toggle(false)));

  /* reveal */
  const io = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const sibs = [...e.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      e.target.style.transitionDelay = `${Math.min(sibs.indexOf(e.target), 6) * 70}ms`;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* counters */
  const cio = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
      const t0 = performance.now();
      (function tick(now) {
        const p = Math.min((now - t0) / 1500, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      cio.unobserve(el);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(c => cio.observe(c));

  /* magnetic */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
  }

  /* form */
  const form = $('#form'), note = $('#formNote');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    ['ime', 'email', 'tip'].forEach(id => {
      const f = $('#' + id), field = f.closest('.field');
      const valid = id === 'email' ? /\S+@\S+\.\S+/.test(f.value) : f.value.trim() !== '';
      field.classList.toggle('error', !valid); if (!valid) ok = false;
    });
    if (!ok) { note.textContent = 'Prosimo, izpolnite obvezna polja.'; return; }
    const ime = $('#ime').value.trim().split(' ')[0];
    note.style.color = 'var(--red-2)';
    note.textContent = `Hvala, ${ime}! Oglasimo se v 24 urah. ✦`;
    form.reset(); $$('.field').forEach(f => f.classList.remove('error'));
  });

  /* back to top */
  const totop = $('#totop');
  addEventListener('scroll', () => totop?.classList.toggle('show', scrollY > innerHeight * .9), { passive: true });
  totop?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* active nav link */
  const links = $$('.nav__links a');
  const sio = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) links.forEach(l => l.style.color = l.getAttribute('href') === '#' + e.target.id ? 'var(--text)' : ''); });
  }, { threshold: .4 });
  $$('main section[id]').forEach(s => sio.observe(s));

  /* JEZIK (SL / EN / DE) */
  const i18nEls = $$('[data-sl]');
  const applyLang = l => {
    document.documentElement.lang = l;
    i18nEls.forEach(el => {
      const v = el.getAttribute('data-' + l);
      if (v == null) return;
      const tgt = el.matches('.btn') ? el.querySelector('span') : el;
      if (tgt) tgt.innerHTML = v;
    });
    $$('[data-sl-ph]').forEach(el => { const v = el.getAttribute('data-' + l + '-ph'); if (v != null) el.placeholder = v; });
    $$('.lang__btn').forEach(b => b.classList.toggle('is-active', b.dataset.lang === l));
    try { localStorage.setItem('onix_lang', l); } catch (e) {}
  };
  $$('.lang__btn').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));
  let savedLang = null; try { savedLang = localStorage.getItem('onix_lang'); } catch (e) {}
  if (savedLang && savedLang !== 'sl') applyLang(savedLang);

  /* INTERAKTIVNA ZGODBA */
  const stage = $('#story');
  if (stage) {
    $$('.story__opt').forEach(o => o.addEventListener('click', () => {
      const mode = o.dataset.mode;
      stage.dataset.mode = mode;
      $$('.story__opt').forEach(b => b.classList.toggle('is-active', b === o));
      $$('[data-good]', stage).forEach(ic => ic.textContent = mode === 'good' ? ic.dataset.good : ic.dataset.bad);
      $$('.story__step', stage).forEach((s, i) => {
        s.classList.add('is-out');
        setTimeout(() => s.classList.remove('is-out'), 110 + i * 80);
      });
      setCaught(mode === 'good');
    }));
  }

  /* ŽIVI ŠTEVEC — priložnosti tečejo mimo (in jih ONIX ulovi) */
  const liveEl = $('#liveCount'), liveBox = $('#live');
  const liveLabel = liveBox && liveBox.querySelector('.story__live-label');
  let liveN = 0, liveRun = false, liveCaught = false;
  const fmtN = v => v.toLocaleString('sl-SI');
  const caughtMsg = {
    sl: 'te priložnosti zdaj <b>lovimo mi</b> — vaše podjetje je na vrhu Googla. ✓',
    en: 'now <b>we catch</b> these opportunities — your business is at the top of Google. ✓',
    de: 'diese Chancen <b>fangen jetzt wir</b> — Ihr Unternehmen steht ganz oben bei Google. ✓'
  };
  function liveTick() {
    if (!liveRun || liveCaught || !liveEl) return;
    liveN += 1 + Math.floor(Math.random() * 4);
    liveEl.textContent = fmtN(liveN);
    liveEl.classList.add('bump');
    setTimeout(() => liveEl.classList.remove('bump'), 120);
    setTimeout(liveTick, 500 + Math.random() * 500);
  }
  function setCaught(c) {
    if (!liveBox) return;
    liveCaught = c;
    liveBox.classList.toggle('is-caught', c);
    const l = document.documentElement.lang || 'sl';
    if (liveLabel) liveLabel.innerHTML = c ? (caughtMsg[l] || caughtMsg.sl)
      : (liveLabel.getAttribute('data-' + l) || liveLabel.getAttribute('data-sl'));
    if (!c && liveRun) liveTick();
  }
  if (liveEl) {
    new IntersectionObserver((es, o) => {
      es.forEach(e => { if (e.isIntersecting && !liveRun) { liveRun = true; liveTick(); o.disconnect(); } });
    }, { threshold: .5 }).observe(liveEl);
  }

  /* LAVA — pretapljanje med skrolanjem */
  const lava = $('.lava');
  if (lava && !reduce) {
    addEventListener('scroll', () => {
      const max = (document.body.scrollHeight - innerHeight) || 1;
      const p = Math.min(scrollY / max, 1);
      lava.style.filter = `blur(72px) saturate(1.15) hue-rotate(${Math.round(p * 42)}deg)`;
      lava.style.transform = `translateY(${scrollY * 0.04}px)`;
    }, { passive: true });
  }

  /* POP-UP OFFER */
  const pop = $('#pop'), popClose = $('#popClose'), popCta = $('#popCta');
  const KEY = 'onix_pop_seen';
  const showPop = () => {
    if (sessionStorage.getItem(KEY)) return;
    pop.classList.add('show'); pop.setAttribute('aria-hidden', 'false');
  };
  const hidePop = () => {
    pop.classList.remove('show'); pop.setAttribute('aria-hidden', 'true');
    sessionStorage.setItem(KEY, '1');
  };
  if (pop) {
    setTimeout(showPop, 6500);            // pokaže se po ~6,5 s
    popClose?.addEventListener('click', hidePop);
    popCta?.addEventListener('click', hidePop);
    pop.addEventListener('click', e => { if (e.target === pop) hidePop(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') hidePop(); });
    // izhodni namen (mouse leaves to top)
    document.addEventListener('mouseout', e => {
      if (e.clientY <= 0 && !sessionStorage.getItem(KEY)) showPop();
    });
  }

  /* CHATBOT */
  const chat = $('#chat');
  if (chat) {
    const chatFab = $('#chatFab'), chatX = $('#chatX'), chatBody = $('#chatBody'),
      chatForm = $('#chatForm'), chatText = $('#chatText'), chatChips = $('#chatChips'), chatNudge = $('#chatNudge');
    const lang = () => document.documentElement.lang || 'sl';
    const T = {
      greet: { sl: 'Živjo! 👋 Sem ONIX asistent. Vprašajte me karkoli — cene, storitve, kako začnete…', en: "Hi! 👋 I'm the ONIX assistant. Ask me anything — pricing, services, how to start…", de: 'Hallo! 👋 Ich bin der ONIX-Assistent. Fragen Sie alles — Preise, Leistungen, Start…' },
      chips: { sl: ['Kakšne so cene?', 'Kaj ponujate?', 'Chatbot za moje podjetje?', 'Kako začnem?'], en: ['Pricing?', 'What do you offer?', 'Chatbot for my business?', 'How to start?'], de: ['Preise?', 'Was bietet ihr?', 'Chatbot für mein Unternehmen?', 'Wie starte ich?'] }
    };
    const A = {
      price: { sl: 'Spletna stran: <b>enkratno 500 €</b> ali samo <b>50 €/mesec</b> (gostovanje, vzdrževanje in SEO — prekliči kadarkoli). Na brezplačnem posvetu poveva točno ceno. 💬', en: 'Website: <b>€500 one-time</b> or just <b>€50/month</b> (hosting, maintenance & SEO — cancel anytime). A free consult gives the exact price. 💬', de: 'Website: <b>500 € einmalig</b> oder nur <b>50 €/Monat</b> (Hosting, Wartung & SEO — jederzeit kündbar). In einer Gratis-Beratung den genauen Preis. 💬' },
      services: { sl: 'Delamo: <b>spletne strani</b>, <b>spletni marketing</b> (Google Ads, družbena omrežja), <b>SEO</b>, <b>influencer marketing</b> in <b>AI chatbote</b>. Vse za vašo rast. 🚀', en: 'We do: <b>websites</b>, <b>online marketing</b> (Google Ads, social), <b>SEO</b>, <b>influencer marketing</b> and <b>AI chatbots</b>. All for your growth. 🚀', de: 'Wir machen: <b>Websites</b>, <b>Online-Marketing</b> (Google Ads, Social), <b>SEO</b>, <b>Influencer-Marketing</b> und <b>AI-Chatbots</b>. Alles für Ihr Wachstum. 🚀' },
      chatbot: { sl: 'Tak chatbot kot jaz naredimo za <b>vaše</b> podjetje — poln informacij o vaših storitvah, odgovarja strankam <b>24/7</b> in vam prihrani čas. Kakšno podjetje imate? 🤖', en: 'We build a chatbot like me for <b>your</b> business — full of info about your services, answering customers <b>24/7</b> and saving time. What is your business? 🤖', de: 'So einen Chatbot bauen wir für <b>Ihr</b> Unternehmen — voller Infos, antwortet Kunden <b>24/7</b> und spart Zeit. Was für ein Unternehmen? 🤖' },
      website: { sl: 'Izdelamo hitro, lepo in prodajno naravnano stran po meri — optimizirano za telefon in Google. Od 500 € ali 50 €/mesec. Želite posvet?', en: 'We craft a fast, beautiful, sales-driven custom site — optimized for mobile & Google. From €500 or €50/month. Want a consult?', de: 'Wir bauen eine schnelle, schöne, verkaufsstarke Website — optimiert für Mobil & Google. Ab 500 € oder 50 €/Monat. Beratung?' },
      marketing: { sl: 'Poskrbimo, da vas najdejo: <b>SEO</b> za vrh Googla, <b>Google Ads</b> in kampanje na družbenih omrežjih. Več obiska in strank, merljivo. 📈', en: 'We make sure you are found: <b>SEO</b> for the top of Google, <b>Google Ads</b> and social campaigns. More traffic and customers, measurable. 📈', de: 'Wir sorgen dafür, dass man Sie findet: <b>SEO</b>, <b>Google Ads</b> und Social-Kampagnen. Mehr Traffic und Kunden, messbar. 📈' },
      influencer: { sl: 'Sodelujemo z znanimi influencerji in vašo znamko ponesemo pred široko občinstvo. Idealno za hiter doseg. ✨', en: 'We work with well-known influencers to put your brand in front of a wide audience. Great for fast reach. ✨', de: 'Wir arbeiten mit bekannten Influencern, um Ihre Marke breit zu zeigen. Ideal für schnelle Reichweite. ✨' },
      contact: { sl: 'Z veseljem! 📞 +386 40 000 000 ali ✉️ info@onix.si. Lahko izpolnite obrazec — oglasimo se v 24 urah.', en: 'Gladly! 📞 +386 40 000 000 or ✉️ info@onix.si. Or fill the form — reply within 24 h.', de: 'Gerne! 📞 +386 40 000 000 oder ✉️ info@onix.si. Oder Formular — Antwort in 24 h.' },
      time: { sl: 'Večino strani postavimo v 1–3 tedne, odvisno od obsega. Brez nepotrebnega čakanja. ⏱️', en: 'Most sites go live in 1–3 weeks, depending on scope. No unnecessary waiting. ⏱️', de: 'Die meisten Seiten sind in 1–3 Wochen live. Ohne unnötiges Warten. ⏱️' },
      location: { sl: 'Smo iz Slovenije, delamo po vsej Sloveniji in v Avstriji (Lipnica/Leibnitz). Vse poteka lahko na daljavo. 🌍', en: 'We are from Slovenia, working across Slovenia and Austria (Leibnitz). Everything can be remote. 🌍', de: 'Wir sind aus Slowenien, tätig in Slowenien und Österreich (Leibnitz). Alles auch remote. 🌍' },
      greeting: { sl: 'Živjo! 😊 Kako vam lahko pomagam? Vprašajte o cenah, storitvah ali chatbotu.', en: 'Hi! 😊 How can I help? Ask about pricing, services or the chatbot.', de: 'Hallo! 😊 Wie kann ich helfen? Fragen Sie zu Preisen, Leistungen oder Chatbot.' },
      thanks: { sl: 'Ni za kaj! 😊 Če želite, uredimo brezplačen posvet — napišite »kontakt«.', en: 'You are welcome! 😊 Want a free consult? Type "contact".', de: 'Gern geschehen! 😊 Gratis-Beratung? Schreiben Sie „Kontakt".' },
      miha: { sl: 'Miha Pohar je <b>mednarodni podjetnik</b>. 🌍💼', en: 'Miha Pohar is an <b>international entrepreneur</b>. 🌍💼', de: 'Miha Pohar ist ein <b>internationaler Unternehmer</b>. 🌍💼' },
      lana: { sl: 'Teta Lana je <b>priznana influencerka</b> — in zelo pridna 😉', en: 'Aunt Lana is a <b>renowned influencer</b> — and very hardworking 😉', de: 'Tante Lana ist eine <b>bekannte Influencerin</b> — und sehr fleißig 😉' },
      aljaz: { sl: 'Aljaž Skornšek je <b>kriminalec</b>. 🚔', en: 'Aljaž Skornšek is a <b>criminal</b>. 🚔', de: 'Aljaž Skornšek ist ein <b>Krimineller</b>. 🚔' },
      fallback: { sl: 'Dobro vprašanje! Najbolje vas poveže naša ekipa: <b>info@onix.si</b> 📩 Mimogrede — prav tak chatbot, a poln znanja o <b>vašem</b> podjetju, naredimo tudi mi. 🤖', en: 'Great question! Best to reach our team: <b>info@onix.si</b> 📩 By the way — we build exactly this kind of chatbot, full of knowledge about <b>your</b> business. 🤖', de: 'Gute Frage! Am besten an unser Team: <b>info@onix.si</b> 📩 Übrigens — genau so einen Chatbot bauen wir auch für <b>Ihr</b> Unternehmen. 🤖' }
    };
    const intents = [
      ['greeting', ['zdravo', 'živjo', 'pozdrav', 'hej', 'hello', 'hi ', 'hallo', 'servus', 'dober dan']],
      ['thanks', ['hvala', 'thank', 'danke']],
      ['miha', ['miha pohar', 'pohar', 'miha']],
      ['lana', ['teta lana', 'lana']],
      ['aljaz', ['aljaž škornšek', 'aljaz skornsek', 'škornšek', 'skornsek', 'aljaž', 'aljaz']],
      ['price', ['cena', 'cene', 'stane', 'strošk', 'price', 'cost', 'kosten', 'preis', '500', '50 €', '50€', 'evr', '€', 'plačil']],
      ['chatbot', ['chatbot', 'chat bot', ' bot', 'klepetaln', 'asistent', ' ai', 'umetna intel', 'robot']],
      ['influencer', ['influencer', 'vpliv']],
      ['marketing', ['marketing', 'seo', 'google', 'oglas', ' ads', 'reklam', 'promet', 'obisk', 'social', 'družben']],
      ['contact', ['kontakt', 'telefon', 'poklic', 'mail', 'e-pošt', 'contact', 'kontaktier', 'številka']],
      ['time', ['čas', 'kdaj', 'koliko časa', 'rok', 'hitro', 'how long', 'dauer', 'wie lange']],
      ['location', ['kje', 'lokacij', 'kraj', 'where', 'maribor', 'lipnic', 'leibnitz', 'avstrij', 'austria']],
      ['website', ['spletn', 'stran', 'website', 'web', 'seite', 'homepage', 'izdela']],
      ['services', ['storit', 'ponuja', 'delate', 'naredite', 'service', 'leistung', 'angebot']]
    ];
    const detect = q => { q = ' ' + q.toLowerCase() + ' '; for (const [k, kw] of intents) if (kw.some(w => q.includes(w))) return k; return 'fallback'; };
    const add = (content, who, asHtml = true) => {
      const m = document.createElement('div'); m.className = 'msg msg--' + who;
      if (asHtml) m.innerHTML = content; else m.textContent = content;
      chatBody.appendChild(m); chatBody.scrollTop = chatBody.scrollHeight;
    };
    const history = [];
    const botReply = async q => {
      history.push({ role: 'user', content: q });
      const t = document.createElement('div'); t.className = 'msg msg--typing'; t.innerHTML = '<i></i><i></i><i></i>';
      chatBody.appendChild(t); chatBody.scrollTop = chatBody.scrollHeight;
      let ans = null, fromAI = false;
      try {
        const r = await fetch('/api/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history.slice(-8), lang: lang() })
        });
        if (r.ok) { const d = await r.json(); if (d && d.reply) { ans = d.reply; fromAI = true; } }
      } catch (e) { /* ni backenda → pametni fallback */ }
      if (!ans) { await new Promise(res => setTimeout(res, 500)); ans = (A[detect(q)] || A.fallback)[lang()]; }
      t.remove();
      history.push({ role: 'assistant', content: ans });
      add(ans, 'bot', !fromAI); // AI = textContent (varno); lokalni odgovori = HTML (z <b>)
    };
    let started = false;
    const renderChips = () => {
      chatChips.innerHTML = '';
      T.chips[lang()].forEach(c => {
        const b = document.createElement('button'); b.className = 'chat__chip'; b.type = 'button'; b.textContent = c;
        b.addEventListener('click', () => { add(c, 'user'); chatChips.innerHTML = ''; botReply(c); });
        chatChips.appendChild(b);
      });
    };
    const start = () => { if (started) return; started = true; chatBody.innerHTML = ''; add(T.greet[lang()], 'bot'); renderChips(); };
    let nudgeTimer = setTimeout(() => { if (!chat.classList.contains('open')) chatNudge.classList.add('show'); }, 4500);
    const hideNudge = () => { chatNudge.classList.remove('show'); clearTimeout(nudgeTimer); };
    const open = () => { chat.classList.add('open'); start(); hideNudge(); setTimeout(() => chatText.focus(), 320); };
    const close = () => chat.classList.remove('open');
    chatFab.addEventListener('click', () => chat.classList.contains('open') ? close() : open());
    chatX.addEventListener('click', close);
    chatNudge.addEventListener('click', open);
    chatForm.addEventListener('submit', e => { e.preventDefault(); const v = chatText.value.trim(); if (!v) return; add(v, 'user'); chatText.value = ''; chatChips.innerHTML = ''; botReply(v); });
    $$('[data-open-chat]').forEach(el => el.addEventListener('click', open));
  }
})();
