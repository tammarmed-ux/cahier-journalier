# Checklist de publication – Cahier d’EPS (Cahier Journalier digital)

Fichier interne : jamais servi par Firebase Hosting (exclu par `firebase.json` > `hosting.ignore` : `**/*.md`, `RELEASE*`, `.firebase/`, `.git`).

Format de version : **1.<version>.<correctif>** (actuelle : 1.25.1 · suivante : 1.26.0). Étiquette Git : `v1.25.1`. Cache du service worker : `cahier-v25-1` (règle : `cahier-v<version>`, suivi de `-<correctif>` si le correctif n’est pas 0) (= `APP_VER`).

## Avant de publier
1. `index.html` : `APP_SEMVER` (« 1.25.1 »), `APP_VER` (« cahier-v25-1 »), splash `.sp-ver`, en-tête `.h-ver`, écran de connexion `#gVer`, page d’accueil `#lnVer`, Paramètres `#verLine`, `softwareVersion` du JSON-LD. Le `<title>` SEO ne porte pas de version.
2. `manifest.webmanifest` : `name` = « Cahier d’EPS v1.25.1 », `short_name` = « Cahier d’EPS ».
3. `sw.js` : `CACHE = 'cahier-v25-1'` ; toute nouvelle ressource (polices, scripts, logos, icônes, image og) ajoutée à `ASSETS` ou `FONT_ASSETS`.
4. La clé de stockage `classRegister.v2` ne change JAMAIS.
5. Tests (dossier `cj-emu`, émulateurs Firebase actifs) : `test_gate` 61+, `test_move`, `test_pdf`, `test_order`, `test_snap`, `test_import`, `test_v251`, `test_v251_site` et `test_v251_logo` (copies dans `tests/`, non servies ; versions, polices arabes, bidi, semestres, vert/rouge, toutes les classes, page d’accueil, SEO, connexion, synchro, sauvegarde JSON, mise à jour v25 → v25.1 sans changement de `classRegister.v2`).
7. Sauvegarde avant publication : étiquette `backup-pre-<version>` poussée sur GitHub + archive tar dans `/workspace/backups/` (dossier exclu de l’hébergement).
6. Aperçus PDF à regarder (PNG) : nom centré (latin + arabe), vert/rouge présence, polices arabes, semestres.

## Publier
1. `git commit` puis `git push origin main`, puis `git tag -a v1.25.1 && git push origin v1.25.1`.
2. `firebase deploy --only hosting:app --project cahier-journalier-2830a`.

## Vérifier en ligne
- `/sw.js` contient `cahier-v25-1` ; `/robots.txt` et `/sitemap.xml` en 200 ; titre, meta, og et JSON-LD présents dans le HTML servi ; `/index.html` et `/cj-pdf.js` identiques aux fichiers locaux.
- 404 sur `/.git/HEAD`, `/firebase.json`, `/RELEASE-CHECKLIST.md`, `/.firebase/`, `/tests/…`, `/backups/` ; 200 sur `/`.

## Marque et logo
- Nom visible : « Cahier d’EPS » (apostrophe typographique). Titre SEO inchangé : « Cahier Journalier EPS — registre d’absences et bilans pour professeurs d’EPS au Maroc ».
- Logo B : coureur orange #E85D04 + piste courbe sur carré bleu #0B3A6E (`icons/logo-b.svg`) ; favicon à piste épaissie (`icons/favicon-b.svg`). `logo.jpg` conservé (en-tête des PDF).

## Icônes et caches (leçon de 1.25.0 → 1.25.1)
- Une icône qui change de dessin change aussi de NOM de fichier (ex. `icon-b-192.png`) : iOS et les navigateurs gardent les icônes par adresse.
- `sw.js` télécharge ses ressources à l’installation avec `cache: 'reload'` (jamais depuis le cache HTTP) ; les anciens caches `cahier-*` sont supprimés à l’activation.
- `firebase.json` : `/icons/**`, `/favicon.ico`, `/og-image*.png`, `/logo.jpg` en `no-cache` (revalidation, réponse 304 si inchangé).
- Test `test_v251_logo` : client v1.24.0 avec cache HTTP rempli → mise à jour → logo B affiché.
