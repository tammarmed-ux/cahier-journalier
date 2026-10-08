# Checklist de publication – Cahier d’EPS (Cahier Journalier digital)

Fichier interne : jamais servi par Firebase Hosting (exclu par `firebase.json` > `hosting.ignore` : `**/*.md`, `RELEASE*`, `.firebase/`, `.git`).

Format de version : **1.<version>.<correctif>** (actuelle : 1.27.0 · suivante : 1.28.0). Étiquette Git : `v1.27.0`. Cache du service worker : `cahier-v27` (règle : `cahier-v<version>`, suivi de `-<correctif>` si le correctif n’est pas 0) (= `APP_VER`).

## Avant de publier
1. `index.html` : `APP_SEMVER` (« 1.27.0 »), `APP_VER` (« cahier-v27 »), splash `.sp-ver`, en-tête `.h-ver`, écran de connexion `#gVer`, page d’accueil `#lnVer`, Paramètres `#verLine`, `softwareVersion` du JSON-LD. Le `<title>` SEO ne porte pas de version.
2. `manifest.webmanifest` : `name` = « Cahier d’EPS v1.27.0 », `short_name` = « Cahier d’EPS ».
3. `sw.js` : `CACHE = 'cahier-v27'` ; toute nouvelle ressource (polices, scripts, logos, icônes, image og) ajoutée à `ASSETS` ou `FONT_ASSETS`.
4. La clé de stockage `classRegister.v2` ne change JAMAIS.
5. Tests (dossier `cj-emu`, émulateurs Firebase actifs) : `test_gate` 61+, `test_move`, `test_pdf`, `test_order`, `test_snap`, `test_import`, `test_v27`, `test_v27_site`, `test_v27_cap` et `test_v251_logo` (générique : version courante) (copies dans `tests/`, non servies ; versions, polices arabes, bidi, semestres, vert/rouge, toutes les classes, page d’accueil, SEO, connexion, synchro, sauvegarde JSON, mise à jour v25 → v25.1 sans changement de `classRegister.v2`).
7. Sauvegarde avant publication : étiquette `backup-pre-<version>` poussée sur GitHub + archive tar dans `/workspace/backups/` (dossier exclu de l’hébergement).
6. Aperçus PDF à regarder (PNG) : logo B et « Cahier d’EPS » dans l’en-tête, nom centré (latin + arabe), vert/rouge présence, polices arabes, semestres.

## Publier
1. `git commit` puis `git push origin main`, puis `git tag -a v1.27.0 && git push origin v1.27.0`.
2. `firebase deploy --only hosting:app --project cahier-journalier-2830a`.

## Vérifier en ligne
- `/sw.js` contient `cahier-v27` ; `/robots.txt` et `/sitemap.xml` en 200 ; titre, meta, og et JSON-LD présents dans le HTML servi ; `/index.html` et `/cj-pdf.js` identiques aux fichiers locaux.
- 404 sur `/.git/HEAD`, `/firebase.json`, `/RELEASE-CHECKLIST.md`, `/.firebase/`, `/tests/…`, `/backups/` ; 200 sur `/`.

## Marque et logo
- Nom visible : « Cahier d’EPS » (apostrophe typographique). Titre SEO inchangé : « Cahier Journalier EPS — registre d’absences et bilans pour professeurs d’EPS au Maroc ».
- Logo B : coureur orange #E85D04 + piste courbe sur carré bleu #0B3A6E (`icons/logo-b.svg`) ; favicon à piste épaissie (`icons/favicon-b.svg`). `logo.jpg` conservé mais plus utilisé par les PDF.
- PDF (`cj-pdf.js`) : en-tête bleu avec `icons/logo-b-pdf.png` (logo B 360 px, coins transparents, liseré clair), marque « Cahier d’EPS », filet orange #E85D04 ; pied de page « Cahier d’EPS v<version> ».

## Icônes et caches (leçon de 1.25.0 → 1.25.1)
- Une icône qui change de dessin change aussi de NOM de fichier (ex. `icon-b-192.png`) : iOS et les navigateurs gardent les icônes par adresse.
- `sw.js` télécharge ses ressources à l’installation avec `cache: 'reload'` (jamais depuis le cache HTTP) ; les anciens caches `cahier-*` sont supprimés à l’activation.
- `firebase.json` : `/icons/**`, `/favicon.ico`, `/og-image*.png`, `/logo.jpg` en `no-cache` (revalidation, réponse 304 si inchangé).
- Test `test_v251_logo` : client v1.24.0 avec cache HTTP rempli → mise à jour → logo B affiché.

## Note comportementale (depuis 1.27.0)
- Par défaut selon le niveau lu dans le nom de la classe — Connaissances comportementales (OP 2007) : TC 5 · 1BAC 4 · 2BAC 3 ; autres classes 3 (`levelOf`, `defaultCap`).
- Valeur personnalisée par classe : champ `capM` (Paramètres › Classes › « Valeur personnalisée »). L’ancien champ `cap` (avant 1.27.0) reste dans les données sans être appliqué ; il est proposé comme valeur de départ si l’on choisit « Valeur personnalisée ».
- Les points retirés sont toujours recalculés à l’affichage : min(points bruts, note de la classe). L’historique des séances n’est jamais modifié.
- Test `test_v27_cap` : détection TC/1BAC/2BAC, mise à jour réelle v1.26.0 → v1.27.0, valeurs avant/après, valeur personnalisée, Rapports, PDF.
