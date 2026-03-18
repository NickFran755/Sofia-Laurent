/* ============================================================
   api/chat.js — Vercel Serverless Function
   ============================================================
   Reçoit les messages du widget chatbot et appelle OpenAI
   GPT-3.5-turbo avec le system prompt de Sofia Laurent.
   La clé API est dans la variable d'environnement OPENAI_API_KEY
   configurée dans le dashboard Vercel (jamais côté client).

   Utilise le module https natif Node.js (compatible toutes versions).
   ============================================================ */

var https = require('https');

/* System prompt — personnalité de l'assistante IA */
var SYSTEM_PROMPT = [
  'Tu es l\'assistante virtuelle de Sofia Laurent, coach en développement personnel féminin.',
  'Tu réponds de façon chaleureuse, bienveillante et professionnelle.',
  'Tu parles uniquement en français.',
  'Tu connais parfaitement les services et tarifs de Sofia :',
  '- Séance découverte : Gratuit (30 min)',
  '- Coaching individuel : 120\u20AC / séance (1h)',
  '- Pack 5 séances : 550\u20AC',
  '- Programme groupe : 297\u20AC / mois (4 séances/mois)',
  '- Accompagnement 3 mois : 990\u20AC tout compris',
  'Pour réserver : cliquer sur le bouton "Réserver un appel" sur le site.',
  'Si tu ne connais pas la réponse, invite poliment à contacter Sofia directement.',
  'Reste concise (2-3 phrases maximum par réponse).'
].join(' ');


/* Fonction utilitaire : appel HTTPS avec Promise */
function callOpenAI(apiKey, userMessage) {
  return new Promise(function (resolve, reject) {

    var postData = JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage.trim() }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    var options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    var req = https.request(options, function (response) {
      var chunks = [];

      response.on('data', function (chunk) {
        chunks.push(chunk);
      });

      response.on('end', function () {
        var body = Buffer.concat(chunks).toString();
        try {
          var data = JSON.parse(body);
          resolve({ status: response.statusCode, data: data });
        } catch (e) {
          reject(new Error('Impossible de parser la réponse OpenAI: ' + body.substring(0, 200)));
        }
      });
    });

    req.on('error', function (err) {
      reject(err);
    });

    /* Timeout de 9 secondes (Vercel max 10s) */
    req.setTimeout(9000, function () {
      req.destroy();
      reject(new Error('Timeout OpenAI (9s)'));
    });

    req.write(postData);
    req.end();
  });
}


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
    return res.status(500).json({ error: 'Configuration serveur manquante. Vérifiez OPENAI_API_KEY dans Vercel.' });
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
    /* Appel à l'API OpenAI via https natif */
    var result = await callOpenAI(apiKey, userMessage);

    /* Vérifier le statut HTTP d'OpenAI */
    if (result.status !== 200) {
      var errMsg = (result.data && result.data.error && result.data.error.message) || 'Erreur inconnue';
      console.error('Erreur OpenAI ' + result.status + ':', errMsg);
      return res.status(502).json({
        error: 'Erreur du service IA (' + result.status + '): ' + errMsg
      });
    }

    /* Extraire la réponse de l'assistant */
    var reply = result.data
      && result.data.choices
      && result.data.choices[0]
      && result.data.choices[0].message
      && result.data.choices[0].message.content;

    if (!reply) {
      console.error('Réponse vide OpenAI:', JSON.stringify(result.data));
      return res.status(502).json({ error: 'Réponse vide du service IA.' });
    }

    /* Retourner la réponse au frontend */
    return res.status(200).json({ reply: reply.trim() });

  } catch (err) {
    console.error('Erreur serveur chatbot:', err.message || err);
    return res.status(500).json({ error: 'Erreur interne: ' + (err.message || 'Réessayez plus tard.') });
  }
};
