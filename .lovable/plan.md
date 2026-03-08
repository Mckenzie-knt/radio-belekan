

## Plan : Activation de Lovable Cloud et mise en place du backend

### Architecture de la base de données

**Tables a creer :**

1. **profiles** - Profils utilisateurs (auto-cree a l'inscription)
   - `id` (uuid, FK auth.users), `display_name`, `avatar_url`, `created_at`

2. **user_roles** - Roles admin securises
   - `id`, `user_id` (FK auth.users), `role` (enum: admin, moderator, user)

3. **radio_config** - Configuration du flux radio
   - `id`, `key` (unique), `value`, `updated_at`, `updated_by`

4. **shows** - Emissions / categories
   - `id`, `name`, `description`, `cover_image_url`, `created_at`

5. **episodes** - Episodes en rediffusion
   - `id`, `show_id` (FK shows), `title`, `audio_url`, `date`, `duration`, `created_at`

6. **chat_messages** - Messages du chat en direct
   - `id`, `user_id` (FK auth.users), `message`, `created_at`

7. **chat_reactions** - Reactions emoji en direct
   - `id`, `user_id`, `emoji`, `created_at`

8. **feedbacks** - Avis des auditeurs
   - `id`, `user_id` (FK auth.users), `rating`, `message`, `created_at`

**Storage bucket :**
- `episodes-audio` : stockage des fichiers audio des rediffusions

### Authentification
- Email/password via Supabase Auth
- Trigger auto-creation du profil a l'inscription
- Auth context React avec `onAuthStateChange`
- Page de reset password

### Securite (RLS)
- `radio_config`, `shows`, `episodes` : lecture publique, ecriture admin uniquement
- `chat_messages`, `chat_reactions`, `feedbacks` : lecture publique, ecriture par utilisateur authentifie
- `profiles` : lecture publique, modification par le proprietaire
- `user_roles` : fonction `has_role()` en SECURITY DEFINER

### Temps reel
- Activer Realtime sur `chat_messages` et `chat_reactions` pour le chat en direct

### Modifications frontend
- **Auth.tsx** : Connecter a Supabase Auth (signUp, signIn)
- **AudioContext.tsx** : Charger l'URL du flux depuis `radio_config`
- **Replay.tsx** : Charger episodes depuis la table `episodes` + storage
- **LiveChat.tsx** : Chat et reactions en temps reel via Supabase Realtime
- **Feedback.tsx** : CRUD feedbacks avec auth requise pour poster
- **Admin.tsx** : Gestion du flux, upload episodes, moderation (admin only)
- **Navbar.tsx** : Afficher etat connecte/deconnecte, bouton logout
- Creer un `AuthContext` avec gestion de session

### Etapes d'implementation
1. Activer Lovable Cloud / connecter Supabase
2. Creer les migrations (tables, RLS, triggers, storage)
3. Creer le contexte d'authentification et modifier Auth.tsx
4. Connecter chaque page au backend (config, episodes, chat, feedbacks)
5. Securiser le panneau admin avec verification de role

