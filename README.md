- URL site WEB : https://sae303-thomas-bambou.netlify.app/
- URL Notebook Observable : https://observablehq.com/@mmi-montbeliard/sae-303-gr-21
- Nom : Perruchot
- Prénom : Thomas
- Nom binome : Franceschini
- Prénom binome : Bambou

# Remarques :

Site Astro « L'électricité de l'IA » : un récit en 4 temps (contexte → exploration → révélation → conclusion) qui compare l'électricité **mesurée** en laboratoire (AI Energy Score) et **estimée** sur de vraies conversations (Compar:IA).

- **Navigation** : 7 pages (accueil, 4 visualisations, conclusion, méthode), menu des chapitres avec page courante signalée (`aria-current`), liens précédent / suivant, lien d'évitement « Aller au contenu ». Code : [layout](src/layouts/Layout.astro).
- **Routes d'export** : V1, V2 et V3 sont rendues au build (HTML/CSS statique, aucun JavaScript). V4 est un calculateur recalculé chez le lecteur, car c'est la seule qui doit bouger. Justification détaillée sur la page [Méthode](src/pages/methode.astro).
- **Données** : seuls des fichiers filtrés sont dans le dépôt ([public/data](public/data)), générés par [scripts/prepare-data.mjs](scripts/prepare-data.mjs) à partir des fichiers bruts (non versionnés). Colonnes utiles, deux décimales, conversion en secondes d'ampoule LED.
- **Accessibilité** : `<figure>` / `<figcaption>` sur chaque visualisation, description textuelle pour lecteurs d'écran, valeurs écrites en toutes lettres à côté des barres, couleur jamais seule porteuse du sens, animations désactivées avec `prefers-reduced-motion`.
- **Responsive** : mise en page testée du téléphone au bureau (grilles `auto-fit`, tableaux défilants).
- **Identité** : palette de charte (violets) distincte de la palette de données (mesuré / estimé / absence de donnée), définies séparément dans [global.css](src/styles/global.css).
- **Travail à deux** : deux branches (`Intro-structure`, `feature/visus-methode`) fusionnées dans `main` par Pull Request, règles dans [CONTRIBUTING.md](CONTRIBUTING.md).
