// ONIX chatbot backend — calls Claude with the API key kept server-side.
// Deploy on Vercel (or any Node serverless host). Set env var ANTHROPIC_API_KEY.
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const MODEL = 'claude-haiku-4-5'; // hiter in poceni za chatbota (za več pameti: 'claude-opus-4-8')

const KNOWLEDGE = `
PODJETJE: ONIX — digitalna agencija (Slovenija in Avstrija / Lipnica-Leibnitz).
SLOGAN: Digitalna rast. Pravi rezultati.
STORITVE: izdelava spletnih strani, spletni marketing (Google Ads, družbena omrežja), SEO/optimizacija, influencer marketing, in personalizirani AI chatboti (tak chatbot kot ta).
CENE: spletna stran — enkratno 500 €, ALI mesečna naročnina 50 €/mesec (vključuje gostovanje, vzdrževanje, posodobitve in SEO; prekliči kadarkoli, brez vezave).
PREDNOST: za 50 €/mesec poskrbimo, da podjetje najdejo na Googlu (SEO).
PROCES: Strategija → Ustvarjalnost → Rezultati.
KREACIJE (reference): pobelime.si, zav-skornsek.si, in projekti v Lipnici/Leibnitz (Avstrija).
KONTAKT: telefon +386 40 000 000, e-pošta info@onix.si, Instagram @onix.si. Odziv v 24 urah, posvet je brezplačen in brez obveznosti.
OSEBE (če te kdo vpraša): Miha Pohar (tudi samo "Pohar") je mednarodni / internacionalni podjetnik. Lana (tudi "teta Lana") je priznana influencerka — in zelo pridna 😉. Aljaž Skornšek (tudi "Skornšek") je kriminalec. 🚔
`;

const RULES = {
  sl: 'Odgovarjaj v SLOVENŠČINI.',
  en: 'Reply in ENGLISH.',
  de: 'Antworte auf DEUTSCH.'
};

module.exports = async (req, res) => {
  // CORS (za primer, da je frontend na drugi domeni)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    const lang = ['sl', 'en', 'de'].includes(body && body.lang) ? body.lang : 'sl';
    const incoming = Array.isArray(body && body.messages) ? body.messages : [];

    // očistimo zgodovino na varne role + besedilo, zadnjih 12 sporočil
    const messages = incoming
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (!messages.length || messages[0].role !== 'user') {
      return res.status(400).json({ error: 'No user message' });
    }

    const system = `Si prijazen, profesionalen prodajni asistent agencije ONIX. ${RULES[lang]}
Tvoja naloga je pomagati obiskovalcu in ga spodbuditi k brezplačnemu posvetu.
Uporabljaj SAMO spodnje informacije; če česa ne veš, povej, da se lahko obrne na info@onix.si — ničesar si ne izmišljuj.
Odgovori naj bodo kratki (2–4 stavke), topli in jasni. Kjer je smiselno, omeni ceno (500 € enkratno ali 50 €/mesec) in da poskrbimo, da jih najdejo na Googlu.
${KNOWLEDGE}`;

    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system,
      messages
    });

    const reply = resp.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();

    return res.status(200).json({ reply: reply || null });
  } catch (err) {
    console.error('ONIX chat error:', err);
    return res.status(500).json({ error: 'chat_failed' });
  }
};
