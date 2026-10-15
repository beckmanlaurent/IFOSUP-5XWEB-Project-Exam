// securite.js : cartes à retourner, quiz phishing, onglets

/* ---------- 1. DONNÉES DU QUIZ ---------- */

// Tous les messages sont fictifs. Les adresses en ".example" n'existent pas.
// "phishing: true" = le message est une tentative d'hameçonnage.
const MESSAGES = [
  {
    canal: "SMS",
    de: "Livraison Express",
    corps:
      "Votre colis est bloqué. Réglez 1,99 € de frais avant ce soir : livraison-express-verif.example/paiement",
    phishing: true,
    indice:
      "Urgence, petite somme à payer et lien qui ne mène pas au site officiel du transporteur : trois signes classiques.",
  },
  {
    canal: "Courriel",
    de: "Banque Exemple <securite@banque-exemple-verif.example>",
    objet: "Votre compte sera suspendu sous 24 h",
    corps:
      "Cher client, nous avons détecté une activité inhabituelle. Cliquez sur le lien ci-dessous pour confirmer vos identifiants, sinon votre compte sera bloqué.",
    phishing: true,
    indice:
      "Menace de blocage, message générique (« Cher client ») et demande d'identifiants. Une banque ne demande pas ses identifiants par message.",
  },
  {
    canal: "Courriel",
    de: "Cabinet dentaire du Parc",
    objet: "Confirmation de rendez-vous",
    corps:
      "Bonjour, votre rendez-vous est confirmé jeudi à 10 h. Pour le déplacer, appelez-nous au numéro habituel du cabinet.",
    phishing: false,
    indice:
      "Pas de lien, pas d'urgence, aucune demande d'informations personnelles : il n'y a rien à cliquer ni à donner.",
  },
  {
    canal: "SMS",
    de: "Codes de sécurité",
    contexte:
      "Tu viens de te connecter à un site qui t'a demandé un code de vérification.",
    corps:
      "Ton code de vérification est 482913. Ne le communique à personne. Si tu n'as rien demandé, ignore ce message.",
    phishing: false,
    indice:
      "Tu as déclenché ce code toi-même, et le message ne contient aucun lien. Attention : si tu reçois un code sans l'avoir demandé, quelqu'un essaie peut-être d'entrer dans ton compte.",
  },
  {
    canal: "Courriel",
    de: "Service informatique <assistance@ecole-exemple-support.example>",
    objet: "Ton mot de passe expire aujourd'hui",
    corps:
      "Pour garder ton accès, réponds à ce message avec ton mot de passe actuel.",
    phishing: true,
    indice:
      "Personne de sérieux ne te demande ton mot de passe par message, pas même un service informatique.",
  },
  {
    canal: "Courriel",
    de: "Promotions",
    objet: "Vous avez gagné un téléphone !",
    corps:
      "Félicitations ! Vous êtes le visiteur n° 1 000 000. Cliquez ici pour réclamer votre prix avant minuit.",
    phishing: true,
    indice:
      "Un gain inattendu et une limite de temps : c'est trop beau pour être vrai.",
  },
  {
    canal: "Courriel",
    de: "Boutique en ligne <commandes@boutique-exemple.example>",
    objet: "Votre commande est expédiée",
    contexte: "Tu as passé une commande sur ce site hier.",
    corps:
      "Bonjour, votre commande n° 48210 est partie. Suivez-la depuis votre espace client, en vous connectant comme d'habitude à notre site.",
    phishing: false,
    indice:
      "Tu attendais ce message et il ne demande aucune information. En cas de doute, ouvre le site toi-même plutôt que de cliquer sur un lien.",
  },
];

/* ---------- 2. CARTES À RETOURNER ---------- */

function initCartes() {
  document.querySelectorAll("[data-flip]").forEach((carte) => {
    const bouton = carte.querySelector(".flip-btn");
    const recto = carte.querySelector(".flip-front");
    const verso = carte.querySelector(".flip-back");
    if (!bouton || !recto || !verso) return;

    // Au départ, seul le recto est lisible par les lecteurs d'écran.
    verso.setAttribute("aria-hidden", "true");

    bouton.addEventListener("click", () => {
      const retournee = carte.classList.toggle("is-flipped");
      recto.setAttribute("aria-hidden", String(retournee));
      verso.setAttribute("aria-hidden", String(!retournee));
      bouton.setAttribute("aria-expanded", String(retournee));
      bouton.textContent = retournee
        ? "Revenir au résumé"
        : "Voir comment ça marche";
    });
  });
}

/* ---------- 3. QUIZ PHISHING ---------- */

