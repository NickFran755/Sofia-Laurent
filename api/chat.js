/* ============================================================
   api/chat.js — Vercel Serverless Function
   ============================================================
   Reçoit les messages du widget chatbot et appelle OpenAI
   GPT-3.5-turbo avec le system prompt de Sofia Laurent.
   La clé API est dans la variable d'environnement OPENAI_API_KEY
   configurée dans le dashboard Vercel (jamais côté client).
   ============================================================ */

/* System prompt — personnalité de l'assistante IA */
var SYSTEM_PROMPT = [
  'Tu es l\'assistante virtuelle de Sofia Laurent, coach en développement personnel féminin.',
  'Tu réponds de façon chaleureuse, bienveillante et professionnelle.',
  'Tu parles uniquement en français.',
  'Tu connais parfaitement les services et tarifs de Sofia :',
  '- Séance découverte : Gratuit (30 min)',
  '- Coaching individuel : 120€ / séance (1h)',
  '- Pack 5 séances : 550€',
  '- Programme groupe : 297€ / mois (4 séances/mois)',
  '- Accompagnement 3 mois : 990€ tout compris',
  'Pour réserver : cliquer sur le bouton "Réserver un appel" sur le site.',
  'Si tu ne connais pas la réponse, invite poliment à contacter Sofia directement.',
  'Reste concise (2-3 phrases maximum par réponse).'
].join(' ');

module.exports = async function handler(req, res) {

  /* --- CORS headers pour le frontend --- */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  /* Preflight OPTIONS */
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  /* Seul POST est autorisé */
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  /* Vérifier que la clé OpenAI est configurée */
  var apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY manquante dans les variables d\'environnement Vercel.');
    return res.status(500).json({ error: 'Configuration serveur manquante.' });
  }

  /* Extraire le message du visiteur */
  var body = req.body || {};
  var userMessage = body.message;

  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
    return res.status(400).json({ error: 'Le champ "message" est requis.' });
  }

  /* Limiter la longueur du message (sécurité) */
  if (userMessage.length > 1000) {
    return res.status(400).json({ error: 'Message trop long (1000 caractères max).' });
  }

  try {
    /* Appel à l'API OpenAI */
    var response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage.trim() }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    /* Vérifier la réponse d'OpenAI */
    if (!response.ok) {
      var errorData = await response.json().catch(function() { return {}; });
      console.error('Erreur OpenAI:', response.status, errorData);
      return res.status(502).json({ error: 'Erreur du service IA. Réessayez dans quelques instants.' });
    }

    var data = await response.json();

    /* Extraire la réponse de l'assistant */
    var reply = data.choices
      && data.choices[0]
      && data.choices[0].message
      && data.choices[0].message.content;

    if (!reply) {
      return res.status(502).json({ error: 'Réponse vide du service IA.' });
    }

    /* Retourner la réponse au frontend */
    return res.status(200).json({ reply: reply.trim() });

  } catch (err) {
    console.error('Erreur serveur chatbot:', err);
    return res.status(500).json({ error: 'Erreur interne. Réessayez plus tard.' });
  }
};
