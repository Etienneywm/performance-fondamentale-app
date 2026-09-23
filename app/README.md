# Performance Fondamentale — app coaché

Application web mobile (PWA) pour les coachés de l'accompagnement Performance Fondamentale.
Elle reprend le prototype `project/Application.dc.html` (variante d'Accueil « Crème »).
Elle s'installe sur l'iPhone via Safari → Partager → « Sur l'écran d'accueil ».

## Démarrer

```bash
cd app
npm install
npm run dev       # http://localhost:5173
npm test          # tests de la logique (dates, check-in, graphiques)
npm run build     # génère dist/
```

## Configurer un coaché — `src/config.ts`

| Constante | Rôle |
| --- | --- |
| `SHEET_ENDPOINT` | URL de l'Apps Script (Web app). Vide : les envois sont seulement simulés dans la console. |
| `SHEET_URL` | Lien vers le Google Sheet du coaché (boutons « journal de sommeil »). |
| `PRENOM`, `OBJECTIF` | Affichés sur l'Accueil et le Profil. |
| `CONSULTATIONS` | Dates des consultations. Elles donnent le n° de session et le jour de consultation (bandeau + saisie des scores). |
| `GOALS`, `INITIAL_SCORES` | Objectifs des graphiques et scores déjà mesurés. **Ce sont des valeurs d'exemple, à remplacer.** |

Le contenu de la bibliothèque (titres, thèmes, durées, pratiques du jour, vidéo « À regarder ») se trouve dans `src/content.ts`.
Ajoute `src: 'https://…/fichier.mp3'` (ou `.mp4`) à un contenu pour lire le vrai média. Sans `src`, la lecture est simulée.

## Envoi vers Google Sheet

Chaque envoi fait un `POST` avec le corps `{ sheet, row }` (en `text/plain`, pour éviter le pré-vol CORS) :

- `Wellbeing` : quand le check-in est complet (3/3), puis à chaque modification.
- `Pratiques` : quand une pratique est cochée (ou l'audio écouté jusqu'au bout), et quand une vidéo est marquée comme vue.
- `Scores & Prescriptions` : quand tu cliques sur « Enregistrer mes scores ».

Le script à installer dans le Google Sheet, avec son guide pas à pas, est dans [`google-sheet/`](../google-sheet/README.md).

## Mise en ligne

Chaque modification de `main` publie automatiquement l'app sur GitHub Pages (`.github/workflows/deploy.yml`) :
https://etienneywm.github.io/performance-fondamentale-app/

## Données locales

L'état (check-in, historique, pratiques, scores, réglages) est gardé dans le `localStorage` sous la clé `pf-coache-v2`.
Chaque jour, le check-in de la veille passe dans l'historique, qui alimente les graphiques « 7 derniers jours ».

## Limites connues

- Les **rappels** du Profil enregistrent seulement la préférence. Aucune notification n'est envoyée : il faudrait un service de notifications push.
- Si l'envoi au Sheet échoue (hors ligne), il n'est pas réessayé. Les données restent quand même en local.
