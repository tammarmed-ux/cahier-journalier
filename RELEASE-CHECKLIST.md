# Checklist de publication – Cahier Journalier digital

Fichier interne : jamais servi par Firebase Hosting (exclu par `firebase.json` > `hosting.ignore` : `**/*.md`, `RELEASE*`, `.firebase/`, `.git`).

Format de version : **1.<version>.<correctif>** (actuelle : 1.24.0 · suivante : 1.25.0). Étiquette Git : `v1.24.0`. Cache du service worker : `cahier-v24` (= `APP_VER`).

## Avant de publier
1. `index.html` : `APP_SEMVER` (« 1.24.0 »), `APP_VER` (« cahier-v24 »), splash `.sp-ver`, en-tête `.h-ver`, écran de connexion `#gVer`, page d’accueil `#lnVer`, Paramètres `#verLine`, `softwareVersion` du JSON-LD. Le `<title>` SEO ne porte pas de version.
2. `manifest.webmanifest` : `name` contient `v1.24.0`.
3. `sw.js` : `CACHE = 'cahier-v24'` ; toute nouvelle ressource (polices, scripts, logos, icônes, image og) ajoutée à `ASSETS` ou `FONT_ASSETS`.
4. La clé de stockage `classRegister.v2` ne change JAMAIS.
5. Tests (dossier `cj-emu`, émulateurs Firebase actifs) : `test_gate` 61+, `test_move`, `test_pdf`, `test_order`, `test_snap`, `test_import`, `test_v24` et `test_v24_site` (copies dans `tests/`, non servies ; versions, polices arabes, bidi, semestres, vert/rouge, toutes les classes, page d’accueil, SEO, connexion, synchro, sauvegarde JSON, mise à jour v23 → v24 sans changement de `classRegister.v2`).
7. Sauvegarde avant publication : étiquette `backup-pre-<version>` poussée sur GitHub + archive tar dans `/workspace/backups/` (dossier exclu de l’hébergement).
6. Aperçus PDF à regarder (PNG) : nom centré (latin + arabe), vert/rouge présence, polices arabes, semestres.

## Publier
1. `git commit` puis `git push origin main`, puis `git tag -a v1.24.0 && git push origin v1.24.0`.
2. `firebase deploy --only hosting:app --project cahier-journalier-2830a`.

## Vérifier en ligne
- `/sw.js` contient `cahier-v24` ; `/robots.txt` et `/sitemap.xml` en 200 ; titre, meta, og et JSON-LD présents dans le HTML servi ; `/index.html` et `/cj-pdf.js` identiques aux fichiers locaux.
- 404 sur `/.git/HEAD`, `/firebase.json`, `/RELEASE-CHECKLIST.md`, `/.firebase/`, `/tests/…`, `/backups/` ; 200 sur `/`.
