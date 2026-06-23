# ONIX — pravi AI chatbot (Claude)

Stran sama je statična (deluje na GitHub Pages), a **pravi AI chatbot potrebuje strežnik**,
ker se API ključ NE sme dati v brskalnik. Spodaj je 5-minutna postavitev na Vercel (brezplačno).

## Postavitev na Vercel
1. Naredi račun na https://vercel.com (poveži z GitHub).
2. Uvozi ta repozitorij (ali povleci mapo na Vercel).
3. V projektu: **Settings → Environment Variables** dodaj:
   - `ANTHROPIC_API_KEY` = tvoj ključ (dobiš ga na https://console.anthropic.com)
4. **Deploy**. Vercel samodejno postreže `index.html` in funkcijo `/api/chat`.
5. Odpri stran → chatbot zdaj odgovarja s pravim Claudom. Če `/api/chat` ni na voljo
   (npr. na GitHub Pages), chatbot samodejno pade nazaj na pametne vnaprej pripravljene odgovore.

## Lokalni test
```bash
npm install
npm i -g vercel
vercel dev   # odpre lokalni strežnik z /api/chat
```

## Opombe
- Model je `claude-opus-4-8` (datoteka `api/chat.js`). Za nižjo ceno/hitrost ga zamenjaj z
  `claude-haiku-4-5`.
- Ključ je viden samo na strežniku (Vercel env var), nikoli v brskalniku — varno.
- Vsa "znanja o podjetju" so v `api/chat.js` (spremenljivka KNOWLEDGE) — uredi po želji.
