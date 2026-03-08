

## Probleme : URL du flux audio incorrecte

L'URL de streaming actuellement configuree dans l'application (`https://stream.zeno.fm/yn65fsaurfhvv`) ne correspond pas a votre station **Radio BELEKAN de Kati**. Chaque station Zeno.fm a un identifiant de flux unique (mount point) qui est different du slug de la page.

### Comment trouver la bonne URL

Vous pouvez trouver votre URL de streaming exacte dans votre **tableau de bord Zeno Tools** :
1. Connectez-vous sur [zeno.fm](https://zeno.fm)
2. Allez dans **Tools** > **Settings** > **Stream Configuration**
3. L'URL ressemblera a : `https://stream.zeno.fm/XXXXXXXX`

Alternativement, sur la page https://zeno.fm/radio/radiobelekandekati/ :
- Cliquez sur "Listen" puis ouvrez les **DevTools du navigateur** (F12) > onglet **Network**
- Filtrez par "media" ou "stream" -- vous verrez l'URL exacte du flux audio

### Ce que je ferai une fois l'URL fournie

Modifier la constante `DEFAULT_STREAM` dans `src/contexts/AudioContext.tsx` (ligne 22) avec la bonne URL.

**Pourriez-vous me fournir l'URL exacte du flux de votre station ?**

