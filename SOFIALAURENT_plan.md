# Sofia Laurent — Plan de projet

## 1. Présentation du projet

- **Nom** : Sofia Laurent
- **Concept** : Landing page pour une coach en développement personnel. Site vitrine one-page conçu pour présenter ses services, inspirer confiance et convertir les visiteuses en leads via un formulaire de contact.
- **Cible** : Femmes, 25-45 ans, en quête de transformation personnelle, d'alignement et de confiance en soi.
- **Slogan** : *"Révèle la femme que tu es vraiment"*

---

## 2. Stack technique

| Couche       | Technologie              | Rôle                                      |
| ------------ | ------------------------ | ----------------------------------------- |
| Front-end    | HTML / CSS / JS vanilla  | Interface utilisateur, animations, logique |
| Base données | Supabase (PostgreSQL)    | Stockage des leads (formulaire contact)    |
| Hébergement  | Vercel                   | Déploiement, CDN, HTTPS automatique       |

Aucun framework, aucun bundler. Fichiers servis directement.

### Identifiants Supabase

```
SUPABASE_URL=https://axdsyckjfyizmayeeqbk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZHN5Y2tqZnlpem1heWVlcWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDgzMzksImV4cCI6MjA4ODkyNDMzOX0.zZiICAMVSq9DJj-MRsYYN4EDY5Sh0eyxBUg9Ei1BiIw
```

---

## 3. Direction artistique

### 3.1 Palette de couleurs

| Token      | Hex       | Usage                              |
| ---------- | --------- | ---------------------------------- |
| `bg`       | `#FAF7F4` | Fond de page principal             |
| `surface`  | `#F2EDE8` | Cartes, sections alternées         |
| `primary`  | `#C9A084` | Boutons, liens, accents principaux |
| `accent`   | `#8B7355` | Hover, éléments secondaires        |
| `text`     | `#2C2420` | Texte courant                      |
| `muted`    | `#9E8E85` | Texte secondaire, placeholders     |
| `border`   | `#E8E0D8` | Bordures, séparateurs              |

### 3.2 Typographie

- **Titres** : Cormorant Garamond (Google Fonts) — serif élégante, féminine
- **Corps** : Raleway (Google Fonts) — sans-serif lisible et moderne

### 3.3 Composants

- **Border-radius cartes** : `16px`
- **Border-radius boutons** : `50px` (pill)
- **Ombres cartes** : `0 4px 24px rgba(44, 36, 32, 0.06)`

### 3.4 Animations

- Déclenchées au scroll via **Intersection Observer API** uniquement (pas de librairie externe)
- Effets : fade-in + léger translateY (20px → 0)
- Durée : 600ms, easing `ease-out`
- `threshold` : 0.15

### 3.5 Responsive

- Approche **mobile-first obligatoire**
- Breakpoints :
  - Mobile : < 768px (base)
  - Tablette : 768px – 1024px
  - Desktop : > 1024px

---

## 4. Schéma table Supabase — `leads`

```sql
CREATE TABLE leads (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom        TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

| Colonne      | Type          | Contrainte        | Description               |
| ------------ | ------------- | ----------------- | ------------------------- |
| `id`         | `UUID`        | PK, auto-généré   | Identifiant unique        |
| `nom`        | `TEXT`        | NOT NULL          | Nom complet de la lead    |
| `email`      | `TEXT`        | NOT NULL          | Adresse email             |
| `message`    | `TEXT`        | nullable          | Message libre (optionnel) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()`   | Date de soumission        |

---

## 5. Structure de la page

La page est composée des sections suivantes, dans cet ordre :

### 5.1 Header fixe
- Logo texte "Sofia Laurent" à gauche
- Navigation : À propos · Services · Témoignages · Contact
- Bouton CTA "Réserver un appel" à droite
- Fond transparent → fond `bg` au scroll (avec transition)

### 5.2 Hero
- Titre principal : *"Révèle la femme que tu es vraiment"*
- Sous-titre : courte phrase d'accroche (1-2 lignes)
- Bouton CTA principal vers le formulaire contact
- Image ou illustration d'ambiance (pleine largeur ou demi-page)

### 5.3 À propos
- Photo de Sofia Laurent
- Texte de présentation (parcours, valeurs, approche)
- Ton chaleureux et authentique

### 5.4 Services (3 cartes)
- **Carte 1** : Coaching individuel — séances 1:1 personnalisées
- **Carte 2** : Programme groupe — ateliers collectifs de transformation
- **Carte 3** : Retraite bien-être — immersion sur plusieurs jours
- Chaque carte : icône/illustration, titre, description courte, bouton "En savoir plus"

