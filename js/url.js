// url.js : décomposeur d'adresse et jeu « devine le code »

/* ---------- 1. DONNÉES (faciles à modifier) ---------- */

// Les cinq morceaux de l'adresse d'exemple, dans l'ordre.
// Mis bout à bout, leurs "texte" recomposent l'URL complète.
const SEGMENTS = [
  {
    id: 1,
    texte: "https://",
    nom: "Le schéma",
    explication:
      "Il dit comment le navigateur doit parler au serveur. « https » signifie que l'échange est chiffré, « http » qu'il ne l'est pas. Le numéro de port est alors sous-entendu (443 pour https, 80 pour http), c'est pour ça qu'on ne le voit pas.",
  },
  {
    id: 2,
    texte: "fr.wikipedia.org",
    nom: "Le nom de domaine",
    explication:
      "C'est le nom du site, qui indique quel serveur contacter. Ici, wikipedia.org est le domaine et « fr » est un sous-domaine : la version française. Le DNS transforme ensuite ce nom en adresse IP.",
  },
  {
    id: 3,
    texte: "/wiki/Conception_de_site_web",
    nom: "Le chemin",
    explication:
      "Il indique quelle page ou quel fichier demander sur le serveur, un peu comme les dossiers d'un ordinateur. Ici : la page « Conception de site web », dans la partie /wiki/ du site.",
  },
  {
    id: 4,
    texte: "?id=42",
    nom: "Les paramètres",
    explication:
      "Après le « ? », on envoie des informations au serveur sous la forme nom=valeur. Plusieurs paramètres se séparent avec « & ». Ici, id=42 est un paramètre ajouté pour l'exemple.",
  },
  {
    id: 5,
    texte: "#Premiers_pas",
    nom: "L'ancre",
    explication:
      "Après le « # », le navigateur fait défiler la page jusqu'à un endroit précis, par exemple un titre. L'ancre n'est pas envoyée au serveur : tout se passe dans le navigateur.",
  },
];

// Les situations du jeu. "rep" est le bon code.
const QUESTIONS = [
  {
    q: "Tu cliques sur un lien : la page existe et s'affiche normalement.",
    rep: "200",
    expl: "Le serveur a trouvé la page et l'a envoyée. Tout va bien.",
  },
  {
    q: "Tu tapes l'adresse d'un article, avec une faute de frappe dans le chemin.",
    rep: "404",
    expl: "Le serveur fonctionne, mais il ne trouve rien à cette adresse.",
  },
  {
    q: "Un site de boutique qui marche d'habitude plante pendant qu'il prépare la page. Tu vois un message d'erreur.",
    rep: "500",
    expl: "Le problème vient du serveur, pas du visiteur.",
  },
  {
    q: "Une entreprise change définitivement de nom de domaine. L'ancienne adresse envoie automatiquement vers la nouvelle.",
    rep: "301",
    expl: "C'est un déménagement définitif : navigateurs et moteurs de recherche retiennent la nouvelle adresse.",
  },
  {
    q: "Un site envoie ses visiteurs vers une page « maintenance » pendant une heure, puis tout redevient normal.",
    rep: "302",
    expl: "C'est un déménagement temporaire : l'ancienne adresse reste la bonne.",
  },
  {
    q: "Tu ouvres un vieux lien vers une page supprimée il y a des années.",
    rep: "404",
    expl: "La page n'existe plus à cette adresse.",
  },
  {
    q: "Tu tapes http:// devant un site qui te renvoie toujours vers sa version en https://.",
    rep: "301",
    expl: "Le site a décidé une fois pour toutes que la bonne adresse est la version https.",
  },
];

const CODES = ["200", "301", "302", "404", "500"];

/* ---------- 2. DÉCOMPOSEUR ---------- */

