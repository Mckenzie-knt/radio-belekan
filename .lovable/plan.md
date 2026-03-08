

## Diagnostic et corrections

### Probleme identifie : Les avis ne s'affichent pas
Les requetes sur `feedbacks` et `chat_messages` echouent (erreur 400) car elles tentent de joindre la table `profiles` via une foreign key (`feedbacks_user_id_fkey`, `chat_messages_user_id_fkey`) qui **n'existe pas** en base. Les tables `feedbacks` et `chat_messages` ont un `user_id` mais aucune contrainte FK vers `profiles`.

### Corrections prevues

**1. Migration base de donnees** — Ajouter les foreign keys manquantes :
- `feedbacks.user_id` → `profiles.user_id`
- `chat_messages.user_id` → `profiles.user_id`

**2. `src/pages/Feedback.tsx`** — Les requetes `.select("*, profiles!feedbacks_user_id_fkey(display_name)")` fonctionneront une fois les FK ajoutees. Aucun changement de code necessaire.

**3. `src/pages/LiveChat.tsx`** — Meme correction automatique via la FK ajoutee.

### Ajout page Contact / Support

**4. `src/pages/Contact.tsx`** — Nouvelle page avec :
- Informations de contact (email, telephone, adresse)
- Formulaire de contact (nom, email, sujet, message) qui insere dans une nouvelle table `contact_messages`
- Liens vers les reseaux sociaux

**5. Migration** — Creer la table `contact_messages` (id, name, email, subject, message, created_at) avec RLS : insertion publique (meme les non-connectes), lecture admin uniquement.

**6. `src/App.tsx`** — Ajouter la route `/contact`.

**7. `src/components/layout/Navbar.tsx`** — Ajouter le lien "Contact" dans la navigation.