// Mélange une copie du tableau (méthode de Fisher-Yates).
function melanger(tableau) {
  const copie = tableau.slice();
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function initQuiz() {
  const zone = document.getElementById("quiz-zone");
  if (!zone) return;

  const elProgression = document.getElementById("quiz-progression");
  const elContexte = document.getElementById("quiz-contexte");
  const elMessage = document.getElementById("quiz-message");
  const elChoix = document.getElementById("quiz-choix");
  const elRetour = document.getElementById("quiz-retour");
  const elSuivant = document.getElementById("quiz-suivant");
  const elFin = document.getElementById("quiz-fin");
  const elScore = document.getElementById("quiz-score");
  const elBilan = document.getElementById("quiz-bilan");
  const elRejouer = document.getElementById("quiz-rejouer");

  let ordre = [];
  let index = 0;
  let score = 0;

  function demarrer() {
    ordre = melanger(MESSAGES);
    index = 0;
    score = 0;
    elFin.hidden = true;
    zone.hidden = false;
    afficher();
  }

  // Ajoute une ligne « Étiquette : valeur » dans la carte du message.
  function ligne(etiquette, valeur) {
    const p = document.createElement("p");
    p.className = "mail-ligne";
    const label = document.createElement("span");
    label.className = "mail-label";
    label.textContent = etiquette;
    p.appendChild(label);
    p.appendChild(document.createTextNode(" " + valeur));
    elMessage.appendChild(p);
  }

  // Affiche le message en cours et les deux boutons de réponse.
  function afficher() {
    const m = ordre[index];
    elProgression.textContent =
      "Message " + (index + 1) + " sur " + ordre.length;
    elContexte.hidden = !m.contexte;
    elContexte.textContent = m.contexte ? "Contexte : " + m.contexte : "";

    elMessage.innerHTML = "";
    ligne(m.canal === "SMS" ? "SMS de" : "De", m.de);
    if (m.objet) ligne("Objet", m.objet);
    const corps = document.createElement("p");
    corps.className = "mail-corps";
    corps.textContent = m.corps;
    elMessage.appendChild(corps);

    elRetour.hidden = true;
    elSuivant.hidden = true;
    elChoix.innerHTML = "";
    [
      ["Phishing", true],
      ["Message légitime", false],
    ].forEach(([texte, valeur]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.textContent = texte;
      b.dataset.valeur = String(valeur);
      b.addEventListener("click", () => repondre(valeur, b));
      elChoix.appendChild(b);
    });
  }

  // Corrige la réponse, bloque les boutons et explique.
  function repondre(valeur, bouton) {
    const m = ordre[index];
    const juste = valeur === m.phishing;
    if (juste) score++;

    Array.from(elChoix.children).forEach((b) => {
      b.disabled = true;
      if (b.dataset.valeur === String(m.phishing)) b.classList.add("is-ok");
    });
    if (!juste) bouton.classList.add("is-ko");

    const verdict = m.phishing
      ? "c'était un phishing."
      : "c'était un message légitime.";
    elRetour.textContent =
      (juste ? "Bien vu : " : "Pas tout à fait : ") + verdict + " " + m.indice;
    elRetour.hidden = false;

    elSuivant.textContent =
      index === ordre.length - 1 ? "Voir mon score" : "Message suivant";
    elSuivant.hidden = false;
    elSuivant.focus();
  }

  function terminer() {
    zone.hidden = true;
    elFin.hidden = false;
    elScore.textContent = "Score : " + score + " sur " + ordre.length;
    if (score === ordre.length) {
      elBilan.textContent =
        "Sans faute. Pense quand même à survoler les liens avant de cliquer.";
    } else if (score >= ordre.length / 2) {
      elBilan.textContent =
        "Bon résultat. Relis le message annoté plus haut, puis retente ta chance.";
    } else {
      elBilan.textContent =
        "Relis les quatre signes du message annoté, puis rejoue : l'ordre des messages change à chaque partie.";
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

/* ---------- 4. ONGLETS UTILISATEUR / DÉVELOPPEUR ---------- */

function initOnglets() {
  const zone = document.getElementById("onglets");
  if (!zone) return;
  const panneaux = Array.from(zone.querySelectorAll(".panneau"));

  // Les onglets sont créés ici : sans JavaScript, les deux panneaux restent visibles.
  const liste = document.createElement("div");
  liste.className = "onglets-liste";
  liste.setAttribute("role", "tablist");
  liste.setAttribute("aria-label", "Bonnes pratiques");

  const onglets = panneaux.map((panneau, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "onglet";
    b.id = "onglet-" + i;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", panneau.id);
    b.textContent = panneau.dataset.titre;
    panneau.setAttribute("role", "tabpanel");
    panneau.setAttribute("aria-labelledby", b.id);
    b.addEventListener("click", () => choisir(i, false));
    // Flèches, Début et Fin déplacent la sélection, comme sur les onglets natifs.
    b.addEventListener("keydown", (e) => {
      let cible = null;
      if (e.key === "ArrowRight") cible = (i + 1) % onglets.length;
      if (e.key === "ArrowLeft")
        cible = (i - 1 + onglets.length) % onglets.length;
      if (e.key === "Home") cible = 0;
      if (e.key === "End") cible = onglets.length - 1;
      if (cible !== null) {
        e.preventDefault();
        choisir(cible, true);
      }
    });
    liste.appendChild(b);
    return b;
  });
  zone.insertBefore(liste, zone.firstChild);

  function choisir(i, donnerFocus) {
    onglets.forEach((b, n) => {
      const actif = n === i;
      b.setAttribute("aria-selected", String(actif));
      b.tabIndex = actif ? 0 : -1;
      panneaux[n].hidden = !actif;
    });
    if (donnerFocus) onglets[i].focus();
  }
  choisir(0, false);
}

/* ---------- 4 bis. TEMPS DE FORCE BRUTE ---------- */

// Hypothèse de calcul, affichée sous le champ : 10 milliards d'essais par seconde.
const ESSAIS_PAR_SECONDE = 1e10;

// Les familles de caractères : plus il y en a, plus chaque position a de possibilités.
const FAMILLES = [
  { nom: "minuscules", test: /[a-z]/, taille: 26 },
  { nom: "majuscules", test: /[A-Z]/, taille: 26 },
  { nom: "chiffres", test: /[0-9]/, taille: 10 },
  { nom: "symboles ou accents", test: /[^a-zA-Z0-9]/, taille: 33 },
];

// Quelques mots de passe très courants : un attaquant les essaie avant tout le reste.
const COURANTS = [
  "123456", "123456789", "12345678", "password", "motdepasse", "azerty",
  "qwerty", "000000", "111111", "abc123", "soleil", "admin", "iloveyou",
];

// Transforme un nombre de secondes en durée lisible (« 3 heures », « 12 millions d'années »).
function dureeLisible(secondes) {
  if (secondes < 1) return "moins d'une seconde";
  const annees = secondes / 31557600;
  if (annees >= 1e9) return "plus d'un milliard d'années";
  if (annees >= 1e6) return Math.round(annees / 1e6) + " millions d'années";
  const UNITES = [
    [31557600, "an", "ans"],
    [86400, "jour", "jours"],
    [3600, "heure", "heures"],
    [60, "minute", "minutes"],
    [1, "seconde", "secondes"],
  ];
  for (const [duree, un, plusieurs] of UNITES) {
    if (secondes >= duree) {
      const n = Math.round(secondes / duree);
      return n.toLocaleString("fr-BE") + " " + (n > 1 ? plusieurs : un);
    }
  }
}

function initForceBrute() {
  const champ = document.getElementById("mdp");
  const criteres = document.getElementById("force-criteres");
  const jauge = document.getElementById("force-jauge");
  const temps = document.getElementById("force-temps");
  if (!champ || !criteres || !jauge || !temps) return;
  const barre = jauge.querySelector(".barre");

  function calculer() {
    const mdp = champ.value;

    // Les pastilles : longueur, puis chaque famille présente ou non.
    criteres.replaceChildren();
    const longueur = document.createElement("li");
    longueur.textContent = mdp.length + " caractère" + (mdp.length > 1 ? "s" : "");
    longueur.classList.toggle("is-ok", mdp.length >= 12);
    criteres.appendChild(longueur);

    let alphabet = 0; // nombre de caractères possibles à chaque position
    FAMILLES.forEach((f) => {
      const present = f.test.test(mdp);
      if (present) alphabet += f.taille;
      const li = document.createElement("li");
      li.textContent = (present ? "✓ " : "✗ ") + f.nom;
      li.classList.toggle("is-ok", present);
      criteres.appendChild(li);
    });

    if (!mdp) {
      jauge.dataset.niveau = "";
      barre.style.width = "0";
      temps.textContent = "Commence à taper pour voir le résultat.";
      return;
    }

    // Combinaisons = alphabet ^ longueur. En moyenne, on trouve après la moitié des essais.
    const combinaisons = Math.pow(alphabet, mdp.length);
    let secondes = combinaisons / 2 / ESSAIS_PAR_SECONDE;
    // Un mot de passe très courant, ou fait d'un ou deux caractères répétés, tombe tout de suite.
    const courant =
      COURANTS.includes(mdp.toLowerCase()) || new Set(mdp).size <= 2;
    if (courant) secondes = 0;

    // Jauge sur une échelle logarithmique : chaque dixième de la barre = environ 10 fois plus long.
    const maximum = Math.log10(31557600 * 1e9); // un milliard d'années
    const part = Math.min(Math.log10(secondes + 1) / maximum, 1);
    barre.style.width = Math.max(part * 100, 3) + "%";

    let niveau = "fort";
    if (secondes < 86400) niveau = "faible"; // moins d'un jour
    else if (secondes < 31557600 * 100) niveau = "moyen"; // moins d'un siècle
    jauge.dataset.niveau = niveau;

    const duree = dureeLisible(secondes);
    if (courant) {
      temps.textContent =
        "Trouvé immédiatement : ce mot de passe est trop courant ou trop répétitif, il est essayé en premier.";
    } else if (niveau === "faible") {
      temps.textContent = "Trop faible : trouvé en " + duree + ".";
    } else if (niveau === "moyen") {
      temps.textContent = "Moyen : trouvé en " + duree + ". Ajoute des caractères.";
    } else {
      temps.textContent = "Solide : il faudrait " + duree + ".";
    }
  }

  champ.addEventListener("input", calculer);
  calculer();
}

/* ---------- 5. DÉMARRAGE ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initCartes();
  initQuiz();
  initOnglets();
  initForceBrute();
});
