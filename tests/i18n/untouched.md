## 3. Laissé tel quel (et pourquoi)

- **Codes et données** : codes de statut enregistrés `M` / `K` (affichés M / MJ), clés `soup`, champs JSON, charge utile Firestore, synchronisation : inchangés. La reconnaissance de la colonne souplesse à l’import (`/souplesse|\bsit\b|reach|flex/`) est inchangée : les anciens fichiers avec « sit and reach » sont toujours reconnus.
- **En-têtes CSV/Excel d’export** « Maladie non justifiée / Maladie justifiée » → **modifiés** en « Malade non justifié / Malade justifié » : aucun code ne relit ces en-têtes (l’import en masse ignore les colonnes inconnues, la restauration JSON n’utilise pas les libellés).
- **Arabe** : aucune chaîne arabe modifiée.
- **Termes Massar** (noms de colonnes des fichiers officiels) : inchangés.
- **Messages techniques** (`console.*`, codes internes `nometa`, `noprf`, `access ok`…) : non visibles, inchangés.
- **Commentaire HTML** (index.html l. 942) : non affiché, inchangé.
- **« Cahier Journalier digital »** : nom du produit, conservé (« numérique » serait plus correct en français ; à décider par le propriétaire). Seule la majuscule de « Journalier » a été harmonisée.
- **« Course en durée »** (nom d’activité par défaut) : les deux formes (« en durée » / « de durée ») sont usuelles en EPS ; c’est une donnée modifiable par l’utilisateur.
- **« Dispensé »** (libellé de statut) et « dispensé(e) » dans les phrases sur un élève : usage cohérent, conservé.
- **« Hand-ball »** dans un exemple de saisie (placeholder) : graphie admise, conservée.
- **Espaces fines U+202F** déjà présentes dans les boîtes de confirmation : conservées (typographiquement correctes).
- **Apostrophes** : déjà toutes typographiques (’) ; aucune apostrophe droite dans le texte visible. Pas de « ... », pas de doubles espaces.
- **RELEASE-CHECKLIST.md** (documentation interne) : historique conservé, nouvelle entrée ajoutée.
