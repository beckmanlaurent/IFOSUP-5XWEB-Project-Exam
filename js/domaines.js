// domaines.js : DNS pas à pas et comparateur de prix

/* ---------- 1. DONNÉES ---------- */

// Les cinq étapes d'une recherche DNS (dans l'ordre des flèches du schéma).
const ETAPES_DNS = [
  "Tu tapes exemple.be. Le navigateur ne connaît pas l'adresse IP : il la demande à un résolveur DNS, en général celui de ton fournisseur d'accès.",
  "Si le résolveur ne connaît pas déjà la réponse, il interroge l'annuaire du DNS : d'abord la racine, puis les serveurs du .be, puis ceux du domaine exemple.be.",
  "Le serveur DNS du domaine répond avec l'adresse IP du site.",
  "Le résolveur garde la réponse en mémoire (le cache) pour aller plus vite la prochaine fois, puis il transmet l'adresse IP au navigateur.",
  "Le navigateur contacte le serveur du site à cette adresse IP. Le serveur envoie la page.",
];

// Mise en forme des prix en euros (format belge).
const EURO = new Intl.NumberFormat("fr-BE", {
  style: "currency",
  currency: "EUR",
});

/* ---------- 2. DNS PAS À PAS ---------- */

function initDNS() {
  const texte = document.getElementById("dns-texte");
  const compteur = document.getElementById("dns-compteur");
  const prec = document.getElementById("dns-prec");
  const suiv = document.getElementById("dns-suiv");
  const fleches = document.querySelectorAll(".dns-etape");
  if (!texte || !prec || !suiv) return;

  let courant = 0;

  function afficher() {
    texte.textContent = ETAPES_DNS[courant];
    compteur.textContent =
      "Étape " + (courant + 1) + " sur " + ETAPES_DNS.length;
    prec.disabled = courant === 0;
    suiv.disabled = courant === ETAPES_DNS.length - 1;

    // Les flèches déjà passées restent visibles, la flèche active est en pleine couleur.
    fleches.forEach((g) => {
      const n = Number(g.dataset.etape);
      g.classList.toggle("is-actif", n === courant + 1);
      g.classList.toggle("is-vu", n < courant + 1);
    });
  }

  prec.addEventListener("click", () => {
    courant--;
    afficher();
  });
  suiv.addEventListener("click", () => {
    courant++;
    afficher();
  });
  afficher();
}

/* ---------- 3. COMPARATEUR DE PRIX ---------- */

function initPrix() {
  const lignes = document.querySelectorAll("#table-prix tbody tr");
  const curseur = document.getElementById("duree");
  const sortie = document.getElementById("duree-valeur");
  const zone = document.getElementById("barres");
  if (!lignes.length || !curseur || !zone) return;

  // On lit les prix dans le tableau HTML : une seule source de vérité.
  const extensions = Array.from(lignes).map((tr) => ({
    nom: tr.dataset.ext,
    creation: Number(tr.dataset.creation),
    renouvellement: Number(tr.dataset.renouv),
  }));

  function afficher() {
    const annees = Number(curseur.value);
    sortie.textContent = annees;

    // Coût total = première année + (années - 1) renouvellements.
    const totaux = extensions.map((e) => ({
      nom: e.nom,
      total: e.creation + (annees - 1) * e.renouvellement,
    }));
    const maximum = Math.max(...totaux.map((t) => t.total));

    zone.innerHTML = "";
    totaux.forEach((t) => {
      const ligne = document.createElement("div");
      ligne.className = "barre-ligne";
      ligne.innerHTML =
        "<strong>" +
        t.nom +
        "</strong>" +
        '<span class="barre-fond"><span class="barre" style="width:' +
        (t.total / maximum) * 100 +
        '%"></span></span>' +
        '<span class="barre-valeur">' +
        EURO.format(t.total) +
        "</span>";
      zone.appendChild(ligne);
    });
  }

  curseur.addEventListener("input", afficher);
  afficher();
}

/* ---------- 3 bis. JEU « REMETS DANS L'ORDRE » ---------- */

// Le bon ordre, le même que la liste de la page.
const CYCLE = ["Actif", "Expiré", "Rachat", "Supprimé", "Disponible"];

function initOrdre() {
  const liste = document.getElementById("ordre-liste");
  const verifier = document.getElementById("ordre-verifier");
  const melangerBouton = document.getElementById("ordre-melanger");
  const retour = document.getElementById("ordre-retour");
  if (!liste || !verifier || !melangerBouton || !retour) return;

  let ordre = [];

  // Mélange (Fisher-Yates) jusqu'à obtenir un ordre différent du bon.
  function melanger() {
    do {
      ordre = CYCLE.slice();
      for (let i = ordre.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
      }
    } while (ordre.every((etape, i) => etape === CYCLE[i]));
    retour.hidden = true;
    afficher(null);
  }

  // Fabrique une flèche ; elle est désactivée au bout de la liste.
  function fleche(texte, etiquette, sens, desactivee, action) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ordre-fleche";
    b.textContent = texte;
    b.setAttribute("aria-label", etiquette);
    b.dataset.sens = sens;
    b.disabled = desactivee;
    b.addEventListener("click", action);
    return b;
  }

  // Échange une étape avec sa voisine (sens = -1 pour monter, 1 pour descendre).
  function deplacer(i, sens) {
    const j = i + sens;
    [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
    retour.hidden = true;
    afficher({ index: j, sens: sens });
  }

  function afficher(focus) {
    liste.replaceChildren();
    ordre.forEach((etape, i) => {
      const li = document.createElement("li");
      li.className = "ordre-item";
      const numero = document.createElement("span");
      numero.className = "ordre-num";
      numero.textContent = i + 1 + ".";
      const nom = document.createElement("span");
      nom.className = "ordre-nom";
      nom.textContent = etape;
      li.append(
        numero,
        nom,
        fleche("↑", "Monter « " + etape + " »", -1, i === 0, () => deplacer(i, -1)),
        fleche("↓", "Descendre « " + etape + " »", 1, i === ordre.length - 1, () => deplacer(i, 1)),
      );
      liste.appendChild(li);
    });

    // Au clavier, le focus suit l'étape déplacée pour pouvoir continuer à la bouger.
    if (focus) {
      const li = liste.children[focus.index];
      const meme = li.querySelector('[data-sens="' + focus.sens + '"]');
      (meme.disabled ? li.querySelector("button:not(:disabled)") : meme).focus();
    }
  }

  verifier.addEventListener("click", () => {
    let bien = 0;
    Array.from(liste.children).forEach((li, i) => {
      const juste = ordre[i] === CYCLE[i];
      if (juste) bien++;
      li.classList.toggle("is-ok", juste);
      li.classList.toggle("is-ko", !juste);
      // Le résultat est aussi écrit en toutes lettres, pas seulement en couleur.
      const marque = document.createElement("span");
      marque.className = "ordre-marque";
      marque.textContent = juste ? "bien placée" : "à déplacer";
      li.querySelector(".ordre-marque")?.remove();
      li.insertBefore(marque, li.querySelector(".ordre-fleche"));
    });
    retour.textContent =
      bien === CYCLE.length
        ? "Parfait : actif, expiré, rachat, supprimé, puis disponible pour tout le monde."
        : bien + " étape(s) sur " + CYCLE.length + " à la bonne place. Déplace celles marquées « à déplacer », puis vérifie à nouveau.";
    retour.hidden = false;
  });

  melangerBouton.addEventListener("click", melanger);
  melanger();
}

/* ---------- 4. DÉMARRAGE ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initDNS();
  initPrix();
  initOrdre();
});
