/* ============================================================
   MAIN.JS — Animations premium, parallaxe, compteurs, header
   ============================================================
   Ce fichier gère toute l'interactivité visuelle du site :

   1. ANIMATIONS AU SCROLL (Intersection Observer)
      Tous les éléments avec la classe "reveal" apparaissent
      en fondu + glissement quand ils entrent dans le viewport.

   2. PARALLAXE HERO
      L'image de fond du Hero se déplace plus lentement que
      le scroll, créant un effet de profondeur élégant.

   3. HEADER GLASSMORPHISM
      Le header passe de transparent à verre dépoli au scroll.

   4. COMPTEURS ANIMÉS
      Les chiffres clés (200+, 95%, 5 ans) s'incrémentent
      de 0 à leur valeur finale quand la section est visible.

   5. MENU MOBILE (HAMBURGER)
      Ouverture/fermeture du menu de navigation sur mobile.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ============================================================
     1. ANIMATIONS AU SCROLL — Intersection Observer
     ============================================================
     On observe tous les éléments ".reveal". Quand un élément
     entre dans le viewport (15% visible), on ajoute la classe
     "is-visible" qui déclenche l'animation CSS.

     Pourquoi Intersection Observer ?
     → Plus performant que d'écouter l'événement scroll.
       Le navigateur optimise les vérifications en interne.
     ============================================================ */

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          /* L'élément est visible → on déclenche l'animation */
          entry.target.classList.add('is-visible');
          /* On arrête de l'observer (animation unique) */
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  /* On lance l'observation sur tous les éléments .reveal */
  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });


  /* ============================================================
     2. PARALLAXE HERO
     ============================================================
     L'image de fond du Hero (hero__bg) se déplace verticalement
     à une vitesse réduite par rapport au scroll. Ça donne un
     effet de profondeur — l'image semble "flotter" derrière.

     Le facteur 0.3 signifie que l'image bouge à 30% de la
     vitesse du scroll. Plus le nombre est petit, plus l'effet
     est subtil.

     requestAnimationFrame synchronise le mouvement avec le
     rafraîchissement de l'écran pour une animation fluide.
     ============================================================ */

  var heroBg = document.getElementById('hero-bg');
  var heroSection = document.querySelector('.hero');
  var parallaxFactor = 0.3;

  /* On ne lance le parallaxe que sur les écrans assez larges
     (pas sur mobile, pour préserver les performances) */
  function updateParallax() {
    if (window.innerWidth < 768 || !heroBg) return;

    var scrollY = window.scrollY;
    var heroHeight = heroSection.offsetHeight;

    /* On n'applique l'effet que tant qu'on est dans le Hero */
    if (scrollY <= heroHeight) {
      var offset = scrollY * parallaxFactor;
      heroBg.style.transform = 'translateY(' + offset + 'px)';
    }
  }

  window.addEventListener('scroll', function () {
    requestAnimationFrame(updateParallax);
  });


  /* ============================================================
     3. HEADER GLASSMORPHISM
     ============================================================
     Au-delà de 50px de scroll, le header reçoit la classe
     "scrolled" qui active le fond semi-transparent + flou
     (backdrop-filter: blur) défini dans le CSS.
     ============================================================ */

  var header = document.getElementById('header');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });


  /* ============================================================
     4. COMPTEURS ANIMÉS
     ============================================================
     Les éléments .stat__number ont des attributs data-target
     (valeur finale) et data-suffix (texte après le nombre).
     Quand la section entre dans le viewport, les nombres
     s'incrémentent progressivement de 0 à la valeur cible.

     L'animation dure 2 secondes et utilise une courbe
     "ease-out" pour ralentir vers la fin (plus naturel).
     ============================================================ */

  var statsObserved = false;

  var statsObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !statsObserved) {
          statsObserved = true;
          animateCounters();
        }
      });
    },
    { threshold: 0.3 }
  );

  var statsSection = document.getElementById('stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  /* Fonction qui anime tous les compteurs en parallèle */
  function animateCounters() {
    var counters = document.querySelectorAll('.stat__number');
    var duration = 2000; /* Durée totale en millisecondes */

    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-target'));
      var suffix = counter.getAttribute('data-suffix') || '';
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;

        /* Progression de 0 à 1 avec courbe ease-out.
           La formule 1 - (1-t)^3 ralentit vers la fin. */
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);

        var current = Math.floor(eased * target);
        counter.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          /* Animation terminée : on affiche la valeur exacte
             et on ajoute un petit effet de rebond (pulse) */
          counter.textContent = target + suffix;
          counter.classList.add('counted');
        }
      }

      requestAnimationFrame(step);
    });
  }


  /* ============================================================
     5. MENU MOBILE — HAMBURGER
     ============================================================
     Sur mobile, le bouton burger ouvre/ferme le menu de
     navigation en plein écran. Cliquer sur un lien du menu
     le referme automatiquement.
     ============================================================ */

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  burger.addEventListener('click', function () {
    burger.classList.toggle('is-active');
    nav.classList.toggle('is-open');
    /* On bloque le scroll du body quand le menu est ouvert */
    document.body.style.overflow =
      nav.classList.contains('is-open') ? 'hidden' : '';
  });

  /* Ferme le menu quand on clique sur un lien */
  document.querySelectorAll('.header__nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      burger.classList.remove('is-active');
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

});
