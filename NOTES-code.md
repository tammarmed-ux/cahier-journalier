# Notes de code déplacées hors de index.html (budget de démarrage < 720 Ko)

## Athlétisme : barèmes OP 2007 → note PRODUIT

```
/* ===== Athlétisme : barèmes officiels OP 2007 (op2007-athle.js) → note PRODUIT (habileté motrice) d’après le meilleur essai =====
   Règle (précisée par le propriétaire le 08/10/2026) : une performance située entre deux paliers prend la note du palier SUPÉRIEUR.
     distances / hauteurs : plus petit palier ≥ performance (intervalle ]palier précédent ; palier]) — ex. 2BAC G poids 920 cm → palier 947 → 5,25 ;
     temps (plus petit = meilleur) : plus grand palier ≤ temps (intervalle [palier ; palier précédent[) — ex. 2BAC G 1000 m 3.30 → palier 3.25 → 5,25.
     Moins bien que le palier 1 : note du palier 1 si la performance reste dans « l’intervalle » du palier 1 (même écart qu’entre les paliers 1 et 2), sinon 0.
     Égal ou meilleur que le palier 20 : note maximale. Note du palier n = n × pas (TC 0,30 · 1BAC et 2BAC 0,35).
   Données de l’élève (champ additif s.ev) : essais (textes saisis, 1 à 6), perfEvent (épreuve), prodAuto (Produit calculé ; absent = Produit saisi à la main).
   La note Performance (comportement moteur) reste saisie à la main.
   Épreuve du cycle : DB.evals.evt["<classe>|<cycle>"], sinon l’épreuve notée chez les élèves, sinon d’après le nom de l’activité. */
```
