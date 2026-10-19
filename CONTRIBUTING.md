# Travailler à deux

- `main` = version qui marche (publiée sur Netlify). On n'y pousse pas directement.
- Une branche par sujet : `feature/recit-layout`, `feature/visus-methode`.
- Avant de commencer : `git pull --rebase origin main`.
- Quand c'est prêt : Pull Request vers `main`, relue par l'autre, puis merge.
- Vérifier avant PR : `npm run build` passe sans erreur.
