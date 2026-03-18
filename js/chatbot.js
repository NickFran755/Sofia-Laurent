/* ============================================================
   js/chatbot.js — Widget Chat IA premium · Sofia Laurent
   ============================================================
   Widget flottant en bas à droite qui communique avec
   la Vercel Serverless Function api/chat.js.

   Fonctionnalités :
   - Bouton flottant avec gradient animé et badge notification
   - Fenêtre de chat avec particules dorées
   - Effet typewriter sur les réponses de Sofia
   - Typing indicator (3 points rebondissants)
   - Message d'accueil + boutons de suggestion
   - Responsive mobile (100% width sur < 480px)
   - prefers-reduced-motion respecté
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ============================================================
     1. URL de l'API chatbot
     ============================================================ */
  var API_URL = '/api/chat';

  /* Détection reduced motion */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Vitesse typewriter (ms par caractère) */
  var TYPEWRITER_SPEED = prefersReducedMotion ? 0 : 30;


  /* ============================================================
     2. CRÉATION DU DOM — Bouton flottant + Fenêtre
     ============================================================ */

  /* --- Bouton flottant --- */
  var toggleBtn = document.createElement('button');
  toggleBtn.className = 'chatbot-toggle';
  toggleBtn.setAttribute('aria-label', 'Ouvrir le chat');
  toggleBtn.innerHTML = '<i data-lucide="message-circle"></i><span class="chatbot-badge">1</span>';
  document.body.appendChild(toggleBtn);

  /* --- Fenêtre de chat --- */
  var chatWindow = document.createElement('div');
  chatWindow.className = 'chatbot-window is-hidden';

  chatWindow.innerHTML = [
    /* Header */
    '<div class="chatbot-header">',
    '  <div class="chatbot-avatar">SL</div>',
    '  <div class="chatbot-header-info">',
    '    <div class="chatbot-header-name">Sofia — Assistante IA &#10024;</div>',
    '    <div class="chatbot-header-status">',
    '      <span class="chatbot-status-dot"></span> En ligne maintenant',
    '    </div>',
    '  </div>',
    '  <button class="chatbot-close" aria-label="Fermer le chat">',
    '    <i data-lucide="x"></i>',
    '  </button>',
    '</div>',

    /* Zone messages avec canvas particules */
    '<div class="chatbot-messages" id="chatbot-messages">',
    '  <canvas class="chatbot-particles" id="chatbot-particles"></canvas>',
    '</div>',

    /* Input */
    '<div class="chatbot-input-area">',
    '  <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Votre message..." autocomplete="off">',
    '  <button class="chatbot-send" id="chatbot-send" aria-label="Envoyer">',
    '    <i data-lucide="send"></i>',
    '  </button>',
    '</div>'
  ].join('\n');

  document.body.appendChild(chatWindow);

  /* Recréer les icônes Lucide dans le widget */
  if (window.lucide) { lucide.createIcons(); }

  /* Références DOM */
  var messagesContainer = document.getElementById('chatbot-messages');
  var inputField = document.getElementById('chatbot-input');
  var sendBtn = document.getElementById('chatbot-send');
  var closeBtn = chatWindow.querySelector('.chatbot-close');
  var badge = toggleBtn.querySelector('.chatbot-badge');

  var isOpen = false;
  var isWaitingResponse = false;
  var welcomeSent = false;


  /* ============================================================
     3. BADGE NOTIFICATION — apparaît après 3 secondes
     ============================================================ */

  setTimeout(function () {
    if (!isOpen) { badge.classList.add('is-visible'); }
  }, 3000);


  /* ============================================================
     4. OUVERTURE / FERMETURE
     ============================================================ */

  toggleBtn.addEventListener('click', function () {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn.addEventListener('click', function () {
    closeChat();
  });

  function openChat() {
    isOpen = true;
    badge.classList.remove('is-visible');
    badge.classList.add('is-hidden');
    chatWindow.classList.remove('is-hidden', 'is-closing');
    /* Focus sur l'input */
    setTimeout(function () { inputField.focus(); }, 400);
    /* Message d'accueil la première fois */
    if (!welcomeSent) {
      welcomeSent = true;
      setTimeout(function () { showWelcomeMessage(); }, 800);
    }
    /* Lancer les particules */
    initParticles();
  }

  function closeChat() {
    chatWindow.classList.add('is-closing');
    setTimeout(function () {
      chatWindow.classList.add('is-hidden');
      chatWindow.classList.remove('is-closing');
      isOpen = false;
    }, 250);
  }


  /* ============================================================
     5. MESSAGE D'ACCUEIL + SUGGESTIONS
     ============================================================ */

  function showWelcomeMessage() {
    var welcomeText = 'Bonjour ! \u2728 Je suis l\'assistante de Sofia. Comment puis-je vous aider aujourd\'hui ?';
    addBotMessage(welcomeText, function () {
      /* Ajouter les boutons de suggestion après le typewriter */
      var suggestions = document.createElement('div');
      suggestions.className = 'chatbot-suggestions';

      var options = [
        { emoji: '\uD83D\uDCB0', text: 'Voir les tarifs' },
        { emoji: '\uD83D\uDCC5', text: 'R\u00e9server un appel' },
        { emoji: '\u2753', text: 'En savoir plus' }
      ];

      options.forEach(function (opt) {
        var btn = document.createElement('button');
        btn.className = 'chatbot-suggestion';
        btn.textContent = opt.emoji + ' ' + opt.text;
        btn.addEventListener('click', function () {
          /* Envoyer le texte du bouton comme message */
          sendMessage(opt.text);
          /* Masquer les suggestions */
          suggestions.remove();
        });
        suggestions.appendChild(btn);
      });

      messagesContainer.appendChild(suggestions);
      scrollToBottom();
    });
  }


  /* ============================================================
     6. ENVOI DE MESSAGE
     ============================================================ */

  /* Touche Entrée pour envoyer */
  inputField.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  sendBtn.addEventListener('click', function () {
    handleSend();
  });

  function handleSend() {
    var text = inputField.value.trim();
    if (!text || isWaitingResponse) return;
    sendMessage(text);
  }

  function sendMessage(text) {
    /* Afficher le message visiteur */
    addUserMessage(text);
    inputField.value = '';
    isWaitingResponse = true;
    sendBtn.disabled = true;

    /* Flash sur le bouton envoyer */
    sendBtn.classList.add('is-flash');
    setTimeout(function () { sendBtn.classList.remove('is-flash'); }, 300);

    /* Retirer les suggestions si elles existent */
    var suggestions = messagesContainer.querySelector('.chatbot-suggestions');
    if (suggestions) suggestions.remove();

    /* Afficher le typing indicator */
    var typing = showTypingIndicator();

    /* Appel API */
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      /* Retirer le typing indicator */
      if (typing && typing.parentNode) typing.remove();

      if (data.reply) {
        addBotMessage(data.reply);
      } else if (data.error) {
        console.warn('[Chatbot] Erreur API:', data.error);
        addBotMessage('D\u00e9sol\u00e9e, je rencontre un petit souci technique. N\'h\u00e9site pas \u00e0 contacter Sofia directement via le formulaire ci-dessous ! \uD83D\uDE4F');
      }
    })
    .catch(function (err) {
      console.error('[Chatbot] Erreur réseau:', err);
      if (typing && typing.parentNode) typing.remove();
      addBotMessage('Oups, impossible de me connecter pour le moment. Essaie de nouveau dans quelques instants. \uD83D\uDE0A');
    })
    .finally(function () {
      isWaitingResponse = false;
      sendBtn.disabled = false;
    });
  }


  /* ============================================================
     7. CRÉATION DES MESSAGES
     ============================================================ */

  function getTimestamp() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    return h + ':' + m;
  }

  /* Message visiteur (droite) */
  function addUserMessage(text) {
    var wrapper = document.createElement('div');
    wrapper.className = 'chatbot-msg chatbot-msg--user';

    var content = document.createElement('div');

    var bubble = document.createElement('div');
    bubble.className = 'chatbot-msg-bubble';
    bubble.textContent = text;

    var time = document.createElement('div');
    time.className = 'chatbot-msg-time';
    time.textContent = getTimestamp();

    content.appendChild(bubble);
    content.appendChild(time);
    wrapper.appendChild(content);
    messagesContainer.appendChild(wrapper);
    scrollToBottom();
  }

  /* Message Sofia (gauche) avec typewriter */
  function addBotMessage(text, onComplete) {
    var wrapper = document.createElement('div');
    wrapper.className = 'chatbot-msg chatbot-msg--bot';

    var avatar = document.createElement('div');
    avatar.className = 'chatbot-msg-avatar';
    avatar.textContent = 'SL';

    var content = document.createElement('div');

    var bubble = document.createElement('div');
    bubble.className = 'chatbot-msg-bubble';

    var time = document.createElement('div');
    time.className = 'chatbot-msg-time';
    time.textContent = getTimestamp();

    content.appendChild(bubble);
    content.appendChild(time);
    wrapper.appendChild(avatar);
    wrapper.appendChild(content);
    messagesContainer.appendChild(wrapper);
    scrollToBottom();

    /* Effet typewriter */
    if (TYPEWRITER_SPEED > 0) {
      var index = 0;
      bubble.textContent = '';
      var typeInterval = setInterval(function () {
        if (index < text.length) {
          bubble.textContent += text.charAt(index);
          index++;
          scrollToBottom();
        } else {
          clearInterval(typeInterval);
          if (onComplete) onComplete();
        }
      }, TYPEWRITER_SPEED);
    } else {
      /* Si reduced motion, pas de typewriter */
      bubble.textContent = text;
      if (onComplete) onComplete();
    }
  }


  /* ============================================================
     8. TYPING INDICATOR — 3 points rebondissants
     ============================================================ */

  function showTypingIndicator() {
    var wrapper = document.createElement('div');
    wrapper.className = 'chatbot-typing';

    var avatar = document.createElement('div');
    avatar.className = 'chatbot-typing-avatar';
    avatar.textContent = 'SL';

    var dots = document.createElement('div');
    dots.className = 'chatbot-typing-dots';
    dots.innerHTML = '<span class="chatbot-typing-dot"></span><span class="chatbot-typing-dot"></span><span class="chatbot-typing-dot"></span>';

    wrapper.appendChild(avatar);
    wrapper.appendChild(dots);
    messagesContainer.appendChild(wrapper);
    scrollToBottom();

    return wrapper;
  }


  /* ============================================================
     9. SCROLL AUTO EN BAS
     ============================================================ */

  function scrollToBottom() {
    setTimeout(function () {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
  }


  /* ============================================================
     10. PARTICULES DORÉES — Canvas dans la fenêtre chat
     ============================================================
     5-8 particules très subtiles qui flottent.
     Désactivé si prefers-reduced-motion.
     ============================================================ */

  var particlesActive = false;

  function initParticles() {
    if (particlesActive || prefersReducedMotion) return;
    particlesActive = true;

    var canvas = document.getElementById('chatbot-particles');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var numParticles = 6;

    function resize() {
      canvas.width = messagesContainer.offsetWidth;
      canvas.height = messagesContainer.offsetHeight;
    }
    resize();

    /* Créer les particules */
    for (var i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.2,
        dy: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.2 + 0.05
      });
    }

    function draw() {
      if (!isOpen) {
        requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201, 160, 132, ' + p.opacity + ')';
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      }
      requestAnimationFrame(draw);
    }
    draw();

    /* Recalculer la taille au resize */
    window.addEventListener('resize', resize);
  }

});
