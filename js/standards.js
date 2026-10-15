// standards.js : curseur « avec / sans standards » et jeu « qui écrit cette règle ? »

// Les trois niveaux du curseur (0, 1, 2).
const NIVEAUX = [
  {
    nom: "Avec les standards",
    texte:
      "Les deux navigateurs suivent les mêmes règles : la page s'affiche de la même façon partout.",
  },
  {
    nom: "Standards peu respectés",
    texte:
      "Chaque navigateur interprète certaines règles à sa façon. Les polices, les espacements et les boutons ne sont plus les mêmes.",
  },
  {
    nom: "Aucun standard",
    texte:
      "Chaque navigateur fait ce qu'il veut. Le menu, l'image et le bouton sont cassés : il faudrait écrire une version du site pour chaque navigateur.",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const demo = document.getElementById("demo");
  const curseur = document.getElementById("niveau");
  const nom = document.getElementById("niveau-nom");
  const texte = document.getElementById("niveau-texte");
  if (!demo || !curseur || !nom || !texte) return;

  // Le JavaScript ne fait que changer data-niveau : c'est le CSS qui déforme le navigateur B.
  function afficher() {
    const n = Number(curseur.value);
    demo.dataset.niveau = n;
    nom.textContent = NIVEAUX[n].nom;
    texte.textContent = NIVEAUX[n].texte;
    curseur.setAttribute("aria-valuetext", NIVEAUX[n].nom);
  }

  curseur.addEventListener("input", afficher);
  afficher();
});

/* ---------- JEU « QUI ÉCRIT CETTE RÈGLE ? » ---------- */

const ORGANISMES = ["W3C", "WHATWG", "IETF", "Ecma", "ICANN"];

// Les questions. "rep" est le bon organisme, "expl" s'affiche après la réponse.
const QUESTIONS_ORGA = [
  {
    q: "Le HTML d'aujourd'hui, le « Living Standard » qui évolue en continu.",
    rep: "WHATWG",
    expl: "Le WHATWG maintient le HTML. Depuis 2019, le W3C travaille avec lui sur cette version unique.",
  },
  {
    q: "Le CSS, le langage qui décrit l'apparence des pages.",
    rep: "W3C",
    expl: "Le W3C écrit les règles du CSS.",
  },
  {
    q: "HTTP, le protocole qui transporte les pages entre le serveur et ton navigateur.",
    rep: "IETF",
    expl: "L'IETF écrit les protocoles d'Internet dans des documents appelés RFC.",
  },
  {
    q: "La norme ECMAScript, sur laquelle repose JavaScript.",
    rep: "Ecma",
    expl: "Ecma International publie ECMAScript : c'est pour ça qu'un même script marche dans tous les navigateurs.",
  },
  {
    q: "Le système des noms de domaine, comme .be ou .com.",
    rep: "ICANN",
    expl: "L'ICANN coordonne les noms de domaine et les adresses IP dans le monde.",
  },
  {
    q: "Les règles d'accessibilité WCAG, pour un web utilisable par tous.",
    rep: "W3C",
    expl: "Les WCAG sont publiées par le W3C.",
  },
  {
    q: "Le standard URL, qui dit comment découper une adresse web.",
    rep: "WHATWG",
    expl: "Le WHATWG publie le « URL Standard », cité sur la page Sources.",
  },
];

// Mélange une copie du tableau (méthode de Fisher-Yates).
function melanger(tableau) {
  const copie = tableau.slice();
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function initJeuOrganismes() {
  const zone = document.getElementById("orga-zone");
  if (!zone) return;

  const elProgression = document.getElementById("orga-progression");
  const elQuestion = document.getElementById("orga-question");
  const elChoix = document.getElementById("orga-choix");
  const elRetour = document.getElementById("orga-retour");
  const elSuivant = document.getElementById("orga-suivant");
  const elFin = document.getElementById("orga-fin");
  const elScore = document.getElementById("orga-score");
  const elMessage = document.getElementById("orga-message");
  const elRejouer = document.getElementById("orga-rejouer");

  let ordre = [];
  let index = 0;
  let score = 0;

  function demarrer() {
    ordre = melanger(QUESTIONS_ORGA);
    index = 0;
    score = 0;
    elFin.hidden = true;
    zone.hidden = false;
    afficher();
  }

  // Affiche la question en cours et un bouton par organisme.
  function afficher() {
    const question = ordre[index];
    elProgression.textContent =
      "Question " + (index + 1) + " sur " + ordre.length;
    elQuestion.textContent = question.q;
    elRetour.hidden = true;
    elSuivant.hidden = true;
    elChoix.innerHTML = "";

    ORGANISMES.forEach((orga) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.textContent = orga;
      b.addEventListener("click", () => repondre(orga, b));
      elChoix.appendChild(b);
    });
  }

  // Corrige la réponse, bloque les boutons et explique.
  function repondre(orga, bouton) {
    const question = ordre[index];
    const juste = orga === question.rep;
    if (juste) score++;

    Array.from(elChoix.children).forEach((b) => {
      b.disabled = true;
      if (b.textContent === question.rep) b.classList.add("is-ok");
    });
    if (!juste) bouton.classList.add("is-ko");

    elRetour.textContent =
      (juste
        ? "Bien vu ! "
        : "Pas tout à fait, c'était " + question.rep + ". ") + question.expl;
    elRetour.hidden = false;

    elSuivant.textContent =
      index === ordre.length - 1 ? "Voir mon score" : "Question suivante";
    elSuivant.hidden = false;
    elSuivant.focus();
  }

  function terminer() {
    zone.hidden = true;
    elFin.hidden = false;
    elScore.textContent = "Score : " + score + " sur " + ordre.length;
    if (score === ordre.length) {
      elMessage.textContent = "Sans faute. Tu sais qui fait les règles du web.";
    } else {
      elMessage.textContent =
        "Relis les cartes des organismes plus haut, puis rejoue : les questions changent d'ordre à chaque partie.";
    }
    elRejouer.focus();
  }

  elSuivant.addEventListener("click", () => {
    if (index < ordre.length - 1) {
      index++;
      afficher();
    } else {
      terminer();
    }
  });
  elRejouer.addEventListener("click", demarrer);
  demarrer();
}

document.addEventListener("DOMContentLoaded", initJeuOrganismes);
