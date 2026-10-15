// main.js : script commun à toutes les pages
// (menu mobile, barre de lecture, apparition des éléments au défilement, carnet de voyage)

// 1. On prévient le CSS que JavaScript fonctionne.
//    Sans JavaScript, le menu reste visible et tout le contenu reste affiché.
document.documentElement.classList.add("js");

// 2. On attend que la page soit lue avant de chercher les éléments.
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initProgression();
  initCarnet();
  initApparitions();
});

/* ---------- Menu mobile ---------- */
function initMenu() {
  const bouton = document.querySelector(".nav-toggle");
  const menu = document.getElementById("menu");
  if (!bouton || !menu) return;

  function fermer() {
    menu.classList.remove("is-open");
    bouton.setAttribute("aria-expanded", "false");
  }

  // Un clic sur le bouton ouvre ou ferme le menu.
  bouton.addEventListener("click", () => {
    const ouvert = menu.classList.toggle("is-open");
    bouton.setAttribute("aria-expanded", String(ouvert));
  });

  // La touche Échap ferme le menu et ramène le focus sur le bouton.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      fermer();
      bouton.focus();
    }
  });
}

/* ---------- Barre de lecture : un trait fin qui se remplit en descendant ---------- */
function initProgression() {
  const entete = document.querySelector(".site-header");
  if (!entete) return;

  const barre = document.createElement("div");
  barre.className = "progression";
  barre.setAttribute("aria-hidden", "true");
  entete.appendChild(barre);

  function mettreAJour() {
    const page = document.documentElement;
    const maximum = page.scrollHeight - page.clientHeight;
    const part = maximum > 0 ? page.scrollTop / maximum : 0;
    barre.style.transform = "scaleX(" + part + ")";
  }

  // requestAnimationFrame évite de recalculer à chaque pixel de défilement.
  window.addEventListener("scroll", () => requestAnimationFrame(mettreAJour), {
    passive: true,
  });
  mettreAJour();
}

/* ---------- Apparition des blocs quand on arrive dessus ---------- */
function initApparitions() {
  // Si l'utilisateur a demandé moins d'animations, ou si le navigateur est trop ancien : on ne fait rien.
  const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calme || !("IntersectionObserver" in window)) return;

  // On anime les blocs de chaque section, et les cartes des grilles une par une.
  const cibles = [];
  document
    .querySelectorAll(".section .container, .page-nav-inner")
    .forEach((conteneur) => {
      Array.from(conteneur.children).forEach((el) => {
        if (el.tagName === "NOSCRIPT") return;
        if (el.matches(".card-grid, .cycle")) cibles.push(...el.children);
        else cibles.push(el);
      });
    });

  // L'observateur prévient quand un élément entre dans l'écran.
  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (!entree.isIntersecting) return;
        const el = entree.target;
        el.classList.add("is-visible");
        observateur.unobserve(el);

        // Une fois l'apparition finie, on retire les classes : le survol reprend la main.
        const fin = (e) => {
          if (e.target !== el) return;
          el.removeEventListener("transitionend", fin);
          el.classList.remove("reveal", "is-visible");
        };
        el.addEventListener("transitionend", fin);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
  );

  const compteurs = new Map();
  cibles.forEach((el) => {
    // Ce qui est déjà à l'écran au chargement reste visible tout de suite.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    // Petit décalage entre frères, pour que les cartes arrivent l'une après l'autre.
    const parent = el.parentElement;
    const rang = compteurs.get(parent) || 0;
    compteurs.set(parent, rang + 1);
    el.style.setProperty("--delai", Math.min(rang, 4) * 0.08 + "s");

    el.classList.add("reveal");
    observateur.observe(el);
  });
}

/* ---------- Carnet de voyage : un tampon par escale visitée ---------- */

// Les cinq escales du site, par nom de fichier.
const ESCALES = ["timeline", "urls", "domaines", "standards", "securite"];
const CLE_CARNET = "webatlas-escales";

// Le carnet est gardé dans le navigateur du visiteur (localStorage), jamais envoyé ailleurs.
// try/catch : en navigation privée ou si le stockage est bloqué, le site marche quand même, sans carnet.
function lireCarnet() {
  try {
    const valeur = JSON.parse(localStorage.getItem(CLE_CARNET));
    return Array.isArray(valeur) ? valeur.filter((p) => ESCALES.includes(p)) : [];
  } catch {
    return [];
  }
}

function ecrireCarnet(visitees) {
  try {
    localStorage.setItem(CLE_CARNET, JSON.stringify(visitees));
  } catch {
    // Stockage indisponible : on ne fait rien.
  }
}

function initCarnet() {
  // Sur une page de sujet : on note l'escale.
  const page = location.pathname.split("/").pop().replace(".html", "");
  const visitees = lireCarnet();
  if (ESCALES.includes(page) && !visitees.includes(page)) {
    visitees.push(page);
    ecrireCarnet(visitees);
  }

  // Sur l'accueil : un tampon sur chaque carte visitée, et le compteur.
  const compteur = document.getElementById("carnet");
  if (!compteur) return;

  document.querySelectorAll(".card").forEach((carte) => {
    const cible = carte.getAttribute("href").replace(".html", "");
    if (!visitees.includes(cible)) return;
    carte.classList.add("is-visitee");
    const tampon = document.createElement("span");
    tampon.className = "tampon";
    tampon.textContent = "Escale visitée";
    carte.appendChild(tampon);
  });

  const n = visitees.length;
  const total = ESCALES.length;
  compteur.replaceChildren();
  if (n === 0) {
    compteur.append("Ton carnet de voyage est vide : chaque escale visitée y recevra un tampon.");
  } else if (n === total) {
    compteur.append("Bravo, tu as visité les " + total + " escales ! ");
  } else {
    compteur.append("Ton carnet : " + n + " escale" + (n > 1 ? "s" : "") + " sur " + total + " visitée" + (n > 1 ? "s" : "") + ". ");
  }

  // Un bouton pour recommencer le voyage (seulement s'il y a quelque chose à effacer).
  if (n > 0) {
    const effacer = document.createElement("button");
    effacer.type = "button";
    effacer.className = "carnet-effacer";
    effacer.textContent = "Effacer mon carnet";
    effacer.addEventListener("click", () => {
      ecrireCarnet([]);
      document.querySelectorAll(".tampon").forEach((t) => t.remove());
      document.querySelectorAll(".card.is-visitee").forEach((c) => c.classList.remove("is-visitee"));
      compteur.replaceChildren("Carnet effacé : ton voyage recommence.");
    });
    compteur.appendChild(effacer);
  }
  compteur.hidden = false;
}
