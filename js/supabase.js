/* ============================================================
   SUPABASE.JS — Initialisation du client Supabase
   ============================================================
   Ce fichier configure la connexion à Supabase, notre base de données.

   Comment ça marche ?
   → Supabase fournit une API REST automatique. On envoie les données
     du formulaire directement via fetch() (requête HTTP).
   → La clé "anon" (anonyme) est PUBLIQUE — c'est normal et sécurisé
     car Supabase protège les données avec ses règles RLS
     (Row Level Security) côté serveur.

   Ce fichier crée un objet global `supabaseClient` utilisé
   par form.js pour envoyer les leads.
   ============================================================ */

/* --------------------------------------------------------
   CONFIGURATION
   URL du projet Supabase et clé anonyme publique.
   Ces valeurs viennent du dashboard Supabase du projet.
   -------------------------------------------------------- */

const SUPABASE_URL = 'https://axdsyckjfyizmayeeqbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZHN5Y2tqZnlpem1heWVlcWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDgzMzksImV4cCI6MjA4ODkyNDMzOX0.zZiICAMVSq9DJj-MRsYYN4EDY5Sh0eyxBUg9Ei1BiIw';

/* --------------------------------------------------------
   CLIENT SUPABASE
   Objet qui contient l'URL et les en-têtes nécessaires
   pour communiquer avec l'API REST de Supabase.

   Pourquoi un objet et pas juste des variables ?
   → Ça regroupe tout au même endroit et c'est plus propre
     quand on l'utilise dans form.js.
   -------------------------------------------------------- */

const supabaseClient = {
  url: SUPABASE_URL,

  /* Les en-têtes (headers) sont envoyés avec chaque requête HTTP.
     - apikey : identifie notre projet Supabase
     - Authorization : prouve qu'on a le droit d'accéder aux données
     - Content-Type : indique qu'on envoie du JSON
     - Prefer : demande à Supabase de renvoyer les données insérées */
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  },

  /* --------------------------------------------------------
     MÉTHODE INSERT
     Insère une nouvelle ligne dans une table Supabase.

     Paramètres :
     - table : nom de la table (ex : "leads")
     - data  : objet avec les données à insérer

     Retourne : la réponse HTTP (on vérifie response.ok pour savoir
     si ça a marché).
     -------------------------------------------------------- */
  async insert(table, data) {
    const response = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    return response;
  }
};
