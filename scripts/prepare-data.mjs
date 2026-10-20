// Prépare les fichiers de données du site à partir des fichiers bruts du défi.
// Usage : node scripts/prepare-data.mjs "<dossier avec aies_energie_toutes_taches.json et comparia_conversations_echantillon.json>"
// Les fichiers bruts ne sont jamais copiés dans le dépôt : seuls les JSON filtrés sont écrits dans public/data/.
// Le traitement reprend celui du notebook Observable (nettoyage et jointures), cellule par cellule.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const dossier = process.argv[2];
if (!dossier) {
  console.error('Usage : node scripts/prepare-data.mjs "<dossier des fichiers bruts>"');
  process.exit(1);
}
const lire = (nom) => JSON.parse(readFileSync(join(dossier, nom), "utf8"));
const brutAES = lire("aies_energie_toutes_taches.json");
const brutComparia = lire("comparia_conversations_echantillon.json");

// ---------- outils ----------
const r2 = (x) => Math.round(x * 100) / 100;
const mediane = (v) => {
  const s = [...v].sort((a, b) => a - b), n = s.length;
  return n === 0 ? null : n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};
const grouper = (liste, cle) => {
  const m = new Map();
  for (const x of liste) { const k = cle(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); }
  return m;
};
// 1 Wh = une ampoule LED de 10 W allumée 360 secondes
const enSecondes = (wh) => r2(wh * 360);

const libellesTaches = {
  asr: "Reconnaissance de la parole", image_captioning: "Légendage d'images", image_classification: "Classification d'images",
  image_generation: "Génération d'images", object_detection: "Détection d'objets", question_answering: "Réponse à des questions",
  reasoning: "Raisonnement (texte)", sentence_similarity: "Similarité de phrases", summarization: "Résumé de texte",
  text_classification: "Classification de texte", text_generation: "Génération de texte (réponse directe)"
};
const famillesTaches = {
  asr: "Parole", image_captioning: "Image", image_classification: "Image", image_generation: "Image", object_detection: "Image",
  question_answering: "Texte", reasoning: "Texte", sentence_similarity: "Texte", summarization: "Texte",
  text_classification: "Texte", text_generation: "Texte"
};

// ---------- AI Energy Score (mesuré) ----------
const aes = brutAES.filter((d) => d.model && Number.isFinite(+d.total_gpu_energy)).map((d) => {
  const m = d.model.match(/^(.*?)(?: (low|medium|high))?$/);
  return {
    tache: d.tache, id_modele: m[1], niveau_raisonnement: m[2] ?? null,
    wh: +d.total_gpu_energy, classe: d.class ?? null,
    campagne: d["test date"] === "Feb 25" ? "2025-02" : d["test date"] === "Dec 25" ? "2025-12" : null
  };
});
// on ne mélange jamais deux campagnes : texte et raisonnement, décembre 2025 seulement
const aesComparable = aes.filter((d) => (d.tache !== "text_generation" && d.tache !== "reasoning") || d.campagne === "2025-12");

const taches = [...grouper(aesComparable, (d) => d.tache)].map(([tache, v]) => {
  const w = v.map((d) => d.wh);
  return {
    tache, libelle: libellesTaches[tache] ?? tache, famille: famillesTaches[tache] ?? "Autre", n_modeles: v.length,
    secondes: enSecondes(mediane(w)), ecart_max_min: Math.round(Math.max(...w) / Math.min(...w))
  };
}).sort((a, b) => b.secondes - a.secondes);

// ---------- Compar:IA (estimé) ----------
const modesConnus = ["random", "custom", "big-vs-small", "reasoning", "small-models"];
const conversations = brutComparia.filter((d) => d.mode == null || modesConnus.includes(d.mode));
const reponses = conversations.flatMap((d) => ["a", "b"].map((c) => ({
  modele: d[`model_${c}_name`], kwh: d[`total_conv_${c}_kwh`], tokens: d[`total_conv_${c}_output_tokens`],
  raisonnement: d[`conv_${c}_raisonnement`] === true
})));
const valides = reponses.filter((r) => r.kwh > 0 && r.tokens > 0);
const coefModele = new Map();
for (const [modele, toutes] of grouper(reponses, (r) => r.modele)) {
  const ok = valides.filter((r) => r.modele === modele);
  const avec = toutes.filter((r) => r.raisonnement && r.tokens > 0).map((r) => r.tokens);
  const sans = toutes.filter((r) => !r.raisonnement && r.tokens > 0).map((r) => r.tokens);
  coefModele.set(modele, {
    n_valides: ok.length, kwh_med: mediane(ok.map((r) => r.kwh)), coef: mediane(ok.map((r) => r.kwh / r.tokens)),
    n_raisonnement: avec.length, n_sans: sans.length, tok_rai: mediane(avec), tok_sans: mediane(sans)
  });
}

