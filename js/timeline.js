// timeline.js : frise interactive du web

/* ---------- 1. DONNÉES (faciles à modifier) ---------- */

// Quatre types d'étapes, chacun avec une petite icône au trait.
const TYPES = {
  reseau: {
    nom: "Réseau",
    icone:
      '<circle cx="6" cy="7" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="12" cy="17" r="2"/><path d="M8 7h8M7 9l4 6M17 9l-4 6"/>',
  },
  technologie: {
    nom: "Technologie ou standard",
    icone: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12"/>',
  },
  service: {
    nom: "Service",
    icone:
      '<path d="M5 5h14a1.5 1.5 0 011.5 1.5v8a1.5 1.5 0 01-1.5 1.5h-7l-4.5 3.5V16H5a1.5 1.5 0 01-1.5-1.5v-8A1.5 1.5 0 015 5z"/>',
  },
  appareil: {
    nom: "Appareil",
    icone:
      '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  },
};

// Les générations du web se superposent : ces repères indiquent seulement quand elles apparaissent.
const ERES = {
  avant: "Avant le web",
  web1: "Web 1.0 (dès 1989)",
  web2: "Web 2.0 (dès 2004)",
};

// Repère affiché dans la frise, déduit de l'année de l'étape.
function ereDe(etape) {
  const annee = parseInt(etape.annee, 10);
  if (isNaN(annee) || annee >= 2004) return "web2";
  return annee < 1989 ? "avant" : "web1";
}

// Les étapes, dans l'ordre. "fait" = ce qui s'est passé, "change" = ce que ça a changé.
// À vérifier dans tes sources avant de rendre.
const ETAPES = [
  {
    annee: "1969",
    titre: "ARPANET",
    type: "reseau",
    fait: "Des centres de recherche américains relient leurs ordinateurs dans un réseau expérimental. Le premier message passe entre l'UCLA et l'institut de recherche de Stanford.",
    change:
      "C'est l'ancêtre d'Internet : pour la première fois, des machines éloignées s'échangent des données.",
  },
  {
    annee: "1989-1991",
    titre: "Naissance du web au CERN",
    type: "technologie",
    fait: "Tim Berners-Lee, chercheur au CERN, imagine un système de pages reliées entre elles. Il crée le HTML, le HTTP et les URL. Le premier site est accessible au public en 1991.",
    change:
      "On peut passer d'une page à l'autre d'un simple clic, depuis n'importe quel ordinateur du réseau.",
    // Facultatif : un lien affiché sous le détail de l'étape.
    lien: {
      url: "https://info.cern.ch/hypertext/WWW/TheProject.html",
      texte: "Voir le tout premier site web, toujours en ligne",
    },
  },
  {
    annee: "1993",
    titre: "Le web devient libre",
    type: "technologie",
    fait: "Le CERN place le logiciel du web dans le domaine public. Le navigateur Mosaic arrive et affiche des images dans les pages.",
    change:
      "Tout le monde peut créer un site ou un navigateur sans payer de licence, et le web devient visuel, donc accessible au grand public.",
  },
  {
    annee: "1994",
    titre: "Le W3C et Netscape",
    type: "technologie",
    fait: "Tim Berners-Lee fonde le W3C, l'organisme qui écrit les standards du web. La même année sort le navigateur Netscape Navigator.",
    change:
      "Le web a un organisme qui fixe des règles communes, et un navigateur qui le fait connaître au grand public.",
  },
  {
    annee: "1995",
    titre: "JavaScript",
    type: "technologie",
    fait: "Brendan Eich crée JavaScript chez Netscape, en quelques jours.",
    change:
      "Les pages ne sont plus de simples textes : elles réagissent aux clics, vérifient les formulaires et s'animent.",
  },
  {
    annee: "1995",
    titre: "Amazon et eBay",
    type: "service",
    fait: "Amazon ouvre sa librairie en ligne et eBay lance son site d'enchères entre particuliers.",
    change:
      "Acheter et vendre sur le web devient possible : le commerce en ligne est né.",
  },
  {
    annee: "1996",
    titre: "CSS",
    type: "technologie",
    fait: "Le W3C publie la première version du CSS, le langage qui décrit l'apparence des pages.",
    change:
      "On sépare le contenu (le HTML) de la mise en forme (le CSS) : changer le design de tout un site ne demande plus de réécrire chaque page.",
  },
  {
    annee: "1998",
    titre: "Google",
    type: "service",
    fait: "Larry Page et Sergey Brin lancent Google, un moteur de recherche qui classe les pages selon les liens qui pointent vers elles.",
    change:
      "Trouver une information sur un web qui grandit vite devient simple, et la recherche devient la porte d'entrée du web.",
  },
  {
    annee: "2001",
    titre: "Wikipédia",
    type: "service",
    fait: "L'encyclopédie en ligne Wikipédia est lancée : chacun peut écrire et corriger les articles.",
    change:
      "Le savoir se construit à plusieurs, grâce à des milliers de contributeurs.",
  },
  {
    annee: "2001",
    titre: "Le W3C lance le web sémantique",
    type: "technologie",
    fait: "En février 2001, le W3C lance ses travaux sur le web sémantique, aussi appelé web de données. Des langages comme RDF, puis OWL, permettent de décrire le sens des données. On l'appellera plus tard le « Web 3.0 ».",
    change:
      "Au lieu de simples pages à lire, le web devient un web de données : chaque information est accompagnée d'une description que les machines comprennent.",
  },
  {
    annee: "2004",
    titre: "Le Web 2.0 et Facebook",
    type: "service",
    fait: "L'expression « Web 2.0 » apparaît en 1999 sous la plume de Darcy DiNucci. Elle devient populaire en 2004, avec la première conférence Web 2.0 organisée par Tim O'Reilly et Dale Dougherty. La même année, Facebook est lancé.",
    change:
      "Les visiteurs ne se contentent plus de lire : ils publient, commentent et partagent. Wikis, blogs et réseaux sociaux deviennent des lieux centraux du web.",
  },
  {
    annee: "2005",
    titre: "YouTube",
    type: "service",
    fait: "YouTube ouvre et permet à n'importe qui de publier une vidéo.",
    change:
      "La vidéo devient un contenu courant du web, et chacun peut diffuser à un public du monde entier.",
  },
  {
    annee: "2007",
    titre: "L'iPhone",
    type: "appareil",
    fait: "Apple lance l'iPhone, un téléphone avec un écran tactile et un vrai navigateur.",
    change:
      "Le web se consulte partout, dans la poche. Les sites doivent s'adapter aux petits écrans, ce qui prépare le design responsive.",
  },
  {
    annee: "2010",
    titre: "Le Web 3.0 s'installe",
    type: "technologie",
    fait: "Selon l'article de référence, la troisième génération du web existe depuis 2010. Ses technologies, comme RDF, OWL et SPARQL, sont déjà utilisées sur certaines parties du web.",
    change:
      "Les machines comprennent mieux le contenu des pages. Par exemple, un moteur de recherche peut afficher directement le temps de préparation d'une recette, parce que la page décrit cette information de façon standard.",
  },
  {
    annee: "2014",
    titre: "HTML5",
    type: "technologie",
    fait: "Le W3C publie HTML5 comme recommandation officielle.",
    change:
      "La vidéo, le son et le dessin s'intègrent directement dans les pages, sans extension comme Flash.",
  },
  {
    annee: "Aujourd'hui",
    titre: "Les trois générations cohabitent",
    type: "technologie",
    fait: "Les pages statiques du Web 1.0, les sites participatifs du Web 2.0 et les données décrites du Web 3.0 existent en même temps. Le Web 3.0 est présent dans certaines parties du web, sans les couvrir toutes.",
    change:
      "Le web actuel mélange les trois générations, chacune avec ses technologies.",
  },
];

// Une illustration par étape (dessins SVG du dossier img/frise), avec son texte alternatif.
// La clé est le titre de l'étape.
const IMAGES = {
  ARPANET: ["arpanet", "Quatre ordinateurs reliés entre eux par un réseau"],
  "Naissance du web au CERN": ["cern", "Un écran affichant une page avec des liens, à côté d'un ordinateur en forme de cube"],
  "Le web devient libre": ["libre", "Une fenêtre de navigateur qui affiche une image à côté du texte"],
  "Le W3C et Netscape": ["w3c-netscape", "Un document de règles validé, à côté d'une fenêtre de navigateur"],
  JavaScript: ["javascript", "Une page avec un bouton sur lequel on clique, et des accolades de code"],
  "Amazon et eBay": ["amazon-ebay", "Un chariot de courses avec un colis et une étiquette de prix"],
  CSS: ["css", "Une page de texte brut transformée en page mise en forme"],
  Google: ["google", "Une barre de recherche suivie d'une liste de résultats"],
  "Wikipédia": ["wikipedia", "Un livre ouvert et un crayon qui écrit dedans"],
  "Le W3C lance le web sémantique": ["semantique", "Des données reliées entre elles par des liens étiquetés"],
  "Le Web 2.0 et Facebook": ["web2-facebook", "Deux bulles de conversation, dont une avec un cœur"],
  YouTube: ["youtube", "Une vidéo avec un bouton de lecture et une barre de progression"],
  "L'iPhone": ["iphone", "Un smartphone qui affiche une page web"],
  "Le Web 3.0 s'installe": ["web3-2010", "Un résultat de recherche enrichi : photo, note en étoiles et temps de préparation"],
  HTML5: ["html5", "Une page qui contient une vidéo et une onde sonore"],
  "Les trois générations cohabitent": ["aujourdhui", "Trois pages superposées, marquées 1.0, 2.0 et 3.0"],
};

/* ---------- 2. AFFICHAGE ---------- */

// Fabrique l'icône SVG d'un type d'étape.
function icone(type) {
  return (
    '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true">' +
    TYPES[type].icone +
    "</svg>"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const liste = document.getElementById("frise");
  const detail = document.getElementById("frise-detail");
  const prec = document.getElementById("frise-prec");
  const suiv = document.getElementById("frise-suiv");
  if (!liste || !detail) return;

  // Si l'utilisateur a demandé moins d'animations, on défile sans transition.
  const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let courant = 0;

  // Un bouton par étape, dans un élément de liste.
  // Une étiquette s'insère dans la frise à chaque changement d'époque.
  let ereCourante = null;
  const elements = ETAPES.map((etape, i) => {
    const ere = ereDe(etape);
    if (ere !== ereCourante) {
      const repere = document.createElement("li");
      repere.className = "frise-ere";
      repere.innerHTML = "<span>" + ERES[ere] + "</span>";
      liste.appendChild(repere);
      ereCourante = ere;
    }
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "step";
    b.setAttribute("aria-pressed", "false");
    b.innerHTML =
      icone(etape.type) +
      '<span class="step-year">' +
      etape.annee +
      "</span>" +
      '<span class="step-title">' +
      etape.titre +
      "</span>";
    b.addEventListener("click", () => choisir(i, true));
    li.appendChild(b);
    liste.appendChild(li);
    return li;
  });

  // Sélectionne une étape : met en évidence la carte et remplit le détail.
  function choisir(i, defiler) {
    if (i < 0 || i >= ETAPES.length) return;
    courant = i;
    const etape = ETAPES[i];

    elements.forEach((li, n) => {
      li.classList.toggle("is-active", n === i);
      li.firstChild.setAttribute("aria-pressed", String(n === i));
    });

    let texte =
      '<p class="step-meta">' +
      icone(etape.type) +
      TYPES[etape.type].nom +
      "</p>" +
      "<h3>" +
      etape.annee +
      ", " +
      etape.titre +
      "</h3>" +
      "<p><strong>Ce qui s'est passé.</strong> " +
      etape.fait +
      "</p>" +
      "<p><strong>Ce que ça a changé.</strong> " +
      etape.change +
      "</p>";

    // Certaines étapes ont un lien vers une page d'époque, ouvert dans un nouvel onglet.
    if (etape.lien) {
      texte +=
        '<p><a href="' +
        etape.lien.url +
        '" target="_blank" rel="noopener">' +
        etape.lien.texte +
        " (nouvel onglet)</a></p>";
    }

    // L'illustration à gauche (au-dessus sur téléphone), le texte à droite.
    const image = IMAGES[etape.titre];
    detail.classList.toggle("avec-image", Boolean(image));
    detail.innerHTML = image
      ? '<img class="step-image" src="img/frise/' +
        image[0] +
        '.svg" alt="' +
        image[1] +
        '" width="160" height="120"><div>' +
        texte +
        "</div>"
      : texte;

    prec.disabled = i === 0;
    suiv.disabled = i === ETAPES.length - 1;

    // On fait défiler la frise pour centrer la carte choisie (sans bouger la page).
    if (defiler) {
      elements[i].scrollIntoView({
        behavior: calme ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }

  prec.addEventListener("click", () => choisir(courant - 1, true));
  suiv.addEventListener("click", () => choisir(courant + 1, true));

  choisir(0, false);
});
