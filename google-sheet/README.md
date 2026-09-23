# Relier l'app au Google Sheet du coaché

À faire une fois par coaché, dans **son** Google Sheet.

1. Ouvre le Google Sheet du coaché → menu **Extensions → Apps Script**.
2. Efface le contenu de `Code.gs`, colle tout le fichier [`Code.gs`](Code.gs) de ce dossier, puis clique sur 💾 (Enregistrer).
3. Clique sur **Déployer → Nouveau déploiement**.
   - ⚙️ à côté de « Sélectionner le type » → **Application Web**.
   - « Exécuter en tant que » : **Moi**.
   - « Qui a accès » : **Tout le monde**.
   - Clique sur **Déployer**, puis **Autoriser l'accès** et choisis ton compte Google. Si Google affiche « Google n'a pas validé cette application », clique sur **Paramètres avancés → Accéder au projet (non sécurisé)** : c'est ton propre script.
4. Copie l'**URL de l'application Web** (elle finit par `/exec`).
   Pour vérifier : ouvre-la dans un navigateur, elle doit afficher `ok`.
5. Colle cette URL dans `app/src/config.ts`, à la ligne `SHEET_ENDPOINT = '…'`, et le lien du Sheet lui-même à la ligne `SHEET_URL = '…'`.

Les onglets `Wellbeing`, `Pratiques` et `Scores & Prescriptions` sont créés automatiquement au premier envoi, avec leurs en-têtes.
Si ces onglets existent déjà, les colonnes manquantes sont ajoutées à droite.

Si tu modifies `Code.gs` plus tard : **Déployer → Gérer les déploiements → ✏️ → Version : Nouvelle version → Déployer**. L'URL reste la même.
