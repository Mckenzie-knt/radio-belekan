

## Plan : Gestion des messages de contact dans le panneau admin

### Modification unique : `src/pages/Admin.tsx`

Ajouter un 4e onglet "Messages" dans les Tabs existants :

- **State** : `contactMessages` (array avec id, name, email, subject, message, created_at)
- **Chargement** : dans le `useEffect` existant, appeler `supabase.from("contact_messages").select("*").order("created_at", { ascending: false })` 
- **Onglet UI** : icône `Mail`, titre "Messages de contact"
  - Liste des messages avec nom, email, sujet, message, date
  - Chaque message dans une carte avec bouton Trash2 pour supprimer
  - Suppression via `supabase.from("contact_messages").delete().eq("id", msg.id)`
  - Toast de confirmation

Les RLS policies existantes couvrent deja le SELECT et DELETE pour les admins. Aucune migration necessaire.

### Aucun autre fichier modifie

