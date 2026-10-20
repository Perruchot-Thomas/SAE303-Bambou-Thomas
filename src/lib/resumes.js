// Phrases qui dépendent des données, utilisées par les pages (accroches et conclusion).
import { taches, paires, raisonnement } from "./donnees.js";
import { duree, fr, facteur } from "./format.js";

const plusSobre = taches.at(-1);
const plusGourmande = taches[0];
const p70 = paires.filter((p) => p.taille_70_milliards);
const ecart70 = Math.round(Math.max(...p70.map((p) => p.mesure_s)) / Math.min(...p70.map((p) => p.mesure_s)));
const reguliers = raisonnement.laboratoire.filter((d) => !d.ecarte);
const labMin = Math.min(...reguliers.map((d) => d.facteur));
const labMax = Math.max(...reguliers.map((d) => d.facteur));
const convMin = Math.min(...raisonnement.conversations.map((d) => d.facteur));
const convMax = Math.max(...raisonnement.conversations.map((d) => d.facteur));
const nombre = (x) => Math.round(x).toLocaleString("fr-FR");

export const resumes = {
  v1: {
    lead: `Selon la tâche, une requête consomme autant qu'une ampoule LED allumée pendant ${duree(plusSobre.secondes).replace(" s", " seconde")}… ou pendant ${duree(plusGourmande.secondes).replace(" min", " minutes")}.`,
  },
  v2: {
    ecart: ecart70,
    lead: `Non. Pour deux modèles de même taille, l'estimation donne le même chiffre ; la mesure trouve un écart de ×${ecart70}.`,
  },
  v3: {
    lead: `En laboratoire, le raisonnement multiplie la consommation par ${nombre(labMin)} à ${nombre(labMax)} pour ${reguliers.length} modèles sur ${raisonnement.laboratoire.length}. Dans les conversations, le facteur ne va que de ${facteur(convMin)} à ${facteur(convMax)}.`,
    labMin: nombre(labMin),
    labMax: nombre(labMax),
    convMin: facteur(convMin),
    convMax: facteur(convMax),
  },
  conclusion: {
    mesureEstimation: `×${ecart70}`,
    tacheMin: duree(plusSobre.secondes).replace(" s", " seconde"),
    tacheMax: duree(plusGourmande.secondes).replace(" min", " minutes"),
  },
};