### 5.5 Témoignages (3 avis)
- **Avis 1** : Prénom, photo, citation, note étoiles
- **Avis 2** : Prénom, photo, citation, note étoiles
- **Avis 3** : Prénom, photo, citation, note étoiles
- Design en cartes ou en carrousel simple

### 5.6 Comment ça marche (3 étapes)
- **Étape 1** : Prise de contact — remplir le formulaire
- **Étape 2** : Appel découverte — échange gratuit de 30 min
- **Étape 3** : Démarrage — début de l'accompagnement personnalisé
- Numérotation visuelle (1 · 2 · 3), icônes, connecteurs visuels

### 5.7 Formulaire de contact
- Champs : Nom, Email, Message (optionnel)
- Bouton "Envoyer" (style pill, couleur `primary`)
- Envoi vers Supabase table `leads`
- Feedback visuel : succès / erreur
- Validation côté client avant envoi

### 5.8 Footer
- Logo texte "Sofia Laurent"
- Liens rapides : Mentions légales · Politique de confidentialité
- Réseaux sociaux (icônes Instagram, LinkedIn)
- Copyright © 2026 Sofia Laurent

---

## 6. Architecture des fichiers

```
Sofia Laurent/
├── index.html              # Page unique (one-page)
├── css/
│   └── style.css           # Feuille de styles complète
├── js/
│   ├── main.js             # Animations scroll, header, navigation
│   └── contact.js          # Logique formulaire + envoi Supabase
├── assets/
│   └── images/             # Photos, illustrations, icônes
├── SOFIALAURENT_plan.md    # Ce fichier (référence projet)
├── .gitignore
└── vercel.json             # Configuration déploiement (optionnel)
```

---

## 7. Ordre de développement recommandé

| Phase | Tâche                                                  |
| ----- | ------------------------------------------------------ |
| 1     | Structure HTML complète (toutes les sections)          |
| 2     | Variables CSS, reset, typographie, layout mobile-first |
| 3     | Style du header fixe + comportement scroll             |
| 4     | Section Hero (titre, CTA, image)                       |
| 5     | Section À propos                                       |
| 6     | Section Services (3 cartes)                            |
| 7     | Section Témoignages (3 avis)                           |
| 8     | Section Comment ça marche (3 étapes)                   |
| 9     | Formulaire de contact (HTML + styles)                  |
| 10    | Footer                                                 |
| 11    | Responsive tablette + desktop                          |
| 12    | Animations scroll (Intersection Observer)              |
| 13    | Connexion Supabase + logique formulaire (contact.js)   |
| 14    | Tests cross-browser + optimisation performances        |
| 15    | Déploiement Vercel                                     |

---

## 8. Prompts utiles pour les prochaines sessions Claude Code

### Phase 1 — HTML + CSS de base
```
Crée le fichier index.html avec la structure HTML complète de toutes les sections
définies dans SOFIALAURENT_plan.md (Header → Footer). Utilise des classes BEM.
Inclus les liens Google Fonts (Cormorant Garamond + Raleway) et le lien vers css/style.css.
```

### Phase 2 — Styles complets
```
Crée css/style.css en suivant la direction artistique de SOFIALAURENT_plan.md.
Variables CSS pour la palette, typographie, border-radius. Mobile-first.
Style toutes les sections dans l'ordre. Utilise Flexbox/Grid.
```

### Phase 3 — Responsive
```
Ajoute les media queries tablette (768px) et desktop (1024px) dans style.css.
Adapte le header (menu hamburger mobile → nav inline desktop),
le Hero, les cartes Services, les Témoignages et le formulaire.
```

### Phase 4 — Animations scroll
```
Crée js/main.js. Implémente les animations au scroll avec Intersection Observer.
Fade-in + translateY sur les sections et cartes. Gère aussi le header fixe
(ajout classe .scrolled quand scrollY > 50). Smooth scroll pour la navigation.
```

### Phase 5 — Formulaire + Supabase
```
Crée js/contact.js. Connecte le formulaire à Supabase (table leads).
Validation côté client (nom requis, email valide). Affiche un message
de succès ou d'erreur. Utilise fetch + l'API REST Supabase.
La clé anon sera stockée en variable JS (acceptable pour un insert public).
```

### Phase 6 — Déploiement
```
Prépare le projet pour Vercel : vérifie la structure des fichiers,
crée vercel.json si nécessaire, ajoute un .gitignore propre.
Donne-moi les étapes pour déployer via Vercel CLI ou GitHub.
```
