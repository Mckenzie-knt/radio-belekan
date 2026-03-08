

## Radio Belekandekati - Application Web Installable (PWA)

### 1. Page d'accueil - Écoute en direct
- Lecteur audio en bas de l'écran (toujours visible) avec le flux Zeno FM en direct
- Indicateur "EN DIRECT" avec animation
- Nom de la radio, logo et description
- Bouton play/pause, contrôle du volume

### 2. Espace Live - Chat & Réactions
- Chat en temps réel visible pendant les émissions live (nécessite un compte)
- Réactions rapides (👍❤️🔥😂👏) envoyées en temps réel par tous les auditeurs connectés
- Indicateur du nombre d'auditeurs connectés

### 3. Replay / Rediffusions
- Catalogue des émissions passées organisé par :
  - Nom d'émission (catégorie)
  - Date de diffusion
- Lecteur audio pour chaque épisode
- Les admins uploadent les fichiers audio via le panneau admin

### 4. Page Feedback
- Formulaire pour laisser un avis général sur la radio
- Système de notation (étoiles)
- Les commentaires sont visibles publiquement (compte requis pour poster)

### 5. Authentification
- Écoute libre sans compte
- Inscription/connexion requise pour : chat live, réactions, feedback
- Connexion par email

### 6. Panneau Admin
- Gestion de l'URL du flux radio (actuellement Zeno FM, modifiable)
- Upload et gestion des émissions en rediffusion (titre, catégorie, date, fichier audio)
- Modération des commentaires du chat et feedback
- Gestion des administrateurs

### 7. PWA - Installation mobile
- Installation depuis le navigateur (Android et iPhone)
- Icône sur l'écran d'accueil, fonctionne comme une app native
- Page dédiée avec instructions d'installation

### Backend (Lovable Cloud / Supabase)
- Base de données : émissions, épisodes, chat, feedback, configuration radio
- Stockage des fichiers audio (rediffusions)
- Authentification utilisateurs
- Rôles admin sécurisés
- Temps réel pour le chat et les réactions

