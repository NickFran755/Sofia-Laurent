/* ============================================================
   CONTACT.JS — Logique du formulaire de contact
   ============================================================
   Ce fichier gère le formulaire de contact :
   1. Validation côté client (nom requis, email valide)
   2. Envoi SIMULTANÉ vers deux destinations :
      a) Supabase (table "leads") — stockage en base de données
      b) n8n Webhook — automatisation (emails, notifications…)
   3. Affichage du message de succès ou d'erreur
   4. Remise à zéro du formulaire après envoi

   Priorité : Supabase est prioritaire. Si l'envoi n8n échoue,
   le formulaire fonctionne quand même normalement.

   Important : le formulaire utilise des labels flottants.
   Les inputs ont placeholder=" " (espace) pour que le CSS
   détecte quand un champ est vide ou rempli via la règle
   :not(:placeholder-shown). On doit conserver ce placeholder.

   Ce fichier nécessite que supabase.js soit chargé AVANT.
   ============================================================ */

/* --------------------------------------------------------
   URL du Webhook n8n.
   Ce webhook reçoit les données du formulaire pour
   déclencher des automatisations (ex : envoi d'email
   de confirmation, notification Slack, ajout CRM…).
   -------------------------------------------------------- */
var N8N_WEBHOOK_URL = 'https://nickfran.app.n8n.cloud/webhook/sofia-lead';

document.addEventListener('DOMContentLoaded', function () {

  /* --------------------------------------------------------
     Récupération des éléments du formulaire.
     On stocke les références pour ne pas les chercher
     à chaque interaction.
     -------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  var nomInput = document.getElementById('nom');
  var emailInput = document.getElementById('email');
  var messageInput = document.getElementById('message');
  var submitBtn = document.getElementById('submit-btn');
  var successMsg = document.getElementById('form-success');
  var errorMsg = document.getElementById('form-error');
  var nomError = document.getElementById('nom-error');
  var emailError = document.getElementById('email-error');

  /* --------------------------------------------------------
     Validation d'email — regex classique.
     Vérifie le format basique : texte@texte.texte
     -------------------------------------------------------- */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* --------------------------------------------------------
     Gestion visuelle des erreurs sur les champs.
     Ajoute/retire les classes CSS pour la bordure rouge
     et le message d'erreur.
     -------------------------------------------------------- */
  function showFieldError(input, errorEl) {
    input.classList.add('is-error');
    errorEl.classList.add('is-visible');
  }

  function clearFieldError(input, errorEl) {
    input.classList.remove('is-error');
    errorEl.classList.remove('is-visible');
  }

  function hideAllMessages() {
    successMsg.classList.remove('is-visible');
    errorMsg.classList.remove('is-visible');
  }

  /* --------------------------------------------------------
     Validation en temps réel — quand l'utilisatrice
     quitte un champ (blur), on vérifie immédiatement.
     Quand elle tape (input), on efface l'erreur.
     -------------------------------------------------------- */
  nomInput.addEventListener('blur', function () {
    if (nomInput.value.trim() === '') {
      showFieldError(nomInput, nomError);
    } else {
      clearFieldError(nomInput, nomError);
    }
  });

  emailInput.addEventListener('blur', function () {
    if (!isValidEmail(emailInput.value.trim())) {
      showFieldError(emailInput, emailError);
    } else {
      clearFieldError(emailInput, emailError);
    }
  });

  nomInput.addEventListener('input', function () {
    clearFieldError(nomInput, nomError);
  });

  emailInput.addEventListener('input', function () {
    clearFieldError(emailInput, emailError);
  });

  /* --------------------------------------------------------
     Envoi du formulaire vers Supabase.
     1. On empêche le rechargement de la page
     2. On valide les champs
     3. On envoie via le client Supabase (supabase.js)
     4. On affiche le résultat
     -------------------------------------------------------- */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAllMessages();

    /* --- Validation --- */
    var isValid = true;
    var nom = nomInput.value.trim();
    var email = emailInput.value.trim();
    var message = messageInput.value.trim();

    if (nom === '') {
      showFieldError(nomInput, nomError);
      isValid = false;
    }
    if (!isValidEmail(email)) {
      showFieldError(emailInput, emailError);
      isValid = false;
    }
    if (!isValid) return;

    /* --- Envoi --- */
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';

    try {
      /* Données envoyées à Supabase (colonnes de la table "leads") */
      var leadData = {
        nom: nom,
        email: email,
        message: message || null
      };

      /* --------------------------------------------------------
         ENVOI SIMULTANÉ : Supabase + n8n
         On lance les deux requêtes en parallèle avec
         Promise.allSettled(). Contrairement à Promise.all(),
         allSettled attend que TOUTES les promesses se terminent
         même si l'une échoue — parfait pour notre cas où
         Supabase est prioritaire et n8n est secondaire.
         -------------------------------------------------------- */

      /* Données envoyées au webhook n8n — inclut la date/heure */
      var n8nData = {
        nom: nom,
        email: email,
        message: message || '',
        date: new Date().toISOString()
      };

      /* On prépare les deux requêtes en parallèle */
      var supabasePromise = supabaseClient.insert('leads', leadData);

      var n8nPromise = fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nData)
      });

      /* On attend que les deux se terminent (succès ou échec) */
      var results = await Promise.allSettled([supabasePromise, n8nPromise]);

      /* --------------------------------------------------------
         Résultat de l'envoi Supabase (index 0)
         C'est lui qui détermine si on affiche succès ou erreur.
         -------------------------------------------------------- */
      var supabaseResult = results[0];

      if (supabaseResult.status === 'fulfilled' && supabaseResult.value.ok) {
        /* Supabase a bien reçu les données → succès */
        successMsg.classList.add('is-visible');
        /* Reset du formulaire — on remet placeholder=" " (espace)
           pour que les labels flottants reviennent en position basse */
        form.reset();
        clearFieldError(nomInput, nomError);
        clearFieldError(emailInput, emailError);
      } else {
        /* Supabase a échoué → on affiche l'erreur */
        console.error('Erreur Supabase :', supabaseResult);
        errorMsg.classList.add('is-visible');
      }

      /* --------------------------------------------------------
         Résultat de l'envoi n8n (index 1)
         Purement informatif — un échec n8n n'empêche pas
         le formulaire de fonctionner. On log dans la console.
         -------------------------------------------------------- */
      var n8nResult = results[1];

      if (n8nResult.status === 'fulfilled' && n8nResult.value.ok) {
        console.log('Webhook n8n : envoi réussi', n8nData);
      } else {
        /* L'échec n8n est silencieux pour l'utilisatrice,
           on log juste dans la console pour le debug */
        console.warn('Webhook n8n : échec (non bloquant)', n8nResult);
      }

    } catch (error) {
      /* Erreur réseau globale (pas d'internet, etc.) */
      console.error('Erreur réseau :', error);
      errorMsg.classList.add('is-visible');
    }

    /* --- Restauration du bouton --- */
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-lucide="send"></i>&nbsp;&nbsp;Envoyer mon message';
    if (window.lucide) lucide.createIcons();
  });
});
