

## Barre de progression pour l'upload audio

Le SDK Supabase JS ne fournit pas de callback de progression natif pour `storage.upload()`. La solution est d'utiliser `XMLHttpRequest` (ou `fetch` avec `ReadableStream`) pour uploader directement vers l'API Storage avec suivi de progression.

### Approche
- Remplacer `supabase.storage.upload()` par un `XMLHttpRequest` vers l'endpoint Storage REST, avec listener `upload.onprogress`
- Ajouter un state `uploadProgress` (0-100)
- Afficher le composant `Progress` existant pendant l'upload

### Modifications
**src/pages/Admin.tsx** :
1. Ajouter `const [uploadProgress, setUploadProgress] = useState(0)`
2. Créer une fonction `uploadWithProgress(fileName, file)` utilisant `XMLHttpRequest` vers `${SUPABASE_URL}/storage/v1/object/episodes-audio/${fileName}` avec le header Authorization Bearer
3. Dans le JSX, afficher `<Progress value={uploadProgress} />` quand `uploading` est true, avec le pourcentage affiché

