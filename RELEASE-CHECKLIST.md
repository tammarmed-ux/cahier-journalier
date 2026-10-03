# Checklist de publication – Cahier Journalier digital

Fichier interne : jamais servi par Firebase Hosting (exclu par `firebase.json` > `hosting.ignore` : `**/*.md`, `RELEASE*`, `.firebase/`, `.git`).

Format de version : **1.<version>.<correctif>** (actuelle : 1.23.0 · suivante : 1.24.0). Étiquette Git : `v1.23.0`. Cache du service worker : `cahier-v23` (= `APP_VER`).

## Avant de publier
1. `index.html` : `APP_SEMVER` (« 1.23.0 »), `APP_VER` (« cahier-v23 »), `<title>`, splash `.sp-ver`, en-tête `.h-txt`, écran de connexion `#gVer`, Paramètres `#verLine`.
2. `manifest.webmanifest` : `name` contient `v1.23.0`.
3. `sw.js` : `CACHE = 'cahier-v23'` ; toute nouvelle ressource (polices, scripts) ajoutée à `ASSETS` ou `FONT_ASSETS`.
4. La clé de stockage `classRegister.v2` ne change JAMAIS.
5. Tests (dossier `cj-emu`, émulateurs Firebase actifs) : `test_gate` 61+, `test_move`, `test_pdf`, `test_order`, `test_snap`, `test_import`, `test_v23` (copie dans `tests/`, non servie ; version, polices arabes, bidi, semestres, vert/rouge).
6. Aperçus PDF à regarder (PNG) : nom centré (latin + arabe), vert/rouge présence, polices arabes, semestres.

## Publier
1. `git commit` puis `git push origin main`, puis `git tag v1.23.0 && git push origin v1.23.0`.
2. `firebase deploy --only hosting:app --project cahier-journalier-2830a`.

## Vérifier en ligne
- `/sw.js` contient `cahier-v23` ; `/index.html` et `/cj-pdf.js` identiques aux fichiers locaux.
- 404 sur `/.git/HEAD`, `/firebase.json`, `/RELEASE-CHECKLIST.md`, `/.firebase/` ; 200 sur `/`.