function initDecomposeur() {
  const zone = document.getElementById("url-parts");
  const panneau = document.getElementById("url-explication");
  if (!zone || !panneau) return;

  // Un bouton par morceau d'adresse.
  const boutons = SEGMENTS.map((seg) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "url-part";
    b.dataset.seg = seg.id;
    b.textContent = seg.texte;
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => choisir(seg, b));
    b.addEventListener("mouseenter", () => choisir(seg, b));
    zone.appendChild(b);
    return b;
  });

  // Met à jour le bouton actif et le texte d'explication.
  function choisir(seg, bouton) {
    boutons.forEach((b) =>
      b.setAttribute("aria-pressed", String(b === bouton)),
    );
    panneau.dataset.seg = seg.id;
    panneau.querySelector("h3").textContent = seg.nom;
    panneau.querySelector("p").textContent = seg.explication;
  }

  choisir(SEGMENTS[0], boutons[0]);
}

/* ---------- 2 bis. « COLLE TON URL » ---------- */

// Découpe n'importe quelle adresse grâce à l'objet URL, intégré au navigateur.
// Tout est écrit avec textContent, jamais innerHTML : un texte collé ne peut pas injecter de code dans la page.
function initDecoupeLibre() {
  const formulaire = document.getElementById("url-form");
  const saisie = document.getElementById("url-saisie");
  const erreur = document.getElementById("url-erreur");
  const resultat = document.getElementById("url-resultat");
  const info = document.getElementById("url-info");
  const morceaux = document.getElementById("url-perso");
  const legende = document.getElementById("url-legende");
  if (!formulaire || !saisie) return;

  function afficherErreur(message) {
    erreur.textContent = message;
    erreur.hidden = false;
    resultat.hidden = true;
  }

  formulaire.addEventListener("submit", (e) => {
    e.preventDefault(); // le formulaire ne recharge pas la page
    let texte = saisie.value.trim();
    if (!texte) return afficherErreur("Colle d'abord une adresse dans le champ.");
    // Une adresse ne contient jamais d'espace : certains navigateurs l'acceptent quand même, pas nous.
    if (/\s/.test(texte)) {
      return afficherErreur("Une adresse ne contient pas d'espace. Vérifie ce que tu as collé.");
    }

    // Sans schéma (par exemple « www.ifosup.be »), on ajoute https:// comme le fait le navigateur.
    const ajoute = !/^[a-z][a-z0-9+.-]*:/i.test(texte);
    if (ajoute) texte = "https://" + texte;

    let url;
    try {
      url = new URL(texte); // provoque une erreur si l'adresse est mal formée
    } catch {
      return afficherErreur(
        "Cette adresse n'est pas valide. Vérifie qu'il n'y a pas de caractère en trop.",
      );
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return afficherErreur(
        "Ce n'est pas une adresse web : elle doit commencer par http:// ou https://.",
      );
    }

    // Les morceaux présents, avec le même numéro de couleur que l'exemple du dessus.
    const liste = [
      {
        seg: 1,
        texte: url.protocol + "//",
        nom: "Le schéma",
        expl:
          url.protocol === "https:"
            ? "https : l'échange est chiffré."
            : "http : l'échange n'est pas chiffré, évite d'y taper un mot de passe.",
      },
      {
        seg: 2,
        texte: url.host,
        nom: "Le nom de domaine",
        expl:
          "Le serveur à contacter." +
          (url.port ? " Le nombre après « : » est le numéro de port." : ""),
      },
      {
        seg: 3,
        texte: url.pathname,
        nom: "Le chemin",
        expl:
          url.pathname === "/"
            ? "Juste « / » : c'est la page d'accueil du site."
            : "La page demandée sur le serveur.",
      },
    ];
    if (url.search) {
      // searchParams range déjà chaque paramètre en paires nom / valeur.
      const params = Array.from(
        url.searchParams,
        ([nom, valeur]) => nom + " = " + (valeur || "(vide)"),
      );
      liste.push({
        seg: 4,
        texte: url.search,
        nom: "Les paramètres",
        expl: params.length + " paramètre(s) : " + params.join(" ; "),
      });
    }
    if (url.hash) {
      liste.push({
        seg: 5,
        texte: url.hash,
        nom: "L'ancre",
        expl: "L'endroit de la page où aller. Elle n'est pas envoyée au serveur.",
      });
    }

    // On vide l'ancien résultat, puis on affiche un morceau coloré et une explication par élément.
    morceaux.replaceChildren();
    legende.replaceChildren();
    liste.forEach((m) => {
      const morceau = document.createElement("span");
      morceau.className = "url-morceau";
      morceau.dataset.seg = m.seg;
      morceau.textContent = m.texte;
      morceaux.appendChild(morceau);

      const li = document.createElement("li");
      li.dataset.seg = m.seg;
      const titre = document.createElement("strong");
      titre.textContent = m.nom + " : ";
      li.append(titre, m.expl);
      legende.appendChild(li);
    });

    info.hidden = !ajoute;
    info.textContent = ajoute
      ? "Il manquait le schéma : on a ajouté https:// devant, comme le fait ton navigateur."
      : "";
    erreur.hidden = true;
    resultat.hidden = false;
  });
}

