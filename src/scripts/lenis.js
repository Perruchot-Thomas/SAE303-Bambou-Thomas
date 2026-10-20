// Défilement fluide (Lenis). Désactivé si le visiteur a demandé moins d'animations.
import Lenis from "lenis";

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  // anchors : le lien d'évitement « Aller au contenu » et les ancres restent fonctionnels
  new Lenis({ autoRaf: true, lerp: 0.09, anchors: true });
}
