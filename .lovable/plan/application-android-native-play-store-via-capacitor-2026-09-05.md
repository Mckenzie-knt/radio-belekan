# Application Android native (Play Store) via Capacitor

L'application web (PWA) actuelle fonctionne déjà sur téléphone. Pour être publiée sur le **Google Play Store**, il faut l'emballer en application native avec **Capacitor** — votre code React existant est réutilisé tel quel.

## 1. Installation et configuration Capacitor

- Installer les dépendances : `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`
- Initialiser Capacitor avec :
  - `appId` : `app.lovable.p9b67a7cc933a4f50a063ff635cfadbb7`
  - `appName` : `radio-belekan`
  - Bloc `server.url` pointant vers l'URL de preview Lovable pour le hot-reload pendant le développement
- Vérification : la lecture audio en arrière-plan et le lecteur persistant fonctionnent dans le conteneur natif

## 2. Génération du projet Android

À faire **sur votre machine** (le sandbox ne peut pas compiler d'APK) :

```text
1. Exporter le projet vers GitHub (bouton "Export to Github")
2. git clone / git pull le dépôt sur votre machine
3. npm install
4. npx cap add android
5. npx cap update android
6. npm run build
7. npx cap sync        (à refaire après chaque git pull)
8. npx cap run android (émulateur ou téléphone branché)
```

Prérequis : **Android Studio** installé (gratuit).

## 3. Publication sur le Play Store (manuel, hors sandbox)

- Créer un compte **Google Play Console** (25 $ unique)
- Dans Android Studio : générer un **AAB signé** (Build > Generate Signed Bundle)
- Remplir la fiche Play Store : titre, description, captures d'écran, icône, politique de confidentialité
- Soumettre pour révision (quelques jours)

Je peux préparer le texte de la fiche Play Store (titre, description, mots-clés) quand vous y serez.

## Modifications dans ce projet

- `package.json` : ajout des dépendances Capacitor
- `capacitor.config.ts` : configuration de l'app native
- Aucune autre modification du code existant — la web app reste identique

## Limites à connaître

- La compilation Android et la publication Play Store ne peuvent pas se faire depuis Lovable : elles se font sur votre machine avec Android Studio.
- Après chaque modification faite dans Lovable : `git pull` puis `npx cap sync` pour mettre à jour l'app native.

## Documentation

Guide complet : https://docs.lovable.dev/tips-tricks/capacitor (blog Lovable sur le développement mobile natif)