/* ---------- 3. JEU « DEVINE LE CODE » ---------- */

// Mélange une copie du tableau (méthode de Fisher-Yates).
function melanger(tableau) {
  const copie = tableau.slice();
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function initJeu() {
  const zone = document.getElementById("jeu-zone");
  if (!zone) return;

  const elProgression = document.getElementById("jeu-progression");
  const elScenario = document.getElementById("jeu-scenario");
  const elChoix = document.getElementById("jeu-choix");
  const elRetour = document.getElementById("jeu-retour");
  const elSuivant = document.getElementById("jeu-suivant");
  const elFin = document.getElementById("jeu-fin");
  const elScore = document.getElementById("jeu-score");
  const elMessage = document.getElementById("jeu-message");
  const elRejouer = document.getElementById("jeu-rejouer");

  let ordre = [];
  let index = 0;
  let score = 0;

  function demarrer() {
    ordre = melanger(QUESTIONS);
    index = 0;
    score = 0;
    elFin.hidden = true;
    zone.hidden = false;
    afficher();
  }

  // Affiche la question en cours et ses cinq boutons.
  function afficher() {
    const question = ordre[index];
    elProgression.textContent =
      "Question " + (index + 1) + " sur " + ordre.length;
    elScenario.textContent = question.q;
    elRetour.hidden = true;
    elSuivant.hidden = true;
    elChoix.innerHTML = "";

    CODES.forEach((code) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.textContent = code;
      b.addEventListener("click", () => repondre(code, b));
      elChoix.appendChild(b);
    });
  }

  // Corrige la réponse, bloque les boutons et explique.
  function repondre(code, bouton) {
    const question = ordre[index];
    const juste = code === question.rep;
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

  function suivant() {
    if (index < ordre.length - 1) {
      index++;
      afficher();
    } else {
      terminer();
    }
  }

  function terminer() {
    zone.hidden = true;
    elFin.hidden = false;
    elScore.textContent = "Score : " + score + " sur " + ordre.length;
    if (score === ordre.length) {
      elMessage.textContent =
        "Sans faute. Tu lis les codes comme un navigateur.";
    } else if (score >= ordre.length / 2) {
      elMessage.textContent =
        "Bon résultat. Relis le tableau des codes et retente ta chance.";
    } else {
      elMessage.textContent =
        "Relis le tableau des codes plus haut, puis rejoue : les situations changent d'ordre à chaque partie.";
    }
    elRejouer.focus();
  }

  elSuivant.addEventListener("click", suivant);
  elRejouer.addEventListener("click", demarrer);
  demarrer();
}

/* ---------- 4. DÉMARRAGE ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initDecomposeur();
  initDecoupeLibre();
  initJeu();
});