// ---------- Jointure mesure ↔ estimation (appariement fait à la main, comme dans le notebook) ----------
const appariement = [
  ["google/gemma-3-4b-pt", "gemma-3-4b"], ["google/gemma-3-27b-pt", "gemma-3-27b"],
  ["mistralai/Mistral-Nemo-Instruct-2407", "mistral-nemo-2407"],
  ["swiss-ai/Apertus-8B-Instruct-2509", "Apertus-8B-Instruct-2509"], ["swiss-ai/Apertus-70B-Instruct-2509", "Apertus-70B-Instruct-2509"],
  ["Qwen/Qwen3-30B-A3B", "qwen3-30b-a3b"], ["zai-org/GLM-4.5", "glm-4.5"], ["zai-org/GLM-4.6", "glm-4.6"],
  ["deepseek-ai/DeepSeek-R1-Distill-Llama-70B", "deepseek-r1-distill-llama-70b"]
];
const paires = appariement.map(([idAes, nomComparia]) => {
  const a = aes.find((d) => d.tache === "text_generation" && d.id_modele === idAes && d.campagne === "2025-12");
  const c = coefModele.get(nomComparia);
  if (!a || !c) return null;
  const whEstime = c.kwh_med * 1000;
  return {
    modele: nomComparia, classe: a.classe, taille_70_milliards: /70b/i.test(nomComparia), n_reponses: c.n_valides,
    mesure_s: enSecondes(a.wh), estimation_s: enSecondes(whEstime),
    mesure_wh: r2(a.wh), estimation_wh_1000_tokens: r2(c.coef * 1e6)
  };
}).filter(Boolean);

// ---------- Raisonnement ----------
const facteurs = aes.filter((d) => d.tache === "reasoning" && d.niveau_raisonnement == null).map((r) => {
  const direct = aes.find((d) => d.tache === "text_generation" && d.campagne === "2025-12" && d.id_modele === r.id_modele);
  return direct ? { modele: r.id_modele.split("/").pop(), facteur: r2(r.wh / direct.wh) } : null;
}).filter(Boolean);
// un modèle consomme autant avec que sans raisonnement (×1) : montré, mais écarté de la fourchette
const laboratoire = facteurs.map((d) => ({ ...d, ecarte: d.facteur < 2 })).sort((a, b) => b.facteur - a.facteur);
const anomalies = laboratoire.filter((d) => d.ecarte).map((d) => d.modele);
const conv = [...coefModele].filter(([, m]) => m.n_raisonnement >= 10 && m.n_sans >= 10)
  .map(([modele, m]) => ({ modele, facteur: r2(m.tok_rai / m.tok_sans), n_raisonnement: m.n_raisonnement, n_sans: m.n_sans }))
  .sort((a, b) => b.facteur - a.facteur);

// ---------- Chiffres de la page Méthode ----------
const chiffres = {
  aes: {
    lignes_brutes: brutAES.length, lignes_lisibles: aes.length, taches: taches.length,
    mesures_fevrier_texte_ecartees: aes.filter((d) => d.tache === "text_generation" && d.campagne === "2025-02").length,
    mesures_comparables: aesComparable.length
  },
  comparia: {
    conversations_brutes: brutComparia.length, conversations_retirees: brutComparia.length - conversations.length,
    conversations: conversations.length, reponses: reponses.length,
    reponses_sans_kwh: reponses.filter((r) => r.kwh == null).length, reponses_utilisables: valides.length,
    modeles: coefModele.size, modeles_appaires: paires.length
  },
  raisonnement: { modeles_laboratoire: facteurs.length, modeles_conversations: conv.length, anomalies }
};

mkdirSync("public/data", { recursive: true });
const ecrire = (nom, data) => writeFileSync(join("public/data", nom), JSON.stringify(data, null, 1) + "\n");
ecrire("taches.json", taches);
ecrire("paires.json", paires);
ecrire("raisonnement.json", { laboratoire, conversations: conv, anomalies });
ecrire("chiffres.json", chiffres);
console.log(JSON.stringify(chiffres, null, 1));
console.log(`${taches.length} tâches, ${paires.length} paires, ${laboratoire.length} + ${conv.length} facteurs`);
