# WebAtlas

Site de veille qui explique cinq notions du web à des débutants : la timeline du web, les URL, les noms de domaine, les standards du web et la sécurité.

Projet réalisé par Laurent Beckman, en première année de Web Developer (IFOSUP), pour le cours Environnement et technologies Web.

## Contenu

| Page | Sujet | Élément interactif |
|---|---|---|
| `index.html` | Accueil | Cartes vers les cinq sujets, carnet de voyage (un tampon par escale visitée) |
| `timeline.html` | Timeline du web | Frise à faire défiler, lien vers le premier site web |
| `urls.html` | Les URL | Adresse découpée, « colle ton URL », jeu « devine le code » |
| `domaines.html` | Les noms de domaine | Calcul des prix, DNS pas à pas, jeu « remets dans l'ordre » |
| `standards.html` | Les standards du web | Jeu « qui écrit cette règle ? », curseur avec / sans standards |
| `securite.html` | La sécurité | Cartes à retourner, quiz phishing, temps de force brute d'un mot de passe |
| `sources.html` | Sources et auteurs | Tableau des sources |

## Technique

- Site statique : HTML, CSS (`css/style.css`) et JavaScript (`js/`) dans des fichiers séparés.
- Aucun serveur, aucune clé d'API. Polices chargées depuis Google Fonts.
- Images : icônes (`img/icones/`) et illustrations de la frise (`img/frise/`) dessinées en SVG pour le site.
- Publié sur Vercel. Pour le voir en local, ouvrir `index.html` dans un navigateur.

## Outils d'IA

Claude (Anthropic) a aidé à expliquer les sujets, à rédiger les textes et à écrire le code. Les sources de chaque sujet sont listées sur la page `sources.html`.
