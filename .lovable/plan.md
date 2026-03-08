

## Plan : Suppression admin + Barre de progression Spotify-like

### 1. Admin — Suppression des émissions et épisodes

**src/pages/Admin.tsx** :
- **Onglet Émissions** : Ajouter un bouton Trash2 à côté de chaque émission existante. Au clic, appeler `supabase.from("shows").delete().eq("id", s.id)` et retirer du state local. Afficher un toast de confirmation.
- **Onglet Épisodes** : Ajouter une section "Épisodes existants" qui charge tous les épisodes avec leurs shows associés. Chaque épisode affiche titre, date, nom d'émission et un bouton supprimer. Au clic, supprimer le fichier du storage (`supabase.storage.from("episodes-audio").remove(...)`) puis la ligne en base (`supabase.from("episodes").delete().eq("id", ep.id)`).
- Les RLS policies existantes (`Admins can manage episodes` / `Admins can manage shows` avec command ALL) couvrent déjà le DELETE. Aucune migration nécessaire.

### 2. Barre de progression audio style Spotify

**src/contexts/AudioContext.tsx** :
- Ajouter `currentTime`, `duration` au state
- Ajouter `seek(time: number)` pour modifier `audioRef.current.currentTime`
- Attacher les listeners `timeupdate` et `loadedmetadata` sur l'élément audio pour mettre à jour `currentTime` et `duration` en temps réel
- Exposer `currentTime`, `duration`, `seek` dans le contexte

**src/components/layout/AudioPlayer.tsx** :
- Ajouter un `Slider` cliquable entre les infos de piste et les contrôles (ou au-dessus du player, comme Spotify)
- Le slider affiche la progression `currentTime / duration` en pourcentage
- Au changement de valeur (`onValueChange`), appeler `seek(newTime)`
- Afficher le temps écoulé et la durée totale formatés (mm:ss)
- Masquer la barre de progression quand on écoute le flux live (pas de durée connue)

### Fichiers modifiés
- `src/contexts/AudioContext.tsx` — ajout currentTime/duration/seek
- `src/components/layout/AudioPlayer.tsx` — ajout slider de progression + affichage temps
- `src/pages/Admin.tsx` — ajout suppression shows + liste/suppression épisodes

