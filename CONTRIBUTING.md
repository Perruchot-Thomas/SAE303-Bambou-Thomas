# Travailler à deux

- `main` = version qui marche (publiée sur Netlify). On n'y pousse pas directement.
- Une branche par sujet : `feature/recit-layout`, `feature/visus-methode`.
- Avant de commencer : `git pull --rebase origin main`.
- Quand c'est prêt : Pull Request vers `main`, relue par l'autre, puis merge.
- Vérifier avant PR : `npm run build` passe sans erreur.

## Répartition (contrat entre les deux branches)

| | Branche `Intro-structure` | Branche `feature/visus-methode` |
|---|---|---|
| Possède | `src/layouts/`, `src/styles/`, `src/pages/`, composants de mise en page (`src/components/ui/`) | `src/components/viz/`, `src/lib/`, `scripts/`, `public/data/`, `src/pages/methode.astro` |
| Ne touche pas | `src/components/viz/`, `public/data/` | `src/layouts/`, `src/styles/`, les autres pages |

Les pages importent `V1Requete`, `V2Mesure`, `V3Raisonnement`, `V4Usage` depuis `src/components/viz/`.
Ces quatre fichiers existent déjà (vides) pour que chacun compile seul : ne pas les renommer.
La page `/methode` est écrite côté visus ; le layout lui donne la structure via `<Layout>`.

## Données
Les fichiers bruts du défi ne sont jamais dans le dépôt. `node scripts/prepare-data.mjs <dossier-brut>` génère les JSON filtrés dans `public/data/`.
