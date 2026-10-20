// Animations au défilement : apparition des blocs, croissance des barres, barres du bandeau d'accueil.
// Rien n'est masqué en CSS : sans JavaScript (ou avec prefers-reduced-motion), tout reste visible.
if (!matchMedia("(prefers-reduced-motion: reduce)").matches && Element.prototype.animate) {
  const easing = "cubic-bezier(.2,.7,.2,1)";
  const anims = new Map();
  const retenir = (el, keyframes, options) => {
    const a = el.animate(keyframes, { fill: "both", easing, ...options });
    a.pause(); // en attente : se joue quand l'élément entre à l'écran
    anims.set(el, (anims.get(el) || []).concat(a));
  };
  const rang = (el) => [...el.parentElement.children].indexOf(el);

  // 1. Apparition des blocs de la page
  document
    .querySelectorAll("main .page > *, main .cartes > *, main .sommaire > li, main .reflexes > li, main .deux > section")
    .forEach((el) => {
      retenir(el, [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "none" }], {
        duration: 750,
        delay: Math.min(rang(el), 6) * 90,
      });
    });

  // 2. Barres horizontales (V1, V3) : elles partent de la gauche, ou de la droite pour une valeur sous ×1
  document.querySelectorAll('[data-bar="x"]').forEach((el, i) => {
    el.style.transformOrigin = el.dataset.origine === "right" ? "right center" : "left center";
    retenir(el, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1100, delay: 200 + (i % 11) * 60 });
  });

  // 3. Barres verticales (V2)
  document.querySelectorAll('[data-bar="y"]').forEach((el, i) => {
    el.style.transformOrigin = "center bottom";
    retenir(el, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 1100, delay: 250 + i * 140 });
  });

  // 4. Barres du bandeau d'accueil : jouées toutes ensemble quand le bandeau est visible
  document.querySelectorAll("[data-hero]").forEach((hero) => {
    const enfants = [...hero.children];
    enfants.forEach((el, i) => {
      el.style.transformOrigin = "center bottom";
      retenir(el, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 900, delay: 300 + i * 45 });
    });
    anims.set(hero, enfants.flatMap((c) => anims.get(c) || []));
  });

  const observateur = new IntersectionObserver(
    (entrees) =>
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        (anims.get(e.target) || []).forEach((a) => a.play());
        observateur.unobserve(e.target);
      }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  anims.forEach((_, el) => observateur.observe(el));
}
