// Formatage à la française et conversions communes aux visualisations.
export const fr = (x, n = 2) =>
  x.toLocaleString("fr-FR", { minimumFractionDigits: n, maximumFractionDigits: n });

// Facteur multiplicatif : ×697, ×7,7, ×0,3
export const facteur = (f) =>
  "×" + (f >= 10 ? Math.round(f).toLocaleString("fr-FR") : fr(f, 1));

// 1 Wh = une ampoule LED de 10 W allumée 360 secondes. Entrée : secondes d'ampoule.
export const duree = (s) => {
  if (s < 10) return `${fr(s, 2)} s`;
  if (s < 60) return `${Math.round(s)} s`;
  if (s < 3600) {
    const m = s / 60;
    return `${m < 10 ? fr(m, 1) : Math.round(m)} min`;
  }
  return `${fr(s / 3600, 1)} h`;
};

// Position (en %) sur un axe logarithmique de 1 s à 1 h (repères : 1 s, 10 s, 1 min, 10 min, 1 h)
export const posDuree = (s) => Math.max(1.5, 21.9 + 21.96 * Math.log10(s));

// Position (en %) d'un facteur sur l'axe ×0,1 → ×1 000 ; ×1 est à 25 %
export const posFacteur = (f) => 25 * (Math.log10(f) + 1);
